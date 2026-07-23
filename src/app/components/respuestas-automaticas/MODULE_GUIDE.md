# Guía funcional — Respuestas Automáticas

Documento de referencia funcional para QA y desarrollo. Cubre navegación, reglas, motor de
condiciones, editor de correo, elementos, plantillas/vigencia y validaciones — todo lo que hoy
existe implementado en el módulo. No es una guía de diseño visual (para eso ver `DESIGN.md`, en
esta misma carpeta) — es una guía de **comportamiento**: qué hace cada pantalla, qué reglas rigen
cada flujo, y qué es (y qué no es) un bug.

**Contexto del prototipo — léase antes que nada:** este módulo es un prototipo Figma Make, 100%
client-side. No hay backend real, no hay envío real de correos, no hay persistencia entre
recargas de página (todo vive en memoria de React). Todo lo que "se activa", "se envía" o "se
ejecuta" es una simulación local. Esto es intencional, no una limitación a corregir — ver la
sección 9 para el detalle de qué es simulado y por qué QA no debe reportarlo como bug.

---

## 1. Mapa de navegación

El módulo entero es un único componente (`index.tsx`, `RespuestasAutomaticas`) que mantiene una
sola variable de estado `view: ModuleView` con 5 valores posibles, y renderiza una pantalla
distinta según cuál esté activa. No hay rutas de URL — es navegación 100% en memoria.

```
'list'  ──Nueva regla──────────────▶ 'wizard' (paso 1)
'list'  ──Editar───────────────────▶ 'wizard' (paso 1, con la regla cargada)
'list'  ──Ver ejecuciones──────────▶ 'log'
'wizard' ──Diseñar/editar plantilla▶ 'editor'
'wizard' ──Gestionar plantillas────▶ 'templates'
'templates' ──Editar una plantilla─▶ 'editor'
'editor'/'templates'/'wizard'/'log' ──Volver──▶ (a la vista anterior correspondiente)
```

| Vista (`view`) | Componente | Qué muestra |
|---|---|---|
| `list` | `ListPage` | Lista de todas las reglas creadas (o el empty-state si no hay ninguna) |
| `wizard` | `WizardView` | Los 3 pasos de creación/edición de una regla (Detalles → Condiciones → Mensaje) |
| `editor` | `EditorView` | El editor de correo de **una plantilla puntual** de la regla en curso |
| `templates` | `TemplatesManagerView` | Lista de todas las plantillas de correo de la regla en curso, con su vigencia |
| `log` | `LogView` | Historial de ejecuciones (simulado) de una regla |

**Reglas de retorno (`onBack`) — no todas vuelven al mismo lugar:**
- Desde `editor`: si la regla tiene **2 o más plantillas**, vuelve a `templates` (el gestor); si
  tiene **solo 1**, vuelve directo a `wizard` — se salta el gestor cuando no hace falta elegir
  entre plantillas.
- Desde `templates`: siempre vuelve a `wizard`.
- Desde `log`: siempre vuelve a `list`.
- Desde `wizard` (botón "Respuestas Automáticas" del breadcrumb, o "Descartar y salir" del
  diálogo de confirmación): vuelve a `list`.

**Estado que se pierde al navegar:** el paso del wizard en el que estabas (`wizardStep`) es una
variable separada de `view`, así que **si entrás al editor de correo y volvés, el wizard te
recuerda en qué paso estabas** (no se resetea a "Detalles"). Esto es deliberado — ver 4.3.

---

## 2. Modelo de datos (resumen)

Todo el árbol vive en un solo objeto `AutoResponse` (una "regla"). Los campos relevantes:

```
AutoResponse
├─ id, name, active, published        → identidad + estado de publicación
├─ trigger: 'response' | 'farewell' | null
├─ recipientVariable: string           → a qué correo se envía (variable o pregunta)
├─ sender, replyTo, cc[], bcc[], subject
├─ condGroups: ConditionGroup[]        → el motor de condiciones (sección 4.2/detalle abajo)
├─ templates: EmailTemplate[]          → SIEMPRE al menos 1 (la plantilla permanente inicial)
└─ scheduledAt: string | null          → fecha/hora futura de auto-activación (no de la plantilla)

EmailTemplate                          → una plantilla de correo, con su propia vigencia
├─ id, name
├─ rows: Row[]                         → el contenido visual (ver sección 5.3)
├─ layout: EmailLayoutConfig           → ancho/estilo de contenedor/color de fondo del correo
├─ customHtml: string | null           → si no es null, el modo "Editor HTML" tiene la última palabra
├─ blocksUpdatedAt: string | null      → fecha del último "Guardar diseño"
├─ startDate: string | null            → null = borrador "sin programar"
└─ endDate: string | null              → null = permanente (sin fecha de fin)

Row → Column[] → Component[]           → el árbol del correo (fila > columna > componente)
```

Importante: `AutoResponse.scheduledAt` (activación programada de **la regla completa**) y
`EmailTemplate.startDate/endDate` (vigencia de **una plantilla** dentro de esa regla) son dos
conceptos completamente distintos que no hay que confundir — el primero se configura desde
`ListPage`, el segundo desde `TemplatesManagerView`. Ver secciones 3 y 7.

---

## 3. Lista de reglas (`ListPage`)

Es la pantalla de entrada al módulo. Cada regla se muestra como una `RuleCard` con:

- **Nombre** de la regla.
- **Meta**: "Creado por: Ana Torres" (mock fijo) + si la regla está `published`, además "Últ.
  ejecución: hace N h" (mock determinístico por `id`) y un link "Ver ejecuciones" → `log`.
- **Estado**: si `!published` → pill gris "Borrador". Si `published` → un `Switch` verde
  ACTIVO/INACTIVO:
  - Activar (`false → true`): directo, sin confirmación.
  - Desactivar (`true → false`): pide confirmación (`Popconfirm`) porque deja de enviar correos.
  - **Guard**: activar una regla sin contenido en su plantilla vigente de hoy muestra un
    `message.warning` y no la activa — ver `toggleRule` en `index.tsx`.
- **Acciones**: "Duplicar" (solo si `published`; clona toda la regla con IDs nuevos en cascada —
  filas, columnas, componentes, grupos de condición y subcondiciones — como borrador inactivo,
  nombre `"{original} (copia)"`), "Editar" (→ `wizard`, paso 1), "Eliminar" (con confirmación).

**Empty state**: ilustración + "Configura reglas para enviar correos automáticos a tus
encuestados." + botón "Nueva regla".

**Nota para QA — props sin uso real:** `ListPage` recibe `onSchedule`/`onCancelSchedule` como
props (para una activación programada de la regla vía `scheduledAt`), pero el componente
actualmente **no los usa en ningún control visible** — no hay ningún botón o UI en la lista que
dispare programar una regla completa. Esta lógica de `scheduledAt` sigue viva en `index.tsx`
(hay un timer cada 15s que auto-activa una regla si `scheduledAt` ya pasó), pero hoy no hay
ninguna forma de setearlo desde la UI. No lo reporten como bug de "el botón no aparece" — es una
funcionalidad que quedó a mitad de camino, no una regresión. Lo que **sí** está completamente
funcional es la vigencia por plantilla (sección 7).

---

## 4. El wizard (3 pasos)

Header fijo con breadcrumb ("Respuestas Automáticas" → nombre editable de la regla) + indicador
de 3 pasos clickeables (podés saltar directo a cualquier paso, no es estrictamente lineal).
Footer fijo con "Guardar cambios" (guarda la regla tal cual está y sale, sin pasar por el resto
de los pasos — no valida nada) + "Anterior"/"Siguiente" (o "Guardar y activar" en el paso 3).

El botón "Siguiente"/"Guardar y activar" está **deshabilitado** (`canNext`) hasta que el paso
actual esté completo:

| Paso | Condición para avanzar |
|---|---|
| 1 — Detalles | `name` no vacío y `trigger` elegido |
| 2 — Condiciones | **todas** las condiciones y subcondiciones de **todos** los grupos están completas (`allConditionsComplete`) — un grupo con 0 filas a medio llenar no bloquea; el paso vacío (`condGroups.length === 0`) tampoco bloquea |
| 3 — Mensaje | la plantilla vigente hoy tiene ≥1 componente, `sender` no vacío, `subject` no vacío, y `replyTo` (si tiene algo) es un correo válido |

Salir del wizard (botón del breadcrumb) siempre abre un diálogo con 2 opciones: **"Descartar y
salir"** (vuelve a `list` sin guardar nada) o **"Guardar como borrador y salir"** — nunca hay una
tercera opción de "seguir editando" implícita por cerrar el modal con la X, hay que elegir una.

### 4.1 Paso 1 — Detalles

- **¿A qué correo llega el mensaje?** (`recipientVariable`, requerido): un `Select` agrupado en
  3 secciones —
  1. *Variables de contacto*: `correo_electronico` (fija, siempre presente).
  2. *Variables del estudio*: cualquier variable de tipo `texto` en `VARIABLES_META`.
  3. *Preguntas que obtienen un correo*: cualquier pregunta `respuesta_abierta` con
     `validacion: 'correo'`, o cualquier campo tipo `correo` dentro de una pregunta `formulario`.
  - Texto de ayuda explícito: si el valor real del encuestado está vacío o no es un correo
    válido, ese envío se omite y queda en el historial como **"No enviado"** (no es un error).
- **Disparador** (`trigger`, requerido): 2 tarjetas de radio excluyentes —
  - *"Por cada respuesta nueva"* (`'response'`): se ejecuta con cualquier respuesta, completa o
    parcial.
  - *"Cuando el encuestado llega a una despedida"* (`'farewell'`): se ejecuta solo al terminar el
    estudio.

### 4.2 Paso 2 — Condiciones (el motor completo)

Si no configurás ninguna condición, la regla aplica a **toda** respuesta que cumpla el
disparador — texto explícito en pantalla, no hay que adivinarlo.

**Jerarquía de 3 niveles:**

```
Grupo 1  (conector Y/O respecto al Grupo 2, 3...)
 ├─ Condición 1 (siempre hay al menos 1 por grupo — nunca se puede vaciar del todo)
 ├─ Condición 2, 3... (agregadas con "+", conectadas entre sí por OR implícito dentro del grupo)
 └─ Subcondición A (agregada con el botón de bifurcación — ícono de rama)
     └─ conector Y/O propio, respecto al ítem anterior de la cadena
 └─ Subcondición B...
Grupo 2 ...
```

- **Grupos** (`ConditionGroup`): se agregan con "+ Agregar condición" al final. El primer grupo
  no tiene selector de conector (es la base); desde el 2do en adelante, un toggle Y/O propio
  decide cómo se combina con el grupo anterior. Eliminar un grupo pide confirmación explícita
  (se pierden también sus subcondiciones).
- **Condiciones dentro de un grupo** (`ConditionRule`, en `group.rows`): la primera fila de un
  grupo nuevo hereda **nada** de otros grupos; una fila agregada con "+" dentro de un grupo que
  ya tiene una condición **hereda automáticamente sujeto/pregunta/subtipo/atributo** de la
  primera fila del grupo (solo cambian operador/valor) — pensado para armar rápido "misma
  pregunta, varios valores". Un grupo con solo 1 condición no puede eliminarla (no puede quedar
  vacío); con 2+, cada una tiene su propio botón eliminar con confirmación.
- **Subcondiciones** (`SubCondition`, en `group.subConditions`): se agregan con el botón de
  bifurcación (🔀) del header del grupo. Son condiciones anidadas **un solo nivel** (no tienen su
  propio botón de bifurcación) con su propio conector Y/O respecto al ítem anterior de la
  cadena. Representan el patrón `A Y (B O C)`.

**Cada condición tiene 2 "sujetos" posibles** (`subject`):
- `'response'` — "La respuesta a [una pregunta del estudio]".
- `'variable'` — "La variable [una variable de contacto o especial]".

**Ramas de "La variable"** (`Q_VARIABLE`, `VAR_TYPE`): nombre completo, nombre de preferencia,
correo electrónico, teléfono, identificador, fecha de respuesta, edad (tipos texto/correo/
número/fecha estándar), más 4 variables especiales con reglas propias:
- `canal_respuesta` / `dispositivo` / `plataforma` — **lista cerrada**: solo `Es igual a`/`No es
  igual a` contra un `Select` de valores fijos (ej. canal: Correo/WhatsApp/Enlace
  personalizado/Enlace genérico/QR).
- `alerta_enviada` — **booleano Sí/No**: solo `Es igual a` contra Sí/No.

**Ramas de "La respuesta a"** — 18 tipos de pregunta soportados (`TipoPregunta`), cada uno con su
propio set de operadores y su propio componente de captura de valor:

| Tipo | Sub-selector extra | Operadores clave | Input de valor |
|---|---|---|---|
| NPS / CES / CLI / CSAT | Nota / Grupo | Nota: =/≠ (multi-select + "No aplica"), >, ≥, <, ≤, Está entre, No está vacío. Grupo: =/≠ (multi-select), No está vacío | Select de la escala real de la pregunta |
| Rating | — (siempre "nota") | igual set que Nota arriba | Select de la escala |
| Matriz de escalas | Atributo/fila → luego Nota/Grupo | igual que NPS, mismo patrón, un nivel más | igual que NPS |
| Respuesta abierta | — | Contiene, No contiene, =, ≠, **Habla de / No habla de** (solo si la pregunta es `categorizable`), No está vacío | Input de texto / `HablaDeSelect` (buscador de etiquetas N1>N2>N3) |
| Formulario | Selector de campo real (`campos[]`) | depende del tipo del campo elegido (texto/número/correo/fecha/url) — "No está vacío" siempre disponible sin elegir campo | Input/InputNumber/DatePicker según el campo |
| Opción simple, Dropdown, Sí/No, Selección de imágenes (simple) | Opción / Comentario (solo si alguna opción tiene comentario) → si Comentario, ¿de qué opción? | Opción: =/≠, No está vacío. Comentario: Contiene/=/≠/Habla de/No habla de/No está vacío | Select de opciones (+"Otro"/"Ninguna") |
| Opción múltiple, Selección de imágenes (múltiple) | igual patrón que arriba | Opción: Contiene/=/≠/No está vacío. Comentario: igual que arriba | Select `mode="multiple"` (+"Otro"/"Ninguna"/"Seleccionar todas") |
| Casilla de verificación | — | =, ≠ | `Radio.Group` Aceptó/No aceptó |
| MaxDiff | Más importante / Menos importante | =, ≠, No está vacío | Select de opciones |
| Ranking | — | =, ≠, No está vacío | **Arrastrar y reordenar** (`react-dnd`) — el orden de arriba hacia abajo es el valor |
| Cargar archivo | — | Solo "No está vacío" | (sin input de valor) |

**Operadores con comportamiento especial:**
- **Rango** (`Está entre`, `Tiene longitud entre`): dos inputs "Desde"/"Hasta". Si el primero es
  mayor que el segundo (numérico o fecha, según el contexto), se marca `status="error"` en rojo
  y aparece el texto "El primer valor debe ser menor o igual al segundo." — la condición **no**
  se marca como "lista" mientras el rango sea inválido.
- **Está en la lista / No está en la lista / Pertenece a los dominios / No pertenece a los
  dominios**: `Select mode="tags"` con separadores automáticos por coma o punto y coma — escribís
  "a, b; c" y se parte en 3 chips. Tope de 50 valores, 255 caracteres cada uno.
- **No cumple el patrón** (solo variables de texto): campo de regex con validación de sintaxis en
  vivo — si el patrón no es un regex válido, error inline.
- **Habla de / No habla de**: un único `Select` con buscador (`showSearch`,
  `optionFilterProp="label"`) sobre las 28 etiquetas de `ETIQUETAS_CATEGORIZACION`, mostradas
  como ruta `N1 > N2 > N3`; el buscador filtra por cualquier parte de esa ruta completa, no solo
  por el inicio.

**Indicador "Condición lista"**: aparece (✓ verde) apenas la condición tiene sujeto + pregunta/
variable + operador + valor(es) válidos — es por-condición, no por-grupo ni por-regla.

**Confirmación de borrado**: eliminar una condición, una subcondición, o un grupo completo
siempre pide confirmación explícita (`Popconfirm` con ícono de basurero en círculo rosado) — no
hay borrado directo en ningún nivel de este paso.

### 4.3 Paso 3 — Mensaje

Tarjeta única "Correo configurado" con filas de campo (label fijo a la izquierda, control a la
derecha):

- **Enviar a** (solo lectura visual, pill violeta con `@`): refleja lo elegido en el Paso 1 —
  este paso no permite cambiarlo, solo lo muestra.
- **Remitente** (requerido): Select entre 2 remitentes fijos (`cx@hircasa.com` / `atencion@
  hircasa.com`).
- **Reply to** (opcional): un único correo, con el mismo componente de entrada que CC/CCO pero
  limitado a un solo chip.
- **CC / CCO** (opcionales): múltiples correos como chips removibles, con **sugerencias de
  dominio en vivo** mientras escribís (ej. escribiendo "juan" sugiere "juan@hircasa.com",
  "juan@gmail.com", etc. de una lista de dominios conocidos) y **shake + borde rojo** si
  confirmás (Enter/coma/espacio) algo que no es un correo válido.
- **Asunto** (requerido): input tipo "click para editar" (el ícono de lápiz se oculta mientras
  escribís).
- **Plantilla de correo** (requerido — condiciona `canNext`): si la regla tiene una sola
  plantilla **sin contenido todavía**, un link "Diseñar plantilla de correo" (→ `editor`). En
  cualquier otro caso (ya tiene contenido, o hay 2+ plantillas), muestra cuál plantilla está
  vigente **hoy** (punto verde + nombre) y un link "Gestionar plantillas" (o "N plantillas — ver
  todas →") que va a `templates`.

**Detalle de persistencia de paso**: como `wizardStep` vive en `index.tsx` (no dentro de
`WizardView`), entrar al editor de correo desde este paso y volver **te deja en el mismo Paso 3**
— no hay que renavegar desde el Paso 1 cada vez que vas a ajustar el correo.

---

## 5. El editor de correo (`EditorView`)

Es la pantalla más grande del módulo. Edita **una `EmailTemplate` a la vez** (nunca la regla
completa) sobre un **borrador local** (`draft`, un `useState` inicializado con la plantilla
recibida) — los cambios **no** se aplican a la regla real hasta que se confirma "Guardar diseño".
Cerrar el editor sin guardar (botón "Volver al wizard" o cualquier otra salida) siempre pide
confirmación explícita ("¿Estás seguro de salir? ... Si abandona la edición del estudio, se
perderá el diseño del correo hasta dónde lo ha configurado.") — sin excepción, incluso si no
hiciste ningún cambio.

### 5.1 Header (topbar)

Una sola fila blanca con:
- Izquierda: "← Volver al wizard" + separador + "Últ. actualización: [fecha]" (o "Nunca" si
  jamás se guardó).
- Centro: `Segmented` **Editor visual / Editor HTML** (sección 5.5).
- Derecha: "Enviar prueba" + "Guardar diseño" (primario).

### 5.2 Panel lateral — 3 pestañas fijas

| Pestaña | Qué edita | ¿Depende de la selección? |
|---|---|---|
| **Elementos** | Agregar contenido nuevo — la paleta | No |
| **Configuración** | El **layout global del correo completo**: Ancho del contenido (%), Estilo del contenedor (Con margen / Ancho completo), Color de fondo del lienzo | **No, nunca** — es fijo, se ve igual sin importar qué esté seleccionado en el canvas |
| **Diseño** | La **fila o el componente** seleccionado en el canvas | Sí — sin nada seleccionado muestra "Selecciona una fila o un componente del canvas para editar su diseño." |

Seleccionar cualquier fila o componente en el canvas cambia automáticamente a la pestaña
**Diseño** (no hace falta clickearla a mano).

**Paleta ("Elementos")**, dos secciones:
- *Estructura*: **Columnas** — abre un selector de 6 layouts (`100%`, `50/50`, `33/33/33`,
  `25/75`, `75/25`, `25×4`) que crea una fila nueva con esa cantidad de columnas vacías.
- *Componentes* (7, ver sección 5.4): Texto, Imagen, Divisor, Espaciador, Redes Sociales,
  Respuesta, Botón. Cada uno se puede **clickear** (agrega una fila nueva de 1 columna al final)
  o **arrastrar** directamente al canvas (a una columna vacía existente, o al final).

**Pestaña Diseño**, siempre 1 o 2 secciones colapsables:
- **"Bloque"** (siempre presente, misma estructura para fila o componente): color de fondo,
  alineación de texto (**oculta** para componentes `header`/`divisor`, que no tienen texto
  alineable), borde (color/grosor/estilo sólido·punteado·ninguno), relleno de 4 lados
  independientes, "Ocultar en móvil".
- Una segunda sección **específica**, distinta según qué esté seleccionado:
  - Fila seleccionada → **"Columnas y tamaños"**: re-elegir el layout de columnas de esa fila ya
    creada (misma grilla de 6 presets) — si cambiás la cantidad de columnas, los componentes
    existentes se reubican en la primera columna nueva en vez de perderse.
  - Componente seleccionado → el nombre del tipo (ej. "Imagen", "Redes Sociales") con los campos
    de contenido de ese tipo específico (sección 5.4).

### 5.3 Modelo Fila → Columna → Componente

El correo es un árbol de `Row[]`, cada fila con 1+ `Column[]` (ancho en % que suman ~100), cada
columna con 0+ `Component[]`. Esto permite layouts de varias columnas lado a lado (ej. logo +
texto en la misma fila).

**Reordenar (drag-and-drop real, `react-dnd`):** tanto las filas completas como los componentes
dentro de una misma columna se pueden arrastrar para reordenar — hay una manija de mover en el
overlay de acciones de cada uno (junto con insertar-debajo, duplicar, eliminar). No hay
reordenamiento entre columnas distintas por drag, solo dentro de la misma columna o entre filas
completas.

**Overlay de acciones** (aparece al pasar el mouse/seleccionar una fila o componente): manija de
mover, insertar un elemento nuevo justo debajo, duplicar, eliminar — sin confirmación para
duplicar/insertar (reversibles fácilmente), sin confirmación explícita tampoco para eliminar un
componente individual (a diferencia de las condiciones del wizard, que sí la piden).

### 5.4 Tipos de componente

**7 addable desde la paleta hoy.** Los tipos `header` y `title` siguen existiendo en el modelo de
datos y tienen su propio renderer/campos de contenido (código funcional, no roto), pero **no
tienen entrada en la paleta actual** — no hay forma de agregar uno nuevo desde la UI. Si QA no
encuentra "Encabezado"/"Título" como opciones para agregar, no es un bug: es un tipo legado sin
punto de creación en el flujo vigente.

| Tipo | Campos de contenido propios |
|---|---|
| **Texto** | Contenido (editor de texto inline con toolbar flotante blanco: negrita/cursiva/tamaño/color — variables `{{var}}` insertables, se muestran con fondo celeste en el canvas) |
| **Imagen** | Origen (Subir imagen vs. URL dinámico — Segmented) · Tamaño de la imagen (%) · campo de imagen (drag&drop de archivo .jpg/.jpeg, o Input de URL con `https://` fijo) · Enlace opcional (mismo patrón `https://` fijo) · Texto alternativo (124 car.) |
| **Divisor** | Color · Tamaño (%) · Grosor (px) · Tipo (Sólido/Guiones/Punteado, `IconSegmented`) |
| **Espaciador** | Tamaño (alto en px, 4-200) |
| **Redes Sociales** | Tipo de ícono (Negro/Blanco/Color) · Tamaño · Espacio entre íconos · Estilo del borde (Cuadrado/Redondeado/Círculo) · por cada una de 6 redes (Facebook/Instagram/Linkedin/Youtube/X/Pinterest): casilla incluir + URL (con `https://` fijo, 2048 car.) |
| **Respuesta** | Qué preguntas incluir (picker con buscador) · Mostrar enunciado (on/off) · Estilo de visualización (negrita-con-sangría / lista / tabla) · tipografía y color de pregunta/respuesta · ancho y radio del contenedor · para tabla: color/grosor de borde · incluir preguntas sin respuesta (con ejemplo "Sin respuesta") |
| **Botón** | Texto del botón · URL de destino (con `https://` fijo, 2048 car., variables insertables) · Color de fondo · Color de texto |

**Variables (`{{variable}}`) insertables** vía un modal buscable ("+ Variable") en: contenido de
Texto, URL de Imagen (modo dinámico) y Enlace de Imagen, URL de Botón. Redes Sociales **no**
ofrece variables en sus URLs (son enlaces fijos de perfil, no por-encuestado).

### 5.5 Modo Editor HTML

WYSIWYG real: split view, código a la izquierda (editor `CodeMirror` con resaltado de sintaxis y
numeración de línea) + **vista previa en vivo** a la derecha, que se actualiza en cada tecla. Al
entrar por primera vez, el código se precarga con el HTML generado desde los bloques actuales.
Volver a "Editor visual" mientras hay cambios manuales en el HTML pide confirmación ("Descartar y
volver" / "Seguir en HTML") — es un modo de **última palabra**, no se sincroniza de vuelta al
modelo de filas/columnas: si confirmás el descarte, se pierde el HTML manual y el editor visual
vuelve a ser la fuente de verdad.

### 5.6 Validaciones antes de Guardar diseño / Enviar prueba

Ambas acciones comparten exactamente la misma validación (`validateContentOrWarn`), en este
orden:

1. **Correo vacío** (`countComponents(draft.rows) === 0`): modal "Acción no permitida — Debes
   agregar contenido al correo antes de guardarlo/enviar una prueba." — bloquea por completo.
2. **Enlaces mal formados** (`collectContentIssues`): modal "Revisa los enlaces del correo" con
   la lista puntual de qué falta corregir. Hoy solo puede haber un tipo real de problema
   reportado aquí — ver el punto siguiente — porque el resto de las reglas de URL son
   estructuralmente imposibles de violar (sección 5.7).
3. Si ambas pasan: para Guardar, un `Modal.confirm` adicional ("¿Guardar esta plantilla?"); para
   Enviar prueba, se abre directo el modal de "Enviar prueba" (sección 6).

**Único caso hoy detectado por `collectContentIssues`:** una Imagen en modo "URL dinámico" cuyo
valor **no** termina en `.jpg`, `.jpeg` o `.png` (ignorando query string/hash) — salvo que ese
campo contenga una variable sin resolver (`{{var}}`), en cuyo caso no se puede validar todavía y
se deja pasar. También se valida que cualquier red social marcada como incluida tenga su URL
completada (no vacía).

### 5.7 URLs con "https://" fijo — Imagen, Botón, Redes Sociales

Los 3 campos de URL (Imagen → Origen dinámico / Enlace, Botón → URL, cada red de Redes Sociales)
muestran `https://` como un prefijo **fijo, no editable** (`addonBefore` de AntD) — el usuario
solo escribe el resto de la URL. Consecuencias:

- **Estructuralmente no se puede omitir el esquema** — no hace falta validar "empieza con
  https://", ya no puede fallar.
- Si el usuario pega la URL completa (con `https://` incluido), se recorta automáticamente al
  escribir — nunca queda duplicado, no aparece ningún error pidiendo corregirlo.
- La URL real (`https://` + lo escrito) se reconstruye recién en los 3 lugares donde de verdad se
  usa: el thumbnail de vista previa junto al campo, el render del canvas, y el HTML
  exportado/enviado.

### 5.8 Imágenes con variable en la URL — placeholder

Si el Origen de una Imagen es "URL dinámico" y el valor contiene una variable sin resolver
(`{{sucursal}}`, etc.), **no se intenta cargar ese string como imagen real** (siempre fallaría) —
se muestra un placeholder gris con el texto "Imagen dinámica — se resuelve al enviar", a una
altura de ejemplo fija (200px, el ancho ya lo define el campo "Tamaño de la imagen"). Esto
aplica tanto en el canvas del editor visual como en la vista previa del modo Editor HTML. Si la
URL es una URL real (sin variable) pero no carga (rota, 404, host inválido), se muestra un
placeholder equivalente con el texto "No se pudo cargar la imagen" — mismo tratamiento visual,
distinto motivo.

---

## 6. Enviar prueba (`TestModal`) — resolución real de variables

Modal simple: correo destino (validado con regex básica) + botón "Enviar prueba". **No hay
backend real** — el "envío" es un `setTimeout` de ~900ms que resuelve localmente y muestra un
toast de éxito.

**Valores de ejemplo para variables usadas en URLs**: si la plantilla usa alguna variable dentro
de los 3 campos de URL con variables habilitadas (Imagen→Origen/Enlace, Botón→URL), el modal
detecta automáticamente cuáles son y muestra un input opcional por cada una ("Valor de ejemplo
para [nombre de la variable]"). **Esto no es solo un preview cosmético del modal**: si completás
un valor, se usa de verdad para resolver el `{{variable}}` en el HTML del correo que "llega" —
las variables sin un valor completado quedan como placeholder (sección 5.8) en el resultado.

Después de "Enviar prueba", además del toast, se abre un modal con el **HTML ya resuelto**
renderizado (mismo look que la vista previa del modo Editor HTML) — es lo más parecido a "así
llegaría el correo real" que este prototipo puede ofrecer sin backend.

---

## 7. Gestor de plantillas y vigencia (`TemplatesManagerView` + `templateResolution.ts`)

Cada regla tiene **1 o más** `EmailTemplate`, cada una con `startDate`/`endDate` opcionales — el
modelo "plantilla con vigencia":

| Combinación | Significado |
|---|---|
| `startDate: null` | **Borrador** — "Sin programar", nunca se envía a nadie |
| `startDate` con valor, `endDate: null` | **Permanente** (candidata a respaldo estable) |
| `startDate` y `endDate` con valor | **Temporal** — ventana de una sola vez, sin recurrencia |

**Reglas de resolución** (qué plantilla se envía un día dado, `templateForDate`):
1. Si hay una **temporal** cuya ventana `[startDate, endDate]` cubre la fecha, **esa gana** —
   siempre, sin excepción.
2. Si no, rige la **permanente de inicio más reciente** entre las ya comenzadas (las permanentes
   se encadenan por fecha de inicio: cada una rige hasta que empieza la siguiente).

**Qué es un conflicto real al programar** (`findConflict`, usado tanto en el gestor como en el
selector de fecha del wizard):
- Una permanente **nunca** puede chocar con nada — ni con otra permanente (se ceden el paso por
  construcción, encadenadas por fecha de inicio) ni con una temporal (la temporal la eclipsa
  durante su ventana, y la permanente retoma sola el control apenas termina — **no** es un
  choque, es el comportamiento esperado).
- El **único** choque genuino es entre **dos temporales cuyas ventanas se superponen** — ahí sí
  es ambiguo cuál debería regir esos días, y el sistema lo bloquea con un mensaje explícito
  ("Se cruza con '[nombre]' (rango de fechas)").

**Estados visibles por plantilla** (`templateState`, chip de color en cada fila):
- `draft` (gris) — sin `startDate`.
- `scheduled` (azul) — `startDate` en el futuro.
- `now` (verde) — es la que se usaría **hoy**, incluyendo el caso sutil de una permanente que
  hoy está meramente **eclipsada** por una temporal en curso (esa permanente sigue reportando
  `now`, no `ended`, porque mañana sin esa temporal volvería a regir sola).
- `ended` (gris) — una temporal cuya ventana ya pasó, o una permanente **genuinamente
  reemplazada** por otra permanente de inicio más reciente (no solo eclipsada temporalmente).

**Acciones por fila** (dependen del estado):
- `now`/`scheduled`: Editar (→ `editor`); Eliminar (con confirmación) — **bloqueado** si es la
  única plantilla permanente restante (`isOnlyPermanent`, siempre debe quedar un respaldo).
- `ended`: "Reprogramar" (mismo popover de fecha), "Hacer principal" (la activa ahora mismo, sin
  fecha de fin, reemplazando a la vigente actual — sin chequeo de conflicto porque por
  construcción una permanente nueva nunca puede chocar), Eliminar.
- `draft`: Editar, "Programar" (popover: fecha de inicio + checkbox "¿Tiene fecha de fin?" +
  fecha de fin opcional; el botón "Guardar" del popover se deshabilita en vivo si hay conflicto),
  Eliminar.

"+ Nueva plantilla" agrega una plantilla en blanco (borrador, sin programar) y abre directo el
editor para diseñarla.

---

## 8. Historial de ejecuciones (`LogView`)

**100% simulado, determinístico por regla** (semilla = hash del `id` de la regla, PRNG
`mulberry32`) — las mismas 20-90 "ejecuciones" aparecen siempre para la misma regla, no se
rebarajan al reabrir. Una regla que nunca se activó ni publicó no tiene ejecuciones.

Cada ejecución simulada tiene un estado:
- **Enviado** (verde) — mayoría de los casos.
- **No enviado** (ámbar) — el encuestado no tenía valor en la fuente de correo configurada; es
  una **omisión esperada**, no un error del sistema (hay un `Alert` explícito aclarando esto).
- **Error de envío** (rojo) — falla técnica simulada (SMTP, timeout, formato inválido).

Filtros por estado + tarjetas de conteo (Total/Enviados/No enviados/Errores) + paginación "Cargar
más" (15 por página) + fila expandible con el detalle completo (encuestado, correo, canal,
sucursal, NPS, fecha, motivo si aplica).

---

## 9. Qué es simulado/mock — para no confundir con bugs

- **No hay backend real en ningún punto del módulo.** Crear, activar, programar, "enviar
  prueba", y el historial de ejecuciones son enteramente client-side.
- **El historial de ejecuciones (`LogView`) es data 100% inventada** (determinística, no
  aleatoria en cada render, pero sin relación con encuestados reales).
- **"Enviar prueba" no manda un correo de verdad** — resuelve el HTML localmente y lo muestra en
  un modal, simulando "así llegaría".
- **La activación programada de una regla completa (`scheduledAt`) no tiene UI hoy** — la lógica
  existe (timer de 15s en `index.tsx`) pero no hay ningún control en `ListPage` para setearla.
  Distinto de la vigencia de plantillas (sección 7), que sí está 100% funcional en la UI.
- **Nombres/correos fijos**: "Ana Torres" como autor de toda regla, remitentes limitados a 2
  correos fijos — no hay gestión de usuarios/remitentes real.
- **Sin persistencia**: recargar la página borra todo el estado (reglas, plantillas, todo). Esto
  es esperado en este prototipo, no un bug de "se perdió mi trabajo".

---

## 10. Glosario rápido

- **Regla** (`AutoResponse`) — la unidad completa: a quién, cuándo, bajo qué condiciones, y con
  qué plantilla(s) de correo se envía.
- **Plantilla** (`EmailTemplate`) — un diseño de correo concreto, con su propia vigencia
  (permanente/temporal/borrador). Una regla puede tener varias plantillas (ej. una estándar +
  una de temporada).
- **Grupo de condiciones** — un conjunto de condiciones conectadas por OR implícito dentro del
  grupo, y por Y/O explícito respecto a otros grupos.
- **Subcondición** — una condición anidada un nivel dentro de un grupo, para expresar
  `A Y (B O C)`.
- **Fila / Columna / Componente** — la jerarquía visual del correo dentro del editor.
- **Borrador (draft) local del editor** — la copia de trabajo de una plantilla mientras la
  estás editando; no toca la regla real hasta "Guardar diseño".
- **Vigencia** — el sistema de `startDate`/`endDate` que decide qué plantilla se usa cada día.
