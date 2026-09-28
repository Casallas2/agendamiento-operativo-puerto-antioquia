# 06 · Módulo Eventos

Ruta: `Backend/src/modules/eventos/`

Implementa RF-03 (notificación en tiempo real) y RNF-01 (desacople entre productor y consumidor).
Aquí vive el patrón **Observer** (Figura 2 del diseño arquitectónico).

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `bus-eventos.service.ts` | Sujeto observable: registra observadores y publica eventos |
| `observadores/despachador-notificaciones.observer.ts` | Observador que convierte eventos en notificaciones |
| `eventos.controller.ts` | Canal SSE `/events/stream` |
| `types/evento-dominio.type.ts` | Contrato `EventoDominio` y `ObservadorEvento` |

## Qué sustituye

El diseño arquitectónico contempla Kafka o RabbitMQ. Para un prototipo que corre en una sola
máquina, montar un *broker* añadiría operación sin demostrar nada nuevo, así que
`BusEventosService` cumple su papel: un `Subject` de RxJS más una lista de observadores.

El código de los servicios es el mismo que sería con un *broker* real —publican y siguen—, de
modo que sustituirlo más adelante afecta a un solo archivo.

## El contrato

```typescript
export type EventoDominio = {
  tipo: TipoEventoDominio;
  titulo: string;
  descripcion: string;
  severidad: 'INFO' | 'EXITO' | 'ALERTA' | 'ERROR';
  usuariosAfectados: string[];
  turnoId?: string;
  muelleId?: string;
  ocurridoEn: string;
};
```

Quien publica no pasa `ocurridoEn`: lo sella el bus.

## Los diez eventos

| Evento | Lo publica | Severidad |
|---|---|---|
| `TurnoSolicitado` | Turnos | INFO |
| `ValidacionActualizada` | Validación | EXITO / ERROR |
| `TurnoValidado` | Validación | EXITO |
| `TurnoRechazado` | Validación | ERROR |
| `TurnoCancelado` | Turnos | ALERTA |
| `ConductorEnCamino` | Cabina | INFO |
| `NovedadReportada` | Cabina | ALERTA |
| `MuelleRetrasado` | Muelles | ALERTA |
| `MuelleRestablecido` | Muelles | EXITO |
| `MuelleEnMantenimiento` | Muelles | ALERTA |

## Cómo se publica

```
servicio.publicar(evento)
        │
        ├─ 1. sella ocurridoEn
        ├─ 2. recorre los observadores de dominio  ──► persisten notificaciones
        └─ 3. emite al Subject                     ──► SSE ──► navegadores conectados
```

El orden importa: los observadores corren **antes** de empujar a los clientes, así que cuando el
navegador recibe el evento y refresca sus consultas, la notificación ya está en la base.

Un observador que falle se registra en el log pero no interrumpe la publicación ni la operación
que la originó. Que el envío de un aviso falle no puede deshacer una reserva.

## El despachador de notificaciones

Es el único observador registrado. Se suscribe solo en `onModuleInit` y traduce cada evento en
una fila de `notificaciones` por destinatario.

Ignora `ValidacionActualizada`: ese evento existe para que la interfaz refresque la lista de
validaciones en vivo, no para molestar al usuario con cinco avisos por turno.

Los canales de cada aviso los deciden los notificadores descritos en el documento 08.

## Canal en tiempo real: SSE

`GET /events/stream` devuelve `text/event-stream` con el decorador `@Sse` de NestJS.

### Por qué SSE y no WebSocket

| | SSE | WebSocket |
|---|---|---|
| Dependencias en el cliente | Ninguna (`EventSource` es nativo) | `socket.io-client` |
| Reconexión | Automática | Manual |
| Sentido del tráfico | Solo servidor → cliente | Bidireccional |
| Cookies de sesión | Las envía con `withCredentials` | Requiere manejo aparte |

El flujo aquí solo va en un sentido: el servidor avisa, el cliente reacciona con peticiones
HTTP normales. SSE cubre el caso exacto sin sumar ni una dependencia al frontend.

### El problema del área

`EventSource` no permite enviar cabeceras, así que no puede mandar `X-Area-Sesion`. Por eso el
área viaja como query string: `/events/stream?area=CABINA`. La estrategia JWT acepta ambas
formas.

### Latido

Cada 25 segundos se emite un evento de tipo `latido` para que ningún proxy dé la conexión por
muerta. Va con un `type` propio, de modo que no llega al `onmessage` del cliente y no dispara
refrescos.

## Qué falta para producción

Hoy todos los eventos se emiten a todos los clientes conectados, igual que hacía el prototipo
con `BroadcastChannel`; el filtrado por destinatario ocurre en el navegador. Para producción
habría que filtrar el flujo en el servidor por `usuariosAfectados` antes de emitir.

El otro límite es que el bus vive en memoria: con varias instancias del API, cada una notificaría
solo a sus propios clientes. Ahí es donde entra el *broker* real.
