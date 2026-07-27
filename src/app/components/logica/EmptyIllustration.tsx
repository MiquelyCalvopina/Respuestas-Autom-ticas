// Ilustración del estado vacío del módulo Lógica (Figma 1605, nodo "SVG" 116×117).
// El asset original de Figma no se pudo descargar (la política de egress bloquea
// figma.com), así que se reconstruye inline con el mismo lenguaje: tres tarjetas
// del flujo y una mano que "toca" la del centro (gesto de seleccionar una pregunta).
export function EmptyIllustration({ size = 116 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 116 116" fill="none" aria-hidden="true" style={{ display: 'block' }}>
      {/* Tarjetas laterales */}
      <g stroke="rgba(0,0,0,0.16)" strokeWidth="2">
        <rect x="6" y="26" width="30" height="24" rx="4" fill="#fff" />
        <rect x="80" y="26" width="30" height="24" rx="4" fill="#fff" />
        {/* Tarjeta central destacada */}
        <rect x="40" y="20" width="36" height="30" rx="4" fill="#fafafa" stroke="rgba(0,0,0,0.25)" />
      </g>
      {/* Líneas de contenido dentro de las tarjetas */}
      <g stroke="rgba(0,0,0,0.14)" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="35" x2="30" y2="35" />
        <line x1="12" y1="41" x2="24" y2="41" />
        <line x1="86" y1="35" x2="104" y2="35" />
        <line x1="86" y1="41" x2="98" y2="41" />
        <line x1="47" y1="30" x2="69" y2="30" />
        <line x1="47" y1="37" x2="62" y2="37" />
      </g>
      {/* Mano que toca la tarjeta central */}
      <g fill="#fff" stroke="rgba(0,0,0,0.28)" strokeWidth="2" strokeLinejoin="round">
        {/* dedo índice */}
        <path d="M55 74 v-16 a4 4 0 0 1 8 0 v14" />
        {/* palma con dedos recogidos */}
        <path d="M63 72 v-4 a3.5 3.5 0 0 1 7 0 v4 a3.5 3.5 0 0 1 7 0 v3 a3.5 3.5 0 0 1 7 0 v9 a12 12 0 0 1-12 12 h-6 a12 12 0 0 1-9-4 l-8-9 a4 4 0 0 1 6-5 l3 3 v-9" />
      </g>
      {/* Punto de contacto (tap) */}
      <circle cx="59" cy="50" r="3" fill="rgba(24,144,255,0.9)" />
    </svg>
  );
}
