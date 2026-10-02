# 04 · Módulo Turnos

Ruta: `Backend/src/modules/turnos/`

Es el núcleo del sistema: implementa RF-01, la reserva de ventanas de ingreso.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `turnos.controller.ts` | Endpoints de `/bookings` |
| `turnos.service.ts` | Comandos: crear y cancelar |
| `turnos-consulta.service.ts` | Consultas: listar, detalle, visibilidad por rol |
| `franjas.service.ts` / `franjas.controller.ts` | Agenda de un día (`/slots`) |
| `franjas.helper.ts` | Toma y liberación de cupo en SQL |
| `cupo-prioritario.ts` | Reglas de la cuota para carga refrigerada (OCI-001), con pruebas en `cupo-prioritario.spec.ts` |
| `turnos.mapper.ts` | Entidad → respuesta JSON, con nombres relacionados resueltos |
| `estados-turno.constants.ts` | Etiquetas y agrupaciones de estado |
| `entities/` | `Turno`, `Franja`, `ValidacionTurno`, `EventoTurno` |

La separación entre comandos y consultas existe para respetar el límite de 300 líneas por
archivo: juntos superaban las 350.

## Máquina de estados

```
                    ┌──────────────────────┐
   POST /bookings   │ PENDIENTE_VALIDACION │
   (202 Accepted)   └───────┬──────────────┘
                            │ validación documental asíncrona
                ┌───────────┴───────────┐
                ▼                       ▼
         ┌────────────┐          ┌───────────┐
         │ CONFIRMADO │          │ RECHAZADO │ ← libera el cupo
         └─────┬──────┘          └───────────┘
               │ el conductor avisa
               ▼
         ┌───────────┐     ┌───────────┐     ┌────────────┐
         │ EN_CAMINO │ ──► │ EN_PUERTO │ ──► │ COMPLETADO │
         └───────────┘     └───────────┘     └────────────┘

  PENDIENTE_VALIDACION y CONFIRMADO pueden ir a CANCELADO (libera el cupo).
```

Solo `PENDIENTE_VALIDACION` y `CONFIRMADO` son cancelables. Intentar cancelar otro estado
devuelve `409` con la etiqueta legible del estado: «No se puede cancelar un turno en estado
"En camino"».

## Reserva del cupo

`POST /bookings` responde **202 Accepted**, no 201. Es intencional y refleja la arquitectura
dirigida por eventos: el cupo queda apartado de inmediato, pero el turno todavía no está
confirmado porque la validación documental corre después.

Dentro de una única transacción:

1. Se carga la franja con su muelle. Si no existe → `404`.
2. Si el muelle está en `MANTENIMIENTO` → `409`.
3. Se comprueba que el vehículo y el conductor pertenezcan a la empresa que reserva → `403`.
4. Se comprueba que el vehículo no tenga ya un turno vigente en esa franja → `409`.
5. Se intenta tomar el cupo.
6. Se pide el siguiente código a la secuencia y se crean el turno, sus validaciones
   pendientes (cinco, o seis si la carga es refrigerada) y el primer evento del historial.

Fuera de la transacción se publica `TurnoSolicitado` y se dispara la validación en segundo plano.

### La carrera por el último cupo

El punto delicado es el paso 5. Si dos transportistas piden el mismo último cupo a la vez, leer
`ocupados`, compararlo en Node y volver a escribir permitiría que ambos pasaran.

La condición viaja **dentro** del `UPDATE`, así que es PostgreSQL quien arbitra:

```sql
UPDATE franjas SET ocupados = ocupados + 1
WHERE id = $1 AND ocupados < capacidad
```

Si `affected` es 0, la franja se llenó y se responde `409` sin haber tocado nada. La tabla lleva
además un `CHECK (ocupados >= 0 AND ocupados <= capacidad)` como última red de seguridad.

La liberación es simétrica y no puede bajar de cero:

```sql
UPDATE franjas SET ocupados = GREATEST(ocupados - 1, 0) WHERE id = $1
```

### Cuota prioritaria para carga refrigerada (OCI-001)

Cada franja aparta `cupo_prioritario = FLOOR(capacidad × 0,3)` cupos para contenedores
refrigerados y lleva aparte `ocupados_refrigerados`. Las reglas viven en `cupo-prioritario.ts`:

| Tipo de carga | Puede tomar un cupo si… |
|---|---|
| Refrigerada | `ocupados < capacidad` (cualquier cupo libre; suma también a `ocupados_refrigerados`) |
| General | `ocupados < capacidad` **y** `(ocupados − ocupados_refrigerados) < (capacidad − cupo_prioritario)`, salvo que la franja empiece en 2 h o menos |

Igual que antes, la condición viaja dentro del `UPDATE`, así que la concurrencia la sigue
arbitrando PostgreSQL. Si la carga general choca con la cuota, la respuesta `409` lo explica:
«Los cupos que quedan en esta franja están reservados para carga refrigerada». `GET /slots`
devuelve `disponibles: { general, refrigerada }` para que la interfaz no ofrezca lo que no se puede tomar.

Ante un retraso de muelle, los turnos refrigerados se desplazan como máximo 30 minutos
(`calcularRetrasoAplicable`): se atienden primero para no romper la cadena de frío.

### Códigos de turno

`TRN-1007`, `TRN-1008`… salen de la secuencia PostgreSQL `turnos_codigo_seq`, que la migración
crea empezando en 1007 (los seis turnos de la semilla ocupan del 1001 al 1006). La semilla la
reinicia en cada carga, de modo que `POST /demo/reset` deja la numeración como estaba.

## Visibilidad por rol

Se resuelve en el `WHERE`, no filtrando en memoria:

| Rol | Ve |
|---|---|
| Operador portuario | Todos los turnos |
| Transportista | Los de su empresa |
| Conductor | Los asignados a él |

`buscarVisible` aplica el mismo filtro al detalle, y cuando no encuentra nada lanza `404` con el
mensaje «El turno no existe o no tienes acceso a él». El mismo mensaje para ambos casos evita
que se pueda sondear la existencia de turnos ajenos.

## Búsqueda

El parámetro `busqueda` cruza código, placa, conductor, muelle y empresa. Se aplica **después**
de mapear, porque los tres últimos son nombres de tablas relacionadas; con el volumen del
prototipo el coste es irrelevante. Si el histórico creciera, tocaría moverlo a un `WHERE` con
`ILIKE` sobre los `JOIN`.

## Validación de entrada

`CrearTurnoDto` normaliza antes de validar: recorta espacios y pasa manifiesto y BL a
mayúsculas. Los formatos se exigen con expresión regular:

| Campo | Formato | Mensaje si falla |
|---|---|---|
| `numeroManifiesto` | `MAN-AAAA-NNNNNN` | «El manifiesto debe tener el formato MAN-AAAA-NNNNNN» |
| `numeroBl` | `BL-XX-NNNNN` | «El BL debe tener el formato BL-XX-NNNNN» |

El `ValidationPipe` global corre con `whitelist` y `forbidNonWhitelisted`: un campo de más en el
cuerpo es un `400`, no un dato que se cuela hasta la entidad.
