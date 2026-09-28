# Documento de Diseño Arquitectónico y Patrones de Software: Caso Plataforma de Agendamiento Operativo Puerto Antioquia

**Jose Alejandro Benitez Casallas**
Facultad de Ingeniería, Universidad Remington
Ingeniería de Software II (Diseño de Software)
Marta Lucia Jiménez Torres
Apartadó, Antioquia
Septiembre de 2026

---

## INTRODUCCIÓN

La región del Urabá antioqueño constituye uno de los corredores logísticos más importantes de Colombia. El municipio de Turbo, epicentro del proyecto Puerto Antioquia, concentra un volumen creciente de operaciones de comercio exterior vinculadas a la exportación bananera, la importación de insumos y el tránsito de mercancías generales. En este contexto, el puerto se proyecta como una infraestructura de alcance nacional que debe operar con niveles de eficiencia comparables a los de terminales portuarias modernas.

Sin embargo, la realidad operativa actual revela un problema crítico: el congestionamiento sistemático de tractocamiones de carga pesada en las vías de acceso al puerto. La ausencia de un sistema centralizado de gestión de turnos provoca que los vehículos de carga arriben de forma desordenada, generando colas que pueden extenderse varios kilómetros sobre las vías principales de acceso a Turbo. Este fenómeno tiene consecuencias en múltiples dimensiones:

- **Dimensión operativa:** Tiempos muertos para conductores y transportistas que esperan horas —e incluso días— sin una ventana de atención definida.
- **Dimensión económica:** Incremento en costos de operación logística, consumo de combustible en ralentí y deterioro prematuro de vehículos.
- **Dimensión social y ambiental:** Congestión vial que afecta la movilidad de la comunidad de Turbo, emisiones contaminantes adicionales y condiciones de trabajo precarias para los conductores.
- **Seguridad vial:** Vehículos de carga pesada estacionados en bermas y vías sin iluminación representan un alto riesgo de accidentalidad.

La problemática se agrava por la naturaleza del entorno: conectividad a Internet intermitente en zonas rurales del corredor vial, conductores que operan desde la cabina del vehículo sin acceso a estaciones de trabajo convencionales, y la necesidad de coordinarse con sistemas regulatorios externos como la plataforma de aduanas de la Dirección de Impuestos y Aduanas Nacionales (DIAN).

---

## 1. DELIMITACIÓN DE REQUERIMIENTOS FUNCIONALES Y RESTRICCIONES TÉCNICAS

A continuación se establecen los requisitos funcionales, no funcionales y restricciones del sistema establecidos por el cliente y ejecutar de manera correcta la solución a la necesidad.

**Tabla 1**
*Requerimientos Funcionales del Sistema*

| Identificador | Descripción del Requerimiento |
|---|---|
| RF-01 | **Asignación y reserva de turnos (slots):** El sistema debe permitir que transportistas reserven ventanas de tiempo específicas para el ingreso de tractocamiones al puerto, evitando la llegada no programada. |
| RF-02 | **Validación automatizada de documentación:** Previo al arribo, el sistema debe verificar automáticamente la documentación de carga (manifiesto, BL), del conductor (licencia, RUNT) y del vehículo (SOAT, revisión técnico-mecánica), rechazando turnos con documentación incompleta o vencida. |
| RF-03 | **Notificación en tiempo real:** El sistema debe notificar a conductores y transportistas sobre cambios en la ventana de atención, retrasos en muelle, cancelaciones o reasignaciones de slots de forma inmediata. |

**Tabla 2**
*Requerimientos No Funcionales*

| Identificador | Atributo de Calidad | Descripción |
|---|---|---|
| RNF-01 | Concurrencia / Escalabilidad | Capacidad para procesar peticiones simultáneas de más de 500 transportistas sin degradación del rendimiento de la plataforma. |
| RNF-02 | Seguridad | Autenticación multifactor (MFA) y encriptación de datos sensibles de transporte (AES-256 en reposo, TLS 1.3 en tránsito). |

**Tabla 3**
*Restricciones del Sistema*

| Identificador | Tipo | Descripción |
|---|---|---|
| R-01 | Operativa | Interfaz accesible desde cabina del tractocamión: prioridad de comandos de voz y botones de alta visibilidad adaptados a condiciones de conducción. |
| R-02 | Integración | Obligatoriedad de consumir APIs de sistemas legados de aduana (DIAN) y del operador portuario existente. |

---

## 2. DEFINICIÓN Y JUSTIFICACIÓN DE LA ARQUITECTURA

### Estilo Arquitectónico Seleccionado: Microservicios con Event-Driven Architecture

Para la Plataforma de Agendamiento Operativo Puerto Antioquia se selecciona un estilo híbrido que combina Microservicios con Arquitectura Orientada a Eventos (Event-Driven Architecture [EDA]). Esta elección no es arbitraria: responde directamente a la naturaleza distribuida, asíncrona y altamente concurrente de las operaciones portuarias (Richards & Ford, 2020).

### Justificación Técnica Basada en Atributos de Calidad

A continuación, se argumenta por qué este estilo arquitectónico es superior a las alternativas (monolítica, modelo-vista-controlador [MVC] puro, cliente-servidor o por capas) para el contexto específico de Puerto Antioquia (Bass et al., 2012):

#### Escalabilidad (RNF-01)

El requerimiento RNF-01 exige soportar más de 500 transportistas concurrentes sin degradación del servicio. En una arquitectura monolítica, toda la aplicación escala como una única unidad: si el módulo de turnos está saturado, se debe replicar el sistema completo, incluyendo módulos que no están bajo carga (como validación documental o notificaciones). Esto resulta ineficiente y costoso.

Con microservicios, cada componente escala de forma independiente (Newman, 2021). Si el servicio de reserva de turnos recibe un pico de demanda (por ejemplo, al abrir las ventanas de agendamiento semanales), solo ese servicio se replica horizontalmente, mientras que el servicio de validación mantiene su capacidad habitual. Esta granularidad es esencial en un puerto con patrones de carga irregulares, como los picos vinculados a las cosechas bananeras.

La arquitectura EDA complementa esta escalabilidad al desacoplar temporalmente a productores y consumidores de mensajes. Un transportista solicita un turno y el sistema lo encola en un corredor de mensajes (por ejemplo, Apache Kafka) sin esperar a que la asignación de muelle finalice sincrónicamente.

#### Disponibilidad

En un sistema cliente-servidor monolítico, una falla en cualquier componente puede provocar la caída total de la plataforma. Con microservicios, cada servicio posee su propio ciclo de vida y falla de forma aislada. Si el servicio de validación documental experimenta una caída, el servicio de reserva de turnos continúa operando; las validaciones pendientes se procesan cuando el servicio se recupera, gracias a la persistencia de eventos en el broker.

#### Rendimiento

La validación documental (RF-02) requiere consultar las interfaces de la DIAN y del operador portuario. Estas llamadas externas pueden presentar latencias impredecibles. En una arquitectura síncrona, el conductor queda bloqueado esperando la respuesta. Con EDA, la solicitud se acepta inmediatamente y se emite un evento `TurnoSolicitado`. Las validaciones se ejecutan de manera asíncrona y en paralelo, logrando un tiempo de respuesta percibido en milisegundos.

#### Mantenibilidad y Seguridad (RNF-02)

Cada microservicio puede actualizarse sin afectar a los demás. En cuanto a la seguridad, se implementa un API Gateway como punto único de entrada que centraliza la autenticación multifactor (MFA), la terminación TLS 1.3 y la autorización basada en roles (RBAC). Además, cada servicio maneja únicamente los datos indispensables para su función (principio de mínimo privilegio).

---

## 3. ANÁLISIS COMPARATIVO DE ESTILOS DESCARTADOS

**Tabla 4**
*Estilos Arquitectónicos Descartados y Justificación de Rechazo*

| Estilo Alternativo | Razón de Descarte |
|---|---|
| Monolítico | No permite escalamiento granular por módulo. Un pico en reservas obliga a escalar todo el sistema. Inaceptable para RNF-01 (500+ concurrentes). |
| MVC puro | Es un patrón de presentación, no un estilo arquitectónico completo. Podría usarse dentro de cada microservicio para organizar su API, pero no resuelve los desafíos de distribución y concurrencia. |
| Cliente-Servidor (2 capas) | No ofrece la separación de responsabilidades necesaria. Toda la lógica residiría en un servidor monolítico, heredando problemas de escalabilidad y disponibilidad. |
| Capas (N-Tier) | Las capas se comunican sincrónicamente y escalan como unidad. No resuelve el requerimiento de notificaciones en tiempo real (RF-03) de forma natural. |

---

## 4. DIAGRAMA ARQUITECTÓNICO DE ALTO NIVEL

El Diagrama 1 ilustra la estructura general de la solución, detallando la interacción entre los clientes, el API Gateway, los microservicios del dominio y el corredor de eventos central.

**Figura 1**
*Diagrama de Componentes de la Arquitectura Orientada a Eventos*

```text
[CLIENTES / CLIENTS]
├── App Móvil Conductor (R-01: Voz/Botones) ──┐
└── Portal Web Operador Portuario ────────────┼──> [ HTTPS / TLS 1.3 ]
                                              │
                                              v
                              ┌───────────────────────────────┐
                              │ API GATEWAY (RNF-02)          │
                              │ - Auth MFA (JWT)              │
                              │ - Rate Limiting / SSL Term    │
                              └───────────────┬───────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │ (REST / Sync)                      │ (REST / Sync)                      │ (REST / Sync)
         v                                    v                                    v
┌─────────────────┐                  ┌─────────────────┐                  ┌─────────────────┐
│ Servicio de     │                  │ Servicio de     │                  │ Servicio de     │
│ Autenticación   │                  │ Gestión de      │                  │ Gestión de      │
│ (MFA / RBAC)    │                  │ Turnos (RF-01)  │                  │ Muelles         │
└────────┬────────┘                  └────────┬────────┘                  └────────┬────────┘
         │                                    │                                    │
         └─────────────────────────────┐      │      ┌─────────────────────────────┘
                                       v      v      v
          ═══════════════════════════════════════════════════════════════════
                     EVENT BUS / BROKER (Kafka / RabbitMQ) (RNF-01)
          ═══════════════════════════════════════════════════════════════════
                                       ▲      ▲      ▲
         ┌─────────────────────────────┘      │      └─────────────────────────────┐
         │ (Async Events)                     │ (Async Events)                     │ (Async Events)
         v                                    v                                    v
┌─────────────────┐                  ┌─────────────────┐                  ┌─────────────────┐
│ Servicio de     │                  │ Servicio de     │                  │ Sistemas        │
│ Validación      │                  │ Notificaciones  │                  │ Externos        │
│ Documental      │                  │ (Push/SMS/Voz)  │                  │ (DIAN / Oper)   │
│ (RF-02)         │                  │ (RF-03)         │                  │ (R-02)          │
└─────────────────┘                  └─────────────────┘                  └─────────────────┘
```

*Muestra cómo las peticiones de los usuarios (App Móvil y Portal Web) ingresan de forma segura a través de un **API Gateway** (autenticación MFA/JWT). Desde allí, los microservicios sincrónicos (Autenticación, Turnos, Muelles) se comunican con un **Event Bus/Broker** central (Apache Kafka/RabbitMQ).*

---

## 5. APLICACIÓN DE PATRONES DE DISEÑO

### Patrón de Comportamiento Observer

El patrón Observer (Gamma et al., 1994) define una dependencia uno-a-muchos entre objetos de modo que cuando un objeto cambia de estado, todos sus dependientes son notificados y actualizados automáticamente.

#### Problema Específico en el Sistema

El requerimiento RF-03 exige notificar en tiempo real cambios en ventanas de atención o retrasos en muelles. Si cada componente tuviera que conocer a todos sus destinatarios, se generaría un acoplamiento fuerte. Cualquier modificación en los canales de notificación exigiría cambiar la lógica de negocio de los servicios productores.

#### Justificación de la Solución

El patrón Observer resuelve esta problemática al desacoplar al sujeto de sus observadores (Gamma et al., 1994). El servicio de gestión de muelles solo emite un evento; los observadores suscritos deciden cómo procesarlo (vía push, SMS o comandos de voz). Esto cumple con el principio de responsabilidad única y el principio abierto/cerrado (OCP) de SOLID.

**Figura 2**
*Diagrama de Clases del Patrón Observer*

```text
┌─────────────────────────────────────────────┐              ┌───────────────────────────────────────────┐
│ <<interface>> EventoOperativo               │              │ <<interface>> ObservadorNotificacion      │
├─────────────────────────────────────────────┤              ├───────────────────────────────────────────┤
│ + registrarObservador(obs: Observador)      │──notifica──> │ + actualizar(evento: EventoDTO): void     │
│ + eliminarObservador(obs: Observador)       │ 1          * └─────────────────────┬─────────────────────┘
│ + notificarObservadores(): void             │                                    │
└──────────────────────┬──────────────────────┘                                    │ (implements)
                       │ (implements)                                              │
          ┌────────────┴────────────┐                           ┌──────────────────┼──────────────────┐
          │                         │                           │                  │                  │
┌─────────┴───────────────┐ ┌───────┴─────────────────┐ ┌───────┴────────┐ ┌───────┴────────┐ ┌───────┴────────┐
│ GestorMuelles           │ │ GestorTurnos            │ │ NotificadorPush│ │ NotificadorSMS │ │ NotificadorVoz │
├─────────────────────────┤ ├─────────────────────────┤ ├────────────────┤ ├────────────────┤ ├────────────────┤
│ - estadoMuelle: String  │ │ - estadoTurno: String   │ │ + actualizar() │ │ + actualizar() │ │ + actualizar() │
├─────────────────────────┤ ├─────────────────────────┤ └────────────────┘ └────────────────┘ └────────────────┘
│ + cambiarEstado()       │ │ + reasignarSlot()       │                                         (R-01 Cabina)
└─────────────────────────┘ └─────────────────────────┘
```

*Presenta la interfaz `EventoOperativo` (Sujeto) implementada por los componentes que cambian de estado (`GestorMuelles`, `GestorTurnos`). Cuando ocurre un cambio (p. ej., retraso en muelle o cancelación de slot), el sujeto notifica automáticamente a la interfaz `ObservadorNotificacion`.*

### Patrón Estructural Adapter

El patrón Adapter (Gamma et al., 1994) convierte la interfaz de una clase en otra interfaz que los clientes esperan, permitiendo que clases con interfaces incompatibles trabajen de forma conjunta.

#### Problema Específico en el Sistema

La restricción R-02 obliga a consumir APIs legadas de la DIAN (basadas en SOAP/XML) y del operador portuario (REST/JSON heterogéneo). Si el servicio de validación documental consumiera directamente estas interfaces, su código quedaría acoplado a protocolos externos cambiantes.

#### Justificación de la Solución

Adapter aísla la complejidad de traducción de formatos detrás de una interfaz unificada (`IValidadorExterno`). El servicio de validación únicamente interactúa con dicho contrato, mientras que adaptadores específicos se encargan de la transformación de mensajes XML/JSON y la gestión de credenciales (Fowler, 2002).

**Figura 3**
*Diagrama de Clases del Patrón Adapter*

```text
┌──────────────────────────────────────────────────────────────┐
│ ServicioValidacionDocumental                                 │
├──────────────────────────────────────────────────────────────┤
│ + ejecutarValidacionPreArribo(solicitud: TurnoDTO): boolean  │
└──────────────────────────────┬───────────────────────────────┘
                               │ usa
                               v
┌──────────────────────────────────────────────────────────────┐
│ <<interface>> IValidadorExterno                              │
├──────────────────────────────────────────────────────────────┤
│ + validarDocumentoCarga(doc: CargaDTO): ResultadoValid       │
│ + validarConductor(conductor: ConductorDTO): ResultadoValid  │
│ + validarVehiculo(vehiculo: VehiculoDTO): ResultadoValid     │
└──────────────────────────────▲───────────────────────────────┘
                               │ (implements)
             ┌─────────────────┴─────────────────┐
             │                                   │
┌────────────┴───────────────────┐  ┌────────────┴───────────────────┐
│ AdaptadorDIAN                  │  │ AdaptadorOperadorPortuario     │
├────────────────────────────────┤  ├────────────────────────────────┤
│ - clienteSOAP: SoapClient      │  │ - clienteREST: RestClient      │
├────────────────────────────────┤  ├────────────────────────────────┤
│ + validarDocumentoCarga()      │  │ + validarDocumentoCarga()      │
│ + validarConductor()           │  │ + validarConductor()           │
└───────────────┬────────────────┘  └───────────────┬────────────────┘
                │ llama                             │ llama
                v                                   v
┌────────────────────────────────┐  ┌────────────────────────────────┐
│ Sistema Legado DIAN (SOAP/XML) │  │ Sistema Operador Portuario     │
│ [API Externa - R-02]           │  │ (REST / JSON - R-02)           │
└────────────────────────────────┘  └────────────────────────────────┘
```

*Describe cómo el `ServicioValidacionDocumental` interactúa únicamente con un contrato unificado e interno llamado `IValidadorExterno`. Detrás de esta interfaz, clases adaptadoras específicas (`AdaptadorDIAN` para protocolos SOAP/XML y `AdaptadorOperadorPortuario` para REST/JSON) traducen los formatos externos incompatibles al modelo de dominio interno (`ResultadoValidacion`), aislando la lógica central del sistema ante cambios regulatorios o técnicos externos.*

---

## CONCLUSIONES

### Síntesis de Viabilidad Técnica

La combinación del estilo arquitectónico de Microservicios con Arquitectura Orientada a Eventos y los patrones de diseño Observer y Adapter constituye una solución técnicamente viable y alineada con las exigencias operativas del entorno portuario de Urabá. Las decisiones de diseño aseguran la viabilidad del sistema en los siguientes aspectos:

- **Escalabilidad y disponibilidad:** La combinación de microservicios y procesamientos asíncronos absorbe picos de demanda superiores a 500 transportistas concurrentes sin colapsar la plataforma.
- **Notificaciones en tiempo real:** El patrón Observer flexibiliza la distribución de alertas multicanal, dando soporte crucial a la interacción por voz en cabina (R-01).
- **Integración robusta:** El patrón Adapter blinda al núcleo del sistema frente a cambios e incompatibilidades en los sistemas legados regulatorios (R-02).

En conclusión, el diseño propuesto establece una base sólida y evolutiva capaz de responder a la expansión proyectada para Puerto Antioquia como un nodo logístico estratégico en Colombia.

---

## REFERENCIAS

- Bass, L., Clements, P., & Kazman, R. (2012). *Software architecture in practice* (3rd ed.). Addison-Wesley Professional.
- Fowler, M. (2002). *Patterns of enterprise application architecture*. Addison-Wesley Professional.
- Freeman, E., Robson, E., Bates, B., & Sierra, K. (2004). *Head first design patterns*. O'Reilly Media.
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley Professional.
- ISO/IEC 25010:2011. (2011). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. International Organization for Standardization.
- Newman, S. (2021). *Building microservices: Designing fine-grained systems* (2nd ed.). O'Reilly Media.
- Richards, M., & Ford, N. (2020). *Fundamentals of software architecture: An engineering approach*. O'Reilly Media.
- Rumbaugh, J., Jacobson, I., & Booch, G. (2004). *The Unified Modeling Language reference manual* (2nd ed.). Addison-Wesley Professional.
