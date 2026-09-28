# 10 · Frontend y conexión con el backend

El frontend ya existía como prototipo navegable sobre una capa simulada en `src/core/mock`
(localStorage + `BroadcastChannel`). La conexión consistió en sustituir esa capa por llamadas
reales **sin tocar vistas, componentes ni tipos**.

## Qué se cambió y qué no

| Cambiado | Intacto |
|---|---|
| Los 7 archivos `*.service.ts` | Todas las vistas (`views/`) |
| `core/api/api.ts` y `core/api/respuestaApi.ts` | Todos los hooks de React Query |
| `useEscucharTiempoReal.ts` | Todos los tipos (`types/`) |
| `AppProviders.tsx` (se quitaron los arranques del mock) | `proxy.ts`, `authStore`, `uiStore` |
| `BotonReiniciarDemo.tsx` | Los componentes de `components/` |
| `core/mock/` → **eliminada** | `core/config/catalogos.ts` |

Que los hooks y los tipos no cambiaran es la prueba de que el contrato del backend se diseñó
como espejo exacto del que ya consumía la interfaz.

## Mapa de cableado

| Servicio del frontend | Endpoint |
|---|---|
| `authService.iniciarSesion` | `POST /auth/login` |
| `authService.verificarCodigoMfa` | `POST /auth/mfa/verify` |
| `authService.obtenerPerfil` | `GET /auth/me` |
| `authService.cerrarSesion` | `POST /auth/logout` |
| `turnosService.obtenerTurnos` | `GET /bookings` |
| `turnosService.obtenerTurno` | `GET /bookings/:id` |
| `turnosService.obtenerFranjas` | `GET /slots?fecha=` |
| `turnosService.crearTurno` | `POST /bookings` |
| `turnosService.cancelarTurno` | `POST /bookings/:id/cancel` |
| `muellesService.obtenerMuelles` | `GET /docks` |
| `muellesService.declararRetraso` | `POST /docks/:id/delay` |
| `muellesService.restablecerOperacion` | `POST /docks/:id/restore` |
| `muellesService.alternarMantenimiento` | `POST /docks/:id/maintenance` |
| `flotaService.obtenerVehiculos` | `GET /fleet/vehicles` |
| `flotaService.obtenerConductores` | `GET /fleet/drivers` |
| `conductorService.obtenerResumen` | `GET /driver/summary` |
| `conductorService.marcarEnCamino` | `POST /driver/bookings/:id/on-route` |
| `conductorService.reportarNovedad` | `POST /driver/bookings/:id/incident` |
| `notificacionesService.obtenerNotificaciones` | `GET /notifications` |
| `notificacionesService.marcarTodasLeidas` | `POST /notifications/read-all` |
| `alertasService.obtenerReporte` | `GET /reports/operation` |
| `BotonReiniciarDemo` | `POST /demo/reset` |

Todos siguen el mismo patrón, que cabe en tres líneas:

```typescript
const obtenerTurnos = async (filtro: FiltroTurnos = {}): Promise<TurnoDetallado[]> => {
  const { data } = await api.get<RespuestaApi<TurnoDetallado[]>>('/bookings', { params: { ... } });
  return data.data;
};
```

El servicio desenvuelve `data.data` y devuelve el dato pelado, que es exactamente lo que los
hooks ya esperaban.

## Interceptores de Axios

### Petición: cabecera de área

```typescript
api.interceptors.request.use((configuracion) => {
  configuracion.headers.set(CABECERA_AREA, obtenerAreaSesion());
  return configuracion;
});
```

`obtenerAreaSesion()` devuelve `CABINA` si la ruta empieza por `/conductor` y `PORTAL` en
cualquier otro caso. Es lo que permite que el backend sepa qué cookie leer cuando hay dos
sesiones abiertas.

### Respuesta: el 401

```typescript
const esSolicitudDeAutenticacion = urlSolicitud.includes('/auth/');
if (error.response?.status === 401 && !esSolicitudDeAutenticacion) { ... }
```

Antes la condición excluía `/auth/login` y `/auth/logout` por separado. Se amplió a todo
`/auth/` por un motivo concreto: `POST /auth/mfa/verify` responde `401` cuando el código es
incorrecto, y con la condición anterior el interceptor habría cerrado la sesión y redirigido al
login en lugar de mostrar «Te quedan 2 intento(s)».

### Mensajes de error

`obtenerMensajeError` extrae `response.data.message`, que el backend ya redacta en español, en
lugar del genérico de Axios («Request failed with status code 409»). Si no hay respuesta, avisa
de un problema de conexión.

## Tiempo real

`useEscucharTiempoReal` reemplazó el `BroadcastChannel` del prototipo por `EventSource`:

```typescript
const fuente = new EventSource(`${URL_API}/events/stream?area=${obtenerAreaSesion()}`, {
  withCredentials: true,
});
```

La lógica de reacción no cambió:

1. `ValidacionActualizada` → invalida solo `['turnos']`.
2. Cualquier otro evento → invalida todas las consultas salvo `['auth']`.
3. Si el usuario está en `usuariosAfectados`, muestra el aviso emergente.
4. Si además es conductor y tiene la lectura en voz activa, lo lee en voz alta (R-01).

## Cómo probarlo

1. Abre `http://localhost:3000/login` en dos ventanas.
2. En una entra como **operador**, en la otra como **conductor**.
3. Desde el operador, declara un retraso en el Muelle 2.
4. La ventana del conductor muestra el aviso y lo lee en voz alta, sin recargar.

Funciona porque cada área usa una cookie distinta.
