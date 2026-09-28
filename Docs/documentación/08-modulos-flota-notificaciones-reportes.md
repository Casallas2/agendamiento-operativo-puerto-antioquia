# 08 · Módulos Flota, Notificaciones, Reportes, Cabina y Demo

Módulos de apoyo. Ninguno tiene lógica de negocio compleja, pero todos aplican las mismas reglas
de visibilidad y de contrato.

---

## Flota · `modules/flota/`

Expone vehículos y conductores. Contiene además la entidad `Empresa`, porque empresa, flota y
conductores forman una sola unidad de propiedad.

### Visibilidad (mínimo privilegio)

| Rol | Vehículos | Conductores |
|---|---|---|
| Operador portuario | Todos | Todos |
| Transportista | Los de su empresa | Los de su empresa |
| Conductor | Los de su empresa | **Solo su propia ficha** |

El filtro se construye en `filtroConductores` y viaja en el `WHERE`.

### Semáforo de vencimientos

El backend entrega fechas crudas; el frontend las clasifica en `VIGENTE`, `POR_VENCER`
(≤ 30 días) o `VENCIDO` con `evaluarDocumento`. Se dejó en el cliente a propósito: el umbral es
una decisión de presentación, y así el selector de vehículos puede deshabilitar en el acto los
que tienen papeles vencidos sin pedir nada al servidor.

---

## Notificaciones · `modules/notificaciones/`

Persiste los avisos que genera el bus de eventos y los sirve al panel de campana.

### Los tres canales (Observer)

`notificadores/canales.notificador.ts` define un notificador por canal; cada uno decide solo si
le corresponde entregar:

| Canal | Entrega cuando | Por qué |
|---|---|---|
| `PUSH` | Siempre | Es el canal base de la plataforma |
| `SMS` | Severidad `ALERTA` o `ERROR` | Funciona con la conectividad intermitente del corredor vial |
| `VOZ` | El destinatario es `CONDUCTOR` | R-01: no debe manipular el teléfono en cabina |

Añadir un canal nuevo (correo, WhatsApp) es añadir un objeto a `NOTIFICADORES_REGISTRADOS`. No
hay que tocar los servicios que publican eventos.

### Detalles

- Se devuelven las **30** más recientes: el panel no pagina y más de eso no aporta.
- `POST /notifications/read-all` hace un solo `UPDATE` sobre las no leídas del usuario.
- `registrarEvento` ignora `ValidacionActualizada` y los eventos sin destinatarios.

---

## Reportes · `modules/reportes/`

Un endpoint, `GET /reports/operation`, que alimenta el panel y la vista de alertas.

### Lo que calcula

| Bloque | Contenido |
|---|---|
| `indicadores` | Turnos de hoy, confirmados, en validación, vehículos en camino, tasa de rechazo, muelles con novedad, espera promedio y reducción |
| `ocupacionPorFranja` | Ocupación y capacidad agregadas hora por hora para el día actual |
| `rechazosPorMotivo` | Validaciones rechazadas agrupadas por etiqueta, de mayor a menor |
| `historialEspera` | Serie de los últimos 10 días, con el día ya formateado en español |

Las cuatro consultas base se lanzan con `Promise.all`.

La visibilidad sigue la regla de siempre: el transportista ve solo su empresa, el operador toda
la operación. Los muelles con novedad y el histórico de espera son globales porque describen el
estado del puerto, no el de una empresa.

### RNF-03

`reduccionEsperaPorcentaje` compara el primer punto de `historial_espera` con el último. Con la
semilla la serie va de 312 a 84 minutos: un **73 % de reducción**, que es la cifra que el
requisito pide demostrar.

---

## Cabina · `modules/conductor/`

Sirve la vista `/conductor`, pensada para usarse dentro del vehículo.

| Endpoint | Qué hace |
|---|---|
| `GET /driver/summary` | Turno actual, vehículo, muelle y próximos turnos |
| `POST /driver/bookings/:id/on-route` | `CONFIRMADO` → `EN_CAMINO`, publica `ConductorEnCamino` |
| `POST /driver/bookings/:id/incident` | Registra la novedad en el historial y publica `NovedadReportada` |

El controlador entero lleva `@Roles('CONDUCTOR')`.

### El turno «actual»

Se toman los turnos del conductor en estado visible en cabina, se descartan los cuya ventana ya
pasó —**contando el retraso declarado**, no la hora original— y se ordenan por inicio. El primero
es el actual; el resto, los próximos.

Ese detalle importa: si el muelle declaró 45 minutos de retraso, el turno sigue siendo el actual
durante esos 45 minutos extra en lugar de desaparecer de la pantalla del conductor.

### Novedades

No cambian el estado del turno. Quedan en el historial y avisan al transportista y al puerto.
La decisión sobre qué hacer con la novedad es humana, no automática.

---

## Demo · `modules/demo/`

`POST /demo/reset` vuelve a ejecutar la semilla: borra turnos y notificaciones creados durante
la sesión y restaura el estado inicial. Reservado a transportista y operador.

Como los identificadores de la semilla son constantes, la sesión abierta sigue siendo válida
después del reinicio: el `sub` del JWT sigue apuntando al mismo usuario.
