# Agendamiento Operativo · Puerto Antioquia

Prototipo académico de agendamiento de turnos para el ingreso de tractocamiones a Puerto Antioquia.
Ingeniería de Software II · Uniremington.

| Carpeta | Contenido |
|---|---|
| `Backend/` | API en NestJS 11 + TypeORM + PostgreSQL (puerto 4000, prefijo `/api/v1`) |
| `Frontend/` | Aplicación web en Next.js 16 (puerto 3000) |
| `Docs/documentación/` | Arquitectura, contrato de la API, módulos y modelo de datos |
| `Docs/docs/` | Requerimientos, diseño arquitectónico, enunciados y solución de los parciales |
| `Docs/capturas/` | Capturas de cada módulo y funcionalidad |
| `infra/terraform/` | Infraestructura como código (AWS RDS + AWS Config) |
| `.github/` | Plantillas de cambio, CODEOWNERS e integración continua |

## Requisitos

Node.js 24, Yarn 1.22 y PostgreSQL 18.

## Puesta en marcha

```bash
# Backend
cd Backend
cp .env.example .env            # ajusta las credenciales de PostgreSQL
createdb -U postgres agendamiento_operativo
yarn install
yarn db:setup                   # migraciones + datos de demostración
yarn start:dev                  # http://localhost:4000/api/v1 · Swagger en /api/v1/docs

# Frontend (en otra terminal)
cd Frontend
cp .env.example .env.local
yarn install
yarn dev                        # http://localhost:3000
```

## Cuentas de demostración

Contraseña `Puerto2026!` y código MFA `246810` para todas.

| Rol | Correo |
|---|---|
| Operador portuario | `operador@puertoantioquia.co` |
| Transportista | `transportista@transuraba.co` |
| Conductor | `conductor@transuraba.co` |

Más detalle en [`Docs/documentación/01-arquitectura-y-arranque.md`](Docs/documentación/01-arquitectura-y-arranque.md).

---

## Gestión de Configuración de Software (GCS)

Plan completo en [`Docs/docs/Solucion_Parcial_II.md`](Docs/docs/Solucion_Parcial_II.md).

### Catálogo de Elementos de Configuración (ECS)

Identificador `ECS-<clase>-<nn>`; la versión de cada elemento es la etiqueta Git de la línea base
que lo contiene. Ningún ECS cambia sin una Orden de Cambio de Ingeniería (OCI) aprobada.

#### Programas

| ID | Elemento | Ubicación |
|---|---|---|
| ECS-PRG-01 | Arranque y módulo raíz de la API | `Backend/src/main.ts`, `Backend/src/app.module.ts` |
| ECS-PRG-02 | Núcleo transversal (guards, filtros, decoradores, tipos de dominio) | `Backend/src/common/` |
| ECS-PRG-03 | Módulo Autenticación (MFA, JWT) | `Backend/src/modules/auth/` |
| ECS-PRG-04 | Módulo Turnos (reserva, franjas, cupos) | `Backend/src/modules/turnos/` |
| ECS-PRG-05 | Módulo Validación Documental y adaptadores | `Backend/src/modules/validacion/` |
| ECS-PRG-06 | Módulo Eventos (Observer + SSE) | `Backend/src/modules/eventos/` |
| ECS-PRG-07 | Módulo Muelles | `Backend/src/modules/muelles/` |
| ECS-PRG-08 | Módulos Flota, Notificaciones, Reportes, Conductor, Usuarios, Demo | `Backend/src/modules/` |
| ECS-PRG-09 | Rutas y vistas web | `Frontend/src/app/`, `Frontend/src/modules/*/views/` |
| ECS-PRG-10 | Componentes UI y sistema de diseño | `Frontend/src/components/`, `Frontend/src/app/globals.css` |
| ECS-PRG-11 | Servicios, hooks y estado del cliente | `Frontend/src/core/`, `Frontend/src/modules/*/{services,hooks}/` |
| ECS-PRG-12 | Configuración de construcción y dependencias | `package.json`, `yarn.lock`, `tsconfig*.json`, `nest-cli.json`, `next.config.ts` |
| ECS-PRG-13 | Ejecutables | `Backend/dist/`, `Frontend/.next/` — derivados, no se versionan |
| ECS-PRG-14 | Infraestructura como código | `infra/terraform/` |
| ECS-PRG-15 | Integración continua | `.github/workflows/ci.yml` |

#### Datos

| ID | Elemento | Ubicación / origen |
|---|---|---|
| ECS-DAT-01 | Esquema de base de datos (migraciones) | `Backend/src/shared/database/migrations/` |
| ECS-DAT-02 | Entidades ORM | `Backend/src/modules/*/entities/` |
| ECS-DAT-03 | Datos maestros y semilla | `Backend/src/shared/database/seeds/` |
| ECS-DAT-04 | Plantillas de variables de entorno | `Backend/.env.example`, `Frontend/.env.example` |
| ECS-DAT-05 | Contrato externo DIAN (SOAP/XML) | `Backend/src/modules/validacion/adaptadores/dian.adapter.ts` |
| ECS-DAT-06 | Contrato externo operador portuario / RUNT (REST) | `Backend/src/modules/validacion/adaptadores/operador-portuario.adapter.ts` |
| ECS-DAT-07 | Catálogo de validaciones pre-arribo | `Backend/src/modules/validacion/catalogo-validaciones.ts`, `Frontend/src/core/config/catalogos.ts` |

#### Documentación

| ID | Elemento | Ubicación |
|---|---|---|
| ECS-DOC-01 | Diseño arquitectónico y patrones | `Docs/docs/Diseno_arquitectonico_Puerto_Antioquia.md` |
| ECS-DOC-02 | Línea base de requerimientos | `Docs/docs/Requerimientos_Puerto_Antioquia.md` |
| ECS-DOC-03 | Backlog Scrum y diseño UX | `Frontend/src/modules/proyecto/data/`, `Docs/docs/Anexo_No_3_Parcial_I.md` |
| ECS-DOC-04 | Manual técnico | `Docs/documentación/` |
| ECS-DOC-05 | Manual de usuario y arranque | `README.md`, `Docs/documentación/01-arquitectura-y-arranque.md` |
| ECS-DOC-06 | Evidencia visual | `Docs/capturas/` |
| ECS-DOC-07 | Documentación viva de la API | Swagger en `/api/v1/docs` |
| ECS-DOC-08 | Plan de GCS, plantillas y bitácora de versiones | `Docs/docs/Solucion_Parcial_II.md`, `.github/`, `CHANGELOG.md` |

### Versionamiento y ramas

- **SemVer** `MAYOR.MENOR.PARCHE`; cada versión liberada es una etiqueta anotada en `main`.
  Historial de versiones en [`CHANGELOG.md`](CHANGELOG.md).
- **GitFlow:** `main` (liberado) · `develop` (integración) · `feature/OCI-<nn>-<nombre>` ·
  `release/<x.y.z>` · `hotfix/<x.y.z>`. `main` y `develop` están protegidas: solo cambian por Pull Request.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org) con el ID de la OCI,
  por ejemplo `feat(turnos): cuota prioritaria para carga refrigerada [OCI-001]`.
- **Flujo de cambio:** Issue *Solicitud de cambio* → análisis de impacto → rama `feature/OCI-…` →
  Pull Request con la plantilla → aprobación del Comité de Control (ACC) → `release` → etiqueta.

| Versión | Contenido | Estado |
|---|---|---|
| `v1.0.0` | Línea base del prototipo | Liberada |
| `v1.1.0` | OCI-001 · Prioridad de carga refrigerada y validación fitosanitaria ICA | En revisión del ACC |
