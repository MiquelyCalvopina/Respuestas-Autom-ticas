import { BoxIcon } from './boxicons';

const FONT = "'Roboto', sans-serif";

// Header estandarizado de todas las sub-vistas del sidebar de Lógica (lista,
// formulario, ejemplos). Mantiene un solo modelo mental: el botón "Volver"
// interno siempre a la izquierda, seguido de un divisor y el título/subtítulo;
// la acción de la vista (Crear regla, Ver ejemplos) siempre a la derecha.
export function SidebarHeader({
  onVolver,
  title,
  subtitle,
  right,
}: {
  onVolver?: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ padding: '12px 24px', borderBottom: '1px solid #f0f0f0', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {onVolver && (
          <>
            <button
              type="button" onClick={onVolver}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#1890ff', padding: 0, flexShrink: 0 }}
            >
              <BoxIcon name="bx-arrow-back" size={15} color="#1890ff" />
              <span style={{ fontFamily: FONT, fontSize: 14 }}>Volver</span>
            </button>
            <div style={{ width: 1, height: 20, background: '#d9d9d9', flexShrink: 0 }} />
          </>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: 0, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '2px 0 0 0', lineHeight: '16px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}
