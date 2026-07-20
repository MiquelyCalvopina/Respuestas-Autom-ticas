import { Pregunta, OpcionConComentario, Etiqueta, Row, EmailTemplate } from './types';
import { cuid } from './cuid';

export const countComponents = (rows: Row[]): number =>
  rows.flatMap(r => r.columns).flatMap(c => c.components).length;

// Plantilla nueva en blanco. Sin `startDate` = borrador "sin programar" por defecto —
// crear nunca implica programar. `Partial<EmailTemplate>` permite fijar startDate/endDate
// de una (ej. la plantilla inicial de una regla nueva, que nace vigente desde ya).
export function makeTemplate(name: string, overrides?: Partial<EmailTemplate>): EmailTemplate {
  return {
    id: cuid(),
    name,
    rows: [],
    layout: { widthPercent: 100, boxed: true, bgColor: '#f5f5f5' },
    customHtml: null,
    blocksUpdatedAt: null,
    startDate: null,
    endDate: null,
    ...overrides,
  };
}

export interface VariableMeta { key: string; label: string; type: 'texto' | 'correo' | 'telefono' | 'numero'; }

// Variables mapeadas del estudio (contacto + sistema), con su tipo de dato y su nombre
// legible — el picker de variables busca/lista por `label`, no por `key`.
export const VARIABLES_META: VariableMeta[] = [
  { key: 'nombre_preferido', label: 'Nombre preferido', type: 'texto' },
  { key: 'correo_electronico', label: 'Correo electrónico', type: 'correo' },
  { key: 'sucursal', label: 'Sucursal', type: 'texto' },
  { key: 'canal', label: 'Canal', type: 'texto' },
  { key: 'telefono', label: 'Teléfono', type: 'telefono' },
  { key: 'identificador', label: 'Identificador', type: 'texto' },
  { key: 'numero_credito', label: 'Número de crédito', type: 'numero' },
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

export const SENDERS = ['noreply@hircasa.com', 'contacto@hircasa.com', 'encuestas@hircasa.com'];

// Dominios de correo permitidos — simula el sistema de dominios configurado en el setup del
// estudio (hircasa.com/plugthem.social) más los proveedores públicos comunes, usados para
// autocompletar sugerencias en los campos de ingreso de correo (CC/CCO/Reply to).
export const EMAIL_DOMAINS = ['hircasa.com', 'plugthem.social', 'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Sugerencias para el input de correo: desde que hay texto (incluso sin "@") ofrece completar
// con cada dominio del sistema ("Usar correo: juan@hircasa.com", "juan@plugthem.social", etc.),
// más el texto tal cual para poder confirmarlo con Enter si ya es un correo completo con un
// dominio que no está en la lista. Una vez escrito el "@", filtra los dominios por lo que sigue.
export function getEmailSuggestions(text: string, domains: string[] = EMAIL_DOMAINS): string[] {
  const t = text.trim();
  if (!t) return [];
  const at = t.indexOf('@');
  if (at === -1) {
    return [t, ...domains.map(d => `${t}@${d}`)].slice(0, 8);
  }
  const local = t.slice(0, at);
  if (!local) return [];
  const domainQuery = t.slice(at + 1).toLowerCase();
  const matches = domains.filter(d => d.toLowerCase().startsWith(domainQuery)).map(d => `${local}@${d}`);
  // Si lo escrito no corresponde a un dominio de la lista, se agrega tal cual al final para
  // poder confirmar con Enter un dominio externo válido que no está en el setup.
  if (domainQuery && !domains.some(d => d.toLowerCase() === domainQuery)) matches.push(t);
  return matches.slice(0, 8);
}

export const CONDITION_FIELDS = ['NPS', 'CSAT', 'Canal', 'Sucursal', 'Comentario'];
export const CONDITION_OPERATORS = ['grupo es', 'nota es', 'no está vacía', 'contiene'];
export const CONDITION_VALUES = ['Detractor', 'Neutro', 'Promotor', 'No aplica'];

export const HEADER_COLORS = ['#4338CA', '#7C3AED', '#059669', '#DC2626', '#0F172A', '#D97706', '#0D9488'];

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
