# Línea Base de Requerimientos — Plataforma de Agendamiento Operativo Puerto Antioquia

Ampliación de los requerimientos definidos en la Actividad 1 (Tablas 1, 2 y 3 del documento de diseño arquitectónico). Los identificadores originales se conservan; los nuevos se numeran a continuación. La columna **Origen** indica de dónde se deriva cada requerimiento, y la columna **Componente** lo vincula con la arquitectura de microservicios.

---

## 1. Actores del sistema

| Actor | Descripción | Canal principal |
|---|---|---|
| Conductor | Opera el tractocamión; consulta su turno, recibe alertas y se presenta en portería. | App móvil (cabina) |
| Transportista | Empresa o propietario de flota; reserva turnos, registra vehículos y conductores, gestiona documentación. | App móvil / Portal web |
| Operador portuario | Personal del puerto; gestiona muelles, ventanas de atención y novedades operativas. | Portal web |
| Agente de portería | Controla el ingreso y salida de vehículos en la entrada del puerto. | Portal web / Tablet |
| Administrador | Gestiona usuarios, roles y parámetros generales del sistema. | Portal web |
| Sistemas externos | DIAN y sistema del operador portuario existente (consumidos vía Adapter). | API |

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Descripción | Actor | Origen | Componente |
|---|---|---|---|---|---|
| RF-01 | Asignación y reserva de turnos (slots) | El sistema debe permitir que transportistas reserven ventanas de tiempo específicas para el ingreso de tractocamiones al puerto, evitando la llegada no programada. | Transportista | Actividad 1 | Servicio de Gestión de Turnos |
| RF-02 | Validación automatizada de documentación | Previo al arribo, el sistema debe verificar automáticamente la documentación de carga (manifiesto, BL), del conductor (licencia, RUNT) y del vehículo (SOAT, revisión técnico-mecánica), rechazando turnos con documentación incompleta o vencida. | Sistema | Actividad 1 | Servicio de Validación Documental |
| RF-03 | Notificación en tiempo real | El sistema debe notificar a conductores y transportistas sobre cambios en la ventana de atención, retrasos en muelle, cancelaciones o reasignaciones de slots de forma inmediata. | Conductor, Transportista | Actividad 1 | Servicio de Notificaciones |
| RF-04 | Autenticación y control de acceso por roles | El sistema debe autenticar a los usuarios mediante credenciales y un segundo factor (MFA), y restringir las funciones disponibles según el rol (conductor, transportista, operador portuario, agente de portería, administrador). | Todos | Derivado de RNF-02 | Servicio de Autenticación |
| RF-05 | Gestión de flota y conductores | El sistema debe permitir al transportista registrar, editar y desactivar vehículos y conductores, y asignar un conductor y un vehículo a cada turno reservado. | Transportista | Derivado de RF-01 (distinción transportista/conductor) | Servicio de Gestión de Turnos |
| RF-06 | Carga y actualización de documentos | El sistema debe permitir cargar, reemplazar y consultar los documentos del vehículo, del conductor y de la carga, registrando su fecha de vencimiento. | Transportista, Conductor | Derivado de RF-02 | Servicio de Validación Documental |
| RF-07 | Consulta del estado del turno | El sistema debe mostrar el estado actual de cada turno (solicitado, en validación, aprobado, rechazado, reasignado, cancelado, atendido) y el motivo de cada cambio. | Conductor, Transportista | Derivado del procesamiento asíncrono (EDA) | Servicio de Gestión de Turnos |
| RF-08 | Cancelación y reprogramación de turnos | El sistema debe permitir cancelar o reprogramar un turno dentro de un plazo definido, liberando el slot para otros transportistas. | Transportista | Derivado de RF-01 | Servicio de Gestión de Turnos |
| RF-09 | Gestión de muelles y capacidad | El sistema debe permitir al operador portuario configurar muelles, ventanas de atención y capacidad por franja horaria, así como bloquear franjas por mantenimiento u otras causas. | Operador portuario | Vacío de Actividad 1 (servicio de muelles sin RF) | Servicio de Gestión de Muelles |
| RF-10 | Registro de novedades operativas | El sistema debe permitir al operador registrar retrasos, cierres de muelle o contingencias, generando automáticamente la reasignación de los turnos afectados y el evento de notificación correspondiente. | Operador portuario | Vacío de Actividad 1 / habilita RF-03 | Servicio de Gestión de Muelles |
| RF-11 | Control de ingreso en portería | El sistema debe generar un código QR por turno aprobado y permitir al agente de portería verificarlo, confirmar que el arribo está dentro de la ventana asignada y registrar ingreso y salida del vehículo. | Conductor, Agente de portería | Vacío de Actividad 1 (cierre del ciclo de arribo) | Servicio de Gestión de Turnos |
| RF-12 | Tablero operativo y reportes | El sistema debe presentar al operador un tablero con ocupación de muelles, turnos del día, tiempos de espera, inasistencias y cumplimiento de ventanas. | Operador portuario | Derivado del problema de congestión (Introducción) | Servicio de Gestión de Muelles |
| RF-13 | Interacción por voz | El sistema debe permitir al conductor consultar su turno, escuchar alertas y confirmar acciones básicas mediante comandos de voz. | Conductor | Derivado de R-01 | App móvil / Servicio de Notificaciones |
| RF-14 | Operación con conectividad limitada | La app del conductor debe permitir consultar el turno vigente y mostrar el código QR sin conexión, sincronizando los cambios al recuperar la señal. | Conductor | Derivado de R-03 | App móvil |
| RF-15 | Alertas preventivas de vencimiento documental | El sistema debe alertar al transportista y al conductor sobre documentos próximos a vencer antes de que impidan la reserva de un turno. | Transportista, Conductor | Derivado de RF-02 | Servicio de Validación Documental / Notificaciones |
| RF-16 | Historial de turnos | El sistema debe permitir consultar el historial de turnos por vehículo, conductor o transportista, con sus estados y tiempos de atención. | Transportista, Operador portuario | Derivado de RF-12 | Servicio de Gestión de Turnos |
| RF-17 | Prioridad de carga perecedera | El sistema debe reservar en cada franja una cuota (30 % de la capacidad) para carga refrigerada de exportación, liberarla a la carga general 2 h antes si no se usa, exigir el certificado fitosanitario del ICA a esa carga y limitar a 30 min su desplazamiento ante retrasos de muelle. | Transportista, Operador portuario | OCI-001 (Parcial II) | Servicio de Gestión de Turnos / Validación Documental |

---

## 3. Requerimientos No Funcionales

| ID | Atributo de calidad | Descripción | Métrica de aceptación | Origen |
|---|---|---|---|---|
| RNF-01 | Concurrencia / Escalabilidad | Capacidad para procesar peticiones simultáneas de más de 500 transportistas sin degradación del rendimiento de la plataforma. | ≥ 500 usuarios concurrentes sin aumento del tiempo de respuesta por encima de RNF-04. | Actividad 1 |
| RNF-02 | Seguridad | Autenticación multifactor (MFA) y encriptación de datos sensibles de transporte (AES-256 en reposo, TLS 1.3 en tránsito). | 100 % de sesiones con MFA; 0 datos sensibles sin cifrar. | Actividad 1 |
| RNF-03 | Disponibilidad | La plataforma debe operar de forma continua y aislar las fallas de un servicio sin afectar a los demás. | Disponibilidad ≥ 99,5 % mensual; la caída de un servicio no detiene la reserva de turnos. | Justificación de arquitectura (Actividad 1) |
| RNF-04 | Rendimiento | Las acciones del usuario deben recibir respuesta inmediata aunque el procesamiento de fondo sea asíncrono. | Confirmación de solicitud ≤ 2 s; notificación entregada ≤ 30 s después del evento. | Justificación de arquitectura (Actividad 1) |
| RNF-05 | Usabilidad | Las tareas principales deben poder completarse con pocos pasos y sin capacitación previa. | Reserva de turno en ≤ 3 pantallas; consulta del turno en 1 toque desde el inicio. | Enunciado del parcial (principios de UI) |
| RNF-06 | Accesibilidad | La interfaz debe ser legible y operable en cabina y en exteriores. | Cumplimiento WCAG 2.2 nivel AA; contraste ≥ 4,5:1; áreas táctiles ≥ 48 dp; texto escalable. | R-01 / Enunciado del parcial |
| RNF-07 | Adaptabilidad (Responsive) | Las interfaces deben ajustarse al dispositivo de cada actor. | Portal usable en escritorio y tablet; app funcional en móviles de gama media y baja. | Enunciado del parcial |
| RNF-08 | Tolerancia a conectividad intermitente | Las funciones críticas del conductor deben seguir disponibles sin conexión y sincronizarse sin pérdida de datos. | Turno y QR disponibles offline; 0 acciones perdidas al reconectar. | R-03 |
| RNF-09 | Interoperabilidad / Mantenibilidad | Los cambios en las interfaces externas no deben afectar la lógica central del sistema. | Un cambio en la API de la DIAN solo modifica su adaptador. | Patrón Adapter (Actividad 1) |
| RNF-10 | Trazabilidad / Auditoría | Todo cambio de estado de un turno y todo acceso a datos sensibles debe quedar registrado. | 100 % de transiciones con usuario, fecha y motivo registrados. | Derivado de RF-07 y RNF-02 |
| RNF-11 | Privacidad de datos personales | El tratamiento de datos de conductores y transportistas debe cumplir la normativa colombiana de protección de datos. | Cumplimiento de la Ley 1581 de 2012; autorización de tratamiento registrada por usuario. | Marco legal colombiano |

---

## 4. Restricciones del Sistema

| ID | Tipo | Descripción | Origen |
|---|---|---|---|
| R-01 | Operativa | Interfaz accesible desde cabina del tractocamión: prioridad de comandos de voz y botones de alta visibilidad adaptados a condiciones de conducción. | Actividad 1 |
| R-02 | Integración | Obligatoriedad de consumir APIs de sistemas legados de aduana (DIAN) y del operador portuario existente. Desde la OCI-001 incluye el servicio de certificación fitosanitaria del ICA. | Actividad 1 · ampliada por OCI-001 |
| R-03 | Entorno | Conectividad a Internet intermitente en zonas rurales del corredor vial de acceso a Turbo. | Introducción de la Actividad 1 (formalizada) |

---

## 5. Trazabilidad con las vistas mínimas del Anexo No. 3

| Vista exigida | Requerimientos que la sustentan |
|---|---|
| Pantalla principal / login | RF-04, RNF-02, RNF-05 |
| Módulo central operativo | RF-07, RF-11, RF-12, RF-13, RF-14 |
| Formulario de captura de datos | RF-01, RF-05, RF-06, RF-08 |
| Vista de reportes / alertas | RF-03, RF-10, RF-12, RF-15, RF-16 |
