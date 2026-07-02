# Respuestas Automáticas — Design Brief para construcción con IA

> Potenciador del módulo Estudios · Plugthem  
> Versión: 1.0 · Autor: Miquely Calvopiña  
> Propósito: documento de referencia para construir el módulo con una herramienta de vibe coding

---

## Qué construir

Un potenciador dentro del editor de estudios de Estudios (plugthem.voc.cx). Vive en la pestaña **Potenciadores**, al mismo nivel que Alertas, Tickets y Categorización. Permite configurar reglas que envían un correo automático al encuestado cuando llega una respuesta que cumple ciertas condiciones. El correo se diseña en un editor de bloques. Puede incluir texto fijo, variables del encuestado, un bloque que muestra sus respuestas, y uno o más bloques generados por IA con el contexto real de cada respuesta.

---

## Sistema visual

**Tipografía:** Inter. Pesos: 400 regular, 500 medio, 600 semibold, 700 bold. Mono: JetBrains Mono para variables, IDs y código.

**Paleta:**
- Neutros: `#0F172A` tinta · `#334155` secundario · `#64748B` terciario · `#94A3B8` hint · `#E2E8F0` borde · `#F1F5F9` superficie · `#F8FAFC` fondo · `#FFFFFF` blanco
- Sistema (acciones): índigo `#4338CA` primario, `#4F46E5` hover, `#EEF2FF` claro, `#C7D2FE` medio
- IA — reservado exclusivamente para todo lo que toca IA, nada más usa este tono: violeta `#7C3AED` primario, `#8B5CF6` secundario, `#F5F3FF` fondo, `#DDD6FE` medio, `#4C1D95` oscuro
- Éxito: `#059669` · `#ECFDF5` fondo · `#A7F3D0` medio
- Advertencia: `#D97706` · `#FFFBEB` fondo · `#FDE68A` medio
- Error: `#DC2626` · `#FEF2F2` fondo · `#FECACA` medio

**Radios:** `4px` mínimo · `6px` estándar · `8px` tarjetas · `12px` paneles · `16px` modales

**Sombras:**
- `s1`: `0 1px 2px rgba(15,23,42,.05)` — elementos base
- `s2`: `0 1px 3px rgba(15,23,42,.1), 0 1px 2px rgba(15,23,42,.06)` — hover
- `s4`: `0 4px 6px rgba(15,23,42,.07), 0 2px 4px rgba(15,23,42,.05)` — paneles
- `s8`: `0 8px 16px rgba(15,23,42,.08), 0 3px 6px rgba(15,23,42,.05)` — sidebars
- `s16`: `0 16px 32px rgba(15,23,42,.1), 0 6px 12px rgba(15,23,42,.06)` — modales

**Anti-aliasing:** `-webkit-font-smoothing: antialiased`

---

## Contexto del Setup (datos del cliente, read-only)

Estos datos vienen del Setup del cliente y la IA los usa como contexto base. No los configura el analista en cada regla.

```js
const SETUP = {
  empresa: 'HIR Casa',
  industria: 'Financiamiento Inmobiliario',
  tamano: 'Grande (+500 empleados)',
  descripcion: 'HIR Casa acompaña a las familias en el proceso de adquirir su vivienda propia en México.',
}
```

**Variables disponibles del estudio** (se inyectan con sintaxis `{{nombre_variable}}`):
`nombre_preferido`, `correo_electronico`, `sucursal`, `canal`, `telefono`, `identificador`, `numero_credito`

**Preguntas del estudio** (para el bloque de respuestas y el mini-formulario de simulación):
```js
const PREGUNTAS = [
  { id: 'q1', texto: '¿Qué tan probable es que recomiendes HIR Casa a alguien?', tipo: 'NPS', escala: [0,10] },
  { id: 'q2', texto: '¿Cuál fue el motivo principal de tu calificación?', tipo: 'texto_abierto' },
  { id: 'q3', texto: '¿Cómo calificarías la atención recibida?', tipo: 'CSAT', escala: [1,5] },
  { id: 'q4', texto: '¿En qué sucursal fuiste atendido?', tipo: 'seleccion_simple', opciones: ['Quito Norte','Quito Sur','Guayaquil','Cuenca'] },
]
```

---

## Estructura de vistas

El módulo tiene 4 vistas. Solo una está visible a la vez.

```
vLista        → lista de respuestas automáticas configuradas
vWizard       → wizard de 2 pasos para crear / editar
vEditor       → editor de correo visual
vLog          → historial de ejecuciones de una regla
```

---

## Vista 1 — Lista

**Header:** título "Respuestas automáticas" + subtítulo con conteo + botón "Nueva respuesta automática".

**Estado vacío:** ícono ✉ + título + descripción + botón CTA.

**Cards:** una por cada regla configurada. Cada card tiene:
- Avatar circular: `✦` con fondo violeta si tiene bloque IA, `✉` con fondo índigo si no
- Nombre de la regla (bold)
- Subtítulo: remitente · número de bloques
- Chips: trigger · condiciones · `✦ Bloque IA` si aplica · estado activo/inactivo
- Footer de la card: enlace "Ver ejecuciones →" + botón "Editar" + botón eliminar (solo ícono de basura)
- Toggle activo/inactivo en el header de la card

**Modelo de datos de una respuesta automática:**
```js
{
  id: timestamp,
  name: '',
  trigger: null,          // 'response' | 'farewell'
  active: true,
  published: false,
  condGroups: [{ rules: [] }],
  sender: '',
  replyTo: '',
  subject: '',
  blocks: [],             // array de bloques del editor
}
```

---

## Vista 2 — Wizard (2 pasos)

**Topbar del wizard:**
- Botón "← Respuestas automáticas" para volver a la lista
- Título de la regla actual
- Indicador de pasos: dos nodos con línea conectora. El nodo activo tiene ring de foco. El nodo completado es sólido.
- Botón "← Anterior" (oculto en paso 1)
- Botón "Siguiente →" que en paso 2 dice "Guardar y activar"

**Validaciones para avanzar del paso 1:**
- Nombre no puede estar vacío
- Trigger debe estar seleccionado

### Paso 1 — Condiciones y envío

Contiene 4 cards apiladas:

**Card 1 — Nombre:**
- Input de texto, requerido
- Placeholder: "Ej: Respuesta empática a detractores NPS"
- Hint: "Solo lo verás tú. Usa un nombre que describa claramente el propósito."

**Card 2 — Trigger:**
- Título: "¿Cuándo se ejecuta?"
- Subtítulo: el trigger determina en qué momento del ciclo de vida de la respuesta se dispara el job
- Dos opciones en grid de 2 columnas. Cada opción es una card clickeable con borde que se resalta al seleccionar:
  - "Por cada respuesta nueva" — ícono 📋 — descripción: "Se ejecuta cuando llega cualquier respuesta, completa o parcial."
  - "Al llegar a una despedida" — ícono 🏁 — descripción: "Solo cuando el encuestado termina el estudio y llega a la pantalla final."
- Banner informativo: "El envío se realiza vía jobs en background, entre 2 y 7 minutos después del evento según la configuración del ambiente."

**Card 3 — Condiciones:**
- Título: "¿A quién se envía?"
- Subtítulo: sin condiciones se envía a todas las respuestas
- Builder de condiciones:
  - Grupos conectados entre sí con **AND**
  - Dentro de cada grupo, condiciones conectadas con **OR**
  - Cada condición: 3 selectores en línea — campo (`NPS`, `CSAT`, `Canal`, `Sucursal`, `Comentario`) + operador (`grupo es`, `nota es`, `no está vacía`, `contiene`) + valor (`Detractor`, `Neutro`, `Promotor`, `No aplica`)
  - Botón de eliminar condición (ícono ×) a la derecha de cada fila
  - Botón "Agregar condición OR" con borde punteado índigo dentro de cada grupo
  - Botón "Agregar grupo Y" con borde punteado gris debajo de todos los grupos
  - Botón de eliminar grupo en el header del grupo (solo si hay más de 1 grupo)
- Banner: "Incluye No aplica para contemplar encuestados que presionaron ese botón."

**Card 4 — Envío:**
- Título: "Configuración de envío"
- Dos campos en fila:
  - Select "Remitente" con opciones del ambiente
  - Input "Reply-to" opcional con hint: "Si el encuestado responde, el correo llega aquí."

### Paso 2 — Diseñar correo

**Card 1 — Resumen:**
- Muestra en lista: asunto · bloques configurados · remitente · reply-to si existe · trigger
- El asunto y la lista de bloques usan `font-family: mono`
- Si hay bloque IA: texto "✦ Bloque IA" en violeta. Si no está configurado: texto adicional "— pendiente de configurar" en ámbar
- Botón "Abrir editor de correo" que abre la vista vEditor

**Card 2 — Confirmación:** fondo verde claro con check grande. Describe lo que pasará al activar. Solo visible cuando el correo tiene al menos un bloque configurado.

**Al hacer clic en "Guardar y activar":** guarda en la lista, activa, regresa a vLista, muestra toast "Respuesta automática activada ✓".

---

## Vista 3 — Editor de correo

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Topbar del editor                                           │
├────────────────────────────┬────────────────────────────────┤
│                            │ ZONA A — Paleta de bloques     │
│  Canvas del correo         │ (siempre visible, no colapsa)  │
│  (scrolleable)             ├────────────────────────────────┤
│                            │ ZONA B — Configuración         │
│                            │ del bloque seleccionado        │
│                            │ (aparece al clicar en canvas)  │
└────────────────────────────┴────────────────────────────────┘
```

### Topbar del editor

De izquierda a derecha:
- Botón "← Volver al wizard" — regresa a vWizard sin perder cambios
- Separador `/`
- Nombre de la regla (read-only, solo muestra)
- Toggle "Editor visual / HTML" (el HTML puede decir "próximamente" por ahora)
- Espacio flexible
- Botón "Enviar prueba" — color teal/verde — abre el modal de prueba
- Botón "Guardar diseño" — primario índigo — guarda y regresa a vWizard paso 2

### Barra de asunto

Encima del frame del correo. Contiene:
- Label "ASUNTO" en uppercase pequeño
- Texto del asunto actual
- Botón "Editar" que convierte el texto en input editable inline. Enter o perder el foco guarda.
- El asunto soporta `{{variables}}` que se renderizan con fondo azul claro en el canvas.

### Canvas

- Fondo gris claro que hace contraste con el frame blanco del correo
- Frame del correo: 580px de ancho, fondo blanco, border-radius 12px, sombra pronunciada
- Al hacer hover sobre un bloque: borde azul punteado
- Al hacer clic en un bloque: borde azul sólido + ring de foco + la Zona B del sidebar muestra su configuración
- Cada bloque tiene una toolbar flotante (visible en hover y en selección): botones ↑ ↓ ✕
- Zona de "Agregar bloque" al fondo del frame: texto con ícono +, al hacer clic hace scroll al sidebar y resalta la Zona A

### Sidebar — Zona A: Paleta de bloques

Siempre visible. Ocupa la mitad superior del sidebar. Dividida en 3 secciones:

**Estructura:**
- Header de marca — ícono 🎨 — "Logo y color corporativo"
- Título — ícono T bold — "Texto grande destacado"
- Texto libre — ícono ¶ — "Con variables del encuestado"

**Contenido dinámico:**
- ✦ Bloque IA — fondo y borde violeta — "Texto único por encuestado"
- Bloque de respuestas — ícono 📋 — "Las respuestas del encuestado"

**Otros:**
- Divisor — ícono — — "Línea separadora"
- Footer legal — ícono 📎 — "Texto legal + baja"

Al hacer clic en cualquier ítem de la paleta: el bloque se agrega al final del canvas con animación de aparición (`opacity 0→1`, `translateY 5px→0`, 200ms), el canvas hace scroll hasta el nuevo bloque, y la Zona B muestra inmediatamente su configuración.

### Sidebar — Zona B: Configuración del bloque seleccionado

Aparece debajo de la Zona A cuando hay un bloque seleccionado. Cuando no hay selección muestra: "Selecciona un bloque del canvas para configurarlo aquí."

Cada tipo de bloque tiene su propia configuración. Todos los bloques comparten al final una sección colapsable **"Diseño"** con:
- Padding superior e inferior (número en px)
- Alineación del texto (izquierda / centro / derecha)
- Color de fondo del bloque (selector de colores o transparente)

#### Header de marca
- Input "Nombre o logo": texto que aparece hasta que haya subida de imagen (próximamente)
- Color de fondo: fila de swatches de colores preconfigurados (azul índigo, violeta, verde, rojo, negro, ámbar, teal). El seleccionado tiene ring doble.

#### Título
- Input "Texto del título" — actualiza el canvas en tiempo real

#### Texto libre
- Textarea "Contenido" — actualiza el canvas en tiempo real. Soporta saltos de línea.
- Sección "Insertar variable": chips con las variables disponibles del estudio en fuente mono. Al hacer clic en una chip, la variable se inserta en la posición del cursor del textarea.
- Hint: "Se reemplaza con el dato real del encuestado al enviarse."

#### ✦ Bloque IA

Esta sección es la más importante del editor. Guía al analista de forma conversacional.

**Banner:** fondo violeta claro. Texto: "Usa como contexto: [nombre empresa] · [industria]"

**Campo "¿Qué debe lograr este bloque?"** (requerido):
- Textarea
- Placeholder largo y específico: "Ej: Que el cliente sienta que su queja fue escuchada y que alguien va a actuar. Que no sienta que respondió en vano."
- Hint: "La IA genera texto único para cada encuestado usando su respuesta real y este objetivo como guía principal."
- Si está vacío, el bloque en el canvas muestra estado "sin configurar"
- Si tiene contenido, el bloque muestra texto de muestra según el tono

**Campo "Tono del mensaje":**
- Grid 2×3 de tarjetas clickeables. La seleccionada tiene borde violeta + fondo violeta claro.
- Opciones: Empático ("Para detractores · comprensión") · Formal ("Corporativo · B2B") · Cálido ("Para promotores · positivo") · Directo ("Sin rodeos · eficiente") · Otro… ("Describe el tono")
- Si elige "Otro…": aparece un input libre debajo del grid

**Campo "Dato específico que la IA debe mencionar"** (opcional):
- Input
- Placeholder: "Ej: Si hay número de ticket, incluirlo como referencia"

**Campo "Nunca debe mencionar":**
- Chip input: el analista escribe una restricción y presiona Enter. Aparece como chip rojo elimiable (×).
- Defaults pre-cargados: "No prometer tiempos de resolución" · "No mencionar compensaciones económicas"
- Hint: "La IA respeta estas restricciones en todos los correos de este bloque."

#### Bloque de respuestas

Permite seleccionar qué preguntas del estudio incluir.

**Banner informativo:** "Cada encuestado verá sus propias respuestas exactas. El contenido es dinámico y único por persona."

**Lista de preguntas del estudio:** cada pregunta como fila con checkbox + texto de la pregunta + tipo (NPS, texto, CSAT, etc.). Por defecto todas están seleccionadas.

**Opciones adicionales por pregunta** (visible al expandir cada fila):
- Toggle "Mostrar enunciado de la pregunta" (default: activado)
- Toggle "Mostrar solo la respuesta" (default: desactivado)

**Orden:** las preguntas se pueden reordenar arrastrando (drag handle en el lado izquierdo de cada fila).

**Diseño del bloque:**
- Select "Estilo de visualización": "Pregunta en negrita + respuesta con sangría" (default) | "Solo respuestas en lista" | "Tabla pregunta / respuesta"

#### Divisor
- Sin configuración de contenido. Solo la sección "Diseño" colapsable.

#### Footer legal
- Textarea "Texto del footer"
- Hint: "Debe incluir el aviso de desuscripción. Requerido para correos comerciales."

---

## Renderizado de bloques en el canvas

### Header de marca
Rectángulo con color de fondo configurable (default: índigo). Texto del nombre en blanco, grande, bold.

### Título
Texto grande (21px, bold) con letter-spacing negativo.

### Texto libre
Texto 13.5px, line-height 1.75. Las variables `{{nombre}}` se renderizan como chips con fondo azul claro y texto índigo, fuente mono.

### ✦ Bloque IA

**Sin configurar:**
- Fondo violeta muy claro. Borde violeta 1.5px.
- Header con badge "✦ IA" (pill violeta sólido, texto blanco) + texto "Sin configurar — selecciona para configurar"
- Cuerpo: ícono ✦ grande + título "Bloque IA sin objetivo" + descripción "Define el objetivo en el panel de configuración para que la IA genere el texto."

**Con objetivo configurado:**
- Fondo violeta muy claro. Borde violeta 1.5px.
- Header con badge "✦ IA" + label "Tono: [tono] · Generado" o "Tono: [tono] · Pendiente"
- Cuerpo: texto en cursiva, color violeta oscuro. Si ya se generó con la API, muestra el texto real. Si no, muestra: "Usa 'Enviar prueba' para ver el texto real."

**Durante generación con streaming:**
- El texto aparece carácter a carácter en el cuerpo del bloque mientras llega de la API
- Cursor parpadeante al final del texto mientras escribe (barra vertical 2px violeta, animación blink 0.75s)
- El header cambia a "✦ IA · Generando…" con tres puntos animados

### Bloque de respuestas
Fondo gris muy claro. Borde 1px. Border-radius 8px. Padding 14-16px.
Header: label "TUS RESPUESTAS" en uppercase pequeño, gris.
Cada pregunta seleccionada:
- Pregunta en negrita, 13px, tinta oscura
- Respuesta debajo con sangría izquierda de 11px y borde izquierdo de 2.5px gris claro
- Espaciado de 10px entre preguntas

Las respuestas del canvas son siempre datos simulados para propósito de diseño.

### Divisor
Línea horizontal de 1px, color borde estándar, márgenes horizontales de 26px.

### Footer legal
Fondo gris muy claro. Texto centrado, 11.5px, gris claro. Padding 13px.

---

## Modal: Enviar prueba

Se abre desde el botón "Enviar prueba" del topbar del editor. Es un modal centrado con backdrop oscuro semitransparente.

### Determinar si el correo usa IA o Respuestas

Antes de mostrar el modal, el sistema revisa si `blocks` contiene algún bloque de tipo `ai` o `responses`.

- Si **no tiene** ninguno de los dos: modal de **1 paso**
- Si **tiene** al menos uno: modal de **2 pasos**

### Modal de 1 paso (sin IA ni Respuestas)

**Título:** "Enviar correo de prueba"

**Contenido:**
- Campo "Correo destino" — requerido — placeholder "tu@correo.com"
- Hint: "Recibirás el correo tal como lo verá el encuestado."

**Footer:** botón "Cancelar" + botón "Enviar prueba" (primario)

### Modal de 2 pasos (con IA o Respuestas)

**Header del modal:** indicador de progreso de dos pasos (puntos o pills, el activo resaltado en índigo)

**Paso 1 — Correo destino:**
- Campo "Correo destino" — requerido
- Botón "Siguiente →"

**Paso 2 — Datos para simular:**

Título: "¿Qué respuesta simulamos?"

Subtítulo: "Los bloques ✦ IA y 📋 Respuestas necesitan datos para generar el correo de prueba."

Dos opciones presentadas como cards clickeables en columna:

**Opción A — ID de respuesta real:**
- Card con radio button
- Título: "Usar una respuesta existente"
- Descripción: "Ingresa el ID de una respuesta guardada en este estudio. El correo de prueba usará sus datos reales."
- Si se selecciona: aparece un campo input con placeholder "ID de respuesta (ej: 4821)" y hint: "El ID lo encuentras en el módulo de Descarga de Resultados."
- Banner de advertencia: "Si la respuesta no cumple las condiciones de esta regla, el resultado puede no tener sentido contextual."

**Opción B — Respuesta sintética:**
- Card con radio button
- Título: "Responder el formulario aquí"
- Descripción: "Completa las preguntas del estudio tú mismo para ver cómo quedaría el correo."
- Si se selecciona: aparece el mini-formulario con las preguntas del estudio:
  - Preguntas tipo NPS: slider o input numérico con rango visible
  - Preguntas tipo texto abierto: textarea
  - Preguntas tipo CSAT: selector de estrellas o radio buttons
  - Preguntas tipo selección simple: radio buttons con las opciones

**Footer del paso 2:** botón "← Anterior" + botón "Enviar prueba" (primario, deshabilitado hasta que se complete la opción elegida)

### Qué pasa al enviar la prueba

1. Si se eligió ID real: el sistema llama a la API para obtener los datos de esa respuesta, genera el correo con el bloque IA usando la API de Anthropic (con streaming si es posible), y envía el correo renderizado al correo ingresado en paso 1.
2. Si se eligió respuesta sintética: usa los datos del mini-formulario, genera el bloque IA con la API de Anthropic, y envía el correo al correo ingresado.
3. Toast al cerrar el modal: "Correo de prueba enviado a [email] ✓"

---

## API de IA (Anthropic)

El bloque IA llama a `https://api.anthropic.com/v1/messages` con streaming.

**Modelo:** `claude-sonnet-4-20250514`
**Max tokens:** 300
**Stream:** true

**Prompt base:**

```
Eres el asistente de comunicación de [SETUP.empresa], empresa de [SETUP.industria].
[SETUP.descripcion]

Genera UN SOLO párrafo para un correo automático enviado a un encuestado que cumple: [condiciones de la regla].

Objetivo: [b.objetivo]
Tono: [descripción del tono seleccionado].
[Si b.datoPriorizar existe]: Priorizar este dato si está disponible: [b.datoPriorizar].
[Si b.restricciones.length > 0]: Nunca mencionar: [b.restricciones.join(', ')].

Reglas:
- Solo el párrafo, sin saludo ni firma
- Máximo 3 oraciones concisas
- En español, segunda persona (tú)
- Sonido genuino y humano, no plantilla genérica
- No iniciar con el nombre de la empresa
```

**Manejo de streaming en el canvas:** los tokens llegan uno a uno y se escriben en el cuerpo del bloque IA en tiempo real. Al finalizar, el texto completo se guarda en `block.generatedText`.

**Tonos y sus descripciones para el prompt:**
```js
const TONOS = {
  empatico: 'empático y cercano, mostrando comprensión genuina sin ser condescendiente',
  formal: 'formal y profesional, corporativo y preciso',
  calido: 'cálido y celebratorio, entusiasta y positivo',
  directo: 'directo y claro, sin rodeos ni adornos',
  custom: '[el texto libre que escribió el analista]',
}
```

---

## Vista 4 — Historial de ejecuciones

Accesible desde el enlace "Ver ejecuciones →" en cada card de la lista.

**Header:** título con el nombre de la regla + subtítulo con conteo total y timestamp de última ejecución + botón "← Volver"

**Filtros:** botones de filtro simple: "Todos" · "Enviados" · "No enviados" — con conteo entre paréntesis.

**Lista de ejecuciones:** cada fila contiene:
- ID de la respuesta en fuente mono (bold)
- Badge de estado: "Enviado" (fondo verde claro, texto verde) o "No enviado" (fondo rojo claro, texto rojo)
- Línea secundaria: timestamp relativo · detalle (email enviado o motivo del no envío)

**Motivos comunes de no enviado:**
- `correo_electronico vacío en la respuesta` — el encuestado no tenía email registrado en las variables del estudio

**Banner informativo al fondo:** explica que los "no enviados" por variable vacía son comportamiento esperado, no un error del sistema.

---

## Disparo técnico (restricción importante)

El correo **no se envía en tiempo real**. El sistema usa jobs encadenados en background. El timing típico:
- Trigger "por respuesta nueva": ~7 minutos desde que inicia la respuesta
- Trigger "por despedida": ~2 minutos desde que el encuestado llega a la despedida

El analista no puede configurar el delay — lo controla el sistema. El banner informativo en el selector de trigger explica esto.

---

## Estados de una respuesta automática

Siguiendo el patrón de Alertas (US128):

- **Borrador:** creada pero sin completar. Se muestra con badge ámbar en la card.
- **Activa:** configurada y toggle encendido. Envía correos.
- **Inactiva:** configurada y toggle apagado. No envía correos pero mantiene la configuración.

---

## Reglas de negocio críticas

- Si `correo_electronico` no está mapeado como variable en el estudio, mostrar banner de advertencia antes de que el analista pueda activar la regla.
- Si se elimina una pregunta del estudio que está en uso como condición de una regla activa, la regla pasa a estado de advertencia y se suspende.
- El campo `correo_electronico` del encuestado debe estar presente en la respuesta para que el correo se envíe. Si está vacío, se omite y se registra en el historial como "No enviado".
- Pueden existir múltiples bloques IA en el mismo correo, cada uno con configuración independiente.

---

## Flujo completo resumido

```
Lista
  → "Nueva" → Wizard paso 1 (nombre + trigger + condiciones + envío)
             → "Siguiente" → Wizard paso 2 (resumen del correo)
                           → "Abrir editor" → Editor
                                            → [diseñar bloques]
                                            → "Enviar prueba" → Modal de prueba → correo llega al email
                                            → "Guardar diseño" → regresa a Wizard paso 2
                           → "Guardar y activar" → Lista (regla activa)

Lista → card → "Editar" → Wizard paso 1
Lista → card → "Ver ejecuciones" → Historial
Lista → card → toggle → activa / desactiva sin salir de la lista
Lista → card → botón eliminar → modal de confirmación → elimina
```

---

## Prototipo de referencia

El prototipo funcional en HTML está en `respuestas_automaticas_v2.html`. Tiene el flujo completo implementado incluyendo la integración real con la API de Anthropic con streaming. Úsalo como referencia de interacción y comportamiento, no como referencia de código de producción.
