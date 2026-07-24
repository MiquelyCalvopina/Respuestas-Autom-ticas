import { BoxIcon } from './boxicons';

const FONT = "'Roboto', sans-serif";

interface Props {
  onVolver: () => void;
}

const EJEMPLOS = [
  {
    titulo: 'Dividir el flujo según la respuesta',
    desc: 'Quien elija una opción sigue por un camino y quien elija otra por otro.',
    tip: 'Usa "Ir a la pregunta" para cada opción, no "Mostrar".',
  },
  {
    titulo: 'Filtrar filas de una Matriz según respuesta anterior',
    desc: 'Muestra solo ciertas filas según lo respondido antes.',
    tip: 'Crea una regla "Mostrar" por cada fila; se puede reutilizar la misma Matriz.',
  },
  {
    titulo: 'Pedir explicación solo a quien calificó bajo',
    desc: 'La pregunta "¿Qué podríamos mejorar?" obligatoria solo si el NPS fue bajo.',
    tip: 'Usa "Hacer pregunta obligatoria".',
  },
  {
    titulo: 'Cerrar la encuesta anticipadamente',
    desc: 'Termina sin mostrar más preguntas según la respuesta.',
    tip: 'Usa "Terminar encuesta" y elige la despedida.',
  },
];

export default function SidebarExamples({ onVolver }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <button
          type="button" onClick={onVolver}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#1890ff', padding: 0, marginBottom: 8 }}
        >
          <BoxIcon name="bx-arrow-back" size={15} color="#1890ff" />
          <span style={{ fontFamily: FONT, fontSize: 13 }}>Volver</span>
        </button>
        <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: 0 }}>Ejemplos de reglas</p>
        <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '4px 0 0 0', lineHeight: '16px' }}>
          Estos ejemplos son solo referencia. Arma tu propia regla usándolos como inspiración.
        </p>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EJEMPLOS.map((e, i) => (
          <div key={i} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12, background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <BoxIcon name="bx-bulb" size={16} color="#D48806" style={{ marginTop: 2 }} />
              <div>
                <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 13, color: 'rgba(0,0,0,0.85)', margin: 0, lineHeight: '18px' }}>{e.titulo}</p>
                <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.65)', margin: '4px 0 0 0', lineHeight: '17px' }}>{e.desc}</p>
                <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '6px 0 0 0', lineHeight: '17px', fontStyle: 'italic' }}>{e.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
