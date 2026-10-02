## Orden de Cambio de Ingeniería (OCI)

| Campo | Valor |
|---|---|
| **OCI** | OCI-<nn> |
| **Solicitud de cambio** | Closes #<issue> |
| **Rama** | `feature/OCI-<nn>-<nombre>` → `develop` |
| **Versión resultante** | v<x.y.z> |

### Descripción del cambio

<!-- Qué se implementó y por qué. -->

### Elementos de configuración modificados

| ECS | Archivo(s) | Tipo de cambio |
|---|---|---|
| | | Nuevo / Modificado / Eliminado |

### Análisis de impacto

- **Arquitectura:**
- **Riesgo:** Bajo / Medio / Alto
- **Plan de reversión:**

### Criterios de aceptación

- [ ] 

## Lista de chequeo de auditoría (RTF)

**Auditoría funcional (FCA)**

- [ ] F1 · Se cumplen los criterios de aceptación de la OCI
- [ ] F2 · Las pruebas automáticas pasan (CI en verde)
- [ ] F3 · Sin regresiones sobre los turnos existentes
- [ ] F4 · Las respuestas conservan el contrato `{ status, message, data }`
- [ ] F5 · La reserva confirma en ≤ 2 s (RNF-04)

**Auditoría física (PCA)**

- [ ] P1 · Todos los commits siguen Conventional Commits y citan la OCI
- [ ] P2 · Solo cambiaron los ECS declarados arriba
- [ ] P3 · Las migraciones nuevas tienen `up()` y `down()` probados
- [ ] P4 · Los tipos del backend y su espejo en el frontend coinciden
- [ ] P5 · No se versionaron secretos (`.env`)
- [ ] P6 · `build` y `lint` sin errores en ambos proyectos
- [ ] P7 · README, CHANGELOG y documentación técnica actualizados
- [ ] P8 · Versión de `package.json` coherente con la OCI
- [ ] P9 · Revisión aprobada del Comité de Control (ACC)

## Aprobación del ACC

| Rol | Decisión |
|---|---|
| Líder de Configuración | |
| Product Owner | |
| Arquitecto | |
