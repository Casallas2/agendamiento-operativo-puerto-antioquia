# Guion de demostración · Parcial II (GCS)

Guía paso a paso para demostrar lo que pide el enunciado: la OCI, el repositorio con su estrategia
de ramas, la aprobación del cambio, la auditoría y las herramientas. Cada bloque dice **qué abrir**,
**qué ejecutar** y **qué decir**. Los tiempos siguen la estructura del enunciado (máx. 8–10 min).

Documento de apoyo: [`Solucion_Parcial_II.md`](Solucion_Parcial_II.md).

---

## 0. Preparación (antes de empezar)

### 0.1 Levantar la aplicación

```bash
# Terminal 1 · Backend (PostgreSQL debe estar corriendo)
cd Backend
git switch feature/OCI-001-carga-refrigerada-ica
yarn install
yarn migration:run          # aplica CargaRefrigeradaIca si falta
yarn seed                   # datos limpios: TRN-1001, 1005 y 1006 son refrigerados.
                            # Sembrar el mismo día de la grabación y antes de las 20:00:
                            # así TRN-1001 cae en una franja próxima del Muelle 2 (paso 3.2.5)
yarn start:dev              # http://localhost:4000/api/v1

# Terminal 2 · Frontend
cd Frontend
yarn install
yarn dev                    # http://localhost:3000
```

### 0.2 Pestañas abiertas en el navegador (en este orden)

| # | Pestaña | URL |
|---|---|---|
| 1 | Issue SC-001 | `https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia/issues/1` |
| 2 | Repositorio (README) | `https://github.com/Casallas2/agendamiento-operativo-puerto-antioquia` |
| 3 | Pull Request de la OCI-001 | pestaña *Pull requests* del repositorio |
| 4 | Reglas de protección | *Settings → Branches* |
| 5 | GitHub Actions | pestaña *Actions* |
| 6 | Aplicación | `http://localhost:3000/login` |
| 7 | Swagger | `http://localhost:4000/api/v1/docs` |
| 8 | Este proyecto en el editor | `infra/terraform/main.tf` y `Docs/docs/Solucion_Parcial_II.md` |

### 0.3 Datos de demostración

| Uso | Valor |
|---|---|
| Contraseña de todas las cuentas / código MFA | `Puerto2026!` / `246810` |
| Transportista | `transportista@transuraba.co` |
| Operador portuario | `operador@puertoantioquia.co` |
| Certificado ICA **válido** | `CFE-2026-001204` |
| Certificado ICA **falso** (para mostrar el rechazo) | `CFE-2026-009999` |
| Manifiesto y BL válidos | `MAN-2026-004561`, `BL-PA-88275` (botón «Usar datos de ejemplo») |

---

## 1. Justificación del cambio (min 0–2)

**Abrir:** pestaña 1 (Issue #1).

**Decir (idea, no texto literal):**

1. *Presentación.* «Soy Jose Alejandro Benitez Casallas y en este parcial asumo el rol de Líder de
   Configuración de la Plataforma de Agendamiento Operativo de Puerto Antioquia.»
2. *Contexto Urabá.* El banano es el principal producto de exportación de la región y viaja en
   contenedores refrigerados. En la versión 1.0.0 un *reefer* competía por cupo igual que la carga
   general y nadie validaba el certificado fitosanitario del ICA.
3. *La solicitud (SC-001).* Mostrar en el Issue las secciones 2 y 3: cuota prioritaria del 30 %,
   validación ICA y prioridad ante retrasos. Señalar las etiquetas `solicitud-de-cambio`,
   `aprobada-ACC` y `OCI-001`.
4. *Análisis de impacto.* Bajar a la sección 5 del Issue o abrir la sección B.2 de la solución:
   - Esfuerzo: 34 h, 1 sprint, ≈ COP 1,5 millones.
   - Arquitectura: el **Adapter** absorbe al ICA sin tocar la lógica central; el **Observer** no
     cambia; el punto crítico es la **regla de cupo concurrente**.
   - Riesgo global **MEDIO**: concurrencia del cupo y enum de PostgreSQL no reversible; ambos
     mitigados (regla dentro del `UPDATE`, `CHECK`, `down()` probado, 22 pruebas).

---

## 2. Demostración navegada en Git (min 2–5)

### 2.1 Árbol de ramas y versiones

**Ejecutar en la terminal:**

```bash
git fetch --all --tags
git log --graph --oneline --decorate --all
git tag -n
git branch -a
```

**Señalar en pantalla:**

- `v1.0.0` sobre el commit inicial de `main` = **línea base de producto**.
- `develop` con 6 commits de configuración GCS (`docs(gcs)`, `chore(gcs)`, `ci`, `chore(infra)`).
- `feature/OCI-001-carga-refrigerada-ica` con 13 commits que siguen **Conventional Commits** y
  citan `[OCI-001]`.

**Decir:** «Uso SemVer. La OCI añade funcionalidad compatible, por eso sube la versión MENOR:
de 1.0.0 a 1.1.0. Uso GitFlow: `main` solo guarda versiones liberadas, `develop` integra, y cada
OCI vive aislada en su propia rama `feature`.»

Opcional, para mostrar el alcance exacto del cambio:

```bash
git diff --stat develop..feature/OCI-001-carga-refrigerada-ica
```

### 2.2 README y CHANGELOG

**Abrir:** pestaña 2. Bajar a «Gestión de Configuración de Software» y mostrar el **catálogo de
ECS** en Programas, Datos y Documentación, y la tabla de versiones. Abrir `CHANGELOG.md` en la
rama de la OCI y mostrar la entrada `[1.1.0]`.

### 2.3 Reglas de protección

**Abrir:** pestaña 4 (*Settings → Branches*). Mostrar las reglas de `main` y `develop`:
PR obligatorio, 1 aprobación, CI en verde, sin *force push* ni borrado.

**Decir:** «Nadie, ni siquiera yo, puede escribir directo en `main` o `develop`: todo cambio pasa
por un Pull Request revisado. Así se controlan las copias y los colaboradores.»

### 2.4 Simulación de la aprobación (Pull Request)

**Abrir:** pestaña 3, el PR `feature/OCI-001-carga-refrigerada-ica → develop`.

**Recorrer:**

1. *Conversation:* la plantilla de OCI diligenciada y `Closes #1` (traza Issue ↔ PR).
2. *Commits:* los 13 commits convencionales.
3. *Files changed:* señalar `ica.adapter.ts` (nuevo adaptador) y la migración `CargaRefrigeradaIca`.
4. *Checks:* los dos trabajos de GitHub Actions en verde.
5. *Reviewers:* `CODEOWNERS` pidió la revisión del Líder de Configuración.

**Decir cómo se aprobaría:** «El Comité de Control revisa con *Review changes → Approve*; con la
aprobación y la CI en verde se habilita *Merge pull request*. Después se crea `release/1.1.0`, se
sube la versión, se integra en `main` y se etiqueta `v1.1.0`.» **No hacer clic en Merge**: el
enunciado pide que el PR quede abierto en la entrega.

---

## 3. Auditoría e infraestructura GCS (min 5–8)

### 3.1 Lista de chequeo respondida en voz alta

**Abrir:** el PR (la lista viene en su plantilla) o la sección D.1 de la solución.

| Pregunta | Respuesta y evidencia en pantalla |
|---|---|
| **¿Qué cambió?** | `git diff --stat develop..feature/OCI-001-…`: adaptador ICA, regla de cuota, migración, frontend, docs. Todos son ECS declarados en la OCI (P2). |
| **¿Quién lo autorizó?** | El ACC: etiqueta `aprobada-ACC` del Issue #1 y revisión del PR. |
| **¿Quién lo hizo y cuándo?** | `git log --format="%h %an %ad %s" develop..feature/OCI-001-carga-refrigerada-ica` |
| **¿Qué más se vio afectado?** | Esquema (4 columnas, 2 `CHECK`), contrato de la API (campos opcionales, compatible), reportes y notificaciones. |
| **¿Funciona?** | CI en verde y 22 pruebas (`cd Backend && yarn test`). |

### 3.2 Demostración funcional del cambio (lo que el auditor verifica)

En la pestaña 6, entrar como **transportista** y abrir **Reservar turno**:

1. **Prioridad visible.** Con «Banano refrigerado» el interruptor *Contenedor refrigerado* se
   activa solo y aparece el campo del certificado ICA. El resumen muestra la insignia
   «Refrigerada · prioridad».
2. **Cuota en el selector.** Desactivar el interruptor (carga general): algunas franjas pasan a
   «Solo refrigerada». Volver a activarlo: esas franjas vuelven a estar disponibles.
3. **Rechazo por el ICA.** Reservar con el certificado `CFE-2026-009999`. A los pocos segundos el
   detalle del turno muestra la validación *Certificado fitosanitario* **Rechazada** y el turno en
   **Rechazado** con el motivo del ICA.
4. **Reserva correcta.** Repetir con `CFE-2026-001204`: seis validaciones aprobadas y turno
   **Confirmado**.

Luego entrar como **operador** (otra pestaña o ventana privada):

5. **Prioridad ante retrasos.** En *Muelles*, declarar 90 minutos de retraso en Muelle 2. En
   *Turnos*, el turno refrigerado se desplaza solo 30 minutos y su detalle lo explica.
   Restablecer el muelle al terminar.
6. **Reportes.** En *Alertas y reportes*, la tarjeta «Carga refrigerada hoy» con el % de la cuota
   prioritaria en uso.

### 3.3 Herramientas de GCS y nube

1. **GitHub** (pestaña 5, *Actions*): «Cada PR se audita solo: compila, revisa estilo y corre las
   pruebas. Es la evidencia de los puntos F2 y P6.»
2. **Terraform** (`infra/terraform/main.tf`): «La base de datos se declara como código: PostgreSQL
   18 en RDS, cifrada (RNF-02), sin acceso público y con respaldos. El archivo es un ECS más y
   cambia por PR, igual que el código.»
3. **AWS Config** (mismo archivo, recursos `aws_config_*`): «Terraform define el estado deseado;
   AWS Config vigila el estado real y alerta si alguien quita el cifrado o abre la base al público.
   Combino una herramienta de tercero, portable entre nubes, con una nativa de auditoría continua.»

**Cierre del bloque:** «Esta infraestructura garantiza la integridad porque ningún cambio entra sin
solicitud, impacto, aprobación y auditoría trazables, y cualquier versión se reconstruye exacta
desde su etiqueta.»

---

## 4. Cierre (min 8–10)

- Resumen en una frase por punto: ECS catalogados → OCI con impacto → SemVer + GitFlow con ramas
  protegidas → auditoría FCA/PCA e Informe de Estado → GitHub + Terraform + AWS Config.
- Mostrar el Informe de Estado IEC-001 (sección D.2) con su dictamen «Liberar con observaciones»:
  falta la aprobación del ACC (P9) y la etiqueta `v1.1.0` (P8).

---

## 5. Después de la entrega: liberar `v1.1.0`

Cuando el ACC apruebe el PR, el flujo GitFlow para cerrar la versión es:

```bash
# 1. Integrar la OCI en develop (desde GitHub: Approve → Merge pull request)
git switch develop && git pull

# 2. Rama de release y subida de versión
git switch -c release/1.1.0
cd Backend  && yarn version --new-version 1.1.0 --no-git-tag-version && cd ..
cd Frontend && yarn version --new-version 1.1.0 --no-git-tag-version && cd ..
# En CHANGELOG.md: cambiar «pendiente de aprobación del ACC» por la fecha de liberación
git commit -am "chore(release): v1.1.0"
git push -u origin release/1.1.0

# 3. PR release/1.1.0 → main en GitHub; al integrarlo:
git switch main && git pull
git tag -a v1.1.0 -m "v1.1.0 · OCI-001 Prioridad de carga refrigerada y validación ICA"
git push origin v1.1.0
gh release create v1.1.0 --title "v1.1.0" --notes-from-tag

# 4. Devolver la release a develop
git switch develop && git merge --no-ff main && git push
```

---

## Plan B (si algo falla durante la demostración)

| Problema | Qué hacer |
|---|---|
| No arranca PostgreSQL o el backend | Mostrar las capturas de `Docs/capturas/` y la tabla de criterios de B.3 (resultados ya verificados) |
| La validación tarda | Las latencias son simuladas (hasta 2,5 s); esperar o recargar el detalle del turno |
| Los datos quedaron desordenados tras ensayar | `cd Backend && yarn seed` restaura la semilla |
| Sin internet | Mostrar el árbol con `git log --graph` local y abrir los `.md` del repositorio |
