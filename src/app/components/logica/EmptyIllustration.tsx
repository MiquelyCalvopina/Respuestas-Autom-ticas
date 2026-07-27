// Ilustración del estado vacío del módulo Lógica (Figma 1605, nodo "SVG").
// El asset original de Figma no se pudo descargar (la política de egress bloquea
// figma.com), así que se reconstruye inline con el mismo lenguaje: tres tarjetas
// del flujo (la del centro destacada, con un punto azul) y una mano que la "toca"
// —gesto de seleccionar una pregunta del diagrama—. Grises de la rampa Neutral.
export function EmptyIllustration({ size = 116 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true" style={{ display: 'block' }}>
      {/* Tarjetas laterales */}
      <g stroke="#d9d9d9" strokeWidth="3" fill="none">
        <rect x="14" y="34" width="30" height="22" rx="5" />
        <rect x="76" y="34" width="30" height="22" rx="5" />
      </g>
      {/* Tarjeta central destacada */}
      <rect x="44" y="27" width="32" height="27" rx="5" fill="#fafafa" stroke="#bfbfbf" strokeWidth="3" />
      {/* Líneas de contenido dentro de las tarjetas */}
      <g stroke="#e0e0e0" strokeWidth="3" strokeLinecap="round">
        <line x1="20" y1="42" x2="38" y2="42" /><line x1="20" y1="49" x2="32" y2="49" />
        <line x1="82" y1="42" x2="100" y2="42" /><line x1="82" y1="49" x2="94" y2="49" />
        <line x1="51" y1="35" x2="69" y2="35" /><line x1="51" y1="43" x2="63" y2="43" />
      </g>
      {/* Punto de contacto (tap) en el borde inferior de la tarjeta central */}
      <circle cx="60" cy="54" r="4" fill="#1890ff" />
      {/* Mano que toca la tarjeta: índice extendido, dedos recogidos y pulgar */}
      <path
        d="M56.5 82 V63 a5.5 5.5 0 0 1 11 0 v9 a4.5 4.5 0 0 1 9 0 v2 a4.5 4.5 0 0 1 9 0 v2 a4.5 4.5 0 0 1 9 0 v14 a15 15 0 0 1-15 15 h-7 a15 15 0 0 1-11-5 l-11-12 a5 5 0 0 1 7-7 l3 3 z"
        fill="#fff" stroke="#bfbfbf" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  );
}
