# Estado del proyecto · Agendamiento Operativo Puerto Antioquia

> Documento de traspaso entre sesiones. Actualizado el **2026-10-02**.
> Léelo primero; luego `README.md` y `Docs/documentación/00-indice.md`.

## 1. Qué es

Prototipo académico (Ingeniería de Software II · Uniremington · profesora Marta Lucía Jiménez Torres)
de agendamiento de turnos para el ingreso de tractocamiones a Puerto Antioquia (Turbo, Urabá).
Autor: Jose Alejandro Benitez Casallas. Modalidad individual.

Problema que resuelve: congestión de tractocamiones en las vías de acceso a Turbo por llegadas
sin ventana asignada.

## 2. Historial académico

| Entrega | Peso | Fecha | Estado | Dónde está |
|---|---|---|---|---|
| Actividad 1 · Diseño arquitectónico y patrones | — | sep-2026 | ✅ Entregada | `Docs/docs/Diseno_arquitectonico_Puerto_Antioquia.md` |
| Parcial I · Prototipo UI/UX + Scrum (Anexo 3) | 15 % | 07-09-2026 | ✅ Entregado | `Docs/docs/Parcial_I_*.md`, `Docs/docs/Anexo_No_3_Parcial_I.md`, vista `/proyecto` del frontend (backlog HU-01…HU-10, 3 sprints) |
| **Parcial II · Gestión de Configuración (GCS)** | **25 %** | enunciado 28-09-2026 | 🟡 **En curso** | Enunciado: `Docs/docs/Parcial - 25 (Parcial II).md` · Solución: `Docs/docs/Solucion_Parcial_II.md` |

## 3. Arquitectura implementada

- **Backend:** NestJS 11 + TypeORM 0.3 + PostgreSQL 18 · puerto 4000 · prefijo `/api/v1` · Swagger en `/api/v1/docs`.
  11 módulos: `auth`, `users`, `flota`, `muelles`, `turnos`, `validacion`, `eventos`, `notificaciones`,
  `conductor`, `reportes`, `demo`. 20 endpoints. 13 tablas. 2 migraciones (`EsquemaInicial`, `EstadoConNovedad`).
- **Frontend:** Next.js 16.3 + React 19.2 + shadcn/ui · puerto 3000. Vistas: `/login`, `/dashboard`
  (resumen, turnos, nuevo turno, detalle, muelles, flota, alertas), `/conductor` (cabina con voz), `/proyecto`.
- **Contrato:** toda respuesta `{ status, message, data }`; JWT en cookie `httpOnly` por área
  (`puerto-sesion-portal` / `puerto-sesion-cabina`); tiempo real por SSE.
- **Patrones (de la Actividad 1):** Observer (`BusEventosService` + `despachador-notificaciones.observer`)
  y Adapter (`validacion/adaptadores/dian.adapter.ts`, `operador-portuario.adapter.ts` sobre `validador-externo.interface.ts`).
- **Desviación consciente del diseño:** el diseño habla de microservicios + Kafka; el prototipo es un
  **monolito modular** NestJS con bus de eventos en memoria que sustituye al broker.

Arranque: ver `README.md` (Node 24, Yarn 1.22, PostgreSQL 18, `yarn db:setup`, cuentas demo con `Puerto2026!` y MFA `246810`).

## 4. Cobertura de requisitos (`Docs/docs/Requerimientos_Puerto_Antioquia.md`)

| Implementado | Pendiente / parcial |
|---|---|
| RF-01 reserva, RF-02 validación (DIAN, BL, RUNT, SOAT, tecnomecánica), RF-03 tiempo real, RF-04 MFA + roles, RF-05 flota (consulta), RF-07 estados, RF-08 cancelación, RF-09/10 muelles y retrasos, RF-12 tablero, RF-13 voz | RF-06 carga de documentos, RF-11 portería con QR (no existe el rol agente de portería), RF-14 operación offline, RF-15 alertas de vencimiento, RF-16 historial completo, rol administrador |

Calidad: **no hay pruebas automatizadas** (Jest configurado, sin `*.spec.ts`) ni CI.

## 5. Estado del repositorio Git

- Remoto: `origin` → https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia (público).
- Una sola rama (`main`) y un solo commit (`d53d30f`, 28-09-2026). Sin etiquetas, sin `develop`,
  sin plantillas de PR/Issue, sin protección de ramas.
- `.gitignore` raíz excluye `node_modules`, `dist`, `.next`, `.env*` (salvo `.env.example`).
  `Backend/.env`, `Frontend/.env.local` y `Docs/variables-de-entorno/` existen en disco pero **no** se versionan.
- El `README.md` raíz todavía **no** tiene el catálogo de ECS que exige el Parcial II.

## 6. Qué sigue (Parcial II)

Plan detallado en `Docs/docs/Solucion_Parcial_II.md`. Resumen:

1. Etiquetar la línea base actual como `v1.0.0` en `main`.
2. Crear `develop` y la configuración GCS: `README.md` con catálogo ECS, `.github/PULL_REQUEST_TEMPLATE.md`,
   `.github/ISSUE_TEMPLATE/solicitud-de-cambio.md`, `CHANGELOG.md`.
3. Abrir el Issue de la Solicitud de Cambio y crear `feature/OCI-001-<nombre>` desde `develop`.
4. Implementar el cambio con Conventional Commits; abrir PR `feature → develop` (queda **abierto** para la entrega).
5. Proteger `main` y `develop` en GitHub; preparar `v1.1.0`.
6. Grabar el video (8–10 min): OCI → recorrido Git → auditoría y herramientas.

**Pendiente de decisión del estudiante:** qué cambio (OCI) se implementa. Propuesta recomendada:
OCI-001 *Priorización de carga refrigerada de banano y validación fitosanitaria ICA*.

## 7. Bitácora de sesiones

| Fecha | Qué se hizo |
|---|---|
| 2026-09-28 | Commit inicial con backend, frontend, documentación y capturas. |
| 2026-10-02 | Contextualización, creación de este archivo y de `Docs/docs/Solucion_Parcial_II.md`. Nada de Git tocado todavía. |
