# 07 · Módulo Muelles

Ruta: `Backend/src/modules/muelles/`

El `GestorMuelles` del diseño: publica las novedades de operación para que los conductores no
lleguen a un muelle que no los puede atender.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `muelles.controller.ts` | Endpoints de `/docks`, con `@Roles('OPERADOR_PORTUARIO')` en las acciones |
| `muelles.service.ts` | Retraso, restablecimiento y mantenimiento |
| `muelles.mapper.ts` | Entidad → JSON |
| `entities/muelle.entity.ts` | Tabla `muelles` |
| `dto/declarar-retraso.dto.ts` | Validación de minutos y motivo |

## Los tres estados

| Estado | Qué implica |
|---|---|
| `OPERATIVO` | Atiende con normalidad |
| `RETRASADO` | Atiende, pero con la ventana desplazada `retrasoMinutos` |
| `MANTENIMIENTO` | No acepta reservas nuevas (`POST /bookings` responde `409`) |

## Declarar un retraso

Es la acción más interesante porque no toca un solo registro, sino todos los turnos afectados.

```
POST /docks/:id/delay { minutos: 45, motivo: "..." }
   │
   └─ transacción
        ├─ muelle → RETRASADO, retrasoMinutos, motivoNovedad
        ├─ busca los turnos afectados
        ├─ les copia retrasoMinutos
        └─ añade "MuelleRetrasado" al historial de cada uno
   │
   └─ fuera de la transacción: un evento por turno afectado
```

### Qué turno se considera afectado

Tres condiciones a la vez:

1. Pertenece al muelle.
2. Está en `CONFIRMADO`, `EN_CAMINO` o `PENDIENTE_VALIDACION`.
3. Su ventana cae dentro de las próximas **12 horas** (`fin >= ahora` e `inicio <= ahora + 12 h`).

La ventana de 12 horas evita avisar a quien tiene turno pasado mañana de un retraso que
seguramente ya estará resuelto.

### A quién se avisa

Se llama a `obtenerInteresadosEnTurno(turno, false)`. El `false` excluye a los operadores
portuarios: fue el operador quien declaró el retraso, no tiene sentido notificárselo.

Si no hay ningún turno afectado se publica igualmente un evento sin destinatarios, para dejar
constancia de la novedad en el tablero.

La respuesta es el número de turnos notificados, que la interfaz usa para confirmar: «Se
notificó a 3 turno(s) por Push y SMS, y por voz a los conductores».

## Restablecer

Simétrico al retraso, con un matiz: solo toca los turnos que efectivamente tenían
`retrasoMinutos > 0`. Si un turno entró en la ventana después de declararse el retraso, nunca
llegó a desplazarse y no debe recibir un aviso de que «vuelve a su horario original».

## Mantenimiento

`POST /docks/:id/maintenance` alterna entre `MANTENIMIENTO` y `OPERATIVO` y limpia el retraso.
No modifica turnos existentes: los que ya estaban agendados siguen en pie, lo que se corta es
la entrada de reservas nuevas. Esa comprobación vive en `TurnosService.crearTurno`.

## Transacciones

Retraso y restablecimiento corren dentro de `dataSource.transaction`. Si fallara la escritura
del historial después de haber marcado el muelle, la transacción revierte y el muelle no queda
en un estado que nadie conoce.

Los eventos se publican **fuera** de la transacción, ya confirmada: así nunca se notifica un
retraso que terminó revirtiéndose.

## Control de acceso

El controlador lleva `@UseGuards(RolesGuard)` y cada acción de escritura `@Roles('OPERADOR_PORTUARIO')`.
`GET /docks` no lleva restricción: transportistas y conductores necesitan ver el estado de los
muelles para entender por qué su turno se movió.
