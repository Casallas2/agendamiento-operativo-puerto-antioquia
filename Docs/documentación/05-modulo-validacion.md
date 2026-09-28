# 05 · Módulo Validación

Ruta: `Backend/src/modules/validacion/`

Implementa RF-02: la validación documental previa al arribo. Es el módulo donde vive el patrón
**Adapter** (Figura 3 del diseño arquitectónico).

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `validacion-documental.service.ts` | Orquesta las cinco validaciones y cierra el turno |
| `adaptadores/validador-externo.interface.ts` | Contrato `ValidadorExterno` común |
| `adaptadores/dian.adapter.ts` | Traduce a SOAP/XML |
| `adaptadores/operador-portuario.adapter.ts` | Traduce a REST/JSON |
| `catalogo-validaciones.ts` | Las cinco validaciones y su sistema de origen |
| `entities/registro-externo.entity.ts` | Espejo local de los registros externos |

## El problema que resuelve el Adapter

Los sistemas que hay que consultar no se parecen en nada (R-02):

| Sistema | Protocolo | Qué valida |
|---|---|---|
| DIAN | SOAP / XML, heredado | Manifiesto de carga |
| Operador portuario | REST / JSON | BL, y reenvía al RUNT licencia, SOAT y tecnomecánica |

Sin adaptadores, `ValidacionDocumentalService` tendría que construir sobres XML para una
consulta y objetos JSON para otra. Con ellos, habla un solo lenguaje:

```typescript
export interface ValidadorExterno {
  validarDocumentoCarga(documento: DocumentoCarga): Promise<ResultadoValidacion>;
  validarConductor(conductor: Conductor, fechaTurno: Date): Promise<ResultadoValidacion>;
  validarVehiculo(vehiculo: Vehiculo, documento: DocumentoVehiculo, fechaTurno: Date): Promise<ResultadoValidacion>;
}
```

Todos devuelven lo mismo: `{ aprobado: boolean; mensaje: string }`.

### Cómo se nota la traducción

`AdaptadorDian` construye y *parsea* un sobre SOAP de verdad, aunque el transporte esté
simulado:

```typescript
private construirSobreSoap(numeroManifiesto: string): string {
  return '<soap:Envelope><soap:Body><ConsultarManifiesto>' +
         `<numero>${numeroManifiesto}</numero>` +
         '</ConsultarManifiesto></soap:Body></soap:Envelope>';
}
```

`AdaptadorOperadorPortuario` responde con nombres de campo ajenos al dominio (`bl_status`,
`expiry`, `runt`) y los traduce dentro del adaptador. Esa asimetría es deliberada: demuestra
que el servicio de validación nunca ve el vocabulario del sistema externo.

Los métodos que no le corresponden a un adaptador devuelven aprobado con una explicación:
«La DIAN no valida conductores». Así el contrato se cumple sin condicionales en el orquestador.

## Las cinco validaciones

| Tipo | Etiqueta | Sistema | Latencia simulada |
|---|---|---|---|
| `MANIFIESTO_DIAN` | Manifiesto de carga | DIAN · SOAP/XML | 1400 ms |
| `BL_OPERADOR` | Conocimiento de embarque (BL) | Operador · REST | 900 ms |
| `LICENCIA_RUNT` | Licencia de conducción | RUNT vía operador | 1700 ms |
| `SOAT` | SOAT del vehículo | RUNT vía operador | 2100 ms |
| `TECNOMECANICA` | Revisión técnico-mecánica | RUNT vía operador | 2500 ms |

Las latencias son deliberadas: los sistemas reales son lentos, y es justo esa lentitud la que
justifica que el `POST` responda 202 en lugar de esperar.

## Ejecución

Las cinco corren **en paralelo** con `Promise.all`, así que el total lo marca la más lenta
(~2,5 s) y no la suma (~8,6 s). Cada una persiste su resultado en cuanto llega y publica
`ValidacionActualizada`, de modo que la interfaz va tachando la lista en vivo.

```
POST /bookings ──► 202 Accepted
                    │
                    └─► ejecutarEnSegundoPlano(turnoId)
                          │
                          ├─ marca las cinco validaciones EN_PROCESO
                          ├─ Promise.all ─┬─ DIAN: manifiesto ────────────┐
                          │               ├─ Operador: BL                 │
                          │               ├─ Operador: licencia           │ cada una
                          │               ├─ Operador: SOAT               │ publica
                          │               └─ Operador: tecnomecánica ─────┘ su evento
                          │
                          └─ cerrarValidacion()
                               ├─ ¿algún rechazo? → RECHAZADO + libera el cupo
                               └─ todo aprobado  → CONFIRMADO
```

Basta un rechazo para tumbar el turno; se toma el primero encontrado como motivo.

## Detalles de implementación

### El disparo nunca puede romper la reserva

`ejecutarEnSegundoPlano` envuelve la promesa y registra cualquier fallo en el log. Si la DIAN
estuviera caída, el transportista conserva su 202 y su cupo; lo que no ocurre es que la
excepción viaje hasta el controlador.

### Cierre idempotente

`cerrarValidacion` reabre el turno dentro de una transacción y comprueba que siga en
`PENDIENTE_VALIDACION`. Si alguien lo canceló mientras se consultaba a la DIAN, no lo
resucita ni duplica la notificación.

Además, `validacionesEnCurso` (un `Set` en memoria) impide que dos disparos simultáneos validen
el mismo turno.

### Reanudación tras un reinicio

`AppModule.onApplicationBootstrap` llama a `reanudarPendientes()`, que busca los turnos en
`PENDIENTE_VALIDACION` y los relanza. Sin esto, un turno creado justo antes de reiniciar el
servidor se quedaría en validación para siempre.

## Datos de referencia

La tabla `registros_externos` guarda qué manifiestos conoce la DIAN y qué BL conoce el operador.
La semilla carga 8 manifiestos y 9 BL. Para provocar un rechazo en la demostración basta
reservar con un manifiesto que no esté en la lista, por ejemplo `MAN-2026-999999`.

Las vigencias no se consultan en una lista: se calculan con `differenceInCalendarDays` contra la
fecha del turno, y el mensaje incluye el margen: «SOAT vigente (208 días de margen)».
