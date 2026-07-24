// El setup del cliente, las preguntas y las variables del estudio viven en
// src/app/data/estudio.ts — única fuente de verdad reutilizada por todos los
// módulos (Respuestas Automáticas, Lógica, etc.) para trabajar sobre el mismo
// caso real en vez de duplicar datos.
import { SETUP, VARIABLES, PREGUNTAS, SIMULATED_RESPONSES } from '@/app/data/estudio';
export { SETUP, VARIABLES, PREGUNTAS, SIMULATED_RESPONSES };

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
  condGroups: { rules: { field: string; operator: string; value: string }[] }[],
): string => {
  const condText = condGroups.flatMap(g => g.rules).map(r => `${r.field} ${r.operator} ${r.value}`).join(', ') || 'ninguna';
  const tono = block.tone === 'custom' ? block.customTone : TONOS[block.tone] || '';
  let prompt = `Eres el asistente de comunicación de ${SETUP.empresa}, empresa de ${SETUP.industria}.\n${SETUP.descripcion}\n\nGenera UN SOLO párrafo para un correo automático enviado a un encuestado que cumple: ${condText}.\n\nObjetivo: ${block.objetivo}\nTono: ${tono}.`;
  if (block.datoPriorizar) prompt += `\nPriorizar este dato si está disponible: ${block.datoPriorizar}.`;
  if (block.restricciones.length > 0) prompt += `\nNunca mencionar: ${block.restricciones.join(', ')}.`;
  prompt += `\n\nReglas:\n- Solo el párrafo, sin saludo ni firma\n- Máximo 3 oraciones concisas\n- En español, segunda persona (tú)\n- Sonido genuino y humano, no plantilla genérica\n- No iniciar con el nombre de la empresa`;
  return prompt;
};
