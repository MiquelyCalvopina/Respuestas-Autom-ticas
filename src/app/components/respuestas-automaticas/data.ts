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

export const buildAiPrompt = (
  block: { objetivo: string; tone: string; customTone: string; datoPriorizar: string; restricciones: string[] },
  condGroups: { rows: { variable: string; operator: string; value: string }[] }[],
): string => {
  const condText = condGroups.flatMap(g => g.rows).map(r => `${r.variable} ${r.operator} ${r.value}`).join(', ') || 'ninguna';
  const tono = block.tone === 'custom' ? block.customTone : TONOS[block.tone] || '';
  let prompt = `Eres el asistente de comunicación de ${SETUP.empresa}, empresa de ${SETUP.industria}.\n${SETUP.descripcion}\n\nGenera UN SOLO párrafo para un correo automático enviado a un encuestado que cumple: ${condText}.\n\nObjetivo: ${block.objetivo}\nTono: ${tono}.`;
  if (block.datoPriorizar) prompt += `\nPriorizar este dato si está disponible: ${block.datoPriorizar}.`;
  if (block.restricciones.length > 0) prompt += `\nNunca mencionar: ${block.restricciones.join(', ')}.`;
  prompt += `\n\nReglas:\n- Solo el párrafo, sin saludo ni firma\n- Máximo 3 oraciones concisas\n- En español, segunda persona (tú)\n- Sonido genuino y humano, no plantilla genérica\n- No iniciar con el nombre de la empresa`;
  return prompt;
};

export const SIMULATED_RESPONSES: Record<string, string | number> = {
  q1: 4,
  q2: 'El proceso de trámite fue más largo de lo esperado y no recibí suficiente comunicación durante el proceso.',
  q3: 3,
  q4: 'Quito Norte',
};
