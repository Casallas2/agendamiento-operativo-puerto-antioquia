# Agendamiento Operativo · Puerto Antioquia

Prototipo académico de agendamiento de turnos para el ingreso de tractocamiones a Puerto Antioquia.
Ingeniería de Software II · Uniremington.

| Carpeta | Contenido |
|---|---|
| `Backend/` | API en NestJS 11 + TypeORM + PostgreSQL (puerto 4000, prefijo `/api/v1`) |
| `Frontend/` | Aplicación web en Next.js 16 (puerto 3000) |
| `Docs/documentación/` | Arquitectura, contrato de la API, módulos y modelo de datos |
| `Docs/docs/` | Requerimientos, diseño arquitectónico y enunciado del parcial |
| `Docs/capturas/` | Capturas de cada módulo y funcionalidad |

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
