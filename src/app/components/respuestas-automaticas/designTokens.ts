// Tokens verificados contra el sistema de diseño real de Plugthem en Figma
// ("Ant Design adaptado para Plugthem", https://www.figma.com/design/Ps85a9mvYmaiBwBcquii6h) —
// cada valor fue extraído del archivo (get_design_context / get_variable_defs) o confirmado
// directamente por el equipo, no inferido. Sirve como referencia y, para los casos de mayor
// duplicación, como constante importable — el resto del módulo puede seguir usando literales
// iguales a estos sin que eso sea un error, siempre que respeten el mismo valor exacto.

// ─── Color ──────────────────────────────────────────────────────────────────
// "DayBreak Blue/6" — color primario de Ant Design, heredado por defecto de todos los
// componentes AntD que usa el módulo.
export const COLOR_PRIMARY = '#1890ff';
// "Neutral/5" — borde de inputs, selects, botones y demás controles interactivos.
export const COLOR_BORDER_CONTROL = '#d9d9d9';
// Borde de contenedores/tarjetas y líneas divisorias (no controles interactivos).
export const COLOR_BORDER_SPLIT = '#f0f0f0';
// Fondo de hover / addons de input.
export const COLOR_BG_HOVER = '#fafafa';
// Fondo base de paneles/página.
export const COLOR_BG_BASE = '#f5f5f5';

// "Character" — opacidades de texto sobre negro, confirmadas contra Figma.
export const TEXT_PRIMARY = 'rgba(0,0,0,0.85)';
export const TEXT_SECONDARY = 'rgba(0,0,0,0.45)';
export const TEXT_DISABLED = 'rgba(0,0,0,0.25)'; // "Character/Disabled & Placeholder .25"

// ─── Radio de esquinas ──────────────────────────────────────────────────────
// Tres niveles confirmados por el equipo: componentes chicos (tags/chips/badges) van en
// pill; componentes medium/large (inputs, botones, selects, tarjetas chicas) en 8px
// ("--components-mediumORlarge-radius" en Figma); contenedores grandes (Card/Modal/
// superficies de página) en 20px.
export const RADIUS_PILL = 1000;
export const RADIUS_DEFAULT = 8;
export const RADIUS_CONTAINER_LG = 20;

// ─── Tipografía ─────────────────────────────────────────────────────────────
// Confirmado en la página Typography de Figma ("TYPOGRAPHY - English - Roboto"): Roboto es
// la fuente real del sistema para inglés/español, no un desvío — Inter (ds-tokens.css) no
// corresponde a este archivo.
export const FONT_FAMILY = "'Roboto', sans-serif";
export const FONT_SIZE_BASE = 14;

// Altura de controles por tamaño (AntD estándar, confirmado en Input/DatePicker de Figma).
export const CONTROL_HEIGHT_SMALL = 24;
export const CONTROL_HEIGHT_MEDIUM = 32;
export const CONTROL_HEIGHT_LARGE = 40;
