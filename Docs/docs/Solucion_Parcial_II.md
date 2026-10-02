# Plan de Gestión de Configuración de Software (GCS) · Parcial II

| | |
|---|---|
| **Proyecto** | Plataforma de Agendamiento Operativo Puerto Antioquia |
| **Asignatura** | Ingeniería de Software 2 · Unidad 2: Gestión de Configuración de Software |
| **Profesora** | Marta Lucía Jiménez Torres |
| **Estudiante / Rol** | Jose Alejandro Benitez Casallas · Líder de Configuración de Software |
| **Código / Peso** | ING-TLL-5 · 25 % |
| **Repositorio** | https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia |
| **Línea base de partida** | `v1.0.0` (commit `d53d30f`, 28-09-2026) |
| **Versión objetivo** | `v1.1.0` |

---

## A. Identificación de Elementos de Configuración de Software (ECS)

Un ECS es toda pieza de información creada en el proceso de ingeniería que se somete a control formal:
se identifica de forma única, se versiona en Git y solo cambia mediante una Orden de Cambio aprobada.

**Convención de identificadores:** `ECS-<clase>-<nn>`, donde la clase es `PRG` (programas),
`DAT` (datos) o `DOC` (documentación). La versión de cada ECS es la etiqueta Git de la línea base
que lo contiene (`v1.0.0`, `v1.1.0`, …).

### A.1 Programas (fuentes y ejecutables)

| ID | Elemento | Ubicación | Tipo |
|---|---|---|---|
| ECS-PRG-01 | Arranque y módulo raíz de la API | `Backend/src/main.ts`, `app.module.ts` | Fuente |
| ECS-PRG-02 | Núcleo transversal (guards, filtros, decoradores, tipos de dominio) | `Backend/src/common/` | Fuente |
| ECS-PRG-03 | Módulo Autenticación (login + MFA + JWT) | `Backend/src/modules/auth/` | Fuente / API |
| ECS-PRG-04 | Módulo Turnos (reserva, franjas, cancelación) | `Backend/src/modules/turnos/` | Fuente / API |
| ECS-PRG-05 | Módulo Validación Documental + adaptadores (DIAN, operador) | `Backend/src/modules/validacion/` | Fuente / API |
| ECS-PRG-06 | Módulo Eventos (bus Observer + SSE) | `Backend/src/modules/eventos/` | Fuente / API |
| ECS-PRG-07 | Módulo Muelles | `Backend/src/modules/muelles/` | Fuente / API |
| ECS-PRG-08 | Módulos Flota, Notificaciones, Reportes, Conductor, Usuarios, Demo | `Backend/src/modules/*` | Fuente / API |
| ECS-PRG-09 | Aplicación web: rutas y vistas | `Frontend/src/app/`, `Frontend/src/modules/*/views` | Fuente / Vista |
| ECS-PRG-10 | Componentes UI y sistema de diseño | `Frontend/src/components/`, `globals.css` | Fuente / Vista |
| ECS-PRG-11 | Capa de servicios, hooks y estado del cliente | `Frontend/src/core/`, `Frontend/src/modules/*/{services,hooks}` | Fuente |
| ECS-PRG-12 | Configuración de construcción y dependencias | `package.json`, `yarn.lock`, `tsconfig*.json`, `nest-cli.json`, `next.config.ts`, `eslint.config.mjs` | Configuración |
| ECS-PRG-13 | Ejecutables (artefactos de compilación) | `Backend/dist/`, `Frontend/.next/` | Ejecutable · **derivado**: no se versiona, se reconstruye desde la etiqueta |

### A.2 Datos

| ID | Elemento | Ubicación / Origen | Tipo |
|---|---|---|---|
| ECS-DAT-01 | Esquema de la base de datos (13 tablas, 9 enums) | `Backend/src/shared/database/migrations/` | Base de datos propia (PostgreSQL 18) |
| ECS-DAT-02 | Entidades ORM | `Backend/src/modules/*/entities/` | Modelo de datos |
| ECS-DAT-03 | Datos maestros y semilla de demostración | `Backend/src/shared/database/seeds/` | Datos de referencia |
| ECS-DAT-04 | Plantillas de variables de entorno | `Backend/.env.example`, `Frontend/.env.example` | Configuración (los `.env` reales **no** se versionan: contienen secretos) |
| ECS-DAT-05 | Contrato con la DIAN (SOAP/XML) | `validacion/adaptadores/dian.adapter.ts` | Datos externos · API de terceros |
| ECS-DAT-06 | Contrato con el operador portuario y RUNT (REST/JSON) | `validacion/adaptadores/operador-portuario.adapter.ts` | Datos externos · API de terceros |
| ECS-DAT-07 | Catálogo de validaciones pre-arribo | `validacion/catalogo-validaciones.ts` (+ espejo en `Frontend/src/core/config/catalogos.ts`) | Datos de referencia |

### A.3 Documentación

| ID | Elemento | Ubicación |
|---|---|---|
| ECS-DOC-01 | Especificación arquitectónica y patrones (Actividad 1) | `Docs/docs/Diseno_arquitectonico_Puerto_Antioquia.md` |
| ECS-DOC-02 | Línea base de requerimientos (RF, RNF, restricciones) | `Docs/docs/Requerimientos_Puerto_Antioquia.md` |
| ECS-DOC-03 | Backlog Scrum y diseño UX (Parcial I) | `Frontend/src/modules/proyecto/data/`, `Docs/docs/Anexo_No_3_Parcial_I.md` |
| ECS-DOC-04 | Manual técnico (arquitectura, contrato API, módulos, modelo de datos) | `Docs/documentación/00` a `11` |
| ECS-DOC-05 | Manual de usuario / guía de arranque | `README.md`, `Docs/documentación/01-arquitectura-y-arranque.md` |
| ECS-DOC-06 | Evidencia visual por módulo | `Docs/capturas/` |
| ECS-DOC-07 | Documentación viva de la API (Swagger) | generada en `/api/v1/docs` desde los decoradores |
| ECS-DOC-08 | Plan de GCS, plantillas de cambio y bitácora de versiones | `Docs/docs/Solucion_Parcial_II.md`, `.github/`, `CHANGELOG.md` |

### A.4 Línea base

| Línea base | Contenido | Etiqueta |
|---|---|---|
| LB-Funcional | ECS-DOC-01, ECS-DOC-02 aprobados | — (Actividad 1) |
| LB-Diseño | ECS-DOC-03 + prototipo | — (Parcial I) |
| **LB-Producto 1.0** | Todos los ECS de A.1–A.3 tal como están hoy | **`v1.0.0`** |
| LB-Producto 1.1 | LB 1.0 + cambios de la OCI-001 auditados | `v1.1.0` |

---

## B. Flujo y control de cambios

### B.0 Flujo aplicado

```
 Petición de cambio ──► Análisis de impacto ──► Comité de Control (ACC) ──► OCI aprobada
   (GitHub Issue)          (este documento)        (revisión del PR)            │
                                                                                ▼
 Informe de estado ◄── Auditoría (FCA/PCA) ◄── Pull Request a develop ◄── feature/OCI-001-…
                                                       │
                                                       ▼
                                      release/1.1.0 ──► main + etiqueta v1.1.0
```

### B.1 Solicitud de cambio (SC-001)

| Campo | Contenido |
|---|---|
| **ID** | SC-001 |
| **Fecha** | 2026-10-02 |
| **Solicitante** | Gremio exportador bananero de Urabá, a través de la Gerencia de Operaciones de Puerto Antioquia |
| **Título** | Priorización de carga refrigerada (banano de exportación) y validación fitosanitaria ICA |
| **Tipo** | Evolutivo · origen comercial y gubernamental |
| **Prioridad** | Alta |

**Necesidad del entorno.** El banano es el principal producto de exportación de Urabá y viaja en
contenedores refrigerados (*reefer*) que deben mantener la cadena de frío. Hoy el sistema trata
igual a un contenedor refrigerado que a carga general: si un tractocamión *reefer* queda en cola o
su turno se reasigna por un retraso de muelle, la fruta pierde vida útil y el exportador asume la
pérdida. Además, el **ICA** exige el certificado fitosanitario de exportación antes del embarque y
la plataforma no lo valida, de modo que un turno puede quedar CONFIRMADO y ser rechazado ya en el
puerto.

**Cambio solicitado.**
1. Marcar un turno como **carga refrigerada** al reservarlo.
2. Reservar en cada franja una **cuota prioritaria** (máx. 30 % de la capacidad) para carga
   refrigerada, y que ante un retraso de muelle los turnos refrigerados se reasignen primero.
3. Añadir la validación pre-arribo **Certificado Fitosanitario ICA** mediante un nuevo adaptador.
4. Mostrar la prioridad y la nueva validación en el portal, la cabina y los reportes.

Requerimiento nuevo que introduce: **RF-17 Priorización de carga perecedera** (y amplía RF-02).

### B.2 Análisis de impacto

#### Componentes afectados (trazabilidad con la arquitectura del Parcial I / Actividad 1)

| ECS | Componente | Cambio | Impacto |
|---|---|---|---|
| ECS-PRG-02 | `common/types/dominio.type.ts` | Nuevos valores `CERTIFICADO_ICA` (TipoValidacion) e `ICA` (SistemaExterno) | Medio: es el vocabulario compartido con el frontend |
| ECS-PRG-05 | Validación Documental | Nuevo `adaptadores/ica.adapter.ts` que implementa `ValidadorExterno`; se registra en el servicio | **Bajo**: el patrón Adapter absorbe el cambio sin tocar la lógica central (RNF-09) |
| ECS-PRG-04 | Turnos | DTO `crear-turno.dto.ts` con `cargaRefrigerada`; regla de cuota en la toma de cupo | **Alto**: toca la sección crítica de concurrencia del cupo |
| ECS-PRG-07 | Muelles | Orden de reasignación por prioridad ante retraso | Medio |
| ECS-PRG-06 | Eventos | Carga útil del evento `TurnoSolicitado` incluye la prioridad | Bajo (Observer: los observadores no cambian) |
| ECS-PRG-08 | Reportes | Indicador de turnos refrigerados atendidos a tiempo | Bajo |
| ECS-PRG-09/11 | Frontend | Casilla en Nuevo turno, insignia en la tabla, paso ICA en la línea de validación, catálogo espejo | Medio |
| ECS-DAT-01 | Esquema | Migración `CargaRefrigeradaIca`: columnas `turnos.carga_refrigerada`, `franjas.cupo_prioritario`; nuevo valor en enum | **Alto**: los valores de enum en PostgreSQL no se pueden eliminar en un *rollback* simple |
| ECS-DAT-03 | Semilla | Turnos refrigerados de ejemplo | Bajo |
| ECS-DOC-02/04 | Documentación | RF-17; documentos 02, 04, 05 y 09 | Bajo |

#### Esfuerzo técnico

| Actividad | Horas |
|---|---|
| Migración + entidades + tipos | 4 |
| Adaptador ICA + catálogo | 4 |
| Regla de cuota y reasignación prioritaria | 8 |
| Frontend (formulario, tabla, validación, cabina) | 8 |
| Pruebas (unitarias de la cuota y del adaptador) | 6 |
| Documentación y auditoría | 4 |
| **Total** | **34 h ≈ 1 sprint de 2 semanas (8 puntos)** |

**Costo estimado:** 34 h × COP 45.000/h (desarrollador junior) ≈ **COP 1.530.000**, sin costo de
infraestructura adicional (el adaptador ICA se simula, como los de DIAN y operador).

#### Efectos secundarios y riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| La cuota prioritaria rompe la integridad del cupo bajo concurrencia | Media | Alto | Mantener la condición atómica en el `UPDATE` y el `CHECK` de la franja; prueba de concurrencia |
| Inanición de la carga general en temporada alta | Media | Medio | Tope del 30 %; si la cuota no se usa 2 h antes, se libera a carga general |
| Divergencia de tipos backend/frontend | Media | Medio | Ítem obligatorio en la lista de auditoría (D.1) |
| Migración de enum no reversible | Baja | Alto | `down()` que recrea el tipo; respaldo de BD antes de desplegar |
| El ICA no publica API abierta | Alta | Bajo | Adaptador simulado detrás de la interfaz; cambiar a la API real solo toca el adaptador |

**Nivel de riesgo global para la arquitectura: MEDIO.** El núcleo de dominio y los patrones
Observer/Adapter se conservan; el riesgo se concentra en la regla de cupo.

### B.3 Orden de Cambio de Ingeniería (OCI-001)

| Campo | Contenido |
|---|---|
| **OCI** | OCI-001 · deriva de SC-001 |
| **Descripción** | Implementar la priorización de carga refrigerada y la validación fitosanitaria ICA |
| **ECS afectados** | ECS-PRG-02, 04, 05, 06, 07, 08, 09, 11 · ECS-DAT-01, 03, 07 · ECS-DOC-02, 04 |
| **Rama** | `feature/OCI-001-carga-refrigerada-ica` (desde `develop`) |
| **Versión resultante** | `v1.1.0` (MINOR: funcionalidad nueva y compatible hacia atrás) |
| **Restricciones** | No cambiar el contrato `{ status, message, data }` · no romper endpoints existentes · cuota ≤ 30 % · ningún archivo > 300 líneas · la migración debe tener `down()` · sin secretos en el repositorio |
| **Criterios de aceptación** | 1) Un turno refrigerado ocupa la cuota prioritaria y, si se agota, la general. 2) Un turno general no puede tomar la cuota prioritaria hasta 2 h antes de la franja. 3) Sin certificado ICA vigente un turno refrigerado queda RECHAZADO con motivo. 4) Ante un retraso, los refrigerados se reasignan primero. 5) Los turnos existentes siguen funcionando igual (`carga_refrigerada = false`). 6) `yarn build` y `yarn lint` sin errores en ambos proyectos; pruebas de la cuota en verde. |
| **Plan de reversión** | Revertir el *merge commit* en `develop`/`main` y ejecutar `yarn migration:revert` |

**Aprobación del Comité de Control de Configuración (ACC)**

| Rol en el ACC | Nombre | Decisión | Fecha |
|---|---|---|---|
| Líder de Configuración | Jose Alejandro Benitez Casallas | Aprobada | 2026-10-02 |
| Product Owner (simulado) | Gerencia de Operaciones Puerto Antioquia | Aprobada | 2026-10-02 |
| Arquitecto (simulado) | Revisor técnico | Aprobada con condición: prueba de concurrencia obligatoria | 2026-10-02 |

En GitHub, la aprobación se materializa como la **revisión aprobada del Pull Request** y el Issue
SC-001 enlazado (`Closes #1`).

---

## C. Estrategia de control de versiones y ramas

### C.1 Esquema de versionamiento

**Versionamiento Semántico (SemVer 2.0.0)** `MAYOR.MENOR.PARCHE`:

| Componente | Sube cuando… | Ejemplo en el proyecto |
|---|---|---|
| MAYOR | Se rompe el contrato de la API o el esquema sin migración compatible | Pasar a microservicios con Kafka → `2.0.0` |
| MENOR | Se añade funcionalidad compatible | OCI-001 → `1.1.0` |
| PARCHE | Se corrige un defecto sin funcionalidad nueva | Fallo en el cálculo de la franja → `1.1.1` |

- Cada versión liberada es una **etiqueta anotada** en `main` (`git tag -a v1.1.0`) y un *Release* de GitHub.
- `package.json` de Backend y Frontend llevan el mismo número.
- **Mensajes de commit:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`)
  con el ID de la OCI en el alcance, por ejemplo `feat(turnos): cuota prioritaria para carga refrigerada [OCI-001]`.
- `CHANGELOG.md` registra cada versión (formato *Keep a Changelog*).

### C.2 Estrategia de ramas: GitFlow

```
main      ●─────────────────────────────────────────●──────────●
          v1.0.0                                    v1.1.0     v1.1.1
            \                                      /          /
release      \                        ●──●────────●          /
              \                      /  release/1.1.0       /
develop        ●──────●─────────────●──────────────●───────●
                \    /                            \       /
feature          ●──●  feature/OCI-001-carga-…     \     /
                                                    hotfix/1.1.1
```

| Rama | Origen → destino | Propósito | Protección |
|---|---|---|---|
| `main` | — | Solo versiones liberadas y etiquetadas (líneas base) | Sin *push* directo; PR con 1 aprobación; historial lineal; sin borrado ni *force push* |
| `develop` | `main` → — | Integración de cambios aprobados | Sin *push* directo; PR obligatorio |
| `feature/OCI-<nn>-<nombre>` | `develop` → `develop` | Un cambio aprobado por OCI | Se borra tras el *merge* |
| `release/<x.y.z>` | `develop` → `main` + `develop` | Estabilización, auditoría, subir versión | Solo correcciones |
| `hotfix/<x.y.z>` | `main` → `main` + `develop` | Defecto crítico en producción | PR con aprobación |

**Por qué GitFlow y no Trunk-Based:** el proyecto trabaja con líneas base formales y entregas
académicas por versión; GitFlow separa con claridad lo liberado (`main`) de lo integrado
(`develop`) y deja cada OCI aislada en su rama, que es justamente la trazabilidad que pide la GCS.
Trunk-Based conviene a equipos grandes con despliegue continuo y *feature flags*, que aquí no existen.

### C.3 Control de colaboradores y copias

- Colaboradores con rol *Write*; solo el Líder de Configuración tiene *Admin*.
- `CODEOWNERS`: los cambios en `migrations/` y `common/types/` requieren revisión del Líder.
- Plantillas: `.github/PULL_REQUEST_TEMPLATE.md` y `.github/ISSUE_TEMPLATE/solicitud-de-cambio.md`.
- Copias: el remoto GitHub es la copia maestra; cada clon local es una réplica completa (Git es
  distribuido). Las etiquetas permiten reconstruir cualquier línea base exacta (`git checkout v1.0.0`).

---

## D. Auditoría de la configuración y reporte de estados

### D.1 Lista de chequeo de auditoría (antes de liberar `v1.1.0`)

**Auditoría funcional (FCA) — ¿el producto hace lo que la OCI aprobó?**

| # | Pregunta de verificación | Evidencia | ✔ |
|---|---|---|---|
| F1 | ¿Se cumplen los 6 criterios de aceptación de la OCI-001? | Prueba manual + capturas | ☐ |
| F2 | ¿Las pruebas automáticas de la cuota y del adaptador ICA pasan? | Salida de `yarn test` / GitHub Actions | ☐ |
| F3 | ¿Los turnos creados antes del cambio siguen funcionando igual? | Prueba de regresión con la semilla | ☐ |
| F4 | ¿Todos los endpoints responden con `{ status, message, data }`? | Swagger | ☐ |
| F5 | ¿La reserva sigue confirmando en ≤ 2 s (RNF-04)? | Medición en la red del navegador | ☐ |

**Auditoría física (PCA) — ¿lo que se libera es exactamente lo que se aprobó?**

| # | Pregunta de verificación | Evidencia | ✔ |
|---|---|---|---|
| P1 | ¿Cada commit de la rama cita la OCI-001 y sigue Conventional Commits? | `git log --oneline develop..feature/OCI-001-…` | ☐ |
| P2 | ¿Solo cambiaron los ECS declarados en la OCI? | `git diff --stat v1.0.0..release/1.1.0` contra la tabla B.2 | ☐ |
| P3 | ¿La migración nueva tiene `up()` y `down()` y se probó la reversión? | Código + `yarn migration:revert` | ☐ |
| P4 | ¿Los tipos del backend y su espejo en el frontend coinciden? | `dominio.type.ts` vs `Frontend/src/**/types` | ☐ |
| P5 | ¿No se versionó ningún secreto (`.env`, contraseñas reales)? | `git ls-files \| grep .env` solo muestra `.env.example` | ☐ |
| P6 | ¿`yarn build` y `yarn lint` terminan sin errores en ambos proyectos? | Salida de consola / CI | ☐ |
| P7 | ¿Se actualizaron README (catálogo ECS), CHANGELOG y documentos 02, 04, 05, 09? | Diff de documentación | ☐ |
| P8 | ¿La versión en ambos `package.json` es `1.1.0` y existe la etiqueta anotada? | `git tag -n` | ☐ |
| P9 | ¿El PR tiene la revisión aprobada del ACC y enlaza el Issue SC-001? | Página del PR | ☐ |

**Revisión Técnica Formal (RTF):** la lista se recorre en la revisión del Pull Request; el
resultado queda como comentario del PR y como Informe de Estado.

### D.2 Estructura del Informe de Estado / Dictamen

```
INFORME DE ESTADO DE CONFIGURACIÓN  N.º IEC-001
Proyecto: Agendamiento Operativo Puerto Antioquia      Fecha de emisión: AAAA-MM-DD

1. ¿QUÉ PASÓ?
   - Cambio:           OCI-001 · Priorización de carga refrigerada y validación ICA
   - Versión:          v1.0.0  →  v1.1.0
   - Tipo:             Evolutivo (MINOR)
   - ECS modificados:  <lista con ID>      ECS nuevos: <lista>
   - Commits:          <hash corto · mensaje>   (git log v1.0.0..v1.1.0)

2. ¿QUIÉN LO HIZO?
   - Solicitó:   <solicitante>               (Issue #1)
   - Aprobó:     Comité de Control (ACC)     (revisión del PR #2)
   - Implementó: <autor de los commits>
   - Auditó:     Líder de Configuración

3. ¿CUÁNDO PASÓ?
   - Solicitud:  AAAA-MM-DD     Aprobación: AAAA-MM-DD
   - Merge a develop: AAAA-MM-DD   Liberación (tag v1.1.0): AAAA-MM-DD

4. ¿QUÉ MÁS SE VIO AFECTADO?
   - Componentes y documentos impactados de forma indirecta
   - Migraciones de base de datos ejecutadas
   - Riesgos materializados / incidentes

5. RESULTADO DE LA AUDITORÍA
   - FCA: F1…F5 (cumple / no cumple)     PCA: P1…P9 (cumple / no cumple)
   - No conformidades y acciones correctivas

6. DICTAMEN
   [ ] Liberar     [ ] Liberar con observaciones     [ ] Rechazar
   Firma del Líder de Configuración: ____________
```

---

## E. Selección de herramientas de GCS

### E.1 Repositorio y control de versiones: **GitHub**

| Necesidad GCS | Funcionalidad de GitHub |
|---|---|
| Control de versiones distribuido | Git; etiquetas y *Releases* para líneas base |
| Petición de cambio | **Issues** con plantilla de Solicitud de Cambio |
| Comité de Control (ACC) | **Pull Requests** con revisiones obligatorias y `CODEOWNERS` |
| Control de colaboradores | Roles por repositorio; **reglas de protección** de `main` y `develop` |
| Auditoría automática | **GitHub Actions**: compilación, lint y pruebas en cada PR |
| Trazabilidad | Enlace Issue ↔ PR ↔ commits ↔ etiqueta |

Frente a GitLab: ambos cubren lo anterior; se elige GitHub porque el repositorio ya existe allí,
es público sin costo para la entrega y Actions no requiere instalar *runners* propios.

### E.2 Infraestructura y configuración en la nube

| Herramienta | Tipo | Uso propuesto | Decisión |
|---|---|---|---|
| **Terraform** | Tercero, multinube (IaC declarativa) | Describir como código el entorno: base de datos PostgreSQL administrada (AWS RDS), servidor de la API y red. El archivo `.tf` se versiona como un ECS más y se revisa por PR | **Seleccionada** |
| **AWS Config** | Nativa del proveedor | Registrar el historial de configuración de los recursos y alertar desvíos (p. ej., RDS sin cifrado → incumple RNF-02 AES-256) | **Seleccionada** como auditoría continua |
| Ansible | Tercero, agentless | Configurar servidores (instalar Node 24, variables) | Alternativa si no se usan servicios administrados |
| Puppet | Tercero, con agente | Configuración de flotas grandes de servidores | Descartada: sobredimensionada para el prototipo |

**Justificación:** Terraform es independiente del proveedor (si Puerto Antioquia migra a Azure
o a una nube nacional, se cambia el *provider*, no la práctica) y convierte la infraestructura en
un ECS auditable con el mismo flujo de PR. AWS Config complementa del lado nativo: Terraform
define el estado deseado y AWS Config verifica que el estado real no se desvíe, lo que cierra el
ciclo de auditoría de la configuración. Así se combinan **herramienta de tercero (portabilidad)**
y **herramienta nativa (cumplimiento continuo)**, como plantea el Tema 2 de la unidad.

---

## F. Entregables

### F.1 Repositorio (estructura requerida)

| Exigencia | Cómo se cumple |
|---|---|
| Ramas `main`, `develop`, `feature/OCI-…` | `main` (v1.0.0), `develop`, `feature/OCI-001-carga-refrigerada-ica` |
| `.gitignore` | Ya existe en la raíz y en cada proyecto |
| `README.md` con catálogo ECS | Sección A de este documento en el README raíz |
| Plantillas de PR / Issue | `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/solicitud-de-cambio.md` |
| PR abierto que simule la integración | PR `feature/OCI-001-… → develop`, **abierto**, con la plantilla diligenciada |
| Historial con convenciones y v1.0.0 → v1.1.0 | Conventional Commits + etiqueta `v1.0.0`; `v1.1.0` en `release/1.1.0` |
| Reglas de protección | Configuradas en *Settings → Branches* para `main` y `develop` |

### F.2 Guion del video (8–10 min)

| Minuto | Contenido | Qué mostrar en pantalla |
|---|---|---|
| 0–2 | Presentación, contexto Urabá, SC-001 y OCI-001, impacto y riesgo MEDIO | Sección B de este documento, Issue #1 |
| 2–5 | Árbol de ramas, paso de v1.0.0 a v1.1.0, reglas de protección, PR de la OCI | `git log --graph --oneline --all`, *Settings → Branches*, PR abierto |
| 5–8 | Lista de chequeo respondida en voz alta (¿qué cambió?, ¿quién autorizó?, ¿qué se afectó?), Terraform + AWS Config | `git diff --stat v1.0.0..`, PR aprobado, archivo `.tf`, Informe IEC-001 |
| 8–10 | Cierre: por qué esta GCS garantiza integridad y trazabilidad | — |

---

## Referencias

- Pressman, R. S., & Maxim, B. R. (2020). *Ingeniería del software: un enfoque práctico* (9.ª ed.). McGraw-Hill. Cap. Gestión de la configuración del software.
- Sommerville, I. (2016). *Software engineering* (10th ed.). Pearson. Cap. 25 Configuration management.
- IEEE. (2012). *IEEE Std 828-2012: Configuration management in systems and software engineering*.
- Preston-Werner, T. (2013). *Semantic Versioning 2.0.0*. https://semver.org
- Driessen, V. (2010). *A successful Git branching model*. https://nvie.com/posts/a-successful-git-branching-model/
- Conventional Commits 1.0.0. https://www.conventionalcommits.org
- HashiCorp. *Terraform documentation*. https://developer.hashicorp.com/terraform
- Amazon Web Services. *AWS Config developer guide*. https://docs.aws.amazon.com/config/
