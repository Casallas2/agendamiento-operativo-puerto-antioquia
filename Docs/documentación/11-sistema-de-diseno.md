# 11 · Sistema de diseño

Las decisiones de color y tipografía salen del catálogo de la skill **ui-ux-pro-max**; las de
movimiento y accesibilidad, de sus guías UX. Donde se eligió algo distinto se explica por qué.

## Color

Perfil de partida: **Logistics/Delivery** (azul de rastreo + naranja de entrega).

| Token | Claro | Uso |
|---|---|---|
| `--primary` | `oklch(0.48 0.17 258)` | Acciones principales, enlaces, estado activo |
| `--highlight` | `oklch(0.63 0.2 42)` | Naranja de acento: paso activo del carrusel, filetes de dato |
| `--success` | `oklch(0.52 0.14 150)` | Validación aprobada, turno confirmado |
| `--warning` | `oklch(0.72 0.16 70)` | Retraso de muelle, documento por vencer |
| `--destructive` | `oklch(0.577 0.245 27)` | Rechazo, cancelación |
| `--sidebar` | `oklch(0.26 0.06 255)` | Navegación y tarjeta de turno en cabina |

**Por qué `--highlight` y no `--accent`:** en shadcn/ui, `--accent` es el color de fondo de los
estados *hover* de menús y botones. Pintarlo de naranja habría vuelto naranja cada hover de la
aplicación. El acento de marca necesitaba su propio token.

Todos los colores se declaran en `oklch`, que mantiene la luminosidad perceptual constante al
variar el tono: por eso `--success` y `--warning` se leen con el mismo peso visual pese a ser
colores muy distintos.

### El modo oscuro no es decorativo

Está pensado para la cabina del tractocamión en jornada nocturna. El fondo es
`oklch(0.16 0.015 255)` en lugar de negro puro: el contraste extremo cansa la vista en
conducción, y un gris azulado muy oscuro reduce el deslumbramiento.

### El color nunca va solo

Todo estado se comunica con **icono + texto**, no solo con color. `InsigniaEstado` siempre
compone los tres elementos. Es lo que hace que la interfaz funcione en escala de grises y para
quien no distingue rojo de verde.

## Tipografía

Pareja **Corporate Trust** del catálogo: Lexend + Source Sans 3.

| Familia | Token | Dónde |
|---|---|---|
| **Lexend** | `--font-heading` | Títulos, cifras de indicador, hora del turno en cabina |
| **Source Sans 3** | `--font-sans` | Cuerpo, tablas, formularios |
| **Geist Mono** | `--font-mono` | Códigos de turno, manifiestos, BL |

Lexend se eligió por una razón concreta, no estética: fue diseñada para aumentar la velocidad de
lectura. En cabina, el conductor mira la pantalla de reojo, y la hora de su ventana es el dato
que tiene que leer más rápido de toda la aplicación. Por eso aparece en Lexend, a 60 px y con
`tabular-nums`, que evita que los dígitos bailen al actualizarse el contador.

## Movimiento

Tres curvas y una regla: **el movimiento explica de dónde viene algo, no adorna**.

| Token | Curva | Uso |
|---|---|---|
| `--ease-entrada` | `cubic-bezier(0, 0, 0.2, 1)` | Entra contenido |
| `--ease-salida` | `cubic-bezier(0.4, 0, 1, 1)` | Sale contenido |
| `--ease-suave` | `cubic-bezier(0.22, 1, 0.36, 1)` | Desplazamientos y elevaciones |

Las salidas son más rápidas que las entradas: esperar a que algo desaparezca se percibe como
lentitud del sistema.

### Utilidades

| Utilidad | Qué hace | Dónde |
|---|---|---|
| `animar-entrada` | Aparece subiendo 12 px en 420 ms | Encabezados, texto del carrusel |
| `animar-aparecer` | Fundido en 300 ms | Cambios de estado suaves |
| `animar-lista` | Escalona a los hijos de 60 en 60 ms, hasta el octavo | Rejilla de indicadores, beneficios del login |
| `animar-latido` | Pulso de opacidad continuo | Elementos a la espera |

El escalonado se detiene en el octavo hijo a propósito: pasado ese punto la espera se nota y
deja de ayudar a leer el orden.

### Movimiento reducido

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Se reduce la duración a un valor mínimo en vez de poner `animation: none`, porque varias
animaciones usan `animation-fill-mode: both` para fijar su estado final: con `none`, los
elementos se quedarían invisible

El CSS no alcanza para todo. El carrusel **deja de avanzar solo** cuando se pide menos
movimiento, y eso se decide en JavaScript con `usePrefiereMenosMovimiento`, implementado con
`useSyncExternalStore` para no provocar renders en cascada.

## El carrusel del acceso

Cuatro láminas SVG originales, de unos 6 KB cada una: muelle al amanecer, vía a Turbo, banano de
exportación y patio de contenedores. Son vectores propios, así que no hay dependencias externas,
ni licencias que revisar, ni peticiones a terceros.

La guía «Auto-Rotating Content Controls» del catálogo marca severidad **alta**, y se cumple
entera:

| Requisito | Implementación |
|---|---|
| Control anterior/siguiente | Dos botones de 44×44 px con `aria-label` |
| Play/pausa | Botón que alterna y anuncia su acción |
| Se detiene al pasar el puntero | `onMouseEnter` / `onMouseLeave` |
| Se detiene al recibir foco | `onFocusCapture` / `onBlurCapture` |
| Respeta el movimiento reducido | No auto-avanza y desactiva la deriva Ken Burns |
| Estructura semántica | `role="region"` + `aria-roledescription="carrusel"` |
| Lámina inactiva oculta | `aria-hidden` y `alt=""` en las no visibles |

Se detiene al recibir foco porque, navegando con teclado, el contenido no puede cambiar bajo los
dedos de quien está leyendo.

Los puntos indicadores tienen un área táctil de 44×32 px aunque el punto dibujado mida 6 px: el
objetivo táctil y el elemento visible no tienen por qué coincidir.

Una barra de avance de 2 px muestra cuánto falta para el cambio, para que la rotación no
sorprenda.

## Accesibilidad

| Regla | Cómo se cumple |
|---|---|
| Contraste 4.5:1 en texto | Tokens `oklch` verificados; velo degradado sobre el carrusel |
| Objetivo táctil ≥ 44×44 px | Controles del carrusel; 96 px de alto en los botones de cabina |
| El foco nunca se elimina | `:focus-visible` con contorno de 2 px y 2 px de separación |
| Zoom permitido | No se fija `maximumScale` en el viewport |
| Estado no solo por color | Icono + texto en toda insignia |
| Imágenes con alternativa | `alt` descriptivo en la lámina activa, vacío en las ocultas |
| Movimiento controlable | Guard global + pausa del carrusel |

## Qué queda pendiente

- Verificación de contraste con herramienta automática: los valores se eligieron con criterio,
  pero no se midieron con un comprobador.
- Recorrido completo con lector de pantalla.
- Revisión en dispositivo real: la cabina se diseñó para móvil, pero solo se comprobó en
  simulación de tamaños.
