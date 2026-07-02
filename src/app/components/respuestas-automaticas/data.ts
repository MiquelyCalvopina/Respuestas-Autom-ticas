import { Pregunta, Etiqueta, AiBlock } from './types';

export const SETUP = {
  empresa: 'HIR Casa',
  industria: 'Financiamiento Inmobiliario',
  tamano: 'Grande (+500 empleados)',
  descripcion: 'HIR Casa acompaña a las familias en el proceso de adquirir su vivienda propia en México.',
};

export const VARIABLES = [
  'nombre_preferido', 'correo_electronico', 'sucursal',
  'canal', 'telefono', 'identificador', 'numero_credito',
];

export const PREGUNTAS = [
  { id: 'q1', texto: '¿Qué tan probable es que recomiendes HIR Casa a alguien?', tipo: 'NPS', escala: [0, 10] as [number, number] },
  { id: 'q2', texto: '¿Cuál fue el motivo principal de tu calificación?', tipo: 'texto_abierto' },
  { id: 'q3', texto: '¿Cómo calificarías la atención recibida?', tipo: 'CSAT', escala: [1, 5] as [number, number] },
  { id: 'q4', texto: '¿En qué sucursal fuiste atendido?', tipo: 'seleccion_simple', opciones: ['Quito Norte', 'Quito Sur', 'Guayaquil', 'Cuenca'] },
];

export const TONOS: Record<string, string> = {
  empatico: 'empático y cercano, mostrando comprensión genuina sin ser condescendiente',
  formal: 'formal y profesional, corporativo y preciso',
  calido: 'cálido y celebratorio, entusiasta y positivo',
  directo: 'directo y claro, sin rodeos ni adornos',
  custom: '',
};

export const TONO_LABELS: Record<string, { label: string; sub: string }> = {
  empatico: { label: 'Empático', sub: 'Para detractores · comprensión' },
  formal:   { label: 'Formal',   sub: 'Corporativo · B2B' },
  calido:   { label: 'Cálido',   sub: 'Para promotores · positivo' },
  directo:  { label: 'Directo',  sub: 'Sin rodeos · eficiente' },
  custom:   { label: 'Otro…',    sub: 'Describe el tono' },
};

export const SENDERS = ['noreply@hircasa.com', 'contacto@hircasa.com', 'encuestas@hircasa.com'];

export const CONDITION_FIELDS = ['NPS', 'CSAT', 'Canal', 'Sucursal', 'Comentario'];
export const CONDITION_OPERATORS = ['grupo es', 'nota es', 'no está vacía', 'contiene'];
export const CONDITION_VALUES = ['Detractor', 'Neutro', 'Promotor', 'No aplica'];

export const HEADER_COLORS = ['#4338CA', '#7C3AED', '#059669', '#DC2626', '#0F172A', '#D97706', '#0D9488'];

export const DEFAULT_RESTRICTIONS = ['No prometer tiempos de resolución', 'No mencionar compensaciones económicas'];

const fmtVal = (v: string | string[]): string => Array.isArray(v) ? v.join(' o ') : v;

export const buildAiPrompt = (
  block: { objetivo: string; tone: string; customTone: string; datoPriorizar: string; restricciones: string[] },
  condGroups: { rows: { variable: string; operator: string; value: string | string[] }[] }[],
): string => {
  const condText = condGroups.flatMap(g => g.rows).map(r => `${r.variable} ${r.operator} ${fmtVal(r.value)}`).join(', ') || 'ninguna';
  const tono = block.tone === 'custom' ? block.customTone : TONOS[block.tone] || '';
  let prompt = `Eres el asistente de comunicación de ${SETUP.empresa}, empresa de ${SETUP.industria}.\n${SETUP.descripcion}\n\nGenera UN SOLO párrafo para un correo automático enviado a un encuestado que cumple: ${condText}.\n\nObjetivo: ${block.objetivo}\nTono: ${tono}.`;
  if (block.datoPriorizar) prompt += `\nPriorizar este dato si está disponible: ${block.datoPriorizar}.`;
  if (block.restricciones.length > 0) prompt += `\nNunca mencionar: ${block.restricciones.join(', ')}.`;
  prompt += `\n\nReglas:\n- Solo el párrafo, sin saludo ni firma\n- Máximo 3 oraciones concisas\n- En español, segunda persona (tú)\n- Sonido genuino y humano, no plantilla genérica\n- No iniciar con el nombre de la empresa`;
  return prompt;
};

const TONE_OPENERS: Record<string, string> = {
  empatico: 'Entendemos cómo te sentiste y queremos acompañarte en esto.',
  formal: 'Le escribimos para darle seguimiento a su experiencia reciente con nosotros.',
  calido: '¡Qué gusto saber de ti! Gracias por compartir tu experiencia.',
  directo: 'Vamos directo al punto sobre tu experiencia reciente.',
  custom: 'Gracias por compartir tu experiencia con nosotros.',
};

// Generador simulado en el cliente — NO llama a ninguna API real. Es un prototipo Figma Make
// sin backend, así que "Enviar prueba" solo necesita mostrar un texto plausible y determinístico.
export function mockGenerateAiText(block: AiBlock, responseSummary: string): string {
  const tono = block.tone === 'custom' ? (block.customTone.trim() || 'cercano') : (TONOS[block.tone] || '');
  const opener = TONE_OPENERS[block.tone] || TONE_OPENERS.custom;
  const objetivo = block.objetivo.trim() || 'darte seguimiento personalizado';
  let text = `${opener} Basado en tu respuesta (${responseSummary}), nuestro equipo se enfoca en ${objetivo.toLowerCase()}.`;
  if (block.datoPriorizar.trim()) {
    text += ` Queremos destacar especialmente: ${block.datoPriorizar.trim()}.`;
  }
  text += ` Seguimos comprometidos en brindarte una experiencia ${tono || 'cercana y profesional'}.`;
  return text;
}

export const SIMULATED_RESPONSES: Record<string, string | number> = {
  q1: 4,
  q2: 'El proceso de trámite fue más largo de lo esperado y no recibí suficiente comunicación durante el proceso.',
  q3: 3,
  q4: 'Quito Norte',
};

// ─── PREGUNTAS_EJEMPLO — dataset real para el builder de condiciones (Step2) ──

export const PREGUNTAS_EJEMPLO: Pregunta[] = [

  // ── NPS ──────────────────────────────────────────────────────────────────
  {
    id: 'nps_01',
    texto: '¿Qué tan probable es que recomiendes HIR Casa a un familiar o amigo que esté buscando adquirir su vivienda?',
    tipo: 'NPS',
    escala: [0, 10],
    grupos: ['Promotor', 'Neutro', 'Detractor'],
  },
  {
    id: 'nps_02',
    texto: 'Después de haber formalizado tu crédito, ¿qué tan probable es que recomiendes a tu asesor HIR Casa con otras personas?',
    tipo: 'NPS',
    escala: [0, 10],
    grupos: ['Promotor', 'Neutro', 'Detractor'],
  },

  // ── CSAT ─────────────────────────────────────────────────────────────────
  {
    id: 'csat_01',
    texto: '¿Qué tan satisfecho quedaste con la atención que recibiste durante el proceso de solicitud de tu crédito hipotecario?',
    tipo: 'CSAT',
    escala: [1, 5],
    grupos: ['Muy satisfecho', 'Satisfecho', 'Neutral', 'Insatisfecho', 'Muy insatisfecho'],
  },
  {
    id: 'csat_02',
    texto: '¿Cómo calificarías tu satisfacción con la claridad de la información que te proporcionó HIR Casa sobre tu crédito?',
    tipo: 'CSAT',
    escala: [1, 5],
    grupos: ['Muy satisfecho', 'Satisfecho', 'Neutral', 'Insatisfecho', 'Muy insatisfecho'],
  },

  // ── CES ──────────────────────────────────────────────────────────────────
  {
    id: 'ces_01',
    texto: '¿Qué tan fácil fue completar el proceso de solicitud de tu crédito con HIR Casa?',
    tipo: 'CES',
    escala: [1, 7],
    grupos: ['Muy fácil', 'Fácil', 'Algo fácil', 'Neutral', 'Algo difícil', 'Difícil', 'Muy difícil'],
  },
  {
    id: 'ces_02',
    texto: '¿Cuánto esfuerzo te requirió reunir y entregar la documentación solicitada por HIR Casa?',
    tipo: 'CES',
    escala: [1, 7],
    grupos: ['Muy fácil', 'Fácil', 'Algo fácil', 'Neutral', 'Algo difícil', 'Difícil', 'Muy difícil'],
  },

  // ── CLI ──────────────────────────────────────────────────────────────────
  {
    id: 'cli_01',
    texto: '¿Qué tan seguro estás de que seguirás siendo cliente de HIR Casa si en el futuro necesitas un segundo crédito o refinanciamiento?',
    tipo: 'CLI',
    escala: [0, 10],
    grupos: ['Leal', 'Indiferente', 'En riesgo'],
  },
  {
    id: 'cli_02',
    texto: 'Si un conocido tuyo estuviera evaluando opciones de crédito hipotecario, ¿qué tan probable es que hablaras bien de HIR Casa sin que te lo preguntaran?',
    tipo: 'CLI',
    escala: [0, 10],
    grupos: ['Leal', 'Indiferente', 'En riesgo'],
  },

  // ── MATRIZ DE ESCALAS ─────────────────────────────────────────────────────
  {
    id: 'matriz_01',
    texto: 'Califica cada aspecto de tu experiencia durante el proceso de trámite de crédito hipotecario con HIR Casa.',
    tipo: 'matriz_escalas',
    escala: [1, 5],
    grupos: ['Excelente', 'Bueno', 'Regular', 'Malo', 'Muy malo'],
    atributos: [
      'Atención y disposición de tu asesor',
      'Claridad en los requisitos y documentación',
      'Tiempo de respuesta del área de crédito',
      'Transparencia en tasas y comisiones',
      'Facilidad del proceso de firma',
    ],
  },
  {
    id: 'matriz_02',
    texto: 'Evalúa los siguientes canales de atención que utilizaste durante tu proceso con HIR Casa.',
    tipo: 'matriz_escalas',
    escala: [1, 5],
    grupos: ['Excelente', 'Bueno', 'Regular', 'Malo', 'Muy malo'],
    atributos: [
      'Atención en sucursal',
      'Atención por WhatsApp',
      'Atención telefónica',
      'Portal en línea o aplicación móvil',
    ],
  },

  // ── RESPUESTA ABIERTA ─────────────────────────────────────────────────────
  {
    id: 'ra_01',
    texto: '¿Cuál fue el aspecto del proceso que más trabajo te costó o que cambiarías si pudieras?',
    tipo: 'respuesta_abierta',
    categorizable: true,
  },
  {
    id: 'ra_02',
    texto: '¿Hay algo que tu asesor haya hecho especialmente bien durante el proceso? Cuéntanos con detalle.',
    tipo: 'respuesta_abierta',
    categorizable: true,
  },
  {
    id: 'ra_03',
    texto: '¿Tienes algún comentario adicional para el equipo de HIR Casa?',
    tipo: 'respuesta_abierta',
    categorizable: false,
  },

  // ── FORMULARIO ────────────────────────────────────────────────────────────
  {
    id: 'form_01',
    texto: 'Para darte seguimiento personalizado, compártenos los siguientes datos.',
    tipo: 'formulario',
    campos: [
      { nombre: 'Nombre completo', tipo: 'texto' },
      { nombre: 'Correo electrónico de contacto', tipo: 'correo' },
      { nombre: 'Número de crédito', tipo: 'numero' },
      { nombre: 'Fecha de firma del contrato', tipo: 'fecha' },
      { nombre: 'URL del expediente digital (si aplica)', tipo: 'url' },
    ],
  },
  {
    id: 'form_02',
    texto: 'Ingresa los datos de tu propiedad para registrarla en nuestro sistema.',
    tipo: 'formulario',
    campos: [
      { nombre: 'Dirección del inmueble', tipo: 'texto' },
      { nombre: 'Valor del inmueble en pesos (MXN)', tipo: 'numero' },
      { nombre: 'Correo del notario asignado', tipo: 'correo' },
      { nombre: 'Fecha de escrituración', tipo: 'fecha' },
      { nombre: 'Sitio del portal inmobiliario donde viste el inmueble', tipo: 'url' },
    ],
  },

  // ── OPCIÓN SIMPLE ─────────────────────────────────────────────────────────
  // Sin comentario por opción
  {
    id: 'os_01',
    texto: '¿Ya recibiste el monto de tu crédito en tu cuenta bancaria?',
    tipo: 'opcion_simple',
    opciones: [
      'Sí, ya lo recibí',
      'No, aún está pendiente',
      'Me informaron que hay un retraso',
    ],
  },
  // Con comentario por opción en algunas opciones y categorizable
  {
    id: 'os_02',
    texto: '¿Cómo calificarías en general la atención que recibiste de tu asesor?',
    tipo: 'opcion_simple',
    opciones: [
      { texto: 'Excelente', tieneComentario: true },
      { texto: 'Buena', tieneComentario: true },
      { texto: 'Regular', tieneComentario: true },
      { texto: 'Mala', tieneComentario: true },
      { texto: 'No tuve contacto con un asesor', tieneComentario: false },
    ],
    comentarioCategorizable: true,
  },

  // ── DROPDOWN ─────────────────────────────────────────────────────────────
  {
    id: 'dd_01',
    texto: '¿En qué sucursal HIR Casa iniciaste tu trámite?',
    tipo: 'dropdown',
    opciones: [
      'CDMX — Insurgentes',
      'CDMX — Satélite',
      'CDMX — Santa Fe',
      'Monterrey — San Pedro',
      'Guadalajara — Zapopan',
      'Puebla — Angelópolis',
      'Querétaro — Juriquilla',
      'Tijuana — Zona Río',
      'Otra sucursal',
    ],
  },
  {
    id: 'dd_02',
    texto: '¿Qué canal utilizaste principalmente para comunicarte con tu asesor durante el proceso?',
    tipo: 'dropdown',
    opciones: [
      { texto: 'WhatsApp', tieneComentario: false },
      { texto: 'Llamada telefónica', tieneComentario: false },
      { texto: 'Correo electrónico', tieneComentario: false },
      { texto: 'Visita a sucursal', tieneComentario: false },
      { texto: 'Videollamada', tieneComentario: false },
      { texto: 'Otro', tieneComentario: true },
    ],
    comentarioCategorizable: false,
  },

  // ── SÍ / NO ───────────────────────────────────────────────────────────────
  {
    id: 'sino_01',
    texto: '¿Tu asesor te explicó claramente todos los costos asociados al crédito antes de que firmaras?',
    tipo: 'si_no',
    opciones: ['Sí', 'No'],
  },
  {
    id: 'sino_02',
    texto: '¿Utilizaste la aplicación móvil o el portal en línea de HIR Casa durante tu proceso?',
    tipo: 'si_no',
    opciones: [
      { texto: 'Sí', tieneComentario: true },
      { texto: 'No', tieneComentario: true },
    ],
    comentarioCategorizable: true,
  },

  // ── SELECCIÓN DE IMÁGENES — SIMPLE ────────────────────────────────────────
  {
    id: 'img_s_01',
    texto: '¿Cuál de estas imágenes representa mejor cómo te sentiste al terminar el proceso con HIR Casa?',
    tipo: 'seleccion_imagenes_simple',
    opciones: [
      'Emocionado y satisfecho',
      'Tranquilo y conforme',
      'Indiferente',
      'Algo frustrado',
      'Muy frustrado',
    ],
  },
  {
    id: 'img_s_02',
    texto: 'Selecciona el tipo de vivienda que adquiriste con tu crédito HIR Casa.',
    tipo: 'seleccion_imagenes_simple',
    opciones: [
      'Casa en fraccionamiento',
      'Departamento en edificio',
      'Casa independiente',
      'Casa en condominio horizontal',
    ],
  },

  // ── OPCIÓN MÚLTIPLE ───────────────────────────────────────────────────────
  // Sin comentario por opción
  {
    id: 'om_01',
    texto: '¿Cuáles de los siguientes aspectos del proceso te generaron alguna dificultad? Selecciona todos los que apliquen.',
    tipo: 'opcion_multiple',
    opciones: [
      'Reunir la documentación requerida',
      'Entender los requisitos de elegibilidad',
      'Tiempo de espera para la aprobación',
      'Comunicación con el asesor',
      'Comprensión de las condiciones del crédito',
      'Proceso de firma y escrituración',
      'Ninguno, todo estuvo bien',
    ],
  },
  // Con comentario por opción en selecciones relevantes y categorizable
  {
    id: 'om_02',
    texto: '¿Qué aspectos del servicio de HIR Casa destacarías positivamente? Selecciona los que apliquen.',
    tipo: 'opcion_multiple',
    opciones: [
      { texto: 'Velocidad de aprobación', tieneComentario: true },
      { texto: 'Trato del asesor', tieneComentario: true },
      { texto: 'Claridad en la información', tieneComentario: true },
      { texto: 'Facilidad del proceso', tieneComentario: true },
      { texto: 'Tasa competitiva', tieneComentario: false },
      { texto: 'Flexibilidad en requisitos', tieneComentario: false },
      { texto: 'Ninguno en particular', tieneComentario: false },
    ],
    comentarioCategorizable: true,
  },

  // ── SELECCIÓN DE IMÁGENES — MÚLTIPLE ─────────────────────────────────────
  {
    id: 'img_m_01',
    texto: '¿Qué canales digitales de HIR Casa utilizaste durante tu trámite? Selecciona todos los que apliquen.',
    tipo: 'seleccion_imagenes_multiple',
    opciones: [
      'App móvil HIR Casa',
      'Portal web',
      'WhatsApp Business',
      'Correo electrónico',
      'Ninguno',
    ],
  },
  {
    id: 'img_m_02',
    texto: '¿Qué documentos tuviste que entregar durante el proceso? Selecciona los que apliquen.',
    tipo: 'seleccion_imagenes_multiple',
    opciones: [
      'Identificación oficial',
      'Comprobante de ingresos',
      'Comprobante de domicilio',
      'Acta de matrimonio',
      'Estados de cuenta bancarios',
      'Avalúo del inmueble',
    ],
  },

  // ── CASILLA DE VERIFICACIÓN ───────────────────────────────────────────────
  {
    id: 'cv_01',
    texto: 'Autorizo a HIR Casa a contactarme por correo y WhatsApp para enviarme información sobre mi crédito y servicios relacionados.',
    tipo: 'casilla_verificacion',
  },
  {
    id: 'cv_02',
    texto: 'Confirmo que mis respuestas serán utilizadas de forma anónima y confidencial para mejorar los servicios de HIR Casa.',
    tipo: 'casilla_verificacion',
  },

  // ── MAXDIFF ───────────────────────────────────────────────────────────────
  {
    id: 'md_01',
    texto: 'De los siguientes atributos del servicio HIR Casa, selecciona el que consideras MÁS importante y el que consideras MENOS importante para ti.',
    tipo: 'maxdiff',
    opciones: [
      'Velocidad de aprobación del crédito',
      'Claridad y transparencia en costos',
      'Atención personalizada del asesor',
      'Facilidad del proceso digital',
      'Flexibilidad en requisitos documentales',
      'Tasa de interés competitiva',
    ],
  },
  {
    id: 'md_02',
    texto: 'Al pensar en recomendar HIR Casa, ¿qué aspecto tiene MÁS peso para ti y cuál tiene MENOS peso?',
    tipo: 'maxdiff',
    opciones: [
      'La rapidez con que resolvieron mis dudas',
      'La honestidad del asesor sobre los costos reales',
      'El tiempo total desde solicitud hasta desembolso',
      'Lo sencillo que fue entregar y gestionar documentos',
      'La disposición del asesor para acompañarme en todo',
    ],
  },

  // ── RANKING ───────────────────────────────────────────────────────────────
  {
    id: 'rank_01',
    texto: 'Ordena las siguientes razones por las que elegiste HIR Casa, de la más importante (1) a la menos importante.',
    tipo: 'ranking',
    opciones: [
      'Recomendación de un familiar o amigo',
      'Tasa de interés más baja que la competencia',
      'Proceso más sencillo y rápido',
      'Mayor monto de crédito disponible',
      'Buena reputación de la empresa',
      'Atención cercana y personalizada',
    ],
  },
  {
    id: 'rank_02',
    texto: 'Ordena los siguientes momentos del proceso hipotecario según el nivel de dificultad que te representaron, del más difícil (1) al más sencillo.',
    tipo: 'ranking',
    opciones: [
      'Reunir y organizar la documentación',
      'Esperar la resolución del comité de crédito',
      'Coordinar la cita con el notario',
      'Entender el contrato y las condiciones financieras',
      'Realizar el pago de gastos notariales',
    ],
  },

  // ── RATING ────────────────────────────────────────────────────────────────
  {
    id: 'rat_01',
    texto: '¿Cómo calificarías el desempeño de tu asesor HIR Casa durante todo el proceso de solicitud de crédito?',
    tipo: 'rating',
    escala: [1, 5],
  },
  {
    id: 'rat_02',
    texto: 'En términos generales, ¿cómo calificarías tu experiencia de compra de vivienda con el apoyo de HIR Casa?',
    tipo: 'rating',
    escala: [1, 5],
  },

  // ── CARGAR ARCHIVO ────────────────────────────────────────────────────────
  {
    id: 'arch_01',
    texto: 'Si deseas respaldarnos con evidencia de alguna situación que viviste durante el proceso, puedes adjuntar una captura, foto o documento aquí.',
    tipo: 'cargar_archivo',
  },
  {
    id: 'arch_02',
    texto: 'Sube tu comprobante de domicilio para completar tu expediente digital.',
    tipo: 'cargar_archivo',
  },

];

// ─── ETIQUETAS DE CATEGORIZACIÓN ─────────────────────────────────────────────

export const ETIQUETAS_CATEGORIZACION: Etiqueta[] = [

  // Atención al cliente
  { id: 'e01', n1: 'Atención al cliente', n2: 'Disponibilidad del asesor',       n3: 'Difícil contactar al asesor asignado' },
  { id: 'e02', n1: 'Atención al cliente', n2: 'Disponibilidad del asesor',       n3: 'Tiempos de respuesta lentos por WhatsApp o correo' },
  { id: 'e03', n1: 'Atención al cliente', n2: 'Calidad de la atención',          n3: 'Trato amable, empático y profesional' },
  { id: 'e04', n1: 'Atención al cliente', n2: 'Calidad de la atención',          n3: 'Información incorrecta o contradictoria' },
  { id: 'e05', n1: 'Atención al cliente', n2: 'Seguimiento post-firma',          n3: 'Sin noticias después de firmar el contrato' },
  { id: 'e06', n1: 'Atención al cliente', n2: 'Seguimiento post-firma',          n3: 'No se informó del estado del desembolso' },

  // Proceso y documentación
  { id: 'e07', n1: 'Proceso y documentación', n2: 'Requisitos solicitados',      n3: 'Documentación excesiva o duplicada' },
  { id: 'e08', n1: 'Proceso y documentación', n2: 'Requisitos solicitados',      n3: 'Requisitos poco claros o cambiantes' },
  { id: 'e09', n1: 'Proceso y documentación', n2: 'Tiempos del proceso',         n3: 'Demora prolongada en la aprobación del crédito' },
  { id: 'e10', n1: 'Proceso y documentación', n2: 'Tiempos del proceso',         n3: 'Retraso en el desembolso del monto aprobado' },
  { id: 'e11', n1: 'Proceso y documentación', n2: 'Proceso notarial',            n3: 'Coordinación complicada con el notario asignado' },
  { id: 'e12', n1: 'Proceso y documentación', n2: 'Proceso notarial',            n3: 'Gastos notariales distintos a los cotizados' },

  // Costos y tasas
  { id: 'e13', n1: 'Costos y tasas', n2: 'Transparencia de costos',             n3: 'Gastos adicionales no informados al inicio' },
  { id: 'e14', n1: 'Costos y tasas', n2: 'Transparencia de costos',             n3: 'Diferencia entre cotización y monto final cobrado' },
  { id: 'e15', n1: 'Costos y tasas', n2: 'Competitividad de la tasa',           n3: 'Tasa percibida como alta frente a la competencia' },
  { id: 'e16', n1: 'Costos y tasas', n2: 'Competitividad de la tasa',           n3: 'Tasa más baja que otras instituciones evaluadas' },

  // Producto / Crédito
  { id: 'e17', n1: 'Producto / Crédito', n2: 'Condiciones del crédito',         n3: 'Monto aprobado menor al solicitado' },
  { id: 'e18', n1: 'Producto / Crédito', n2: 'Condiciones del crédito',         n3: 'Plazo de pago no se ajusta a la necesidad' },
  { id: 'e19', n1: 'Producto / Crédito', n2: 'Flexibilidad del producto',       n3: 'Sin opción de prepago o amortización anticipada' },
  { id: 'e20', n1: 'Producto / Crédito', n2: 'Flexibilidad del producto',       n3: 'Imposibilidad de ajustar mensualidad en caso de emergencia' },

  // Tecnología / App
  { id: 'e21', n1: 'Tecnología / App', n2: 'Portal o aplicación móvil',         n3: 'Errores técnicos o caídas del sistema' },
  { id: 'e22', n1: 'Tecnología / App', n2: 'Portal o aplicación móvil',         n3: 'Difícil subir o consultar documentos en línea' },
  { id: 'e23', n1: 'Tecnología / App', n2: 'Comunicación digital',              n3: 'Notificaciones insuficientes por correo o app' },
  { id: 'e24', n1: 'Tecnología / App', n2: 'Comunicación digital',              n3: 'Información del expediente difícil de consultar en línea' },

  // Sucursales
  { id: 'e25', n1: 'Sucursales', n2: 'Infraestructura y comodidad',             n3: 'Sala de espera incómoda o sin privacidad' },
  { id: 'e26', n1: 'Sucursales', n2: 'Infraestructura y comodidad',             n3: 'Difícil acceso o falta de estacionamiento' },
  { id: 'e27', n1: 'Sucursales', n2: 'Cobertura geográfica',                    n3: 'No hay sucursal cerca del domicilio del cliente' },
  { id: 'e28', n1: 'Sucursales', n2: 'Cobertura geográfica',                    n3: 'Tiempo de traslado excesivo para trámites presenciales' },

];
