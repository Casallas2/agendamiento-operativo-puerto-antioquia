# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionamiento
[SemVer](https://semver.org/lang/es/). Cada versión corresponde a una línea base etiquetada en `main`.

## [Sin publicar]

## [1.1.0] - pendiente de aprobación del ACC

OCI-001 · Prioridad de carga refrigerada y validación fitosanitaria ICA (SC-001, #1).

### Añadido
- RF-17: cuota prioritaria del 30 % por franja para carga refrigerada, liberada a la carga
  general 2 horas antes de la franja si no se usa.
- Validación pre-arribo del certificado fitosanitario mediante el nuevo AdaptadorIca.
- Migración CargaRefrigeradaIca (reversible) y semilla con turnos refrigerados.
- Indicadores de carga refrigerada y uso de la cuota en reportes.
- Interfaz: interruptor de carga refrigerada, campo del certificado ICA, cupos por tipo de
  carga e insignia de prioridad en tabla, detalle, resumen y cabina.
- 22 pruebas unitarias (regla de cupos y adaptador ICA).
- Gestión de Configuración: catálogo de ECS en el README, plantillas de solicitud de cambio y de
  Pull Request, CODEOWNERS, integración continua (GitHub Actions) e infraestructura como código
  (Terraform + AWS Config).

### Cambiado
- Ante un retraso de muelle, los turnos refrigerados se desplazan como máximo 30 minutos.
- La carga general recibe 409 con motivo explícito cuando solo quedan cupos de la cuota.

## [1.0.0] - 2026-09-28

### Añadido
- Backend NestJS 11 con 11 módulos y 20 endpoints: autenticación con MFA, turnos, validación
  documental (adaptadores DIAN y operador portuario), eventos en tiempo real, muelles, flota,
  notificaciones, reportes y cabina del conductor.
- Base de datos PostgreSQL con 13 tablas gobernadas por migraciones y semilla de demostración.
- Frontend Next.js 16: portal del transportista y del operador, cabina del conductor con voz.
- Documentación técnica por módulo y capturas de cada funcionalidad.

[Sin publicar]: https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia/compare/v1.0.0...develop
[1.1.0]: https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia/compare/v1.0.0...feature/OCI-001-carga-refrigerada-ica
[1.0.0]: https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia/releases/tag/v1.0.0
