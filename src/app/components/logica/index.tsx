import { useState } from 'react';
import { App } from 'antd';
import { preguntaById } from '@/app/data/estudio';
import { BoxIcon } from './boxicons';
import { Regla, Seleccion, SidebarModo, Momento, DestinosPorMomento } from './types';
import { emptyGrupo, uid } from './seed';
import { reglasDeMomento, preguntasSinAcceso, destinoCalculado } from './derive';
import Canvas from './Canvas';
import SidebarList from './SidebarList';
import SidebarForm from './SidebarForm';
import SidebarExamples from './SidebarExamples';
import DefaultDestinationBar from './DefaultDestinationBar';

const FONT = "'Roboto', sans-serif";

function momentoDeSeleccion(sel: Seleccion): Momento | null {
  if (sel.tipo === 'bienvenida') return 'inicio';
  if (sel.tipo === 'pregunta') return sel.preguntaId;
  return null;
}

function nuevoBorrador(momento: Momento): Regla {
  const g = emptyGrupo();
  // Semilla de la primera condición según el momento
  if (momento === 'inicio') {
    g.condiciones[0].fuente = 'variable';
  } else {
    g.condiciones[0].fuente = 'response';
    g.condiciones[0].campo = momento; // por defecto la pregunta del momento
  }
  return { id: uid('r'), momento, grupos: [g], consecuencia: { tipo: 'mostrar', destinoClase: 'pregunta' } };
}

export default function LogicaModule() {
  const { message } = App.useApp();
  // Arranca en el estado vacío (3.1.a) — primer contacto del usuario con el módulo.
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [seleccion, setSeleccion] = useState<Seleccion>({ tipo: 'none' });
  const [modo, setModo] = useState<SidebarModo>('lista');
  const [borrador, setBorrador] = useState<Regla | null>(null);
  const [modoForm, setModoForm] = useState<'crear' | 'editar'>('crear');
  const [destinos, setDestinos] = useState<DestinosPorMomento>({});
  const [infoVisible, setInfoVisible] = useState(true);
  const [editandoDestino, setEditandoDestino] = useState(false);
  const [destinoPrueba, setDestinoPrueba] = useState<string | undefined>(undefined);

  const momentoActual = momentoDeSeleccion(seleccion);

  // ── Selección de nodo ──────────────────────────────────────────────────────
  function seleccionar(sel: Seleccion) {
    setSeleccion(sel);
    setModo('lista');
    setBorrador(null);
    setEditandoDestino(false);
  }

  // ── Crear / editar / eliminar reglas ─────────────────────────────────────────
  function crear() {
    const m: Momento = momentoActual ?? 'inicio';
    setBorrador(nuevoBorrador(m));
    setModoForm('crear');
    setModo('formulario');
    setEditandoDestino(false);
  }
  function editar(id: string) {
    const r = reglas.find(x => x.id === id);
    if (!r) return;
    setBorrador(JSON.parse(JSON.stringify(r)));
    setModoForm('editar');
    setSeleccion(r.momento === 'inicio' ? { tipo: 'bienvenida' } : { tipo: 'pregunta', preguntaId: r.momento });
    setModo('formulario');
  }
  function eliminar(id: string) {
    const r = reglas.find(x => x.id === id);
    const next = reglas.filter(x => x.id !== id);
    setReglas(next);
    // 5.4 — si era la última regla de un momento con destino personalizado, resetea
    if (r && reglasDeMomento(next, r.momento).length === 0 && destinos[r.momento] !== undefined) {
      setDestinos(d => { const c = { ...d }; delete c[r.momento]; return c; });
    }
    message.success('Regla eliminada');
  }
  function guardarForm() {
    if (!borrador) return;
    setReglas(prev => prev.some(r => r.id === borrador.id)
      ? prev.map(r => r.id === borrador.id ? borrador : r)
      : [...prev, borrador]);
    setSeleccion(borrador.momento === 'inicio' ? { tipo: 'bienvenida' } : { tipo: 'pregunta', preguntaId: borrador.momento });
    setModo('lista');
    setBorrador(null);
    message.success(modoForm === 'crear' ? 'Regla creada' : 'Regla actualizada');
  }

  // ── Barra de destino ─────────────────────────────────────────────────────────
  const sinAcceso = editandoDestino && momentoActual ? preguntasSinAcceso(reglas, momentoActual, destinoPrueba) : [];
  function iniciarEdicionDestino() {
    if (!momentoActual) return;
    // precarga el destino efectivo actual (personalizado o el calculado)
    setDestinoPrueba(destinos[momentoActual] ?? destinoCalculado(momentoActual)?.id);
    setEditandoDestino(true);
  }
  function guardarDestino() {
    if (!momentoActual) return;
    setDestinos(d => ({ ...d, [momentoActual]: destinoPrueba }));
    setEditandoDestino(false);
    message.success('Destino por defecto actualizado');
  }

  const mostrarBarra = modo === 'lista' && momentoActual !== null;

  return (
    // width:100% es necesario: el contenedor "Page content" del shell usa
    // items-start (export de Figma), que en flex-column encoge los hijos a su
    // ancho de contenido en vez de estirarlos — sin esto el canvas no llena.
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, width: '100%', background: '#fff' }}>
      {/* Línea informativa (sección 2) */}
      {infoVisible && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f7fa', borderBottom: '1px solid #f0f0f0', padding: '8px 24px', flexShrink: 0 }}>
          <BoxIcon name="bx-info-circle" size={14} color="rgba(0,0,0,0.35)" />
          <span style={{ flex: 1, fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.55)', lineHeight: '16px' }}>
            El orden que ves aquí es el de Estructura. La lógica puede mostrar, ocultar o saltar preguntas según cada encuestado, pero no las reordena.
          </span>
          <button
            type="button" onClick={() => setInfoVisible(false)} aria-label="Descartar"
            style={{ display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.35)', padding: 2 }}
          >
            <BoxIcon name="bx-x" size={16} />
          </button>
        </div>
      )}

      {/* Split responsive: sidebar + canvas */}
      <div className="flex flex-col xl:flex-row" style={{ flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div
          className="w-full xl:w-[576px] xl:h-auto"
          style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: '1px solid #f0f0f0', flexShrink: 0 }}
        >
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {modo === 'lista' && (
              <SidebarList reglas={reglas} seleccion={seleccion} onCrear={crear} onEditar={editar} onEliminar={eliminar} />
            )}
            {modo === 'formulario' && borrador && (
              <SidebarForm
                borrador={borrador} modoForm={modoForm} reglas={reglas}
                onChange={setBorrador} onGuardar={guardarForm} onCancelar={() => { setModo('lista'); setBorrador(null); }}
                onVerEjemplos={() => setModo('ejemplos')}
              />
            )}
            {modo === 'ejemplos' && (
              <SidebarExamples onVolver={() => setModo('formulario')} />
            )}
          </div>
          {/* Barra de destino por defecto — anclada al fondo del sidebar */}
          {mostrarBarra && momentoActual && (
            <DefaultDestinationBar
              momento={momentoActual}
              tieneReglas={reglasDeMomento(reglas, momentoActual).length > 0}
              destinoCustom={destinos[momentoActual]}
              editando={editandoDestino}
              destinoPrueba={destinoPrueba}
              sinAcceso={sinAcceso}
              onEditar={iniciarEdicionDestino}
              onCambioPrueba={setDestinoPrueba}
              onGuardar={guardarDestino}
              onCancelar={() => setEditandoDestino(false)}
            />
          )}
        </div>

        {/* Canvas */}
        <Canvas reglas={reglas} seleccion={seleccion} onSelect={seleccionar} preguntasSinAcceso={sinAcceso} />
      </div>
    </div>
  );
}
