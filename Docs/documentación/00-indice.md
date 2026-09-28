# Documentación del sistema · Agendamiento Operativo Puerto Antioquia

Documentación técnica del prototipo: un backend NestJS + PostgreSQL y un frontend Next.js 16
conectados sobre el contrato `{ status, message, data }`.

## Índice

| Documento | Contenido |
|---|---|
| [01 · Arquitectura y puesta en marcha](01-arquitectura-y-arranque.md) | Visión general, requisitos, comandos de arranque y variables de entorno |
| [02 · Contrato de la API](02-contrato-api.md) | Los 20 endpoints, formatos de respuesta y códigos de error |
| [03 · Módulo Auth](03-modulo-auth.md) | Login en dos pasos, MFA, JWT en cookie y sesiones por área |
| [04 · Módulo Turnos](04-modulo-turnos.md) | Reserva de cupo, franjas, cancelación y concurrencia |
| [05 · Módulo Validación](05-modulo-validacion.md) | Adaptadores DIAN y operador portuario, validación pre-arribo |
| [06 · Módulo Eventos](06-modulo-eventos.md) | Bus de eventos, patrón Observer y canal SSE en tiempo real |
| [07 · Módulo Muelles](07-modulo-muelles.md) | Retrasos, mantenimiento y propagación a turnos |
| [08 · Módulos Flota, Notificaciones y Reportes](08-modulos-flota-notificaciones-reportes.md) | Consultas filtradas por rol, canales de aviso e indicadores |
| [09 · Modelo de datos](09-modelo-de-datos.md) | Las 13 tablas, relaciones, índices y semilla |
| [10 · Frontend y conexión](10-frontend-y-conexion.md) | Servicios, hooks, tiempo real y mapa de cableado |
| [11 · Sistema de diseño](11-sistema-de-diseno.md) | Paleta, tipografía, movimiento y accesibilidad |

## Estado del prototipo

| Fase | Alcance | Estado |
|---|---|---|
| 1 | Backend NestJS: 11 módulos, 20 endpoints | ✅ Completa |
| 2 | Base de datos PostgreSQL: migración + semilla | ✅ Completa |
| 3 | Conexión del frontend al backend real | ✅ Completa |
| 4 | Sistema de diseño, carrusel y animaciones | ✅ Completa |
| 5 | Documentación por módulo | ✅ Completa |

## Trazabilidad con los requisitos

| Requisito | Dónde se implementa |
|---|---|
| RF-01 Reserva de turnos | `modules/turnos` · `POST /bookings` responde 202 |
| RF-02 Validación documental | `modules/validacion` · adaptadores DIAN y operador |
| RF-03 Notificación en tiempo real | `modules/eventos` · bus Observer + SSE |
| RNF-01 Desacople de productor y consumidor | `BusEventosService` sustituye a Kafka/RabbitMQ |
| RNF-02 Autenticación de doble factor | `modules/auth` · desafío MFA antes de emitir el JWT |
| RNF-03 Reducción de la espera en vía | `modules/reportes` · serie `historial_espera` |
| R-01 Operación en cabina sin manipular el teléfono | Vista `/conductor`: voz, botones de 96 px, avisos no silenciables |
| R-02 Sistemas externos heterogéneos | Patrón Adapter: SOAP/XML en DIAN, REST/JSON en el operador |
