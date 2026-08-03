import { useState } from 'react';
import { App } from 'antd';
import { Regla, Seleccion, SidebarModo, Momento, DestinosPorMomento } from './types';
import { emptyGrupo, uid, nuevoCodigoRegla } from './seed';
import { reglasDeMomento, preguntasSinAcceso, preguntasHuerfanas, destinoCalculado, momentoDeRegla } from './derive';
import Canvas from './Canvas';
import SidebarList from './SidebarList';
import SidebarForm from './SidebarForm';
import SidebarExamples from './SidebarExamples';
import DefaultDestinationBar from './DefaultDestinationBar';
import PreviewModal from './PreviewModal';

function momentoDeSeleccion(sel: Seleccion): Momento | null {
  if (sel.tipo === 'bienvenida') return 'inicio';
  if (sel.tipo === 'pregunta') return sel.preguntaId;
  return null;
}

function nuevoBorrador(sel: Seleccion): Regla {
  const g = emptyGrupo();
  const c0 = g.condiciones[0];
  // Semilla de la primera condición según el foco (o sin foco):
  // - Bienvenida: variable o canal de respuesta (al inicio no hay respuestas
  //   todavía); arranca en variable, el usuario puede cambiar a canal.
  // - Pregunta: respuesta a esa pregunta, ya preseleccionada.
  // - Sin foco: respuesta (sin pregunta elegida); el usuario elige libremente.
  if (sel.tipo === 'bienvenida') {
    c0.fuente = 'variable';
  } else if (sel.tipo === 'pregunta') {
    c0.fuente = 'response';
    c0.campo = sel.preguntaId;
  } else {
    c0.fuente = 'response';
  }
  const momento: Momento = sel.tipo === 'pregunta' ? sel.preguntaId : 'inicio';
  return { id: uid('r'), codigo: nuevoCodigoRegla(), momento, grupos: [g], consecuencia: { tipo: 'mostrar', destinoClase: 'pregunta' } };
}

export default function LogicaModule({ previewAbierto = false, onCerrarPreview }: {
  /** lo controla el botón de ojito del topbar del estudio */
  previewAbierto?: boolean;
  onCerrarPreview?: () => void;
} = {}) {
  const { message } = App.useApp();
  // Arranca en el estado vacío (3.1.a) — primer contacto del usuario con el módulo.
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [seleccion, setSeleccion] = useState<Seleccion>({ tipo: 'none' });
  const [modo, setModo] = useState<SidebarModo>('lista');
  const [borrador, setBorrador] = useState<Regla | null>(null);
  const [modoForm, setModoForm] = useState<'crear' | 'editar'>('crear');
  // "La respuesta a" se bloquea solo en reglas de inicio (foco en Bienvenida o
  // edición de una regla de inicio): antes de la primera pregunta no hay
  // respuestas — pero sí variables y canal de respuesta, ambos disponibles.
  // Sin foco NO se bloquea: se puede crear cualquier lógica.
  const [fuenteBloqueada, setFuenteBloqueada] = useState(false);
  // Pregunta a la que queda fija la primera condición (foco activo al crear).
  const [momentoFijo, setMomentoFijo] = useState<string | null>(null);
  const [destinos, setDestinos] = useState<DestinosPorMomento>({});
  // La barra informativa se descarta por sesión: si el usuario la cierra, no
  // vuelve a aparecer hasta la siguiente sesión (sessionStorage se limpia al
  // cerrar la pestaña/sesión).
  const [infoVisible, setInfoVisible] = useState(() => {
    try { return sessionStorage.getItem('logica.infoDescartada') !== '1'; } catch { return true; }
  });
  function descartarInfo() {
    setInfoVisible(false);
    try { sessionStorage.setItem('logica.infoDescartada', '1'); } catch { /* modo privado / no disponible */ }
  }
  const [editandoDestino, setEditandoDestino] = useState(false);
  const [destinoPrueba, setDestinoPrueba] = useState<string | undefined>(undefined);

  const momentoActual = momentoDeSeleccion(seleccion);

  // ── Selección de nodo ──────────────────────────────────────────────────────
  // Clic en el nodo ya seleccionado = deseleccionar (vuelve a "todas las reglas").
  function seleccionar(sel: Seleccion) {
    const mismo =
      (sel.tipo === 'bienvenida' && seleccion.tipo === 'bienvenida') ||
      (sel.tipo === 'pregunta' && seleccion.tipo === 'pregunta' && sel.preguntaId === seleccion.preguntaId);
    setSeleccion(mismo ? { tipo: 'none' } : sel);
    setModo('lista');
    setBorrador(null);
    setEditandoDestino(false);
  }

  // ── Crear / editar / eliminar reglas ─────────────────────────────────────────
  function crear() {
    // Con foco, la PRIMERA condición queda fija a ese momento: si el usuario
    // eligiera otra pregunta, al guardar la regla cambiaría de momento y
    // desaparecería del foco donde la está creando.
    setFuenteBloqueada(seleccion.tipo === 'bienvenida');
    setMomentoFijo(seleccion.tipo === 'pregunta' ? seleccion.preguntaId : null);
    setBorrador(nuevoBorrador(seleccion));
    setModoForm('crear');
    setModo('formulario');
    setEditandoDestino(false);
  }
  function editar(id: string) {
    const r = reglas.find(x => x.id === id);
    if (!r) return;
    setBorrador(JSON.parse(JSON.stringify(r)));
    setModoForm('editar');
    // Solo las reglas de inicio (por variables) mantienen la fuente bloqueada.
    setFuenteBloqueada(r.momento === 'inicio');
    // Al editar, la regla ya vive en un momento: no se puede mover de ahí.
    setMomentoFijo(r.momento === 'inicio' ? null : r.momento);
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
    // El momento es el foco con el que se creó/edita la regla (momentoFijo) si
    // existe; solo se deriva del contenido cuando no hay foco (pregunta de la
    // 1ª condición, o inicio si es por variable). Anclar al foco permite
    // mezclar condiciones de preguntas y variables en la misma regla sin que,
    // al guardar, desaparezca del foco donde el usuario la está creando.
    const reglaFinal: Regla = { ...borrador, momento: momentoFijo ?? momentoDeRegla(borrador) };
    setReglas(prev => prev.some(r => r.id === reglaFinal.id)
      ? prev.map(r => r.id === reglaFinal.id ? reglaFinal : r)
      : [...prev, reglaFinal]);
    setModo('lista');
    setBorrador(null);
    message.success(modoForm === 'crear' ? 'Regla creada' : 'Regla actualizada');
  }

  // ── Huérfanas ──────────────────────────────────────────────────────────────
  // Huérfanas reales del estado guardado: siempre activo, no solo mientras se
  // edita un destino. Eliminar una regla "Ir a la pregunta" (o cambiar su
  // destino) puede dejar preguntas sin ningún camino de acceso igual que un
  // destino por defecto mal elegido, así que el canvas debe reflejarlo siempre.
  const sinAccesoReal = preguntasHuerfanas(reglas, destinos);
  // Huérfanas de PRUEBA: solo mientras se edita la barra de destino, para
  // validar el candidato antes de guardarlo (bloquea el botón "Guardar").
  const sinAccesoPrueba = editandoDestino && momentoActual ? preguntasSinAcceso(reglas, momentoActual, destinoPrueba, destinos) : [];
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
      {/* Split responsive: sidebar + canvas. La línea informativa (sección 2)
          vive dentro del panel visual (Canvas), no a lo ancho del módulo. */}
      <div className="flex flex-col xl:flex-row" style={{ flex: 1, minHeight: 0 }}>
        {/* Sidebar — altura acotada para que el formulario tenga scroll propio:
            en columna (<xl) comparte alto con el canvas (flex-1); en fila (xl)
            ancho fijo 576 y alto completo por stretch. Nunca height:auto, que
            rompería el scroll interno y ocultaría la consecuencia. */}
        <div
          className="w-full flex-1 min-h-0 xl:flex-none xl:w-[576px]"
          style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #f0f0f0' }}
        >
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {modo === 'lista' && (
              <SidebarList reglas={reglas} seleccion={seleccion} onCrear={crear} onEditar={editar} onEliminar={eliminar} />
            )}
            {modo === 'formulario' && borrador && (
              <SidebarForm
                borrador={borrador} modoForm={modoForm} reglas={reglas} fuenteBloqueada={fuenteBloqueada} momentoFijo={momentoFijo}
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
              sinAcceso={sinAccesoPrueba}
              onEditar={iniciarEdicionDestino}
              onCambioPrueba={setDestinoPrueba}
              onGuardar={guardarDestino}
              onCancelar={() => setEditandoDestino(false)}
            />
          )}
        </div>

        {/* Canvas — la línea informativa se muestra en todos los estados (incluido
            el vacío); si el usuario la cierra, no reaparece hasta la próxima sesión. */}
        <Canvas
          reglas={reglas} seleccion={seleccion} onSelect={seleccionar}
          preguntasSinAcceso={editandoDestino ? sinAccesoPrueba : sinAccesoReal}
          destinos={destinos} infoVisible={infoVisible} onDismissInfo={descartarInfo}
        />
      </div>

      {/* Previsualización de la encuesta con las lógicas aplicadas */}
      <PreviewModal
        abierto={previewAbierto} reglas={reglas} destinos={destinos}
        onCerrar={() => onCerrarPreview?.()}
      />
    </div>
  );
}
