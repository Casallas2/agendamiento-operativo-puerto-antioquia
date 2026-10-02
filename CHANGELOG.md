# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionamiento
[SemVer](https://semver.org/lang/es/). Cada versión corresponde a una línea base etiquetada en `main`.

## [Sin publicar]

### Añadido
- Configuración de Gestión de Configuración: catálogo de ECS en el README, plantillas de solicitud
  de cambio y de Pull Request, CODEOWNERS, integración continua e infraestructura como código.

## [1.0.0] - 2026-09-28

### Añadido
- Backend NestJS 11 con 11 módulos y 20 endpoints: autenticación con MFA, turnos, validación
  documental (adaptadores DIAN y operador portuario), eventos en tiempo real, muelles, flota,
  notificaciones, reportes y cabina del conductor.
- Base de datos PostgreSQL con 13 tablas gobernadas por migraciones y semilla de demostración.
- Frontend Next.js 16: portal del transportista y del operador, cabina del conductor con voz.
- Documentación técnica por módulo y capturas de cada funcionalidad.

[Sin publicar]: https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia/compare/v1.0.0...develop
[1.0.0]: https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia/releases/tag/v1.0.0
