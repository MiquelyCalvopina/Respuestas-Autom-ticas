---
version: alpha
name: Plugthem-design-system
description: A dense, utilitarian design system built directly on stock Ant Design (`antd` v6), not a custom visual language layered on top of it — the primary accent is AntD's DayBreak Blue (#1890ff), Ant's default semantic palette carries success/warning/error, and Ant's own component shapes go almost unmodified. Roboto at 14px carries the whole UI at a size and weight AntD itself ships with; there is no display type scale like a marketing site would have. One deliberate departure from stock AntD is a violet accent (#7C3AED, gradient variant `linear-gradient(270deg,#A154DE,#5196E0,#BE1CE6)`) reserved exclusively for signaling AI-generated content, so a user scanning the page can tell at a glance "this was written by AI" vs. "this is real or static content." A second deliberate departure is Plugthem's own tertiary color (#FF6B35), reserved for sparse emphasis moments distinct from both the primary and the AI accent. Radius follows a strict six-tier rule keyed to component *type* (pill for chips/circular buttons, 4px for small decorative chrome, 8px for controls, 12px for content cards, 16px for Table, 20px for real Card/Modal/Drawer) rather than to size — the one place stock AntD conventions get overridden. This is a system for dense, professional authoring tools, not public-facing pages — density and information scent matter more than generous whitespace.

colors:
  primary: "#1890ff"
  primary-active: "#096DD9"
  primary-disabled: "#E6F7FF"
  border-control: "#d9d9d9"
  border-split: "#f0f0f0"
  bg-hover: "#fafafa"
  bg-base: "#f5f5f5"
  text-primary: "rgba(0,0,0,0.85)"
  text-secondary: "rgba(0,0,0,0.45)"
  text-disabled: "rgba(0,0,0,0.25)"
  error-text: "#CF1322"
  error-text-hover: "#A8071A"
  success: "#52C41A"
  success-bg: "#F6FFED"
  success-border: "#B7EB8F"
  warning: "#FAAD14"
  warning-bg: "#FFFBE6"
  warning-border: "#FFE58F"
  danger: "#FF4D4F"
  danger-bg: "#FFF1F0"
  danger-border: "#FFCCC7"
  ai-violet: "#7C3AED"
  ai-violet-gradient: "linear-gradient(270deg, #A154DE 0%, #5196E0 45.41%, #BE1CE6 100%)"
  ai-violet-mid: "#A154DE"
  ai-violet-bg: "#F5F3FF"
  ai-violet-dark: "#4C1D95"
  accent-tertiary: "#FF6B35"

typography:
  title-lg:
    fontFamily: "'Roboto', sans-serif"
    fontSize: 20px
    fontWeight: 500
    color: "rgba(0,0,0,0.45)"
  body-lg:
    fontFamily: "'Roboto', sans-serif"
    fontSize: 16px
    fontWeight: 400
  body-md:
    fontFamily: "'Roboto', sans-serif"
    fontSize: 14px
    fontWeight: 400
  body-md-medium:
    fontFamily: "'Roboto', sans-serif"
    fontSize: 14px
    fontWeight: 500
  body-sm:
    fontFamily: "'Roboto', sans-serif"
    fontSize: 12px
    fontWeight: 400
  caption:
    fontFamily: "'Roboto', sans-serif"
    fontSize: 12px
    fontWeight: 400
  code:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: 12px
    fontWeight: 400

rounded:
  none: 0px
  chico: 4px
  control: 8px
  tarjeta: 12px
  tabla: 16px
  container: 20px
  pill: 1000px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  base: 24px
  lg: 32px

motion:
  press: "100ms ease"
  hover: "150ms ease"
  toast-enter: "250ms ease-out"
  loading-min: "500ms"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    height: 32px
    padding: "7px 8px"            # inspector de Figma: py 7px, px 8px — NO el default de AntD (4px/15px)
    gap: 4px                      # separación ícono-texto
    boxShadow: "0 2px 0 rgba(0,0,0,0.04)"
  button-primary-active:
    backgroundColor: "{colors.primary}"
    transform: "scale(0.97)"
    transition: "transform 100ms ease"
  button-default:
    backgroundColor: "#ffffff"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.control}"
    height: 32px
    padding: "7px 8px"            # inspector de Figma (py 7px, px 8px)
    gap: 4px
    boxShadow: "0 2px 0 rgba(0,0,0,0.02)"
  button-default-active:
    transform: "scale(0.97)"
    transition: "transform 100ms ease"
  button-dashed:
    backgroundColor: "#ffffff"
    borderStyle: dashed
    borderColor: "{colors.border-control}"
    rounded: "{rounded.control}"
    height: 32px
    padding: "7px 8px"
  button-text:
    backgroundColor: transparent
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    height: 32px
  button-link:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    height: 32px
  icon-button-square:
    backgroundColor: "#ffffff"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.control}"
    height: 24px
    width: 24px
  icon-button-square-active:
    transform: "scale(0.9)"
    transition: "transform 100ms ease"
  icon-button-circle:
    backgroundColor: "#ffffff"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.pill}"
    height: 24px
    width: 24px
  icon-button-circle-active:
    transform: "scale(0.9)"
    transition: "transform 100ms ease"
  loader:
    shape: "rotating ring of dots"
    color: "{colors.primary}"
    size: 34px
    frames: 12
  breadcrumb-back:
    typography: "{typography.body-md}"
    linkColor: "{colors.primary}"
    currentColor: "{colors.text-primary}"
    currentWeight: 500
  breadcrumb-path:
    typography: "{typography.body-md}"
    linkColor: "{colors.primary}"
    currentColor: "{colors.text-secondary}"
    separator: "/"
  anchor:
    activeColor: "{colors.primary}"
    inactiveColor: "{colors.text-secondary}"
    indent: 16px
    subIndent: 32px
  table:
    borderColor: "{colors.border-split}"
    rounded: "{rounded.tabla}"
    headerBg: "{colors.bg-hover}"
    headerHeight: 40px
    rowHeight: 50px
    cellPadding: "8px 16px"
  text-input:
    backgroundColor: "#ffffff"
    borderColor: "{colors.border-control}"
    rounded: "{rounded.control}"
    height: 32px
    typography: "{typography.body-md}"
  radio-segmented:
    rounded: "{rounded.control}"
    height: 32px
  chip-badge:
    rounded: "{rounded.pill}"
    padding: 1px 10px
    typography: "{typography.body-sm}"
  chip-selectable:
    rounded: "{rounded.pill}"
    borderColor: "{colors.border-control}"
    backgroundColor: "#ffffff"
  chip-selectable-selected:
    borderColor: "{colors.primary}"
    backgroundColor: "{colors.primary-disabled}"
  banner-sugerencia:
    backgroundColor: "{colors.primary-disabled}"
    borderColor: "{colors.primary}"
    rounded: "{rounded.control}"
  row-interactive:
    backgroundColor: "#ffffff"
    typography: "{typography.body-md}"
  row-interactive-hover:
    backgroundColor: "{colors.bg-hover}"
    transition: "background 150ms ease"
  card-compact:
    rounded: "{rounded.control}"
  card-compact-selected:
    borderColor: "{colors.primary}"
    backgroundColor: "{colors.primary-disabled}"
  card-modal:
    rounded: "{rounded.container}"
  popover:
    backgroundColor: "#ffffff"
    borderColor: "{colors.border-split}"
    rounded: "{rounded.control}"
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
  card-elevated:
    backgroundColor: "#ffffff"
    rounded: "{rounded.tarjeta}"
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
  toast:
    backgroundColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: 8px 16px
    gap: 8px
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
    typography: "{typography.body-md}"
    iconSize: 16px
    placement: top-right
    enterAnimation: "{motion.toast-enter}, slide-in from right + fade"
---

## Overview

Plugthem builds on Ant Design v6 almost unmodified and layers on **three** deliberate
deviations: (1) a corner-radius rule keyed to component *type* rather than size, (2) a violet
accent reserved exclusively for signaling AI-generated content, and (3) Plugthem's own tertiary
color (`#FF6B35`) for sparse emphasis moments that are neither primary actions (blue) nor AI
content (violet) — the "this deserves a second look" element of the system, used sparingly so it
never competes with the other two meanings. Everything else — primary color, typography, control
height, shadows — is AntD out of the box.

Density stays high on purpose: this is a system for professional authoring tools, not consumption
pages — information fitting on screen matters more than open air. Spacing does scale up one full
step from the tightest values (base 4px → base 8px, etc. — see "Spacing") to feel "aireado," but
that gain lives entirely in the space *around* elements, never in control height (fixed at 32px)
or type size (floor of 12px).

The primary is AntD's DayBreak Blue (`#1890ff`), never replaced by a custom brand color. Text runs
in Roboto 14px across nearly the entire surface — there is no "display" type scale like a
marketing site would have; the largest text anywhere in the system is a 20px/500 section title.
Hierarchy is built with weight and color (secondary color for the large text) before size, the
opposite of a marketing page.

The violet accent's only real function is semantic, not decorative: any surface using
`{colors.ai-violet}` tells the user "this was generated by AI, this is not a real response or a
static label." If violet ever appears outside that context, it stops doing its job.

## Colors

### Marca y acento
- **Primario** (`{colors.primary}` — #1890ff, "DayBreak Blue/6"): primary buttons, links, focus
  rings, checks.
- **Primario activo** (`{colors.primary-active}` — #096DD9, "DayBreak Blue/7"): pressed/hover
  state of primary elements.
- **Primario deshabilitado** (`{colors.primary-disabled}` — #E6F7FF, "DayBreak Blue/1"):
  disabled-state background on primary surfaces.

### Superficie y bordes
- **Fondo base** (`{colors.bg-base}` — #f5f5f5): behind elevated/floating cards.
- **Fondo hover** (`{colors.bg-hover}` — #fafafa, "Neutral/2"): hover state on interactive rows,
  section headers, input addons.
- **Borde de control** (`{colors.border-control}` — #d9d9d9, "Neutral/5"): border of
  Input/Select/Button/DatePicker and any interactive control.
- **Borde de contenedor** (`{colors.border-split}` — #f0f0f0, "Neutral/4"): border of
  cards/panels and divider lines — never interactive controls.

### Texto
- **Primario** (`{colors.text-primary}` — rgba(0,0,0,.85), "Character/Primary"): main text,
  field values, entity names.
- **Secundario** (`{colors.text-secondary}` — rgba(0,0,0,.45), "Character/Secondary"):
  subtitles, help text, section labels.
- **Disabled/placeholder** (`{colors.text-disabled}` — rgba(0,0,0,.25), "Character/Disabled &
  Placeholder"): placeholders, disabled text, character counters.

### Semántico
- **Error** (`{colors.error-text}` — #CF1322, "Dust Red/7") / hover `{colors.error-text-hover}`
  (#A8071A, "Dust Red/8"): validation messages, required-field markers.
- **Éxito** (`{colors.success}` #52C41A / bg `{colors.success-bg}` #F6FFED / borde
  `{colors.success-border}` #B7EB8F): success badges, confirmation banners.
- **Warning** (`{colors.warning}` #FAAD14 / bg `{colors.warning-bg}` #FFFBE6 / borde
  `{colors.warning-border}` #FFE58F): draft-state badges, incomplete-configuration notices.
- **Danger** (`{colors.danger}` #FF4D4F / bg `{colors.danger-bg}` #FFF1F0 / borde
  `{colors.danger-border}` #FFCCC7): destructive-action icons and buttons, delete confirmations.

### Violeta — exclusivo de IA
Tokens: **sólido** (`{colors.ai-violet}` #7C3AED) / **gradiente** (`{colors.ai-violet-gradient}`,
270deg de #A154DE a #5196E0 a #BE1CE6) / **medio** (`{colors.ai-violet-mid}` #A154DE) / **fondo**
(`{colors.ai-violet-bg}` #F5F3FF) / **oscuro** (`{colors.ai-violet-dark}` #4C1D95). Nunca se usa
fuera de un elemento que involucre contenido generado o editable por IA.

**No se pinta todo lo relacionado a IA de violeta** — el tratamiento es deliberadamente contenido:
- **Gradiente**: exclusivo del **ícono indicador** que marca "esto lo generó/edita la IA" (el
  ícono `✦`). Nunca se aplica como fondo de un bloque, un botón, o cualquier otra superficie.
- **Borde + fondo tenue**: el contenedor de un campo o bloque de contenido de IA usa un borde
  fino en `{colors.ai-violet-mid}` (~1px) y un fondo apenas teñido (`{colors.ai-violet-bg}`, un
  lavanda muy claro) — nunca un violeta sólido o denso cubriendo el contenedor.
- **Los controles que disparan una acción de IA no necesitan ser violeta**: un botón "Generar"
  puede usar el chrome estándar de `button-default` — el violeta marca el contenido generado por
  IA, no el control que lo produce.

### Terciario — el acento de énfasis
- **Sólido** (`{colors.accent-tertiary}` #FF6B35) — es el color terciario oficial de Plugthem,
  no uno inventado para este documento. Es el tercer y último acento del sistema — nunca un
  cuarto color nuevo.
- **Sin variantes de fondo/borde definidas todavía** — a diferencia del resto de la paleta
  (que sí tiene su tinte de fondo/borde documentado), este color solo está confirmado en su
  versión sólida. Hasta que se defina un fondo/borde oficial, se usa exclusivamente como color
  de texto/ícono/borde sólido — **no** se inventa un tinte derivado (`rgba`, mezcla con blanco,
  etc.) para simular un fondo.
- **Uso deliberadamente escaso**: badges de tipo "Recomendado"/"Nuevo", íconos de elementos
  destacados, el acento del CTA principal en un empty-state. No reemplaza al warning
  (`#FAAD14`, que ya significa "atención/borrador" — el terciario significa "destacado", un
  significado distinto que no debe mezclarse con warning aunque el tono sea parecido).
- Los tres acentos del sistema — azul (`{colors.primary}`, acción), violeta (`{colors.ai-violet}`,
  IA), terciario (`{colors.accent-tertiary}`, énfasis) — tienen que poder distinguirse de un
  vistazo; ninguno reemplaza a otro.
- **En combinación con el primario**: es común que ambos convivan en una misma vista — el azul
  marca lo neutral/informativo en una secuencia (badges numerados, barras de progreso), y el
  terciario marca lo que se quiere resaltar: un eyebrow label en mayúsculas al inicio de una
  sección, la casilla de un principio/insight destacado, o el último ítem de una secuencia que
  representa el resultado o punto de llegada.

### Política de gradientes
**No hay gradientes decorativos en ningún lugar del sistema.** El único gradiente que existe es
`{colors.ai-violet-gradient}`, con el uso puntual descrito arriba. Si aparece un gradiente en
cualquier otro contexto (fondos de sección, botones, tarjetas), es una desviación del sistema, no
una variación válida.

## Typography

### Familia
Roboto en toda la interfaz. Monoespaciada (`'JetBrains Mono', monospace`) solo para código/markup
crudo y variables/tokens insertados en texto — el propósito es distinguir visualmente "esto es un
token/código", no una elección estética.

### Escala

**Regla dura: 12px es el piso — no existe ningún texto legítimo por debajo de eso, ni siquiera
para captions/hints/contadores.** No hay un token "micro" de 10px: cualquier texto por debajo de
12px es una desviación a corregir, no una categoría tipográfica válida.

| Token | Tamaño | Peso | Uso |
|---|---|---|---|
| `{typography.title-lg}` | 20px | 500, color secundario | Títulos de sección/paso |
| `{typography.body-lg}` | 16px | 400 | Uso puntual — no la base del sistema |
| `{typography.body-md}` | 14px | 400 | Texto de campo, valores de Input, contenido por defecto |
| `{typography.body-md-medium}` | 14px | 500 | Labels de campo, nombres en cards, headers de sección |
| `{typography.body-sm}` | 12px | 400 | Texto de ayuda, subtítulos de card, badges |
| `{typography.caption}` | 12px | 400 | Piso de la escala — contadores, hints, texto de ayuda secundario dentro de tarjetas compactas |
| `{typography.code}` | 12px | 400, monoespaciada | Markup crudo, variables/tokens insertados |

No hay una escala "display" — el texto más grande de todo el sistema es 20px. La jerarquía se
construye con peso y color (texto secundario para lo grande) antes que con tamaño, al revés de un
sitio de marketing.

## Layout

### Spacing
Escala base 4px con 8px como paso más chico legítimo, subiendo un escalón completo respecto a una
densidad más apretada para dejar lugar al aire pedido:

| Token | Valor |
|---|---|
| `{spacing.xxs}` | 4px |
| `{spacing.xs}` | 8px |
| `{spacing.sm}` | 12px |
| `{spacing.md}` | 16px |
| `{spacing.base}` | 24px |
| `{spacing.lg}` | 32px |

**Lo que no cambia con esta escala**: la altura de los controles de captura (32px) y el piso
tipográfico (12px) — el aire se gana en el espacio *alrededor* de los elementos, no agrandando los
elementos mismos.

### Contenedores
Tres tipos de contenedor reutilizables, con sus valores de referencia ya auditados:

- **Columna centrada de formulario**: contenido centrado con padding lateral grande en desktop
  (referencia: `padding: 24px 250px`), que en una pantalla estándar deja el contenido en
  ~580-600px de ancho — suficiente para lectura cómoda sin que el ojo tenga que viajar de borde a
  borde. En viewports angostos, ese padding lateral colapsa a un valor fijo chico (ver
  "Responsive Behavior") en vez de mantenerse proporcional.
- **Canvas de ancho fijo para un artefacto**: cuando la superficie representa un artefacto real
  con un ancho "correcto" propio (un documento, un correo, una tarjeta imprimible), el canvas se
  fija a ese ancho de referencia (ej. 600px, el estándar de un cuerpo de email HTML) en vez de
  estirarse con el viewport — estirar ese tipo de contenido rompe la ilusión de "así se va a ver
  en la práctica".
- **Panel lateral (sidebar)**: ancho porcentual del espacio disponible (referencia: `36%`) con
  `min-width`/`max-width` fijos (referencia: 380px / 560px) — nunca se angosta por debajo del
  mínimo ni crece más allá del máximo sin importar el viewport, para que el contenido del panel
  no quede ilegible ni desproporcionadamente ancho.

## Elevation

No hay un token de sombra "de fábrica" declarado aparte — el sistema usa tres niveles reales,
consistentes entre sí:

| Nivel | Valor | Uso |
|---|---|---|
| Botón en reposo | `0 2px 0 rgba(0,0,0,0.02)` | Sombra por defecto de un `Button` de AntD (no custom — es el token de fábrica) |
| Popover/dropdown | `0 4px 16px rgba(0,0,0,0.12)` | Color picker, popovers de acción |
| Tarjeta flotante | `0 8px 24px rgba(0,0,0,0.12)` | Superficies elevadas por encima del canvas base |

Solo estos tres niveles — el primero es literalmente el default de AntD sin tocar.

## Radio de esquinas

**Escala de 6 niveles**, regla **por tipo de componente, no por tamaño**:

| Radio | Aplica a |
|---|---|
| `{rounded.pill}` (1000px) | Tags, chips, badges, botones/íconos de forma circular |
| `{rounded.chico}` (4px) | Chrome chico y decorativo: toolbars flotantes de acciones, swatches de color, fondos de texto resaltado, ítems de menú/dropdown |
| `{rounded.control}` (8px) | Inputs, Selects, Botones (forma estándar), botones de ícono de forma cuadrada — en cualquier `size` (`small`/`middle`/`large` comparten el mismo radio "default") |
| `{rounded.tarjeta}` (12px) | Tarjetas de contenido con más peso visual que un control pero que no son Card/Modal/Drawer reales |
| `{rounded.tabla}` (16px) | Contenedor de `Table` — un nivel propio entre tarjeta y container |
| `{rounded.container}` (20px) | **Solo** instancias reales de Card/Modal/Drawer — no cualquier `<div>` con estilo de tarjeta |

**Nota de notación**: el pill a veces se escribe literal como `1000` y otras como `100`. Ambos
producen el mismo resultado visual porque cualquier valor ≥ la mitad del alto del elemento da un
pill completo — no es una inconsistencia real, no hace falta unificar la notación.

## Components

### Iconografía
Los íconos funcionales usan la librería **BoxIcons, variante Outlined** (trazo fino, sin relleno)
en toda la interfaz. Se permite un SVG personalizado puntual (para algo que BoxIcons no cubre)
siempre que mantenga la misma estética: trazo redondeado, liviano (sin relleno pesado ni sombras),
minimalista. Nunca un emoji como ícono funcional.

### Botones
Cinco **tipos**, cada uno con variante **Danger** (semántica destructiva, en rojo):

| Tipo | Chrome |
|---|---|
| Primary | fondo `{colors.primary}`, texto blanco — acción primaria persistente de una vista (Guardar, Confirmar, Activar) |
| Secondary | fondo blanco, borde `{colors.border-control}` — acción secundaria (Cancelar, Editar, Ver detalle). Es el tipo que AntD llama "default" internamente; el archivo de diseño lo nombra "Secondary" |
| Dashed | fondo blanco, borde punteado — acción alternativa/de menor énfasis que Secondary |
| Text | sin fondo ni borde — acción de bajo énfasis dentro de una fila o toolbar |
| Link | sin fondo ni borde, texto `{colors.primary}` — se comporta como un hipervínculo, no como un botón con chrome |

Tres **tamaños**, consistentes entre tipos y con los botones de solo-ícono (valores verificados en
el componente Button de Figma, nodo `34701:197`):

| Tamaño | Alto | Radio | Padding (py / px) |
|---|---|---|---|
| Small | 24px | `{rounded.chico}` (4px) | — |
| Medium (default, sin prop `size`) | 32px | `{rounded.control}` (8px) | 7px / 8px |
| Large | 38px | `{rounded.control}` (8px) | — |

**Ojo con el padding**: el valor real (inspector de Figma) es 7px vertical / 8px horizontal, no lo
que da AntD por defecto (`4px 15px`). Se aplica a nivel de módulo con un token `Button:
{ paddingBlock: 7, paddingInline: 8 }` en un `ConfigProvider`, para que todos los botones lo hereden
sin repetirlo. El gap entre ícono y texto dentro del botón es 4px.

Cada combinación tipo×tamaño×danger tiene 4 **estados**: Normal, Hover/Press, Active, Disabled.
- Estado presionado (Primary/Secondary/Dashed): `{component.button-primary-active}` /
  `{component.button-default-active}` / equivalente — `transform: scale(0.97)`,
  `transition: transform 100ms ease`. Es el único micro-movimiento de botones de texto — ver
  "Interaction Principles".

**Botones de solo-ícono** — misma escala de 3 tamaños (24/32/38px), en **dos formas**:
- **`icon-button-square`** — radio `{rounded.control}` (8px). Uso por defecto para acciones de
  ícono dentro de listas, toolbars y filas.
- **`icon-button-circle`** — radio `{rounded.pill}` (circular). Uso para acciones de ícono más
  aisladas/flotantes (ej. un FAB, un ícono de ayuda suelto).
- Ambas formas son la única excepción consciente a la regla de altura mínima de 32px en su
  tamaño Small (24px) — no son la variante `size="small"` de un control de AntD, son un
  componente custom medido directamente del diseño.
- Estado presionado: `{component.icon-button-square-active}` / `{component.icon-button-circle-active}`
  — `scale(0.9)`, un poco más marcado que los botones de texto porque el elemento es chico y el
  movimiento necesita ser perceptible igual.

### Loader
Componente custom para cualquier estado de carga (no el ícono `Spin` default de AntD): un anillo
de puntos en tonos de `{colors.primary}` que gira mediante 12 fotogramas rotacionales (30° cada
uno), ~34×34px. Se usa dentro de botones en estado `loading`, en cargas de página completa, y en
cualquier indicador de carga inline.

### Breadcrumb
Dos patrones aceptados, según la profundidad de la jerarquía de navegación:
- **`breadcrumb-back`** (patrón por defecto): "← [Anterior]" en `{colors.primary}` + un separador
  vertical + el título de la página actual en `{colors.text-primary}` peso 500. Pensado para
  navegación de un solo nivel atrás (volver a la lista/pantalla anterior).
- **`breadcrumb-path`** (alternativa permitida para jerarquías de 3+ niveles reales): breadcrumb
  clásico separado por `/`, cada ancestro clickeable en `{colors.primary}`, el ítem actual (no
  clickeable) en `{colors.text-secondary}`. A partir de 4+ niveles, los intermedios se colapsan
  con `…` para no alargar la fila indefinidamente.
- **Barra contenedora del breadcrumb**: cuando el breadcrumb vive en una barra superior (topbar de
  una vista/wizard), esa barra usa padding `{spacing.md} {spacing.base}` (16px vertical, 24px
  horizontal) y un `border-bottom` de 1px en `{colors.border-subtle}`. No usar padding vertical
  grande (24px+) — la barra debe leerse compacta, no aireada.

### Anchor
Para navegación dentro de contenido de lectura muy extenso (un documento largo, una página de
ayuda con muchas secciones): usar el patrón `Anchor` — lista vertical de enlaces a secciones, con
un indicador de "tinta" + punto en `{colors.primary}` junto al ítem activo, y el resto de los
ítems en `{colors.text-secondary}`. Soporta sub-ítems anidados con mayor indentación (`32px`
contra `16px` del nivel superior). No se usa para navegación general de la app — solo para saltar
entre secciones de una misma página de lectura larga.

### Tabla
Personalización visual de `Table` de AntD, **preservando su funcionalidad nativa de
ordenamiento** (columnas ordenables, ícono de sort, click-to-sort) — solo cambia el chrome:
- Contenedor: borde `1px solid {colors.border-split}`, radio `{rounded.tabla}` (16px).
- Header: fondo `{colors.bg-hover}` (#fafafa), alto de fila 40px, separador de columna
  `rgba(0,0,0,0.06)` (visualmente equivalente a `{colors.border-split}` sobre fondo blanco — no
  es un token nuevo, es el mismo valor expresado distinto).
- Filas de body: alto 50px, separador inferior `{colors.border-split}`.
- Padding de celda (header y body): `8px 16px` (`{spacing.xs} {spacing.md}`).
- Ancho de columna: fijo en px para columnas de contenido corto y acotado (fechas, códigos de
  estado); flexible (`flex: 1 1 0%`) para columnas de contenido largo (texto libre, direcciones).
- Celdas de estado: usan `chip-badge` — tono `info` (fondo `{colors.primary-disabled}`, punto y
  texto `{colors.primary}`) para estados neutros o positivos, tono `danger` para estados
  negativos (error, rebotado, fallido).

### Otros controles

**`text-input`** — blanco, borde `{colors.border-control}`, radio 8px, alto 32px (default). Los
`InputNumber`/`Select`/`DatePicker`/`AutoComplete` comparten exactamente esta especificación.

**`radio-segmented`** — `Radio.Group` renderizado como fila de `Radio.Button` con
`flex:1, textAlign:center`, radio 8px, alto 32px. Se usa para elegir entre 2-3 opciones
excluyentes — nunca un `Select` ni radios apilados para ese caso.

**`chip-badge`** — borde + fondo + texto del mismo tono (nunca solo texto de color, ni `<Tag>`
de AntD sin personalizar), radio pill, padding `1px 10px`, texto 12px. Tonos: neutral, éxito,
warning, ai (violeta), info (azul). Un uso específico de este componente es el **badge de
confianza**: acompaña un dato (nunca lo reemplaza) con un tono verde/ámbar/gris que indica qué
tan confiable es ese valor, sin alterar cómo se muestra el dato mismo.

**`chip-selectable`** — pill con borde, fondo blanco en reposo; distinto de `chip-badge` porque
es interactivo (el usuario lo clickea para incluir/excluir una opción de un conjunto), no solo
informativo. Se usa para elegir entre varias opciones no excluyentes (tipos, categorías, tokens).
- Estado seleccionado: `{component.chip-selectable-selected}` — borde `{colors.primary}`, fondo
  `{colors.primary-disabled}`, más un ícono de check.

**Banner de sugerencia** (`{component.banner-sugerencia}`) — fondo `{colors.primary-disabled}`,
borde `{colors.primary}`, radio 8px. Comunica una propuesta del sistema (ej. una plantilla o
default recomendado) con una acción "Aplicar" + una acción de descarte explícita ("No, gracias")
— nunca bloquea el flujo, y siempre se puede cerrar sin decidir. Es la aplicación visual del
principio "Sugerir → aplicar → override".

**Panel de severidad** — un panel con borde/fondo coloreado según un nivel de severidad
(éxito/warning/danger — mismos tonos semánticos ya definidos), encabezado con ícono + veredicto
corto, y un detalle accionable ("por qué" + qué hacer). Se usa tanto expandido (para un solo
hallazgo importante) como colapsado en forma de resumen tipo semáforo (verde si todo está bien;
ámbar/rojo con un conteo de cuántos ítems necesitan revisión) cuando hay varios hallazgos juntos.

**Tokens editables** — lista de `Tag` cerrables (`closable`) más un input "+ agregar" al final,
con sugerencias opcionales debajo. Se usa para que el usuario mantenga un conjunto abierto de
valores (ej. una lista de excepciones, palabras clave, destinatarios) sin un modal aparte.

**Vista previa comparable** — al elegir entre opciones (una plantilla, una configuración), se
muestra de inmediato qué trae esa opción, y la vista se actualiza en vivo si el usuario cambia de
opción — nunca obliga a confirmar a ciegas para recién ver el resultado.

**`card-compact`** — radio 8px. Tarjetas de selección chicas no-modales (elegir entre unas pocas
opciones representadas como tarjeta, no como lista).
- Estado seleccionado: `{component.card-compact-selected}` — borde `{colors.primary}`, fondo
  `{colors.primary-disabled}` (#E6F7FF).

**Fila/tarjeta compacta expandible** — cabecera resumida (nombre + estado + un toggle o chevron)
que expande a la configuración completa al clickear, en vez de mostrar todo abierto de entrada.
Es la aplicación concreta del principio de "Divulgación progresiva" — el patrón por defecto para
cualquier panel de más de ~4 campos.

**`row-interactive`** — cualquier fila/card clickeable de una lista. Fondo blanco en reposo.
- Estado hover: `{component.row-interactive-hover}` — fondo `{colors.bg-hover}` (#fafafa),
  `transition: background 150ms ease`. Regla para toda fila clickeable del sistema, no una
  excepción puntual.

**`card-modal`** — radio 20px. Únicamente instancias reales de `Card`/`Modal`/`Drawer` de AntD.

**`popover`** — blanco, borde `{colors.border-split}`, radio 8px, sombra
`0 4px 16px rgba(0,0,0,0.12)`. Color picker custom (nunca `<input type="color">` nativo),
popovers de acción — presets + campo + acción, ancla debajo del control que lo abre.

**`card-elevated`** — blanco, radio `{rounded.tarjeta}` (12px), sombra
`0 8px 24px rgba(0,0,0,0.12)`. Superficies elevadas de contenido (ej. una tarjeta que simula un
artefacto real, como un documento o correo).

**Confirmación antes de eliminar** (patrón, no un componente único): `Popconfirm` de AntD con un
ícono circular custom (fondo `{colors.danger-bg}`, ícono `DeleteOutlined` en `{colors.danger}`)
en vez del ícono grande por defecto de AntD. Aplica a eliminar elementos estructurados/anidados
(ej. una condición dentro de un grupo). Acciones de bajo riesgo y fácilmente reversibles
(duplicar, reordenar) no necesitan este patrón — ver "Interaction Principles".
- **Botones de acción de un confirm/diálogo**: siguen el estándar de botón normal —
  `{rounded.control}` (8px, **no** píldora) y altura 32px. En `Popconfirm` hay que forzar
  `size: 'middle'` porque AntD lo pone en `small`/24px por defecto. El confirmar es primario sólido
  (o `danger` si la acción es destructiva) y el cancelar es default outline.

**`toast`** — feedback global de operaciones (guardar, activar, error). **Decisión: componente
100% custom, no `message` ni `notification` de AntD** — ninguno de los dos ofrece nativamente la
combinación exacta pedida (tarjeta compacta + esquina superior derecha + slide-in direccional)
sin pelear contra el comportamiento por defecto de la librería.
- **Visual**: tarjeta blanca, radio 8px, padding `8px 16px`, gap 8px entre ícono y texto, sombra
  `0 2px 8px rgba(0,0,0,0.15)`. Ícono de 16px a color por tipo — éxito `{colors.success}`,
  warning `{colors.warning}`, error `{colors.danger}`, info `{colors.primary}`, loading con
  spinner. Texto `{typography.body-md}` en `{colors.text-primary}`.
- **Comportamiento**: aparece en la esquina superior derecha de la pantalla, entra con slide-in
  desde la derecha + fade (`{motion.toast-enter}`). Múltiples toasts se apilan verticalmente.
  Autodesaparece tras unos segundos (AntD por defecto usa 3s para success/info/warning y 4.5s
  para error; se hereda ese criterio salvo que se pida otra cosa).
- **Arquitectura**: un único componente montado una vez en la raíz de la app, que expone una API
  imperativa simple (ej. `toast.success(mensaje)`, `toast.error(mensaje)`) en vez de reimplementar
  el patrón en cada pantalla.

## Interaction Principles — para "satisfactorio sin fricción"

### Micro-interacciones (press/hover)
Los estados viven como tokens de componente, no como reglas sueltas. Ver cada componente en
"Components" para su variante exacta:
- **Press**: `{component.button-primary-active}`, `{component.button-default-active}`,
  `{component.icon-button-square-active}` / `{component.icon-button-circle-active}` — todos con
  el mismo timing (100ms ease), solo cambia cuánto se achica (0.97 en botones de texto, 0.9 en
  los ícono-botones de 24×24, más marcado porque el elemento es más chico).
- **Hover**: `{component.row-interactive-hover}` para cualquier fila/card clickeable de una
  lista (150ms ease).
- **Selección**: `{component.card-compact-selected}` para tarjetas de elección.
- Dos timings, nada más, en todo el sistema: `{motion.press}` 100ms / `{motion.hover}` 150ms,
  ambos `ease`. No se introduce un tercer timing sin agregarlo acá primero.
- Los controles nativos de AntD (`Radio.Button`, `Switch`, `Select`) mantienen su hover propio —
  no se sobreescribe, ya es consistente con el resto del kit.

### Estados de carga
- Todo botón que dispara una acción usa el prop `loading` nativo de `Button` de AntD (spinner +
  disabled) en vez de solo `disabled`. El spinner visual es el `loader` custom (anillo de puntos),
  no el ícono `Spin` default de AntD — ver "Components".
- **Duración mínima perceptible** (`{motion.loading-min}`, 500ms): cuando una acción resuelve
  instantáneamente (sin backend real detrás, o con una operación local), puede sentirse "rota" —
  no da tiempo a leer el spinner. Se fuerza ese mínimo de estado `loading` antes de resolver,
  incluso si la operación en sí es síncrona.
- Sin skeletons por defecto: solo aplican cuando hay carga de datos asíncrona real.

### Feedback inmediato / deshacer
- **Acciones destructivas o difíciles de deshacer** (eliminar un elemento estructurado/anidado,
  desactivar algo con efectos en cascada) piden confirmación explícita (`Popconfirm`/`Modal`) —
  son las más "caras" de deshacer manualmente.
- **Acciones nuevas o de bajo riesgo** (duplicar, reordenar) no necesitan bloquear con un diálogo
  de confirmación: un toast de éxito con un botón "Deshacer" (`toast.success('...', { undo })`)
  cubre el mismo caso sin fricción, porque revertirlas es trivial.

### Vacíos y primeros usos
Los empty-states de un mismo producto deben compartir **un solo tratamiento visual**, no mezclar
estilos: un ícono BoxIcons Outlined (no una ilustración SVG grande salvo en la pantalla de
bienvenida/primer uso) en `{colors.text-disabled}`, una línea de `{colors.text-secondary}`, y un
CTA opcional. Mezclar una ilustración custom con la ilustración default de AntD (`<Empty>` de
fábrica) rompe la sensación de que es un solo producto — se elige un tratamiento y se aplica en
todos los vacíos de la misma superficie.

## Product & UX Principles — alineados con PlugSuite (Journey Sistémico)

Estos principios vienen del lenguaje de producto compartido entre productos reales de Plugthem
(referencia: PlugSuite, Journey Sistémico) y aplican a cualquier superficie nueva. Los primeros
cinco son principios de producto (rigen toda pantalla); el resto son su traducción a nivel de
interacción.

### Principios de producto
- **Autosuficiencia**: el producto funciona sin mediador. Si una pantalla necesita que alguien la
  explique para que un usuario nuevo la entienda, no está lista.
- **Sin jerga técnica de cara al usuario**: términos internos (estadísticos, de ingeniería, de
  infraestructura) nunca llegan a la interfaz — se traducen a lenguaje de negocio ("fuerza de la
  relación: fuerte/moderada/débil" en vez de un coeficiente crudo). Lo técnico vive en
  documentación interna, no en la UI.
- **El sistema comunica en qué modo está, no bloquea esperando condiciones ideales**: cuando un
  análisis o proceso puede avanzar con datos parciales, lo hace y explica qué le falta para el
  siguiente nivel de certeza — en vez de mostrar una pantalla vacía o de error hasta que las
  condiciones sean perfectas.
- **Las acciones son el destino, no el diagnóstico/reporte**: cualquier análisis, reporte o
  hallazgo que el sistema muestre debe apuntar a una acción concreta que el usuario pueda tomar —
  no ser un fin en sí mismo.
- **Honestidad ante la incertidumbre**: cuando el sistema trabaja con datos incompletos, muestras
  chicas, o inferencias no verificables, se comunica como una pista o candidato a probar — nunca
  como una certeza o una causalidad confirmada.
- **Los datos simulados o de prueba se muestran como si fueran reales**: no se marcan como
  "simulado" ni se distinguen visualmente de un dato real por defecto. Esa distinción solo se
  muestra si el usuario la pide explícitamente (ej. un modo de depuración o un toggle de "ver
  origen del dato").

### Principios de interacción
- **Sugerir → aplicar → override**: el patrón por defecto para cualquier propuesta del sistema
  (default, plantilla, auto-selección) es proponerla ya aplicada, dejar que el usuario la
  confirme o la edite, y que pueda revertirla — nunca imponerla sin vía de escape ni esperar a
  que el usuario arme todo desde cero.
- **No bloquear salvo daño real**: las sugerencias y validaciones no bloqueadoras no frenan el
  avance; el sistema solo bloquea ante una condición con daño real y verificable (ej. una acción
  con una tasa de éxito esperada muy baja) — un aviso sobre una configuración incompleta es un
  banner informativo, no un bloqueo de la acción principal.
- **Divulgación progresiva**: fila/tarjeta compacta que expande a la configuración completa, en
  vez de mostrar todo junto — patrón por default en cualquier panel con más de ~4 campos.
- **Bajar carga cognitiva**: una acción primaria por vista; **a partir de 6 ítems, una lista
  necesita buscador** — no es una decisión ad-hoc por pantalla, es un umbral del sistema.
- **Localizar el problema, en vivo**: los errores de validación se muestran en su ubicación
  exacta (el campo, fila o celda específica, con el motivo) y en el momento en que ocurren —
  idealmente mientras el usuario edita, no solo al enviar — nunca un mensaje genérico arriba de
  todo.
- **Acciones reproducibles**: una vez que el usuario define una transformación, regla o
  configuración repetible, el sistema la guarda y la deja reaplicable — no la trata como un
  ajuste de un solo uso que hay que rehacer manualmente cada vez.
- **El control dice lo que hace**: un botón de acción puede cambiar su propio label/estado tras
  ejecutarse (ej. "Aplicar" → "✓ Aplicado") en vez de depender solo de un toast aparte — mejora
  complementaria al toast, no un reemplazo.
- **Estado siempre visible**: cualquier entidad con más de un estado posible necesita una señal
  visual permanente de cuál es (un badge, un chip), no solo un tooltip o un texto que haya que
  buscar.
- **Configuración mínima, máxima inteligencia**: el sistema infiere y sugiere en vez de exigir
  que el usuario complete todo a mano — si hay un default razonable, se precarga, nunca se
  empieza en blanco por costumbre.

## UX Writing

- **Tuteo**: voz cercana y directa ("prueba", "ajusta", "tu regla"), no la voz formal de "usted".
  Es la voz de producto ya establecida en Plugthem, no una elección de estilo libre por pantalla.
- **Lenguaje de negocio, cero jerga técnica**: usa las palabras que el usuario ya conoce del
  dominio del producto, nunca términos internos de implementación — ver "Sin jerga técnica de
  cara al usuario" en Product Principles.
- **Framing de incertidumbre**: cuando un hallazgo o sugerencia no es una certeza verificada, se
  escribe como pista/candidato a probar ("esto parece indicar...", "prueba esto y ajusta"), nunca
  como una afirmación categórica ni como una orden.
- **Sugerencia, no reja, en el copy**: el texto de cualquier propuesta del sistema deja explícito
  que es opcional y reversible — frases como "solo lo usamos para sugerirte...", "no es
  obligatorio", "puedes cambiarlo después" — nunca redacción que suene a requisito.
- **Errores accionables**: todo mensaje de error comunica tres cosas — qué pasó, cómo se arregla,
  y dónde exactamente ("fila 4: no es un número válido") — nunca un error vago ni una disculpa
  sin información útil.
- **Solo texto accionable, no abrumar**: cada pantalla muestra únicamente lo que el usuario
  necesita para completar la tarea que tiene enfrente. No se llenan las pantallas con párrafos
  explicativos largos ni con información que describe el producto/módulo completo — eso pertenece
  a la documentación, no al flujo. Si un texto no cambia una decisión ni una acción del usuario en
  esa pantalla, se recorta o se saca. Ante la duda, menos copy.
- **Honestidad sin falsa precisión**: nunca se muestran cifras concretas (tiempos, cantidades,
  porcentajes) que el sistema no pueda garantizar de verdad — un número exacto inventado
  ("entre 2 y 7 minutos") comunica una certeza que no existe. Se prefiere una formulación honesta
  y vaga ("poco después", "una vez procesado") antes que una precisión fabricada. La honestidad
  ante la incertidumbre (ver Product Principles) también aplica al copy: es mejor ser impreciso y
  cierto que preciso y falso.
- **El control dice lo que hace**: el label de un botón de acción puede cambiar tras ejecutarse
  (ej. "Aplicar" → "✓ Aplicado") para confirmar el resultado en el lugar donde ocurrió la acción.
- **Guardrail de métricas gamificables**: cuando el usuario elige una métrica u objetivo que el
  sistema va a medir u optimizar, advertir si esa métrica se puede "inflar" artificialmente sin
  lograr el resultado real que se busca (efecto cobra) — no dejar que una métrica mal elegida
  pase sin aviso.
- **Sentence case, nunca Title Case**: los textos de la interfaz (títulos, botones, labels) van en
  minúscula sentence-case. Cada producto mantiene su propio glosario de términos consistente —
  no se introducen sinónimos nuevos para un concepto que el producto ya nombra de una forma.

## Accessibility

- `aria-label` en todo botón solo-ícono (ver `icon-button-square`, 24×24).
- `role="dialog"` + `aria-modal` en overlays — componentes de AntD (Popconfirm/Popover/Modal) lo
  resuelven de fábrica, pero cualquier overlay custom (como el toast) tiene que replicarlo a
  mano, no viene gratis fuera de AntD.
- Foco de teclado visible en todo elemento interactivo — no se debe remover el outline nativo sin
  reemplazarlo por uno propio.
- **Respetar `prefers-reduced-motion`**: las animaciones del sistema (`scale(0.97)` en press,
  slide-in del toast) deben desactivarse o reducirse a un simple cambio de opacidad cuando el
  sistema operativo tiene esa preferencia activada.
- Ninguna señal solo por color — siempre acompañada de texto, ícono o ambos.

## Do's and Don'ts

### Do
- Dejar todo control de captura (`Input`, `InputNumber`, `Select`, `Radio.Group`, `DatePicker`,
  `AutoComplete`, `Button`) en su tamaño por defecto de AntD (32px) — no especificar `size` salvo
  que el componente sea uno de los casos de densidad reconocidos (`Card`, `Switch`, `Steps`,
  `Collapse`).
- Usar íconos de **BoxIcons, variante Outlined** para cualquier ícono funcional. Se permite un
  SVG personalizado puntual solo si mantiene esa misma estética (redondeado, liviano, minimalista)
  — nunca un emoji.
- Renderizar 2-3 opciones excluyentes como `Radio.Group` de `Radio.Button` en fila
  (`flex:1, textAlign:center`) — no un `Select` ni radios apilados.
- Confirmar con `Popconfirm` (ícono circular custom, nunca el default de AntD) antes de eliminar
  un elemento estructurado o anidado.
- Mantener el violeta (`{colors.ai-violet}`) exclusivamente para contenido/indicadores de IA.
- Usar el radio correcto por tipo de componente: pill para chips, 4px para chrome decorativo
  chico, 8px para controles, 12px para tarjetas de contenido, 20px solo para Card/Modal/Drawer
  reales.
- Mantener 12px como el tamaño de texto más chico permitido en toda la interfaz.

### Don't
- No agregar `size="small"` a un control de captura solo para "que se vea más compacto".
- No usar `<input type="color">` nativo — siempre el color picker custom del sistema.
- No introducir un cuarto color de acento fuera de primario/violeta-IA/terciario.
- No usar `<Tag>` de AntD sin criterio — decidir si un chip nuevo sigue el patrón `chip-badge`
  custom o si `Tag` stock aplica por ser semánticamente distinto de un "badge de estado".
- No asumir que un `<div>` con borde "parece tarjeta" hereda el radio de 20px — ese radio es
  exclusivo de instancias reales de Card/Modal/Drawer.
- No introducir gradientes decorativos — el único gradiente del sistema es el de IA.

## Responsive Behavior

### Breakpoints
Hereda la escala estándar de Ant Design:

| Nombre | Ancho | Uso |
|---|---|---|
| `xs` | < 576px | Mobile real — mínimo soportado, ~375px |
| `sm` | ≥ 576px | — |
| `md` | ≥ 768px | Tablet |
| `lg` | ≥ 992px | Umbral típico para herramientas densas que optan por un aviso de ancho mínimo en vez de colapsar su layout |
| `xl` | ≥ 1200px | Desktop estándar |
| `xxl` | ≥ 1600px | — |

### Estrategia por tipo de superficie
- **Pantallas de navegación, lectura y formularios simples** deben ser usables hasta mobile real
  (~375px): layouts de una columna, columnas de campo que en desktop son `1fr 1fr` se apilan por
  debajo de `md`, los paddings laterales grandes de desktop se reducen a un padding fijo chico.
- **Herramientas de construcción densas** (con múltiples zonas simultáneas — canvas, paleta,
  panel de configuración, drag-and-drop) pueden optar por **no** intentar adaptarse: mostrar un
  aviso claro de ancho mínimo por debajo de `lg` (992px) en vez de colapsar un layout de varias
  zonas en un layout roto o inutilizable. Es una decisión de producto válida, no una limitación
  técnica — comprimir esas herramientas a un teléfono las degrada en vez de adaptarlas, siempre
  que el aviso explique la razón y no deje al usuario sin salida.

### Touch Targets
Los botones de acción solo-ícono de **24×24px** (`icon-button-square`) están por debajo del
mínimo de accesibilidad recomendado (44×44px WCAG / 40-48px en la práctica de la mayoría de los
sistemas de diseño de referencia). En desktop con mouse esto no es un problema real; en mobile
con dedo, sí. Cuando una superficie con estos botones debe soportar mobile real, se agranda el
hit-area con padding invisible alrededor del ícono (manteniendo el tamaño visual de 24px) en
viewports `< md`, en vez de agrandar el ícono mismo.

## Iteration Guide — para quien (humano o IA) siga editando este sistema

1. Usá `{token.refs}` de este documento en vez de repetir hex/px sueltos en código nuevo — si el
   valor no tiene un token acá, documentalo primero en vez de inventarlo sobre la marcha.
2. `size="small"` solo aplica a los 4 casos de densidad reconocidos (`Card`, `Switch`, `Steps`,
   `Collapse`) — nunca en un control de captura para "verse más compacto".
3. No documentar hovers custom más allá de los ya definidos — este sistema usa los default de
   AntD salvo la excepción explícita (`row-interactive-hover`).
4. Un valor o patrón se documenta como regla del sistema recién cuando aparece en 2+ superficies
   con el mismo uso. Si es de una sola pantalla, queda como decisión local, no se promueve.
