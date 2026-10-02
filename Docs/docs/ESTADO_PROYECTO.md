# Estado del proyecto · Agendamiento Operativo Puerto Antioquia

> Documento de traspaso entre sesiones. Actualizado el **2026-10-02**.
> Léelo primero; luego `README.md` y `Docs/documentación/00-indice.md`.

## 1. Qué es

Prototipo académico (Ingeniería de Software II · Uniremington · profesora Marta Lucía Jiménez Torres)
de agendamiento de turnos para el ingreso de tractocamiones a Puerto Antioquia (Turbo, Urabá).
Autor: Jose Alejandro Benitez Casallas. Modalidad individual.

## 2. Historial académico

| Entrega | Peso | Estado | Dónde está |
|---|---|---|---|
| Actividad 1 · Diseño arquitectónico y patrones | — | ✅ Entregada | `Docs/docs/Diseno_arquitectonico_Puerto_Antioquia.md` |
| Parcial I · Prototipo UI/UX + Scrum | 15 % | ✅ Entregado | `Docs/docs/Parcial_I_*.md`, `Anexo_No_3_Parcial_I.md`, vista `/proyecto` |
| **Parcial II · Gestión de Configuración (GCS)** | **25 %** | 🟡 **Repositorio listo; falta grabar el video** | Enunciado `Parcial - 25 (Parcial II).md` · Solución `Solucion_Parcial_II.md` · Guion `Guion_Demostracion_Parcial_II.md` |

## 3. Arquitectura implementada

- **Backend:** NestJS 11 + TypeORM 0.3 + PostgreSQL 18 · puerto 4000 · `/api/v1` · Swagger en `/api/v1/docs`.
  11 módulos, 20 endpoints, 13 tablas, 3 migraciones (`EsquemaInicial`, `EstadoConNovedad`, `CargaRefrigeradaIca`).
- **Frontend:** Next.js 16.3 + React 19.2 + shadcn/ui · puerto 3000.
- **Patrones:** Observer (bus de eventos + SSE) y Adapter (DIAN, operador portuario y, desde OCI-001, ICA).
- **Desviación consciente:** el diseño habla de microservicios + Kafka; el prototipo es un monolito
  modular con bus de eventos en memoria.
- **Pruebas:** 22 unitarias con Jest (`cupo-prioritario.spec.ts`, `ica.adapter.spec.ts`).
- **CI:** GitHub Actions (`.github/workflows/ci.yml`): build + pruebas del backend, lint + build del frontend.
- **IaC:** `infra/terraform/` (RDS PostgreSQL + AWS Config). No hay despliegue real; Terraform no está instalado localmente.

## 4. Estado de Git y GitHub

Repositorio público: https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia

| Elemento | Estado |
|---|---|
| `main` | `v1.0.0` (etiqueta anotada sobre `d53d30f`). Protegida |
| `develop` | 6 commits de configuración GCS (README con catálogo ECS, plantillas, CODEOWNERS, CI, Terraform, CHANGELOG). Protegida |
| `feature/OCI-001-carga-refrigerada-ica` | 12 commits convencionales con la OCI-001 implementada |
| Issue #1 | SC-001, etiquetas `solicitud-de-cambio`, `aprobada-ACC`, `OCI-001` |
| PR #2 | `feature/OCI-001-… → develop`, **abierto a propósito** (lo exige el enunciado), CI en verde |
| Protección de ramas | `main` y `develop`: PR con 1 aprobación + code owners, checks de CI obligatorios, sin *force push* ni borrado. `enforce_admins` desactivado: el dueño puede integrar sin segundo revisor |

**Pendiente de la versión 1.1.0** (hacerlo solo cuando el usuario lo pida, después de grabar el video):
aprobar e integrar el PR #2, crear `release/1.1.0`, subir la versión a 1.1.0 en ambos `package.json`,
fechar el CHANGELOG, integrar en `main` y crear la etiqueta `v1.1.0`. Comandos en la sección 5 del guion.

## 5. OCI-001 · qué se implementó

Prioridad de carga refrigerada (banano) y validación fitosanitaria ICA:

- `turnos/cupo-prioritario.ts`: cuota del 30 % (`FLOOR`), liberada 2 h antes; refrigerados desplazados máx. 30 min.
- `turnos/franjas.helper.ts`: la regla viaja dentro del `UPDATE` (concurrencia).
- `validacion/adaptadores/ica.adapter.ts` + `validacionesAplicables()` (6.ª validación solo para refrigerada).
- `GET /slots` devuelve `disponibles: { general, refrigerada }`; `POST /bookings` acepta `cargaRefrigerada` y `numeroCertificadoIca` (`CFE-AAAA-NNNNNN`).
- Semilla: TRN-1001/1005/1006 refrigerados; certificados ICA válidos `CFE-2026-001190/1204/1215/1230/1247`; falso de ejemplo `CFE-2026-009999`.
- Verificado de punta a punta contra la API real y en el navegador (2026-10-02).

## 6. Requisitos aún pendientes

RF-06 carga de documentos, RF-11 portería con QR (no existe el rol agente de portería), RF-14 operación
sin conexión, RF-15 alertas de vencimiento, RF-16 historial completo y el rol administrador.

## 7. Bitácora de sesiones

| Fecha | Qué se hizo |
|---|---|
| 2026-09-28 | Commit inicial con backend, frontend, documentación y capturas. |
| 2026-10-02 | Contextualización y propuestas de OCI. Elegida la OCI-001. Etiqueta `v1.0.0`, rama `develop` con la configuración GCS, Issue #1, implementación completa de la OCI-001 en `feature/OCI-001-carga-refrigerada-ica`, PR #2 abierto, ramas protegidas, solución del Parcial II y guion de demostración. |
