import { Pregunta, OpcionConComentario, Etiqueta, AiBlock, AiLanguage, Row } from './types';

export const countComponents = (rows: Row[]): number =>
  rows.flatMap(r => r.columns).flatMap(c => c.components).length;

export const hasAiComponent = (rows: Row[]): boolean =>
  rows.flatMap(r => r.columns).flatMap(c => c.components).some(comp => comp.type === 'ai');

export const SETUP = {
  empresa: 'HIR Casa',
  industria: 'Financiamiento Inmobiliario',
  tamano: 'Grande (+500 empleados)',
  descripcion: 'HIR Casa acompaña a las familias en el proceso de adquirir su vivienda propia en México.',
};

export interface VariableMeta { key: string; type: 'texto' | 'correo' | 'telefono' | 'numero'; }

// Variables mapeadas del estudio (contacto + sistema), con su tipo de dato.
export const VARIABLES_META: VariableMeta[] = [
  { key: 'nombre_preferido', type: 'texto' },
  { key: 'correo_electronico', type: 'correo' },
  { key: 'sucursal', type: 'texto' },
  { key: 'canal', type: 'texto' },
  { key: 'telefono', type: 'telefono' },
  { key: 'identificador', type: 'texto' },
  { key: 'numero_credito', type: 'numero' },
];

export const VARIABLES = VARIABLES_META.map(v => v.key);

// Decodifica el valor de AutoResponse.recipientVariable, que puede ser una variable plana
// (ej. "correo_electronico") o una referencia a una pregunta del estudio: "pregunta:{id}"
// (respuesta abierta que valida correo) o "pregunta:{id}:campo:{nombre}" (campo tipo correo
// dentro de un Formulario).
export function describeRecipientSource(value: string): string {
  if (!value) return 'correo_electronico';
  const parts = value.split(':');
  if (parts[0] !== 'pregunta') return value;
  const pregunta = PREGUNTAS_EJEMPLO.find(p => p.id === parts[1]);
  if (!pregunta) return value;
  return parts[2] === 'campo' ? `${pregunta.texto} → ${parts[3]}` : pregunta.texto;
}

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

// Sugerencias del selector de "Acciones prohibidas" — además de estas, el usuario puede
// escribir cualquier otra acción libre (Select mode="tags").
export const RESTRICCION_SUGERENCIAS = [
  'No prometer tiempos de resolución',
  'No mencionar compensaciones económicas',
  'No prometer reembolsos',
  'No compartir información de otros clientes',
  'No hacer promesas legales',
  'No usar humor',
  'No mencionar el número de ticket o caso',
];

export const IDIOMA_LABELS: Record<AiLanguage, string> = { es: 'Español', en: 'Inglés', pt: 'Portugués', fr: 'Francés' };

const fmtVal = (v: string | string[]): string => Array.isArray(v) ? v.join(' o ') : v;

export const buildAiPrompt = (
  block: { objetivo: string; tone: string; customTone: string; restricciones: string[]; idioma?: AiLanguage },
  condGroups: { rows: { variable: string; operator: string; value: string | string[] }[] }[],
): string => {
  const condText = condGroups.flatMap(g => g.rows).map(r => `${r.variable} ${r.operator} ${fmtVal(r.value)}`).join(', ') || 'ninguna';
  const tono = block.tone === 'custom' ? block.customTone : TONOS[block.tone] || '';
  const idiomaLabel = IDIOMA_LABELS[block.idioma || 'es'];
  let prompt = `Eres el asistente de comunicación de ${SETUP.empresa}, empresa de ${SETUP.industria}.\n${SETUP.descripcion}\n\nGenera UN SOLO párrafo para un correo automático enviado a un encuestado que cumple: ${condText}.\n\nObjetivo: ${block.objetivo}\nTono: ${tono}.\nIdioma del texto generado: ${idiomaLabel}.`;
  if (block.restricciones.length > 0) prompt += `\nAcciones prohibidas — nunca hacer: ${block.restricciones.join(', ')}.`;
  prompt += `\n\nReglas:\n- Solo el párrafo, sin saludo ni firma\n- Máximo 3 oraciones concisas\n- En ${idiomaLabel.toLowerCase()}\n- Sonido genuino y humano, no plantilla genérica\n- No iniciar con el nombre de la empresa`;
  return prompt;
};

// Frases de plantilla por idioma para el generador simulado — el objetivo que escribe el
// administrador del estudio se mantiene tal cual lo redactó (no se traduce).
const TONE_OPENERS_BY_LANG: Record<AiLanguage, Record<string, string>> = {
  es: {
    empatico: 'Entendemos cómo te sentiste y queremos acompañarte en esto.',
    formal: 'Le escribimos para darle seguimiento a su experiencia reciente con nosotros.',
    calido: '¡Qué gusto saber de ti! Gracias por compartir tu experiencia.',
    directo: 'Vamos directo al punto sobre tu experiencia reciente.',
    custom: 'Gracias por compartir tu experiencia con nosotros.',
  },
  en: {
    empatico: 'We understand how you felt and want to support you through this.',
    formal: 'We are writing to follow up on your recent experience with us.',
    calido: "We're so glad to hear from you! Thank you for sharing your experience.",
    directo: "Let's get straight to the point about your recent experience.",
    custom: 'Thank you for sharing your experience with us.',
  },
  pt: {
    empatico: 'Entendemos como você se sentiu e queremos te acompanhar nisso.',
    formal: 'Escrevemos para dar seguimento à sua experiência recente conosco.',
    calido: 'Que alegria saber de você! Obrigado por compartilhar sua experiência.',
    directo: 'Vamos direto ao ponto sobre sua experiência recente.',
    custom: 'Obrigado por compartilhar sua experiência conosco.',
  },
  fr: {
    empatico: 'Nous comprenons ce que vous avez ressenti et souhaitons vous accompagner.',
    formal: 'Nous vous écrivons pour faire suite à votre expérience récente avec nous.',
    calido: 'Quel plaisir de vous lire ! Merci de partager votre expérience.',
    directo: 'Allons droit au but concernant votre expérience récente.',
    custom: 'Merci de partager votre expérience avec nous.',
  },
};
const FOCUS_BY_LANG: Record<AiLanguage, (summary: string, objetivo: string) => string> = {
  es: (r, o) => `Basado en tu respuesta (${r}), nuestro equipo se enfoca en ${o}.`,
  en: (r, o) => `Based on your response (${r}), our team is focused on ${o}.`,
  pt: (r, o) => `Com base na sua resposta (${r}), nossa equipe está focada em ${o}.`,
  fr: (r, o) => `D'après votre réponse (${r}), notre équipe se concentre sur ${o}.`,
};
const CLOSER_BY_LANG: Record<AiLanguage, (tono: string) => string> = {
  es: t => ` Seguimos comprometidos en brindarte una experiencia ${t}.`,
  en: t => ` We remain committed to providing you with a ${t} experience.`,
  pt: t => ` Continuamos comprometidos em oferecer a você uma experiência ${t}.`,
  fr: t => ` Nous restons engagés à vous offrir une expérience ${t}.`,
};
const TONE_FALLBACK_BY_LANG: Record<AiLanguage, string> = { es: 'cercana y profesional', en: 'warm and professional', pt: 'próxima e profissional', fr: 'chaleureuse et professionnelle' };

// Generador simulado en el cliente — NO llama a ninguna API real. Es un prototipo Figma Make
// sin backend, así que "Enviar prueba" solo necesita mostrar un texto plausible y determinístico.
export function mockGenerateAiText(block: AiBlock, responseSummary: string): string {
  const idioma = block.idioma || 'es';
  const tono = block.tone === 'custom' ? (block.customTone.trim() || 'cercano') : (TONOS[block.tone] || '');
  const opener = TONE_OPENERS_BY_LANG[idioma][block.tone] || TONE_OPENERS_BY_LANG[idioma].custom;
  const objetivo = block.objetivo.trim() || 'darte seguimiento personalizado';
  let text = `${opener} ${FOCUS_BY_LANG[idioma](responseSummary, objetivo.toLowerCase())}`;
  text += CLOSER_BY_LANG[idioma](tono || TONE_FALLBACK_BY_LANG[idioma]);
  return text;
}

// ─── Respuestas simuladas — usadas por el bloque de Respuestas y "Enviar prueba" ──

export const optionTexts = (q: Pregunta): string[] => (q.opciones ?? []).map(o => typeof o === 'string' ? o : o.texto);
export const commentableOptionTexts = (q: Pregunta): string[] =>
  (q.opciones ?? []).filter((o): o is OpcionConComentario => typeof o !== 'string' && o.tieneComentario).map(o => o.texto);

const MOCK_COMMENT = 'El proceso fue más ágil de lo que esperaba, aunque hubo un momento de confusión con la documentación.';
const MOCK_FIELD_VALUE: Record<string, string> = {
  texto: 'Juan Pérez', numero: '482913', correo: 'contacto@ejemplo.com', fecha: '12/03/2026', url: 'https://ejemplo.com/expediente',
};

// Genera una respuesta simulada plausible para cualquiera de los 18 tipos de pregunta, incluyendo
// el caso de comentario atado a una opción de selección (options con tieneComentario: true).
export function mockAnswerFor(q: Pregunta): string {
  switch (q.tipo) {
    case 'NPS': case 'CLI': return `${(q.escala?.[1] ?? 10) - 1}`;
    case 'CES': return `${Math.ceil((q.escala?.[1] ?? 7) / 2)}`;
    case 'CSAT': case 'rating': return `${(q.escala?.[1] ?? 5) - 1} de ${q.escala?.[1] ?? 5}`;
    case 'matriz_escalas':
      return (q.atributos ?? []).map(a => `${a}: ${(q.escala?.[1] ?? 5) - 1}/${q.escala?.[1] ?? 5}`).join(' · ');
    case 'respuesta_abierta':
      return MOCK_COMMENT;
    case 'formulario':
      return (q.campos ?? []).map(c => `${c.nombre}: ${MOCK_FIELD_VALUE[c.tipo] ?? ''}`).join(' · ');
    case 'opcion_simple': case 'dropdown': case 'si_no': case 'seleccion_imagenes_simple': {
      const chosen = optionTexts(q)[0] ?? '';
      return commentableOptionTexts(q).includes(chosen) ? `${chosen} — comentario: "${MOCK_COMMENT}"` : chosen;
    }
    case 'opcion_multiple': case 'seleccion_imagenes_multiple': {
      const opts = optionTexts(q);
      const chosen = opts.slice(0, Math.min(2, opts.length));
      const withComment = chosen.find(c => commentableOptionTexts(q).includes(c));
      const base = chosen.join(', ');
      return withComment ? `${base} — comentario en "${withComment}": "${MOCK_COMMENT}"` : base;
    }
    case 'casilla_verificacion': return 'Aceptó';
    case 'maxdiff': {
      const opts = optionTexts(q);
      return `Más importante: ${opts[0] ?? ''} · Menos importante: ${opts[opts.length - 1] ?? ''}`;
    }
    case 'ranking': return optionTexts(q).map((o, i) => `${i + 1}° ${o}`).join(' · ');
    case 'cargar_archivo': return 'comprobante_domicilio.pdf (adjunto)';
    default: return 'Respuesta de ejemplo.';
  }
}

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

  // ── CSAT ─────────────────────────────────────────────────────────────────
  {
    id: 'csat_01',
    texto: '¿Qué tan satisfecho quedaste con la atención que recibiste durante el proceso de solicitud de tu crédito hipotecario?',
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

  // ── CLI ──────────────────────────────────────────────────────────────────
  {
    id: 'cli_01',
    texto: '¿Qué tan seguro estás de que seguirás siendo cliente de HIR Casa si en el futuro necesitas un segundo crédito o refinanciamiento?',
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

  // ── RESPUESTA ABIERTA ─────────────────────────────────────────────────────
  {
    id: 'ra_01',
    texto: '¿Cuál fue el aspecto del proceso que más trabajo te costó o que cambiarías si pudieras?',
    tipo: 'respuesta_abierta',
    categorizable: true,
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

  // ── OPCIÓN SIMPLE — con comentario por opción ─────────────────────────────
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

  // ── DROPDOWN — con comentario por opción ──────────────────────────────────
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

  // ── SÍ / NO — con comentario por opción ───────────────────────────────────
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

  // ── SELECCIÓN DE IMÁGENES — SIMPLE — con comentario por opción ────────────
  {
    id: 'img_s_01',
    texto: '¿Cuál de estas imágenes representa mejor cómo te sentiste al terminar el proceso con HIR Casa?',
    tipo: 'seleccion_imagenes_simple',
    opciones: [
      { texto: 'Emocionado y satisfecho', tieneComentario: false },
      { texto: 'Tranquilo y conforme', tieneComentario: false },
      { texto: 'Indiferente', tieneComentario: false },
      { texto: 'Algo frustrado', tieneComentario: true },
      { texto: 'Muy frustrado', tieneComentario: true },
    ],
    comentarioCategorizable: true,
  },

  // ── OPCIÓN MÚLTIPLE — con comentario por opción ───────────────────────────
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

  // ── SELECCIÓN DE IMÁGENES — MÚLTIPLE — con comentario por opción ─────────
  {
    id: 'img_m_01',
    texto: '¿Qué canales digitales de HIR Casa utilizaste durante tu trámite? Selecciona todos los que apliquen.',
    tipo: 'seleccion_imagenes_multiple',
    opciones: [
      { texto: 'App móvil HIR Casa', tieneComentario: false },
      { texto: 'Portal web', tieneComentario: false },
      { texto: 'WhatsApp Business', tieneComentario: true },
      { texto: 'Correo electrónico', tieneComentario: false },
      { texto: 'Ninguno', tieneComentario: true },
    ],
    comentarioCategorizable: true,
  },

  // ── CASILLA DE VERIFICACIÓN ───────────────────────────────────────────────
  {
    id: 'cv_01',
    texto: 'Autorizo a HIR Casa a contactarme por correo y WhatsApp para enviarme información sobre mi crédito y servicios relacionados.',
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

  // ── RATING ────────────────────────────────────────────────────────────────
  {
    id: 'rat_01',
    texto: '¿Cómo calificarías el desempeño de tu asesor HIR Casa durante todo el proceso de solicitud de crédito?',
    tipo: 'rating',
    escala: [1, 5],
  },

  // ── CARGAR ARCHIVO ────────────────────────────────────────────────────────
  {
    id: 'arch_01',
    texto: 'Si deseas respaldarnos con evidencia de alguna situación que viviste durante el proceso, puedes adjuntar una captura, foto o documento aquí.',
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
