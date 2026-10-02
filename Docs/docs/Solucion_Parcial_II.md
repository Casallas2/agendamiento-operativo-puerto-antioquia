# Plan de Gestión de Configuración de Software (GCS) · Solución del Parcial II

| | |
|---|---|
| **Proyecto** | Plataforma de Agendamiento Operativo Puerto Antioquia |
| **Asignatura** | Ingeniería de Software 2 · Unidad 2: Gestión de Configuración de Software |
| **Profesora** | Marta Lucía Jiménez Torres |
| **Estudiante / Rol** | Jose Alejandro Benitez Casallas · Líder de Configuración de Software |
| **Código / Peso** | ING-TLL-5 · 25 % |
| **Repositorio** | https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia |
| **Línea base de partida** | `v1.0.0` (commit `d53d30f`, 28-09-2026) |
| **Versión objetivo** | `v1.1.0` (OCI-001) |
| **Guion de demostración** | [`Guion_Demostracion_Parcial_II.md`](Guion_Demostracion_Parcial_II.md) |

Este documento responde, en orden, a los puntos A a E del enunciado y a la estructura exigida
del repositorio. Cada afirmación remite a un elemento verificable en GitHub.

---

## A. Identificación de Elementos de Configuración de Software (ECS)

Un ECS es toda pieza de información creada en el proceso de ingeniería que se somete a control
formal: se identifica de forma única, se versiona en Git y solo cambia mediante una Orden de
Cambio de Ingeniería (OCI) aprobada.

**Convención:** `ECS-<clase>-<nn>`, con clase `PRG` (programas), `DAT` (datos) o `DOC`
(documentación). La versión de cada ECS es la etiqueta Git de la línea base que lo contiene.
El catálogo vivo está en el `README.md` del repositorio.

### A.1 Programas (fuentes y ejecutables: módulos, vistas, APIs)

| ID | Elemento | Ubicación | Tipo |
|---|---|---|---|
| ECS-PRG-01 | Arranque y módulo raíz de la API | `Backend/src/main.ts`, `app.module.ts` | Fuente |
| ECS-PRG-02 | Núcleo transversal (guards, filtros, decoradores, tipos de dominio) | `Backend/src/common/` | Fuente |
| ECS-PRG-03 | Módulo Autenticación (login + MFA + JWT) | `Backend/src/modules/auth/` | Fuente / API |
| ECS-PRG-04 | Módulo Turnos (reserva, franjas, cupos) | `Backend/src/modules/turnos/` | Fuente / API |
| ECS-PRG-05 | Módulo Validación Documental + adaptadores (DIAN, operador, ICA) | `Backend/src/modules/validacion/` | Fuente / API |
| ECS-PRG-06 | Módulo Eventos (bus Observer + SSE) | `Backend/src/modules/eventos/` | Fuente / API |
| ECS-PRG-07 | Módulo Muelles | `Backend/src/modules/muelles/` | Fuente / API |
| ECS-PRG-08 | Módulos Flota, Notificaciones, Reportes, Conductor, Usuarios, Demo | `Backend/src/modules/*` | Fuente / API |
| ECS-PRG-09 | Aplicación web: rutas y vistas | `Frontend/src/app/`, `Frontend/src/modules/*/views` | Fuente / Vista |
| ECS-PRG-10 | Componentes UI y sistema de diseño | `Frontend/src/components/`, `globals.css` | Fuente / Vista |
| ECS-PRG-11 | Servicios, hooks y estado del cliente | `Frontend/src/core/`, `Frontend/src/modules/*/{services,hooks}` | Fuente |
| ECS-PRG-12 | Configuración de construcción y dependencias | `package.json`, `yarn.lock`, `tsconfig*.json`, `nest-cli.json`, `next.config.ts` | Configuración |
| ECS-PRG-13 | Ejecutables | `Backend/dist/`, `Frontend/.next/` | Ejecutable · **derivado**: no se versiona, se reconstruye desde la etiqueta |
| ECS-PRG-14 | Infraestructura como código | `infra/terraform/` | Configuración |
| ECS-PRG-15 | Integración continua | `.github/workflows/ci.yml` | Configuración |

### A.2 Datos (base de datos propia y datos externos)

| ID | Elemento | Ubicación / origen | Tipo |
|---|---|---|---|
| ECS-DAT-01 | Esquema de la base de datos (3 migraciones) | `Backend/src/shared/database/migrations/` | Base de datos propia (PostgreSQL 18) |
| ECS-DAT-02 | Entidades ORM | `Backend/src/modules/*/entities/` | Modelo de datos |
| ECS-DAT-03 | Datos maestros y semilla | `Backend/src/shared/database/seeds/` | Datos de referencia |
| ECS-DAT-04 | Plantillas de variables de entorno | `Backend/.env.example`, `Frontend/.env.example` | Configuración (los `.env` reales **no** se versionan) |
| ECS-DAT-05 | Contrato con la DIAN (SOAP/XML) | `validacion/adaptadores/dian.adapter.ts` | Datos externos · API de terceros |
| ECS-DAT-06 | Contrato con el operador portuario y RUNT (REST/JSON) | `validacion/adaptadores/operador-portuario.adapter.ts` | Datos externos · API de terceros |
| ECS-DAT-07 | Catálogo de validaciones pre-arribo | `validacion/catalogo-validaciones.ts` + espejo `Frontend/src/core/config/catalogos.ts` | Datos de referencia |
| ECS-DAT-08 | Contrato con el ICA (REST/JSON) — **nuevo en OCI-001** | `validacion/adaptadores/ica.adapter.ts` | Datos externos · API de terceros |

### A.3 Documentación (manual técnico, manual de usuario, especificación arquitectónica)

| ID | Elemento | Ubicación |
|---|---|---|
| ECS-DOC-01 | Especificación arquitectónica y patrones | `Docs/docs/Diseno_arquitectonico_Puerto_Antioquia.md` |
| ECS-DOC-02 | Línea base de requerimientos | `Docs/docs/Requerimientos_Puerto_Antioquia.md` |
| ECS-DOC-03 | Backlog Scrum y diseño UX (Parcial I) | `Frontend/src/modules/proyecto/data/`, `Docs/docs/Anexo_No_3_Parcial_I.md` |
| ECS-DOC-04 | Manual técnico | `Docs/documentación/00` a `11` |
| ECS-DOC-05 | Manual de usuario y arranque | `README.md`, `Docs/documentación/01-arquitectura-y-arranque.md` |
| ECS-DOC-06 | Evidencia visual por módulo | `Docs/capturas/` |
| ECS-DOC-07 | Documentación viva de la API | Swagger en `/api/v1/docs` |
| ECS-DOC-08 | Plan de GCS, plantillas y bitácora de versiones | este documento, `.github/`, `CHANGELOG.md` |

### A.4 Líneas base

| Línea base | Contenido | Identificación en Git |
|---|---|---|
| LB-Funcional | ECS-DOC-01 y ECS-DOC-02 aprobados (Actividad 1) | — |
| LB-Diseño | ECS-DOC-03 + prototipo (Parcial I) | — |
| **LB-Producto 1.0** | Todos los ECS tal como estaban el 28-09-2026 | etiqueta anotada **`v1.0.0`** |
| LB-Producto 1.1 | LB 1.0 + configuración GCS + OCI-001 auditada | etiqueta `v1.1.0` (al aprobar el ACC) |

---

## B. Flujo y control de cambios (caso de estudio)

### B.0 Flujo aplicado y dónde se ve en GitHub

```
 Petición de cambio ──► Análisis de impacto ──► Comité de Control (ACC) ──► OCI-001
   Issue #1 (SC-001)        sección B.2              revisión del PR             │
                                                                                 ▼
 Informe de estado ◄── Auditoría FCA/PCA ◄── Pull Request → develop ◄── feature/OCI-001-carga-refrigerada-ica
   sección D.2            plantilla del PR       (abierto)               12 commits convencionales
                                                     │
                                                     ▼  (tras aprobación)
                                    release/1.1.0 ──► main + etiqueta v1.1.0
```

### B.1 Solicitud de cambio justificada (SC-001 · Issue #1)

| Campo | Contenido |
|---|---|
| **ID** | SC-001 |
| **Fecha** | 2026-10-02 |
| **Solicitante** | Gremio exportador bananero de Urabá, vía Gerencia de Operaciones de Puerto Antioquia |
| **Título** | Prioridad de carga refrigerada (banano de exportación) y validación fitosanitaria ICA |
| **Tipo** | Evolutivo · origen comercial y gubernamental |
| **Prioridad** | Alta |

**Necesidad del entorno.** El banano es el principal producto de exportación de Urabá y viaja en
contenedores refrigerados (*reefer*). La versión 1.0.0 trataba igual a un contenedor refrigerado
que a carga general: si un tractocamión *reefer* se quedaba sin cupo o su ventana se desplazaba
por un retraso de muelle, la fruta perdía vida útil y el exportador asumía la pérdida. Además, el
**ICA** exige el certificado fitosanitario de exportación antes del embarque y la plataforma no lo
validaba, de modo que un turno podía quedar CONFIRMADO y ser rechazado ya en el puerto.

**Cambio solicitado.**
1. Marcar un turno como **carga refrigerada** al reservarlo.
2. Reservar en cada franja una **cuota prioritaria** (30 % de la capacidad) solo para carga
   refrigerada; la cuota se libera a la carga general 2 horas antes si no se usó.
3. Añadir la validación pre-arribo **Certificado fitosanitario ICA** mediante un adaptador nuevo.
4. Ante un retraso de muelle, limitar a **30 minutos** el desplazamiento de los turnos refrigerados.
5. Mostrar la prioridad y la nueva validación en portal, cabina y reportes.

Requerimiento nuevo: **RF-17 Prioridad de carga perecedera**; amplía RF-02 y la restricción R-02.

### B.2 Análisis de impacto

#### Componentes afectados (trazabilidad con la arquitectura de la Actividad 1 y el Parcial I)

| ECS | Componente | Cambio realizado | Impacto |
|---|---|---|---|
| ECS-PRG-02 | `common/types/dominio.type.ts` | Valores `CERTIFICADO_ICA` (TipoValidacion) e `ICA` (SistemaExterno) | Medio: vocabulario compartido con el frontend |
| ECS-PRG-05 / DAT-08 | Validación Documental | Nuevo `AdaptadorIca` que implementa `ValidadorExterno`; consulta condicional en el servicio | **Bajo**: el patrón Adapter absorbe el cambio sin tocar la lógica central (RNF-09) |
| ECS-PRG-04 | Turnos | `cupo-prioritario.ts`, `tomarCupo` con la regla en SQL, DTO con `cargaRefrigerada` y `numeroCertificadoIca` | **Alto**: sección crítica de concurrencia del cupo |
| ECS-PRG-07 | Muelles | Tope de 30 min al desplazamiento de turnos refrigerados | Medio |
| ECS-PRG-06 | Eventos | Solo cambia el texto de las notificaciones | Bajo (Observer: los observadores no cambian) |
| ECS-PRG-08 | Reportes | Indicadores `turnosRefrigeradosHoy` y `usoCuotaPrioritaria` | Bajo |
| ECS-PRG-09/10/11 | Frontend | Interruptor de carga refrigerada, campo ICA, cupos por tipo de carga, insignia de prioridad | Medio |
| ECS-DAT-01/02 | Esquema y entidades | Migración `CargaRefrigeradaIca`: 4 columnas, 2 `CHECK`, 1 índice parcial, 2 valores de enum | **Alto**: un valor de enum no se puede quitar con un `ALTER` simple |
| ECS-DAT-03 | Semilla | Turnos refrigerados y certificados ICA de ejemplo | Bajo |
| ECS-DOC-02/04 | Documentación | RF-17; documentos 00, 02, 04, 05 y 09 | Bajo |

Resultado medido: **50 archivos** modificados o nuevos sobre `develop`, de ellos 40 de código y pruebas (`git diff --stat develop..feature/OCI-001-carga-refrigerada-ica`).

#### Esfuerzo técnico

| Actividad | Horas |
|---|---|
| Migración, entidades y tipos | 4 |
| Adaptador ICA y catálogo | 4 |
| Regla de cuota y prioridad ante retrasos | 8 |
| Frontend (formulario, selector, tabla, detalle, cabina, reportes) | 8 |
| Pruebas unitarias (22) y prueba de punta a punta contra la API | 6 |
| Documentación y auditoría | 4 |
| **Total** | **34 h ≈ 1 sprint de 2 semanas (8 puntos)** |

**Costo estimado:** 34 h × COP 45.000/h ≈ **COP 1.530.000**. Sin costo de infraestructura
adicional: el adaptador ICA se simula, igual que los de DIAN y operador.

#### Efectos secundarios y riesgos

| Riesgo | Prob. | Impacto | Mitigación aplicada |
|---|---|---|---|
| La cuota rompe la integridad del cupo bajo concurrencia | Media | Alto | La regla viaja dentro del `UPDATE` (PostgreSQL arbitra) + `CHECK` en la tabla + 17 pruebas de la regla |
| Inanición de la carga general en temporada alta | Media | Medio | Tope del 30 %; la cuota se libera 2 h antes de la franja |
| Divergencia de tipos backend/frontend | Media | Medio | Ítem P4 de la auditoría; `tsc` y `nest build` en la CI |
| Migración de enum no reversible | Baja | Alto | `down()` que recrea los tipos; probado `run → revert → run` |
| El ICA no publica una API abierta | Alta | Bajo | Adaptador simulado detrás de la interfaz; pasar a la API real solo toca `ica.adapter.ts` |

**Nivel de riesgo global para la arquitectura: MEDIO.** Los estilos y patrones del diseño
(EDA, Observer, Adapter) se conservan; el riesgo se concentra en la regla de cupo y se mitigó.

### B.3 Orden de Cambio de Ingeniería (OCI-001)

| Campo | Contenido |
|---|---|
| **OCI** | OCI-001 · deriva de SC-001 (Issue #1) |
| **Descripción** | Implementar la prioridad de carga refrigerada y la validación fitosanitaria ICA |
| **ECS afectados** | ECS-PRG-02, 04, 05, 07, 08, 09, 10, 11 · ECS-DAT-01, 02, 03, 07, 08 · ECS-DOC-02, 04, 08 |
| **Rama** | `feature/OCI-001-carga-refrigerada-ica` (desde `develop`) |
| **Integración** | Pull Request `feature/OCI-001-… → develop` con la plantilla de OCI |
| **Versión resultante** | `v1.1.0` (MENOR: funcionalidad nueva y compatible hacia atrás) |
| **Restricciones** | No cambiar el contrato `{ status, message, data }` · no romper endpoints existentes · cuota ≤ 30 % · ningún archivo > 300 líneas · la migración debe tener `down()` · sin secretos en el repositorio |
| **Plan de reversión** | Revertir el *merge commit* y ejecutar `yarn migration:revert` |

**Criterios de aceptación y su verificación** (prueba de punta a punta contra la API real, 02-10-2026):

| # | Criterio | Resultado observado |
|---|---|---|
| 1 | Un turno refrigerado puede usar la cuota prioritaria y, si se agota, la general | `202` · `TRN-1007` en una franja sin cupo general; la franja pasa a `ocupadosRefrigerados: 1` ✅ |
| 2 | Un turno general no puede tomar la cuota hasta 2 h antes | `409` «Los cupos que quedan en esta franja están reservados para carga refrigerada» ✅ |
| 3 | Sin certificado ICA válido, el turno refrigerado no avanza | Sin certificado: `400` de formato. Con `CFE-2026-009999`: `RECHAZADO` «El certificado fitosanitario no está expedido por el ICA» ✅ |
| 4 | Ante un retraso, los refrigerados se desplazan como máximo 30 min | Retraso de 90 min en Muelle 2 → `TRN-1001` (refrigerado) desplazado 30 min ✅ |
| 5 | Los turnos de carga general siguen funcionando igual | Reserva general `202` con 5 validaciones; cancelación `200` libera el cupo ✅ |
| 6 | Build, lint y pruebas sin errores | `nest build` ✅ · `eslint` ✅ · `tsc` ✅ · `next build` ✅ · `jest` 22/22 ✅ · GitHub Actions ✅ |

**Aprobación del Comité de Control de Configuración (ACC)**

| Rol en el ACC | Nombre | Decisión | Fecha |
|---|---|---|---|
| Líder de Configuración | Jose Alejandro Benitez Casallas | Aprobada | 2026-10-02 |
| Product Owner (simulado) | Gerencia de Operaciones Puerto Antioquia | Aprobada | 2026-10-02 |
| Arquitecto (simulado) | Revisor técnico | Aprobada con condición: pruebas automáticas de la regla de cupo (cumplida) | 2026-10-02 |

En GitHub, la aprobación se materializa como la **revisión del Pull Request** y el Issue SC-001
enlazado con `Closes #1`; la etiqueta `aprobada-ACC` del Issue registra la decisión.

---

## C. Estrategia de control de versiones y ramas

### C.1 Esquema de versionamiento

**Versionamiento Semántico (SemVer 2.0.0)** `MAYOR.MENOR.PARCHE`:

| Componente | Sube cuando… | Ejemplo en el proyecto |
|---|---|---|
| MAYOR | Se rompe el contrato de la API o el esquema sin migración compatible | Pasar a microservicios con Kafka → `2.0.0` |
| MENOR | Se añade funcionalidad compatible hacia atrás | OCI-001 → **`1.1.0`** |
| PARCHE | Se corrige un defecto sin funcionalidad nueva | Fallo en el cálculo de la cuota → `1.1.1` |

- Cada versión liberada es una **etiqueta anotada** en `main` (`v1.0.0` ya existe) y un *Release* de GitHub.
- Backend y Frontend llevan el mismo número en `package.json`; se sube en la rama `release/x.y.z`.
- **Commits:** Conventional Commits con el ID de la OCI:
  `feat(turnos): cuota prioritaria para carga refrigerada [OCI-001]`.
- **`CHANGELOG.md`** (formato *Keep a Changelog*) registra cada versión.

Historial real de la OCI (`git log --oneline develop..feature/OCI-001-carga-refrigerada-ica`):

```
docs(estado): estado del proyecto tras la OCI-001
docs(gcs): solución del Parcial II y guion de demostración [OCI-001]
docs(changelog): entrada de la versión 1.1.0 [OCI-001]
docs(oci-001): RF-17 y documentación técnica de turnos, validación, datos y API
test(validacion): pruebas del adaptador ICA y del catálogo aplicable [OCI-001]
feat(front): reserva de carga refrigerada con certificado ICA y prioridad [OCI-001]
feat(seed): turnos refrigerados y certificados ICA de demostración [OCI-001]
feat(reportes): indicadores de carga refrigerada y uso de la cuota [OCI-001]
feat(muelles): la carga refrigerada se atiende primero ante un retraso [OCI-001]
feat(turnos): cuota prioritaria para carga refrigerada [OCI-001]
feat(validacion): adaptador ICA y certificado fitosanitario pre-arribo [OCI-001]
feat(db): esquema para carga refrigerada y certificado ICA [OCI-001]
```

### C.2 Estrategia de ramas: GitFlow

```
main      ●──────────────────────────────────────────────●──────────●
          v1.0.0                                         v1.1.0     v1.1.1
            \                                           /          /
release      \                             ●───────────●          /
              \                           /  release/1.1.0       /
develop        ●─●─●─●─●─●───────────────●──────────────●───────●
               config GCS \             / (PR aprobado)  \     /
feature                    ●─●─●─●─●─●─●  feature/OCI-001-…   hotfix/1.1.1
```

| Rama | Origen → destino | Propósito | Protección configurada |
|---|---|---|---|
| `main` | — | Solo versiones liberadas y etiquetadas | PR obligatorio con 1 aprobación, CI en verde, sin *force push* ni borrado |
| `develop` | `main` → — | Integración de cambios aprobados | PR obligatorio con 1 aprobación, CI en verde, sin *force push* ni borrado |
| `feature/OCI-<nn>-<nombre>` | `develop` → `develop` | Un cambio aprobado por OCI | Se borra tras el *merge* |
| `release/<x.y.z>` | `develop` → `main` + `develop` | Estabilizar, auditar y subir versión | Solo correcciones |
| `hotfix/<x.y.z>` | `main` → `main` + `develop` | Defecto crítico en producción | PR con aprobación |

**Por qué GitFlow y no Trunk-Based:** el proyecto trabaja con líneas base formales y entregas
por versión; GitFlow separa lo liberado (`main`) de lo integrado (`develop`) y aísla cada OCI en su
rama, que es la trazabilidad que pide la GCS. Trunk-Based conviene a equipos grandes con despliegue
continuo y *feature flags*, que aquí no existen.

### C.3 Control de colaboradores y copias

- **Reglas de protección** de `main` y `develop` (Settings → Branches): nadie integra sin PR.
- **`CODEOWNERS`**: migraciones, tipos de dominio, adaptadores externos, infraestructura y
  `.github/` piden revisión del Líder de Configuración.
- **Plantillas**: `.github/ISSUE_TEMPLATE/solicitud-de-cambio.md` y `.github/PULL_REQUEST_TEMPLATE.md`
  (esta última incluye la lista de auditoría).
- **Copias**: GitHub es la copia maestra; cada clon es una réplica completa (Git es distribuido).
  Cualquier línea base se reconstruye con `git checkout v1.0.0`.
- **Gestión de variantes**: las variantes por entorno no se ramifican; se configuran por
  variables (`.env.example`) y por `var.entorno` en Terraform.

---

## D. Auditoría de la configuración y reporte de estados

### D.1 Lista de chequeo de auditoría (antes de liberar `v1.1.0`)

**Auditoría funcional (FCA) — ¿el producto hace lo que la OCI aprobó?**

| # | Pregunta de verificación | Evidencia | Estado |
|---|---|---|---|
| F1 | ¿Se cumplen los 6 criterios de aceptación de la OCI-001? | Tabla de B.3 | ✅ |
| F2 | ¿Pasan las pruebas automáticas de la cuota y del adaptador ICA? | `yarn test`: 22/22 · GitHub Actions | ✅ |
| F3 | ¿Los turnos de carga general siguen funcionando igual? | Criterio 5 (reserva y cancelación) | ✅ |
| F4 | ¿Todos los endpoints responden con `{ status, message, data }`? | Respuestas 202/400/409 de B.3 · Swagger | ✅ |
| F5 | ¿La reserva sigue confirmando en ≤ 2 s (RNF-04)? | El `POST` responde 202 antes de validar | ✅ |

**Auditoría física (PCA) — ¿lo que se libera es exactamente lo que se aprobó?**

| # | Pregunta de verificación | Evidencia | Estado |
|---|---|---|---|
| P1 | ¿Cada commit cita la OCI y sigue Conventional Commits? | `git log --oneline develop..feature/OCI-001-…` | ✅ |
| P2 | ¿Solo cambiaron los ECS declarados en la OCI? | `git diff --stat develop..feature/OCI-001-…` vs. tabla B.2 | ✅ |
| P3 | ¿La migración tiene `up()` y `down()` y se probó la reversión? | `yarn migration:run` → `migration:revert` → `migration:run` | ✅ |
| P4 | ¿Los tipos del backend y su espejo en el frontend coinciden? | `dominio.type.ts` vs `turnos.types.ts`; `tsc` sin errores | ✅ |
| P5 | ¿No se versionó ningún secreto? | `git ls-files \| grep .env` → solo `.env.example` | ✅ |
| P6 | ¿Build y lint sin errores en ambos proyectos? | CI en el PR | ✅ |
| P7 | ¿Se actualizaron README, CHANGELOG y documentación técnica? | Commits `docs(...)` | ✅ |
| P8 | ¿La versión de `package.json` es `1.1.0` y existe la etiqueta? | Se completa en `release/1.1.0` | ⏳ al liberar |
| P9 | ¿El PR tiene la aprobación del ACC y enlaza SC-001? | PR con `Closes #1` | ⏳ revisión del ACC |

**Revisión Técnica Formal (RTF):** la lista se recorre dentro del Pull Request (viene en su
plantilla) y su resultado se resume en el Informe de Estado.

### D.2 Informe de Estado / Dictamen (estructura y primer informe)

```
INFORME DE ESTADO DE CONFIGURACIÓN  N.º IEC-001
Proyecto: Agendamiento Operativo Puerto Antioquia        Fecha de emisión: 2026-10-02

1. ¿QUÉ PASÓ?
   - Cambio:          OCI-001 · Prioridad de carga refrigerada y validación fitosanitaria ICA
   - Versión:         v1.0.0  →  v1.1.0 (MENOR)
   - ECS nuevos:      ECS-DAT-08 (ica.adapter.ts), migración CargaRefrigeradaIca,
                      cupo-prioritario.ts, 2 archivos de pruebas
   - ECS modificados: ECS-PRG-02, 04, 05, 07, 08, 09, 10, 11 · ECS-DAT-01, 02, 03, 07 · ECS-DOC-02, 04
   - Commits:         12 en feature/OCI-001-carga-refrigerada-ica (ver C.1)

2. ¿QUIÉN LO HIZO?
   - Solicitó:   Gremio exportador bananero, vía Gerencia de Operaciones   (Issue #1)
   - Aprobó:     Comité de Control de Cambios (ACC)                        (etiqueta aprobada-ACC, revisión del PR)
   - Implementó: Jose Alejandro Benitez Casallas                           (autor de los commits)
   - Auditó:     Líder de Configuración                                     (lista D.1)

3. ¿CUÁNDO PASÓ?
   - Línea base de partida: 2026-09-28 (v1.0.0)
   - Solicitud y aprobación: 2026-10-02
   - Implementación y PR:    2026-10-02
   - Liberación (v1.1.0):    al aprobarse el PR y cerrarse release/1.1.0

4. ¿QUÉ MÁS SE VIO AFECTADO?
   - Esquema de base de datos: 4 columnas, 2 CHECK, 1 índice, 2 valores de enum
   - Contrato de la API: campos opcionales nuevos (compatible hacia atrás)
   - Interfaz del transportista, del operador y del conductor
   - Notificaciones de retraso (texto) y reportes (2 indicadores)
   - Riesgos materializados: ninguno

5. RESULTADO DE LA AUDITORÍA
   - FCA: F1–F5 cumplen     PCA: P1–P7 cumplen · P8–P9 pendientes de la liberación
   - No conformidades: ninguna

6. DICTAMEN
   [ ] Liberar     [X] Liberar con observaciones (completar P8 y P9)     [ ] Rechazar
   Firma del Líder de Configuración: ____________
```

---

## E. Selección de herramientas de GCS

### E.1 Repositorio y control de versiones: **GitHub**

| Necesidad GCS | Funcionalidad de GitHub | Evidencia en el repositorio |
|---|---|---|
| Control de versiones distribuido | Git, etiquetas anotadas, *Releases* | `v1.0.0` |
| Petición de cambio | **Issues** con plantilla | Issue #1 (SC-001) |
| Comité de Control (ACC) | **Pull Requests** con revisión obligatoria y `CODEOWNERS` | PR de la OCI-001 |
| Control de colaboradores | Roles y **reglas de protección** | `main` y `develop` protegidas |
| Auditoría automática | **GitHub Actions** | `.github/workflows/ci.yml` |
| Trazabilidad | Issue ↔ PR ↔ commits ↔ etiqueta | `Refs #1` / `Closes #1` |

**Frente a GitLab:** ambos cubren lo anterior. Se elige GitHub porque el repositorio ya vive allí,
es público sin costo para la entrega y Actions no exige instalar *runners* propios.

### E.2 Infraestructura y configuración en la nube

| Herramienta | Tipo | Uso en el proyecto | Decisión |
|---|---|---|---|
| **Terraform** | Tercero, multinube (IaC declarativa) | `infra/terraform/`: PostgreSQL 18 en AWS RDS (cifrado, sin acceso público, respaldos) | **Seleccionada** |
| **AWS Config** | Nativa del proveedor | Grabador de configuración + reglas `RDS_STORAGE_ENCRYPTED`, `RDS_INSTANCE_PUBLIC_ACCESS_CHECK`, `DB_INSTANCE_BACKUP_ENABLED` | **Seleccionada** para auditoría continua |
| Ansible | Tercero, sin agente | Configurar servidores propios | Alternativa si no se usan servicios administrados |
| Puppet | Tercero, con agente | Flotas grandes de servidores | Descartada: sobredimensionada |

**Justificación.** Terraform es independiente del proveedor: si Puerto Antioquia migra a Azure o
a una nube nacional, cambia el *provider*, no la práctica. Además convierte la infraestructura en
un ECS más (ECS-PRG-14), revisado por PR como el código. AWS Config complementa del lado nativo:
Terraform declara el **estado deseado** y AWS Config vigila que el **estado real** no se desvíe
(por ejemplo, alerta si alguien quita el cifrado exigido por RNF-02). Se combinan así una
herramienta de tercero (portabilidad) y una nativa (cumplimiento continuo), como plantea el
Tema 2 de la unidad. Los secretos nunca entran al repositorio: `*.tfstate` y `*.tfvars` están en
`.gitignore` y la contraseña se inyecta con `TF_VAR_db_contrasena`.

---

## F. Cumplimiento de la estructura exigida del repositorio

| Exigencia del enunciado | Cómo se cumple |
|---|---|
| Repositorio real en GitHub, público | https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia |
| Ramas `main`, `develop` y `feature/OCI-nombre-cambio` | `main`, `develop`, `feature/OCI-001-carga-refrigerada-ica` |
| `.gitignore` | Raíz y cada proyecto; excluye dependencias, compilados, `.env` y estado de Terraform |
| `README.md` con catálogo de ECS (Programas, Datos, Documentación) | Sección «Gestión de Configuración de Software» del README |
| Plantillas de Pull Request e Issue para control de cambios | `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/solicitud-de-cambio.md` |
| Pull Request abierto que simule la integración del cambio | PR `feature/OCI-001-… → develop` con la plantilla diligenciada y `Closes #1` |
| Historial con convenciones y política v1.0.0 → v1.1.0 | Conventional Commits + `v1.0.0` + `CHANGELOG.md` con la entrada 1.1.0 |
| Reglas de protección de ramas | `main` y `develop` |

La demostración paso a paso (qué abrir, qué decir y qué comandos ejecutar) está en
[`Guion_Demostracion_Parcial_II.md`](Guion_Demostracion_Parcial_II.md).

---

## Referencias

- Pressman, R. S., & Maxim, B. R. (2020). *Ingeniería del software: un enfoque práctico* (9.ª ed.). McGraw-Hill.
- Sommerville, I. (2016). *Software engineering* (10th ed.). Pearson. Cap. 25: Configuration management.
- IEEE. (2012). *IEEE Std 828-2012: Configuration management in systems and software engineering*.
- Preston-Werner, T. (2013). *Semantic Versioning 2.0.0*. https://semver.org
- Driessen, V. (2010). *A successful Git branching model*. https://nvie.com/posts/a-successful-git-branching-model/
- Conventional Commits 1.0.0. https://www.conventionalcommits.org
- HashiCorp. *Terraform documentation*. https://developer.hashicorp.com/terraform
- Amazon Web Services. *AWS Config developer guide*. https://docs.aws.amazon.com/config/
