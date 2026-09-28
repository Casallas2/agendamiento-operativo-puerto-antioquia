# Puerto Antioquia · Agendamiento Operativo — Frontend

Prototipo interactivo (Parcial I, Ingeniería de Software II) de la plataforma de agendamiento de turnos para tractocamiones de Puerto Antioquia.

**Stack:** Next.js 16 (App Router, `proxy.ts`) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · TanStack Query · Zustand · React Hook Form + Zod · SweetAlert2 (+ sweetalert2-react-content) · Recharts.

## Puesta en marcha

```bash
yarn install
yarn dev          # http://localhost:3000
yarn build && yarn start
```

No requiere backend: la carpeta `src/core/mock` simula los microservicios del diseño arquitectónico y guarda los datos en `localStorage`.

## Cuentas de demostración

Contraseña de todas: `Puerto2026!` · Código MFA: `246810`

| Rol | Correo | Entra a |
|---|---|---|
| Conductor | conductor@transuraba.co | `/conductor` (cabina: voz y botones grandes) |
| Transportista | transportista@transuraba.co | `/dashboard` (reservas y flota) |
| Operador portuario | operador@puertoantioquia.co | `/dashboard` (muelles y alertas) |

## Rutas

| Ruta | Vista | Categoría del Anexo 3 |
|---|---|---|
| `/login` | Inicio de sesión con MFA | Pantalla principal / login |
| `/conductor` | Cabina del conductor | Módulo central operativo |
| `/dashboard/turnos/nuevo` | Reservar turno | Formulario de captura de datos |
| `/dashboard/muelles` | Estado de muelles | Módulo central operativo |
| `/dashboard/alertas` | Alertas y reportes | Vista de reportes / alertas |
| `/dashboard`, `/dashboard/turnos`, `/dashboard/turnos/[id]`, `/dashboard/flota` | Resumen, listado, detalle con validación en vivo, semáforo de documentos | — |
| `/proyecto` | Product Backlog, sprints, justificación UI/UX y guion de sustentación | — |

## Guion de demostración (tiempo real)

Cada **ventana** del navegador guarda su propia sesión (sessionStorage), mientras que los datos y los eventos se comparten entre ventanas. Así se pueden tener los tres roles abiertos a la vez en el mismo navegador.

1. Abre dos ventanas del **mismo navegador y perfil** (una ventana de incógnito o de otro navegador no comparte los datos). Inicia sesión como **operador** en una y como **conductor** en la otra.
2. En la del operador, ve a **Muelles** → *Declarar retraso* en el Muelle 2.
3. La cabina del conductor recibe el aviso al instante, lo lee en voz alta y desplaza la hora del turno.
4. Con **transportista**, reserva un turno y observa la validación documental avanzando (usa `MAN-2026-009999` para ver un rechazo de la DIAN).

El botón *Reiniciar datos de demostración* en la portada restaura los datos iniciales.

## Sistema de diseño y alertas

- **Toda la interfaz usa `src/components/ui`** (shadcn/ui sobre Base UI): Button, Input, Textarea, Select, RadioGroup, Checkbox, Switch, Tabs, Table, Card, Badge, Alert, Progress, Tooltip, DropdownMenu, Sheet, Avatar, Separator, Skeleton y Label. Los componentes compartidos (`components/shared`) se construyen sobre ellos; no hay controles HTML sueltos.
- **SweetAlert2** es el único sistema de alertas (`src/lib/alertas.tsx`): confirmaciones de acciones destructivas, errores, éxitos y avisos emergentes en tiempo real. Sus botones usan `buttonVariants` del kit y los diálogos con formulario (declarar retraso, reportar novedad) renderizan componentes `ui` gracias a `sweetalert2-react-content`.
- Un aviso en tiempo real nunca reemplaza un diálogo abierto (SweetAlert2 muestra una ventana a la vez): se omite el emergente y el aviso queda en el panel de notificaciones.
- Los avisos emergentes del portal se pueden silenciar desde el panel de notificaciones o el menú de usuario; en cabina siempre se muestran (R-01).

## Arquitectura en el frontend

- `src/core/mock/busEventos.ts`: patrón **Observer** (sujeto del bus de eventos; `BroadcastChannel` emula el WebSocket entre pestañas).
- `src/core/mock/notificadores.ts`: observadores Push, SMS y Voz.
- `src/core/mock/validacion/adaptadores.ts`: patrón **Adapter** (`ValidadorExterno`, `AdaptadorDian` SOAP/XML, `AdaptadorOperadorPortuario` REST).
- `src/modules/*/services`: cada servicio imita un endpoint del API Gateway con respuesta `{ status, message, data }`; para conectar el backend NestJS basta con reemplazarlos por llamadas a `core/api/api.ts`.

Los comandos de voz usan la Web Speech API (Chrome o Edge; requiere permiso de micrófono).
