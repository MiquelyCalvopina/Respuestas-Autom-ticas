import { AutoResponse } from './types';

// Formato de archivo para exportar/importar reglas de Respuestas Automáticas entre estudios.
// El envoltorio lleva un `type` que se valida al importar, para no aceptar cualquier JSON suelto.
export const RULES_FILE_TYPE = 'plugthem.respuestas-automaticas.rules';
export const RULES_FILE_VERSION = 1;

interface RulesFile {
  type: string;
  version: number;
  exportedAt: string;
  rules: AutoResponse[];
}

// Nombre de archivo seguro a partir del nombre de la regla.
export function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'regla';
}

// Dispara la descarga de un JSON con las reglas dadas (una o varias).
export function downloadRules(rules: AutoResponse[], filename: string): void {
  const payload: RulesFile = {
    type: RULES_FILE_TYPE,
    version: RULES_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    rules,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Una regla mínima reconocible: tiene nombre y las llaves estructurales del modelo.
function looksLikeRule(o: unknown): o is AutoResponse {
  return !!o && typeof o === 'object'
    && typeof (o as AutoResponse).name === 'string'
    && 'condGroups' in (o as object)
    && 'rows' in (o as object);
}

// Parsea el contenido de un archivo y devuelve las reglas válidas. Acepta tres formas:
// (1) el envoltorio { type, rules: [...] }, (2) un array de reglas suelto, (3) una sola regla.
// Lanza un Error con mensaje legible si el archivo no sirve.
export function parseRulesFile(text: string): AutoResponse[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }

  let candidates: unknown[];
  if (Array.isArray(data)) {
    candidates = data;
  } else if (data && typeof data === 'object' && Array.isArray((data as RulesFile).rules)) {
    candidates = (data as RulesFile).rules;
  } else if (looksLikeRule(data)) {
    candidates = [data];
  } else {
    throw new Error('El JSON no contiene reglas de respuestas automáticas.');
  }

  const rules = candidates.filter(looksLikeRule);
  if (rules.length === 0) {
    throw new Error('No se encontró ninguna regla válida en el archivo.');
  }
  return rules;
}
