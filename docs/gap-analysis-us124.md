# Brecha funcional — Respuestas Automáticas (US124) vs. código de este repo

> Documento de trabajo. Compara lo implementado en este repositorio contra la
> especificación vigente de **US124 Respuestas Automáticas V1.0** en Notion
> (estado "En diseño", última edición 2026-07-24) y sus documentos de
> referencia. Objetivo: servir de checklist de discusión antes de seguir
> desarrollando, no un plan de trabajo cerrado.

## Fuentes revisadas

- Código: `src/app/components/respuestas-automaticas/*` (rama actual del repo)
- Brief original del repo: `src/imports/respuestas_automaticas_brief.md` (v1.0)
- Notion — [US124 Respuestas Automáticas V1.0](https://app.notion.com/p/33a93910500780e781e0ed093233d0fd) (spec vigente)
- Notion — [📑 PRD — Estudios](https://app.notion.com/p/35093910500781f9b622c6e8e119760d) (V18.1.0)
- Notion — [📋 Reglas de Negocio — Estudios](https://app.notion.com/p/35093910500781c58b20cb89430bdfec)
- Notion — [🔀 Lógicas de Condiciones](https://app.notion.com/p/35093910500781048e93dedfcc60ce34) (V18.1.0, referencia obligatoria para cualquier builder de condiciones)
- Notion — [🔔 US128 Rediseño del Potenciador de Alertas](https://app.notion.com/p/36f9391050078172b12cda354e8fbaa7) (patrón de referencia citado explícitamente por US124)

---

## 1. Arquitectura de vistas y navegación

| | Repo | Spec vigente |
|---|---|---|
| Vistas | 4: Lista, Wizard, Editor, Log (`index.tsx:88`) | 5: se agrega un **Gestor de plantillas** independiente entre el wizard y el editor |
| Pasos del wizard | 3: Detalles → Condiciones → Mensaje (`WizardView.tsx:58-61`) — **ya alineado** | 3 pasos, mismo orden — coincide |
| Volver desde breadcrumb | `onBack` directo, sin confirmación (`WizardView.tsx:641-646`) | Debe abrir modal con dos opciones excluyentes: "Descartar y salir" / "Guardar como borrador y salir" — no existe opción de solo cerrar |
| Botón "Guardar borrador" | Presente pero sin handler, `onClick={() => {}}` (`WizardView.tsx:654`, `676`) | Debe persistir la regla en su estado actual sin validar ni avanzar de paso |
| Volver desde el editor | El editor siempre vuelve a `vWizard` (`index.tsx:88`) | Si la regla tiene 2+ plantillas, volver debe llevar al **Gestor de plantillas**; con 1 sola, directo al wizard |

**Hallazgo de código (no solo brecha de alcance):** `onOpenEditor` se declara como prop de `WizardView` (`WizardView.tsx:12`, `623`) pero **nunca se invoca dentro del componente**. El paso 3 ("Mensaje") solo renderiza un `StepPlaceholder` estático (`WizardView.tsx:664`, `600-609`) con el texto "Diseña el correo que se enviará al encuestado." — no hay ningún botón que abra `EditorView`. Tal como está, no existe un camino de UI para llegar al editor de correo desde el wizard.

## 2. Paso 1 — Detalles

Bien alineado con la spec: nombre (máx. 70, con contador), selector "¿A qué correo llega el mensaje?", trigger de dos tarjetas, remitente y reply-to con validación de formato (`WizardView.tsx:97-209`).

Brechas menores:
- El selector de destinatario (`VARIABLES` en `data.ts`) es una lista plana. La spec pide 3 secciones agrupadas: variables de contacto (solo `correo_electronico`), variables del estudio tipo texto, y preguntas que capturan correo (abierta con `validacion: 'correo'` o campos tipo correo dentro de Formulario).
- Falta el texto de ayuda exacto sobre qué pasa si el valor no es un correo válido (el repo sí tiene un hint, pero no distingue "vacío" de "no válido" como pide la spec).

## 3. Paso 2 — Condiciones

Este paso es, en su UI, el más cercano a la spec: replica bastante bien la tabla de "🔀 Lógicas de Condiciones" (tipos p1–p11, subtipos Nota/Grupo, sets de operadores por tipo, `WizardView.tsx:227-316`).

**Hallazgo de código crítico:** el estado de los grupos de condición vive en un `useState<CondGroup[]>([])` local dentro de `Step2` (`WizardView.tsx:527`) que **nunca se sincroniza con `rule.condGroups`** — `onChange(rule)` no se llama en ningún punto de `Step2` ni de `CondGroupUI`/`CondRowUI`. En la práctica, cualquier condición configurada se pierde en cuanto el usuario navega a otro paso o guarda la regla. El modelo persistido (`types.ts:63-72`, `AutoResponse.condGroups`) queda huérfano de la UI que debería alimentarlo.

Brechas de alcance frente a la spec vigente:
- No hay **subcondiciones anidadas** (bifurcación OR dentro de un grupo AND) — el ícono `BranchesOutlined` está pintado (`WizardView.tsx:485`, `501`) pero sin `onClick`, es decorativo.
- No hay herencia de sujeto/pregunta/subtipo al agregar una condición dentro de un grupo ya existente (la spec lo pide explícitamente).
- No hay validación en vivo de regex para "No cumple el patrón", ni tope de 50 valores / 255 caracteres en operadores de lista.
- El límite de caracteres global (255) no está aplicado a los inputs de valor.
- No se contempla "Habla de" / "No habla de" contra etiquetas de categorización.

## 4. Paso 3 — Mensaje / Plantillas

**No implementado.** Es un placeholder estático (ver hallazgo de §1). La spec vigente introduce todo un subsistema que no existe en el modelo de datos actual:

- **Plantillas múltiples por regla** con vigencia: Borrador (`startDate: null`), Permanente (`startDate` sin `endDate`), Temporal (ambas fechas). `types.ts` solo modela `blocks: Block[]` directamente sobre la regla — no hay concepto de plantilla como entidad propia, ni de vigencia, ni de "una regla puede tener 0 o más plantillas".
- Resolución de qué plantilla se usa en cada envío según fecha de disparo, encadenamiento de permanentes, y bloqueo de conflictos entre temporales solapadas.
- Chips de estado por plantilla ("Se usa ahora", "De respaldo", "Desde [fecha]", "Sin programar", "Terminó [fecha]", "Reemplazada por").
- El **Gestor de plantillas** completo (3 secciones: En rotación / Historial / Sin programar) no existe como vista.
- Tarjeta "Correo configurado" del paso 3 (Enviar a read-only, remitente, reply-to, CC, CCO, asunto) — el repo ya tiene remitente/reply-to en el paso 1, no en un paso 3 dedicado; faltan CC y CCO por completo.

## 5. Editor de correo — el punto de mayor divergencia conceptual

| | Repo (`EditorView.tsx`) | Spec vigente |
|---|---|---|
| Modelo de layout | Bloques en columna única, sin filas/columnas | Filas con hasta 6 presets de layout (100%, 50/50, 33/33/33, 25/75, 75/25, 25×4), columnas independientes |
| Paleta de componentes | Header de marca, Título, Texto libre, **Bloque IA**, Bloque de respuestas, Divisor, Footer legal (`EditorView.tsx:482` y alrededores) | Columnas, Texto, Imagen, Divisor, Espaciador, Redes Sociales, Respuesta, Botón — **sin Bloque IA** |
| Bloque IA / generación por Anthropic | Implementado en profundidad: objetivo, tono (5 opciones), dato a priorizar, restricciones, `generatedText`, streaming simulado en el canvas (`types.ts:29-38`, `EditorView.tsx:32,76-89,249-309,482`); `TestModal.tsx:17` decide el flujo del modal según si hay bloques `ai`/`responses` | **No aparece en ningún criterio de aceptación de la US124 vigente.** El editor descrito ahí reutiliza explícitamente "el mismo modelo de componentes que el editor de correo para envíos de Estudios" |
| Sidebar | 2 zonas (Paleta / Configuración del bloque seleccionado) | 3 pestañas fijas: Elementos, Configuración, Diseño — con comportamiento de auto-cambio a "Diseño" al seleccionar algo en canvas |
| Modo HTML | Mencionado como "próximamente" en el brief | Especificado a detalle: vista dividida código/preview, precarga desde bloques, modal de confirmación al volver a visual |
| Variables en URL | No contemplado (no hay Imagen/Botón como bloques) | Prefijo `https://` fijo, placeholder para variable sin resolver, recorte automático de prefijo duplicado |

Esto no es una brecha de "falta terminar" — es una **divergencia de diseño**. El brief v1.0 construyó el diferencial del producto alrededor del Bloque IA con streaming real a `api.anthropic.com` (`respuestas_automaticas_brief.md:424-465`). La spec vigente en Notion no lo menciona ni una vez, y en cambio estandariza el editor con el resto de envíos de Estudios (drag & drop de filas/columnas, sin generación por IA). **Antes de invertir más en el Bloque IA o en migrar al modelo de filas/columnas, hay que confirmar con producto cuál de las dos direcciones es la vigente** — ver sección "Pregunta abierta" al final.

## 6. Envío de prueba (`TestModal.tsx`)

Alineado en el patrón 1-paso/2-pasos según si hay bloques `ai`/`responses` (`TestModal.tsx:17`), heredado del brief v1.0. La spec vigente ya no distingue por tipo `ai` (no existe ese bloque) pero sí agrega:
- Detección automática de variables sin resolver en URLs de Imagen/Botón, con input "Valor de ejemplo para [variable]" por cada una — no implementado.
- Modal posterior con el HTML ya resuelto renderizado, después del toast de éxito — el repo solo muestra el toast (`index.tsx:94-96`).

## 7. Historial de ejecuciones (`LogView.tsx`)

| | Repo | Spec vigente |
|---|---|---|
| Estados | 2: Enviado / No enviado (`LogView.tsx:8`, `19`) | 3: Enviado / No enviado / **Error de envío** |
| Datos mock | `MOCK: Execution[]` hardcodeado (`LogView.tsx:10-17`) | — (esperado en un prototipo; solo lo señalo para no confundir con dato real) |
| Tarjetas resumen | No hay | 4 tarjetas: Total, Enviados, No enviados, Errores |
| Detalle expandible | No hay | Panel de detalle al hacer clic: encuestado, correo destino, canal, sucursal, NPS, timestamp completo, motivo |
| Paginación | No hay (lista completa) | 15 por página, "Cargar más" |

## 8. No implementado en absoluto (no hay UI ni modelo para esto)

- **Setup del ambiente**: sub-tab Automatizaciones → sección Respuestas automáticas (toggle, límite de envíos por período, selector de período, canales habilitados con WhatsApp "próxima versión").
- **Correo de sistema 1**: aviso 48h antes de activar una plantilla programada, a creador de plantilla/estudio, Líder técnico y Ejecutivo de cuenta.
- **Correo de sistema 2**: informe mensual consolidado de respuestas automáticas (separado del informe de envíos existente).
- **Edge cases documentados** sin contraparte en código: regla que se suspende si se elimina una pregunta usada como condición; bloqueo de activación si hay huecos de cobertura entre plantillas temporales; aviso a 7 días de que una plantilla permanente sin contenido se quedará sin respaldo.

## 9. Deuda técnica / limpieza

- `ListView.tsx` (139 líneas) no se importa desde ningún otro archivo del proyecto — quedó huérfano tras el reemplazo por `ListPage.tsx`. Candidato a eliminar.
- `types.ts` (`ConditionRule`/`ConditionGroup`) no coincide con el modelo real que usa la UI de condiciones (`CondRow`/`CondGroup` locales en `WizardView.tsx`) — son dos formas de modelar lo mismo, y ninguna se usa de forma consistente end-to-end.

---

## Pregunta abierta que bloquea priorizar el resto: ¿sigue vigente el Bloque IA?

Es la decisión de mayor impacto porque cambia el resto del roadmap de este potenciador:

- **Si el Bloque IA sigue vigente** pero la US124 de Notion quedó desactualizada al no mencionarlo, hay que actualizar la spec y then decidir cómo convive con el modelo de filas/columnas del editor "estándar" de Estudios.
- **Si el Bloque IA fue descartado** a favor de reusar el editor de envíos existente, buena parte de `EditorView.tsx`, `TestModal.tsx` y los tipos `AiBlock`/`Tone` en `types.ts` quedarían obsoletos y el trabajo pendiente se concentra en migrar al modelo de filas/columnas + plantillas múltiples.

## Sugerencia de orden de trabajo (a discutir, no una decisión tomada)

1. Resolver la pregunta del Bloque IA con producto (bloqueante para todo lo demás).
2. Arreglar el bug de sincronización del paso 2 (condiciones que no se guardan) y cablear `onOpenEditor` — son correcciones de código, no de alcance, y dejan el wizard actual usable end-to-end tal como está diseñado hoy.
3. Definir el modelo de datos de plantillas múltiples + vigencia (afecta `types.ts`, `WizardView.tsx`, y crea la necesidad del Gestor de plantillas como vista nueva).
4. Recién ahí abordar el editor de correo (filas/columnas vs. Bloque IA, según lo que salga del punto 1).
5. Historial de ejecuciones (3er estado, tarjetas resumen, detalle expandible, paginación) y Setup — son incrementales sobre lo que ya existe, menor riesgo.
