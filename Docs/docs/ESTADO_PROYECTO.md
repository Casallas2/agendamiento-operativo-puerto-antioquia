# Estado del proyecto · Agendamiento Operativo Puerto Antioquia

> Documento de estado actualizado el **2026-11-11**.

## 1. Qué es

Prototipo académico (Ingeniería de Software II · Uniremington) de agendamiento de turnos para
el ingreso de tractocamiones a Puerto Antioquia (Turbo, Urabá).

## 2. Arquitectura implementada

- **Backend:** NestJS 11 + TypeORM + PostgreSQL; API bajo `/api/v1`.
- **Frontend:** Next.js 16 + React.
- **Persistencia:** PostgreSQL mediante entidades y repositorios TypeORM, con migraciones y semillas.
- **Patrones:** Observer (bus de eventos + SSE) y Adapter (adaptadores para DIAN, operador/RUNT e ICA).
- **Nota:** los adaptadores de servicios externos simulan las respuestas y consultan datos locales; no
  realizan solicitudes HTTP reales a DIAN, operador/RUNT o ICA.

## 3. Estado frente a los requisitos de implementación

| Requisito | Estado | Evidencia y observación |
|---|---|---|
| Lógica de negocio del dominio | ✅ Implementada | `Backend/src/modules/turnos/turnos.service.ts` reserva y cancela turnos con reglas de cupo, flota, muelle y transacciones. `turnos-consulta.service.ts` consulta y filtra turnos. El frontend permite completar la reserva desde `Frontend/src/modules/dashboard/turnos/views/CrearTurnoView.tsx`. |
| Persistencia de operaciones | 🟡 Implementada para los flujos principales | TypeORM conecta servicios con PostgreSQL. Las reservas, cancelaciones, eventos e hitos de validación se persisten. No se identificó una capa CRUD genérica independiente ni CRUD completo para cada entidad; varios módulos son de consulta o exponen operaciones de dominio específicas. |
| Principios SOLID | ✅ Evidenciados | El diseño arquitectónico identifica SRP y OCP en `Docs/docs/Diseno_arquitectonico_Puerto_Antioquia.md`. La separación de comandos y consultas de turnos, y el bus/observador de eventos en `Backend/src/modules/eventos/`, respaldan esa aplicación en el código. |
| Consumo real de API externa | ❌ Pendiente | Los adaptadores de DIAN, operador/RUNT e ICA modelan contratos y resultados, pero simulan el transporte y resuelven datos contra `registros_externos`. No se encontró una solicitud HTTP saliente hacia un proveedor externo. El cliente Axios del frontend consume el API interno del proyecto. |
| Separación entre interfaz, negocio y datos | ✅ Implementada | Frontend (vistas, hooks y servicios HTTP), backend (controladores y servicios) y persistencia TypeORM/PostgreSQL están separados. La arquitectura está descrita en `Docs/documentación/01-arquitectura-y-arranque.md`. |

**Conclusión:** el prototipo permite simular el flujo de agendamiento portuario y sus reglas centrales.
Para satisfacer completamente el requisito de API externa, queda pendiente reemplazar o complementar
las simulaciones con una integración HTTP real y mostrar sus datos/resultados en la aplicación. La
persistencia cubre los procesos principales, aunque no constituye una capa CRUD uniforme para todas
las entidades.

## 4. Próximos pasos

1. Implementar una integración HTTP real con una API externa apropiada y presentar sus resultados en
   la interfaz.
2. Si el alcance de la entrega lo requiere, completar operaciones CRUD que falten para las entidades
   administrables y documentar sus endpoints.
3. Ejecutar las pruebas y la CI al preparar la entrega correspondiente.
