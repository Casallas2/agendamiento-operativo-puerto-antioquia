# 01 · Arquitectura y puesta en marcha

## Visión general

```
┌──────────────────────────────┐       ┌────────────────────────────────────────┐
│  Frontend · Next.js 16       │       │  Backend · NestJS 11                   │
│  puerto 3000                 │       │  puerto 4000, prefijo /api/v1          │
│                              │       │                                        │
│  vistas → hooks → servicios ─┼─ HTTP ┼→ controladores → servicios → TypeORM ──┼→ PostgreSQL
│                              │ cookie│                      │                 │
│  useEscucharTiempoReal ←─────┼─ SSE ─┼──── BusEventosService (Observer)        │
└──────────────────────────────┘       └────────────────────────────────────────┘
```

El frontend nunca ve un token: el JWT viaja en una cookie `httpOnly` que emite el backend.
Los eventos de dominio no se consultan por *polling*, se empujan por SSE.

## Requisitos

| Herramienta | Versión probada |
|---|---|
| Node.js | 24.21.0 |
| Yarn | 1.22.22 |
| PostgreSQL | 18.4 |

## Arranque

### 1. Backend

```bash
cd Backend
yarn install
# Ajusta las credenciales en .env si tu PostgreSQL no usa las del ejemplo
yarn migration:run     # crea las 13 tablas, los 9 tipos enum y la secuencia de códigos
yarn seed              # carga los datos de demostración
yarn start:dev         # http://localhost:4000/api/v1
```

Antes de la primera migración, la base debe existir:

```bash
createdb -U postgres agendamiento_operativo
```

La documentación Swagger queda en `http://localhost:4000/api/v1/docs`.

### 2. Frontend

```bash
cd Frontend
yarn install
yarn dev               # http://localhost:3000
```

## Variables de entorno

### `Backend/.env`

| Variable | Valor por defecto | Para qué sirve |
|---|---|---|
| `NODE_ENV` | `development` | Activa el registro extendido y desactiva `secure` en las cookies |
| `PORT` | `4000` | Puerto del API |
| `API_PREFIX` | `api/v1` | Prefijo de todas las rutas |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | Conexión a PostgreSQL |
| `DB_USERNAME` / `DB_PASSWORD` | `postgres` / — | Credenciales |
| `DB_NAME` | `agendamiento_operativo` | Base de datos |
| `JWT_SECRET` | — | **Cámbialo en producción.** Firma de los tokens |
| `JWT_EXPIRES_SECONDS` | `28800` | Vigencia del JWT y de la cookie (8 h) |
| `CORS_ORIGIN` | `http://localhost:3000` | Orígenes permitidos, separados por coma |
| `MFA_CODIGO_DEMO` | `246810` | Código fijo del segundo factor en el prototipo |
| `MFA_MAXIMO_INTENTOS` | `3` | Intentos antes de invalidar el desafío |
| `MFA_MINUTOS_VIGENCIA` | `5` | Caducidad del desafío |
| `SEMILLA_CONTRASENA_DEMO` | `Puerto2026!` | Contraseña de las tres cuentas de demostración |

### `Frontend/.env.local`

| Variable | Valor por defecto |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` |

## Cuentas de demostración

Todas usan la contraseña `Puerto2026!` y el código MFA `246810`.

| Rol | Correo | Qué puede hacer |
|---|---|---|
| Operador portuario | `operador@puertoantioquia.co` | Ve toda la operación, gestiona muelles y declara retrasos |
| Transportista | `transportista@transuraba.co` | Reserva y cancela turnos de su empresa, ve su flota |
| Conductor | `conductor@transuraba.co` | Cabina: su turno, avisar que va en camino, reportar novedades |

El operador y el conductor pueden estar conectados **a la vez en el mismo navegador**: cada área
usa su propia cookie (`puerto-sesion-portal` y `puerto-sesion-cabina`).

## Estructura del backend

```
Backend/src/
├── main.ts                    Arranque: CORS con credenciales, Helmet, validación global, Swagger
├── app.module.ts              Módulo raíz, guards globales y reanudación de validaciones
├── data-source.ts             DataSource del CLI de TypeORM
├── common/                    Recursos transversales
│   ├── constants/             Nombres de cookie y resolución de área
│   ├── decorators/            @Publico, @Roles, @UsuarioActual
│   ├── filters/               Normaliza todo error a { status, message }
│   ├── guards/                JwtAuthGuard (global) y RolesGuard
│   ├── strategies/            Extracción del JWT desde la cookie del área
│   └── types/                 Vocabulario de dominio y contrato de respuesta
├── modules/
│   ├── auth/          users/          flota/        muelles/
│   ├── turnos/        validacion/     eventos/      notificaciones/
│   ├── conductor/     reportes/       demo/
└── shared/database/
    ├── migrations/            Esquema inicial
    └── seeds/                 Datos de demostración, reutilizados por POST /demo/reset
```

## Reglas estructurales aplicadas

- Ningún archivo supera las 300 líneas; los servicios grandes se dividieron por responsabilidad
  (`turnos.service` para comandos, `turnos-consulta.service` para consultas).
- Cada módulo tiene sus propias `entities/`, `dto/` y `types/`.
- Los DTO validan la entrada con `class-validator`; los *types* describen las respuestas.
- Código en inglés, mensajes de usuario y comentarios en español.
- Las columnas usan `snake_case`; toda tabla lleva `id`, `created_at` y `updated_at`.
