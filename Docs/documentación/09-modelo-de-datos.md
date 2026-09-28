# 09 · Modelo de datos

Motor: PostgreSQL 18. ORM: TypeORM 0.3. Esquema gobernado por migraciones, nunca por
`synchronize`.

## Convenciones

- Clave primaria `uuid` generada con `uuid_generate_v4()` (extensión `uuid-ossp`).
- Columnas en `snake_case`; propiedades de la entidad en `camelCase`.
- Toda tabla lleva `created_at` y `updated_at` con `timestamptz`.
- Las fechas de negocio también son `timestamptz`: la operación portuaria cruza husos horarios
  y un `timestamp` sin zona sería ambiguo.

## Diagrama

```
  empresas ──┬──< conductores ──┐
             ├──< vehiculos     │
             └──< turnos >──────┤
                   │  │  │      │
                   │  │  └──> muelles ──< franjas
                   │  │              (turnos >── franjas)
                   │  ├──< turno_validaciones
                   │  └──< turno_eventos
                   │
  usuarios >── empresas, conductores
     └──< notificaciones
     └──< desafios_mfa

  registros_externos   historial_espera     (tablas de referencia)
```

## Tablas

### `empresas`
Empresa transportadora. `nit` único.

### `conductores`
Ficha del conductor. `cedula` única, `vencimiento_licencia` alimenta el semáforo y la validación
RUNT. FK a `empresas` con `ON DELETE CASCADE`.

### `vehiculos`
`placa` única, `estado_runt` (`ACTIVO` / `SUSPENDIDO`), y los vencimientos de SOAT y
tecnomecánica.

### `usuarios`
Cuenta de acceso. `correo` único, `password_hash` con `select: false`.

`empresa_id` y `conductor_id` son nulos porque el operador portuario no pertenece a ninguna
empresa transportadora y solo el conductor tiene ficha. Ambas FK usan `ON DELETE SET NULL`:
borrar una empresa no debe borrar cuentas.

`empresa_nombre` se guarda aparte porque el operador muestra «Puerto Antioquia», que no es una
empresa de la tabla.

### `muelles`
Nombre, tipo de carga, estado, retraso vigente y `capacidad_por_franja`.

### `franjas`
Ventana reservable de un muelle.

```sql
CONSTRAINT "CHK_FRANJA_OCUPADOS" CHECK (ocupados >= 0 AND ocupados <= capacidad)
```

Esa restricción es la última defensa de la integridad del cupo, por debajo de la condición que
viaja en el `UPDATE` (documento 04).

### `turnos`
La entidad central. `codigo` único (`TRN-1007`), FK a empresa, vehículo, conductor, muelle y
franja.

`inicio` y `fin` se **copian** de la franja en lugar de leerse por `JOIN`. Es una desnormalización
deliberada: si la franja se editara, los turnos ya reservados conservan la ventana que se le
prometió al transportista.

Las FK a vehículo, conductor, muelle y franja usan `ON DELETE RESTRICT`: no se puede borrar un
recurso con historial de turnos.

### `turno_validaciones`
Una fila por validación. Índice único `(turno_id, tipo)`: un turno no puede tener dos
validaciones del mismo tipo. `orden` preserva el orden del catálogo.

### `turno_eventos`
Línea de tiempo del turno. Es un registro de solo-anexado: nunca se actualiza ni se borra.

### `notificaciones`
`canales` es un `text[]` de PostgreSQL. `turno_id` es nullable y **sin** FK, para que borrar un
turno no arrastre el aviso que informó de su cancelación.

### `desafios_mfa`
Desafío pendiente con `intentos` y `expira_en`. Los caducados se limpian en cada verificación.

### `registros_externos`
Espejo de lo que conocen la DIAN y el operador portuario. Único por `(sistema, numero)`.

### `historial_espera`
Serie diaria de espera en vía. `fecha` es `date` y única.

## Índices

| Índice | Tabla | Para qué |
|---|---|---|
| `IDX_USUARIO_CORREO` | usuarios | Login |
| `IDX_TURNO_CODIGO` | turnos | Búsqueda por código |
| `IDX_TURNO_EMPRESA`, `IDX_TURNO_CONDUCTOR` | turnos | Filtro de visibilidad por rol |
| `IDX_TURNO_ESTADO` | turnos | Pestañas de la tabla e indicadores |
| `IDX_TURNO_INICIO` | turnos | Orden cronológico |
| `IDX_FRANJA_MUELLE_INICIO` | franjas | Agenda de un muelle |
| `IDX_NOTIFICACION_USUARIO_FECHA` | notificaciones | Panel de campana |

## Secuencia

```sql
CREATE SEQUENCE turnos_codigo_seq START WITH 1007;
```

## Migración y semilla

```bash
yarn migration:run   # crea 13 tablas, 9 tipos enum, 18 índices y 1 secuencia
yarn seed            # carga los datos de demostración (idempotente)
```

La semilla es **idempotente**: hace `TRUNCATE ... RESTART IDENTITY CASCADE` sobre las 13 tablas
y vuelve a insertar con identificadores fijos, así que ejecutarla dos veces deja exactamente el
mismo estado. Eso es lo que permite que `POST /demo/reset` la reutilice.

### Qué carga

| Dato | Cantidad |
|---|---|
| Empresas | 2 |
| Usuarios | 3 (uno por rol) |
| Conductores | 5 |
| Vehículos | 5 |
| Muelles | 4 (uno en mantenimiento) |
| Franjas | 224 (7 días × 4 muelles × 8 horas) |
| Turnos | 6 (cubren confirmado, rechazado, en camino y completado) |
| Notificaciones | 4 |
| Registros externos | 17 |
| Historial de espera | 10 días |

Los vencimientos se declaran en **días relativos a hoy**, no en fechas absolutas: así el
semáforo de la flota siempre muestra un vencido, un por vencer y varios vigentes, sin importar
cuándo se ejecute la demostración.

Las contraseñas se cifran con bcrypt y 12 rondas de sal.
