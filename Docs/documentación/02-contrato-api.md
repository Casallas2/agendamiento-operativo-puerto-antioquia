# 02 · Contrato de la API

Base: `http://localhost:4000/api/v1`

## Formato de respuesta

**Toda** respuesta correcta sigue la misma forma:

```json
{
  "status": 200,
  "message": "Turnos obtenidos exitosamente",
  "data": []
}
```

- `status` repite el código HTTP como número.
- `message` va siempre en español y es el texto que la interfaz muestra al usuario.
- `data` se omite en operaciones que no devuelven cuerpo (cierre de sesión, marcar leídas).
- Las fechas viajan **siempre** como `string` ISO 8601, nunca como objeto `Date`.

Los errores conservan la misma forma, sin `data`:

```json
{
  "status": 409,
  "message": "Otro transportista tomó el último cupo de esta franja. Elige otra."
}
```

El filtro global `FiltroExcepcionesHttp` se encarga de esa normalización, incluidos los
mensajes de `class-validator`, que se unen en una sola frase.

## Autenticación

La sesión viaja en una cookie `httpOnly`, no en una cabecera `Authorization`.

| Área | Cookie | Quién la recibe |
|---|---|---|
| Portal web | `puerto-sesion-portal` | Transportista y operador portuario |
| Cabina | `puerto-sesion-cabina` | Conductor |

El cliente declara desde qué área consulta con la cabecera `X-Area-Sesion: PORTAL | CABINA`.
El canal SSE no puede enviar cabeceras, así que usa `?area=PORTAL`.

## Endpoints

### Autenticación · `/auth`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| POST | `/auth/login` | público | `200` · desafío MFA |
| POST | `/auth/mfa/verify` | público | `200` · usuario + cookie de sesión |
| GET | `/auth/me` | autenticado | `200` · perfil |
| POST | `/auth/logout` | público | `200` · limpia la cookie del área |

`/auth/login` está limitado a 5 intentos por minuto y por IP; `/auth/mfa/verify`, a 10.

### Turnos · `/bookings`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/bookings?estado=&busqueda=` | autenticado | `200` · turnos visibles según el rol |
| GET | `/bookings/:id` | autenticado | `200` · detalle |
| POST | `/bookings` | transportista | **`202`** · cupo reservado, validación en curso |
| POST | `/bookings/:id/cancel` | transportista, operador | `200` · turno cancelado |

### Franjas · `/slots`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/slots?fecha=AAAA-MM-DD` | autenticado | `200` · franjas del día con su ocupación |

### Muelles · `/docks`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/docks` | autenticado | `200` · estado de los muelles |
| POST | `/docks/:id/delay` | operador | `200` · nº de turnos notificados |
| POST | `/docks/:id/restore` | operador | `200` · nº de turnos notificados |
| POST | `/docks/:id/maintenance` | operador | `200` · muelle actualizado |

### Flota · `/fleet`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/fleet/vehicles` | autenticado | `200` · vehículos visibles |
| GET | `/fleet/drivers` | autenticado | `200` · conductores visibles |

### Cabina · `/driver`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/driver/summary` | conductor | `200` · turno actual, vehículo, muelle y próximos |
| POST | `/driver/bookings/:id/on-route` | conductor | `200` · turno en camino |
| POST | `/driver/bookings/:id/incident` | conductor | `200` · novedad registrada |

### Notificaciones · `/notifications`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/notifications` | autenticado | `200` · las 30 más recientes |
| POST | `/notifications/read-all` | autenticado | `200` · sin `data` |

### Reportes · `/reports`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/reports/operation` | autenticado | `200` · indicadores, ocupación, rechazos y espera |

### Tiempo real · `/events`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| GET | `/events/stream?area=PORTAL` | autenticado | `text/event-stream` |

### Demostración · `/demo`

| Método | Ruta | Rol | Respuesta |
|---|---|---|---|
| POST | `/demo/reset` | transportista, operador | `200` · datos restaurados |

## Códigos de error usados

| Código | Cuándo aparece | Ejemplo de mensaje |
|---|---|---|
| `400` | Falla la validación del DTO | «El manifiesto debe tener el formato MAN-AAAA-NNNNNN» |
| `401` | Credenciales o código MFA incorrectos, sesión expirada | «Código incorrecto. Te quedan 2 intento(s).» |
| `403` | El rol no alcanza para la acción | «Solo los transportistas pueden reservar turnos» |
| `404` | El recurso no existe o no es visible para el usuario | «El turno no existe o no tienes acceso a él» |
| `409` | Conflicto de estado o de concurrencia | «Este vehículo ya tiene un turno en la misma franja» |
| `410` | El desafío MFA caducó | «El código expiró. Vuelve a ingresar tus credenciales.» |
| `429` | Se superó el límite de peticiones | — |

`404` se usa deliberadamente también cuando el turno existe pero pertenece a otra empresa:
así la API no revela qué turnos ajenos existen.
