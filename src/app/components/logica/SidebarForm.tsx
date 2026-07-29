import { Select, Input, InputNumber, Segmented, Tooltip, Button, Tag, Popconfirm } from 'antd';
import {
  PREGUNTAS, VARIABLES_DETALLE, CANAL_RESPUESTA_VALORES, DESPEDIDAS, ESTUDIO, PAGINAS,
  preguntaById, variableByKey, esCondicionable, esRespondible, Pregunta,
} from '@/app/data/estudio';
import { BoxIcon, BoxIconName } from './boxicons';
import { Regla, Condicion, GrupoCondicion, Consecuencia, ConsecuenciaTipo, Momento, Conector } from './types';
import {
  operadoresPregunta, operadoresVariable, subSelectorDe, condicionLista,
  errorCondicion, esDominioValido, seleccionMultiple, normalizarDominio,
  SIN_VALOR, RANGO, LISTA_TAGS,
} from './catalog';
import { emptyCondicion, emptyGrupo, uid } from './seed';
import { momentoDeRegla, preguntasAfectables, paginasAfectables, errorDestino } from './derive';
import { SidebarHeader } from './SidebarHeader';

const FONT = "'Roboto', sans-serif";
const T85 = 'rgba(0,0,0,0.85)';
const T45 = 'rgba(0,0,0,0.45)';
const BORDER = '#f0f0f0';
const FIELD_BORDER = '#d9d9d9';

interface Props {
  borrador: Regla;
  modoForm: 'crear' | 'editar';
  reglas: Regla[];
  /** true solo en reglas de inicio (foco en Bienvenida): fuente fija a variable */
  fuenteBloqueada: boolean;
  /** id de pregunta al que queda fija la PRIMERA condición (foco activo), o null */
  momentoFijo: string | null;
  onChange: (r: Regla) => void;
  onGuardar: () => void;
  onCancelar: () => void;
  onVerEjemplos: () => void;
}

// ── Piezas de UI reutilizadas del lenguaje visual de RA / Figma ───────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
      <span style={{ fontFamily: FONT, fontSize: 12, color: T45, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

function RoundIconBtn({ icon, onClick, danger, title, rotate }: { icon: BoxIconName; onClick?: () => void; danger?: boolean; title: string; rotate?: number }) {
  return (
    <button
      type="button" onClick={onClick} title={title} aria-label={title}
      style={{
        width: 24, height: 24, borderRadius: 100, flexShrink: 0,
        background: '#fff', border: `1px solid ${FIELD_BORDER}`,
        boxShadow: '0px 2px 0px rgba(0,0,0,0.02)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? '#ff4d4f' : '#434343', transition: 'background .15s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(255,77,79,0.06)' : '#fafafa')}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
    >
      <BoxIcon name={icon} size={14} style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined} />
    </button>
  );
}

function YOToggle({ value, onChange }: { value: Conector; onChange: (v: Conector) => void }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.04)', padding: 4, borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {(['Y', 'O'] as const).map(opt => {
        const on = value === opt;
        return (
          <button
            key={opt} type="button" onClick={() => onChange(opt)}
            style={{
              background: on ? '#fff' : 'transparent',
              boxShadow: on ? '0px 2px 8px rgba(0,0,0,0.05)' : 'none',
              borderRadius: 100, border: 'none', cursor: 'pointer', padding: '4px 8px',
              color: on ? '#1890ff' : T45, fontFamily: FONT, fontSize: 12, lineHeight: 'normal',
              transition: 'all .15s',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// Estilos de campo compartidos
const fieldNarrow: React.CSSProperties = { flex: '0 0 auto', width: 176 };
const fieldWide: React.CSSProperties = { flex: '1 1 220px', minWidth: 180 };

// ── Etiquetas ──────────────────────────────────────────────────────────────
function tituloMomento(momento: Momento): string {
  if (momento === 'inicio') return 'Al iniciar la encuesta';
  const q = preguntaById(momento);
  return q ? `Al responder ${q.pnum}` : momento;
}
function labelPregunta(q: Pregunta): string {
  const full = `(${q.pnum}) ${q.texto}`;
  return full.length > 52 ? full.slice(0, 52) + '…' : full;
}

// ── Control de valor según tipo/operador ──────────────────────────────────────
function ValorControl({ c, q, onChange }: { c: Condicion; q?: Pregunta; onChange: (patch: Partial<Condicion>) => void }) {
  if (SIN_VALOR.has(c.operador)) return null;

  const esVariable = c.fuente === 'variable';
  const varTipo = esVariable ? variableByKey(c.campo)?.tipo : undefined;
  const esNumero = varTipo === 'numero' || (q && ['NPS', 'CSAT', 'CES', 'CLI', 'rating'].includes(q.tipo)) || (q?.tipo === 'matriz') || (q?.tipo === 'formulario' && q.campos?.find(f => f.key === c.subTipo)?.tipo === 'numero');
  const esFecha = varTipo === 'fecha' || (q?.tipo === 'formulario' && q.campos?.find(f => f.key === c.subTipo)?.tipo === 'fecha');

  if (q?.tipo === 'casilla') {
    return (
      <div style={fieldWide}>
        <Segmented block value={c.valor || 'acepto'} onChange={(v) => onChange({ valor: v as string })}
          options={[{ value: 'acepto', label: 'Aceptó' }, { value: 'no_acepto', label: 'No aceptó' }]} />
      </div>
    );
  }

  // Variable especial de lista cerrada (canal de respuesta): Es igual a / No
  // es igual a contra los medios posibles, no texto libre (estándar US138).
  if (varTipo === 'canal') {
    return <Select showSearch optionFilterProp="label" style={fieldWide} value={c.valor || undefined}
      onChange={(v) => onChange({ valor: v as string })}
      options={CANAL_RESPUESTA_VALORES.map(v => ({ value: v, label: v }))} placeholder="Elige un canal" />;
  }

  if (RANGO.has(c.operador)) {
    // Escala de pregunta → dos selects simples con las opciones (estándar).
    // Fecha → dos date pickers. Número (formulario/variable) → dos number inputs.
    const escalaOpts = (esNumero && q?.escala)
      ? Array.from({ length: q.escala[1] - q.escala[0] + 1 }, (_, k) => ({ value: String(q.escala![0] + k), label: String(q.escala![0] + k) }))
      : null;
    const extremo = (key: 'valor' | 'valorB', ph: string) => {
      if (escalaOpts) return <Select showSearch optionFilterProp="label" style={{ width: '100%' }} value={c[key] || undefined} onChange={(v) => onChange({ [key]: v as string })} options={escalaOpts} placeholder={ph} />;
      if (esFecha) return <Input type="date" value={c[key]} onChange={e => onChange({ [key]: e.target.value })} />;
      return <InputNumber style={{ width: '100%' }} value={c[key] === '' ? null : Number(c[key])} onChange={v => onChange({ [key]: v == null ? '' : String(v) })} placeholder={ph} />;
    };
    return (
      <div style={{ ...fieldWide, display: 'flex', alignItems: 'center', gap: 8 }}>
        {extremo('valor', 'Desde')}
        <span style={{ fontFamily: FONT, fontSize: 12, color: T45 }}>y</span>
        {extremo('valorB', 'Hasta')}
      </div>
    );
  }

  if (LISTA_TAGS.has(c.operador)) {
    const esDominio = c.operador.includes('dominios');
    return <Select mode="tags" style={fieldWide} value={c.valores}
      // En dominios se agrega el "@" inicial si falta (igual que Alertas).
      onChange={(v) => onChange({ valores: (v as string[]).map(x => (esDominio ? normalizarDominio(x) : x)) })}
      placeholder={esDominio ? 'Escribe un dominio y Enter (ej. @gmail.com)' : 'Escribe un valor y Enter'} tokenSeparators={[',', ';']} open={false} suffixIcon={null}
      tagRender={(props) => {
        const invalido = esDominio ? !esDominioValido(String(props.value)) : !String(props.value).trim();
        return (
          <Tag color={invalido ? 'error' : undefined} closable={props.closable} onClose={props.onClose} style={{ marginInlineEnd: 4 }}>
            {props.label}
          </Tag>
        );
      }} />;
  }

  // Simple vs. múltiple según el estándar (indicador/matriz "Es igual a" y modo
  // grupo → múltiple; opción simple / dropdown / sí-no / maxdiff → simple).
  const multiSel = q ? seleccionMultiple(q, c) : false;
  if (q?.opciones && (q.tipo.startsWith('seleccion') || q.tipo === 'dropdown' || q.tipo === 'si_no' || q.tipo === 'maxdiff' || q.tipo === 'ranking') && c.subTipo !== 'comentario') {
    // Opciones del usuario + adicionales del estándar según el tipo.
    const extras = q.tipo === 'seleccion_multiple' ? ['Otro', 'Ninguna de las anteriores', 'Seleccionar todas']
      : (q.tipo === 'seleccion_simple' || q.tipo === 'dropdown' || q.tipo === 'si_no') ? ['Otro', 'Ninguna de las anteriores']
      : [];
    const opts = [...q.opciones, ...extras].map(o => ({ value: o, label: o }));
    if (multiSel) return <Select mode="multiple" showSearch optionFilterProp="label" style={fieldWide} value={c.valores} onChange={(v) => onChange({ valores: v as string[] })} options={opts} placeholder="Elige una o más opciones" />;
    return <Select showSearch optionFilterProp="label" style={fieldWide} value={c.valor || undefined} onChange={(v) => onChange({ valor: v as string })} options={opts} placeholder="Elige una opción" />;
  }
  if (esNumero && q?.escala && multiSel) {
    const [min, max] = q.escala;
    const nums = Array.from({ length: max - min + 1 }, (_, k) => String(min + k));
    const opts = nums.concat('No aplica').map(n => ({ value: n, label: n }));
    return <Select mode="multiple" showSearch optionFilterProp="label" style={fieldWide} value={c.valores} onChange={(v) => onChange({ valores: v as string[] })} options={opts} placeholder="Elige uno o más valores" />;
  }
  if (esNumero && q?.escala) {
    const [min, max] = q.escala;
    const opts = Array.from({ length: max - min + 1 }, (_, k) => ({ value: String(min + k), label: String(min + k) }));
    return <Select showSearch optionFilterProp="label" style={fieldWide} value={c.valor || undefined} onChange={(v) => onChange({ valor: v as string })} options={opts} placeholder="Elige un valor" />;
  }
  if (esNumero) {
    return <InputNumber style={fieldWide} value={c.valor === '' ? null : Number(c.valor)} onChange={v => onChange({ valor: v == null ? '' : String(v) })} placeholder="0" />;
  }
  if (esFecha) {
    return <div style={fieldWide}><Input type="date" value={c.valor} onChange={e => onChange({ valor: e.target.value })} /></div>;
  }
  return <Input style={fieldWide} value={c.valor} maxLength={255} onChange={e => onChange({ valor: e.target.value })} placeholder="Escribe un valor…" />;
}

// ── Campos de una condición (flujo flex-wrap dentro del cuerpo de la tarjeta) ──
function CondFields({ c, bloqueada, onChange }: { c: Condicion; bloqueada: boolean; onChange: (patch: Partial<Condicion>) => void }) {
  const fuenteLocked = bloqueada;
  const q = c.fuente === 'response' ? preguntaById(c.campo) : undefined;
  const varTipo = c.fuente === 'variable' ? variableByKey(c.campo)?.tipo : undefined;
  const sub = q ? subSelectorDe(q) : null;
  const esMatriz = q?.tipo === 'matriz';
  const operadores = c.fuente === 'variable' ? (varTipo ? operadoresVariable(varTipo) : []) : (q ? operadoresPregunta(q, c) : []);
  const error = errorCondicion(c, q);
  const lista = condicionLista(c, q) && !error;
  const subResuelto = !sub || !!c.subTipo;
  const matrizResuelto = !esMatriz || !!c.filaMatriz;
  const mostrarOperador = !!c.campo && subResuelto && matrizResuelto && operadores.length > 0;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, width: '100%' }}>
      {/* Fuente */}
      <Select style={fieldNarrow} disabled={fuenteLocked} value={c.fuente}
        onChange={(v) => onChange({ fuente: v as 'response' | 'variable', campo: '', filaMatriz: undefined, modoMatriz: undefined, subTipo: undefined, operador: '', valor: '', valorB: '', valores: [] })}
        options={[{ value: 'response', label: 'La respuesta a' }, { value: 'variable', label: 'La variable' }]} />
      {/* Pregunta / variable — libre incluso con foco: el foco solo ancla en qué
          momento vive la regla (ver guardarForm), no restringe de dónde puede
          venir cada condición. Así se pueden mezclar condiciones de preguntas
          y de variables dentro de la misma regla. */}
      <Select showSearch optionFilterProp="label" style={fieldWide} value={c.campo || undefined}
        placeholder={c.fuente === 'variable' ? 'Selecciona una variable…' : 'Selecciona una pregunta…'}
        onChange={(v) => onChange({ campo: v as string, filaMatriz: undefined, modoMatriz: undefined, subTipo: undefined, operador: '', valor: '', valorB: '', valores: [] })}
        options={c.fuente === 'variable' ? [
          { label: 'Variables del estudio', options: VARIABLES_DETALLE.filter(v => !v.especial).map(v => ({ value: v.key, label: v.label })) },
          { label: 'Variables especiales', options: VARIABLES_DETALLE.filter(v => v.especial).map(v => ({ value: v.key, label: v.label })) },
        ] : PREGUNTAS.filter(esCondicionable).map(p => ({ value: p.id, label: labelPregunta(p) }))} />
      {/* Matriz fila */}
      {esMatriz && (
        <Select showSearch optionFilterProp="label" style={fieldWide} placeholder="Atributo/fila"
          value={c.filaMatriz} onChange={(v) => onChange({ filaMatriz: v as string, operador: '', valor: '', valorB: '', valores: [] })}
          options={(q?.filas ?? []).map(f => ({ value: f, label: f }))} />
      )}
      {/* Sin control "Por nota/Por grupo": en Lógica no se puede distinguir el
          grupo (se calcula post-sesión); las condiciones son siempre por nota. */}
      {/* Sub-selector */}
      {sub && (
        <Select showSearch optionFilterProp="label" style={fieldWide} placeholder={sub.label}
          value={c.subTipo} onChange={(v) => onChange({ subTipo: v as string, operador: '', valor: '', valorB: '', valores: [] })}
          options={sub.opciones} />
      )}
      {/* Operador */}
      {mostrarOperador && (
        <Select showSearch optionFilterProp="label" style={fieldNarrow} placeholder="Condición…"
          value={c.operador || undefined} onChange={(v) => onChange({ operador: v as string, valor: '', valorB: '', valores: [] })}
          options={operadores.map(o => ({ value: o, label: o }))} />
      )}
      {/* Valor */}
      {c.operador && <ValorControl c={c} q={q} onChange={onChange} />}
      {/* Validación: error de formato o "Condición lista" */}
      {error ? (
        <div style={{ flexBasis: '100%', display: 'flex', alignItems: 'center', gap: 4 }}>
          <BoxIcon name="bx-error-circle" size={14} color="#ff4d4f" />
          <span style={{ fontFamily: FONT, fontSize: 13, color: '#ff4d4f' }}>{error}</span>
        </div>
      ) : lista ? (
        <div style={{ flexBasis: '100%', display: 'flex', alignItems: 'center', gap: 4 }}>
          <BoxIcon name="bx-check-circle" size={14} color="#52c41a" />
          <span style={{ fontFamily: FONT, fontSize: 13, color: '#52c41a' }}>Condición lista</span>
        </div>
      ) : null}
    </div>
  );
}

// ── Cuerpo con borde azul de acento ───────────────────────────────────────────
function CondBody({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderLeft: '2px solid #bae7ff', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', boxSizing: 'border-box' }}>
      {children}
    </div>
  );
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fafafa', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${BORDER}`, width: '100%', boxSizing: 'border-box' }}>
      {children}
    </div>
  );
}
const cardStyle: React.CSSProperties = { border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', width: '100%' };

// ── Formulario ─────────────────────────────────────────────────────────────
export default function SidebarForm({ borrador, modoForm, reglas, fuenteBloqueada, momentoFijo, onChange, onGuardar, onCancelar, onVerEjemplos }: Props) {
  // Momento derivado del contenido (no del foco): la pregunta de la 1ª condición
  // o "inicio" si es por variable / aún sin elegir. Si hay foco (momentoFijo),
  // ese es el momento real al guardar —incluso si la 1ª condición termina
  // siendo de variable—, así que es el que se muestra en el encabezado.
  const momento = momentoDeRegla(borrador);
  const momentoMostrado: Momento = (momentoFijo ?? momento) as Momento;
  const primeraEsRespuesta = borrador.grupos[0]?.condiciones[0]?.fuente === 'response' && !!borrador.grupos[0]?.condiciones[0]?.campo;

  function setGrupos(grupos: GrupoCondicion[]) { onChange({ ...borrador, grupos }); }
  function updateCond(gi: number, ci: number, patch: Partial<Condicion>) {
    setGrupos(borrador.grupos.map((g, i) => i !== gi ? g : { ...g, condiciones: g.condiciones.map((c, j) => j !== ci ? c : { ...c, ...patch }) }));
  }
  function addHija(gi: number) {
    setGrupos(borrador.grupos.map((g, i) => {
      if (i !== gi) return g;
      const p = g.condiciones[0];
      const hija: Condicion = { ...emptyCondicion(p.fuente), id: uid('c'), fuente: p.fuente, campo: p.campo, filaMatriz: p.filaMatriz, modoMatriz: p.modoMatriz, subTipo: p.subTipo, operador: p.operador };
      return { ...g, condiciones: [...g.condiciones, hija], conectoresHijas: [...g.conectoresHijas, 'O'] };
    }));
  }
  function delHija(gi: number, ci: number) {
    setGrupos(borrador.grupos.map((g, i) => i !== gi ? g : { ...g, condiciones: g.condiciones.filter((_, j) => j !== ci), conectoresHijas: g.conectoresHijas.filter((_, j) => j !== ci - 1) }));
  }
  function setConectorHija(gi: number, k: number, val: Conector) {
    setGrupos(borrador.grupos.map((g, i) => i !== gi ? g : { ...g, conectoresHijas: g.conectoresHijas.map((c, j) => j !== k ? c : val) }));
  }
  function setConectorGrupo(gi: number, val: Conector) {
    setGrupos(borrador.grupos.map((g, i) => i !== gi ? g : { ...g, conector: val }));
  }
  function addGrupo() {
    const nuevo = emptyGrupo();
    nuevo.conector = 'Y';
    if (fuenteBloqueada) nuevo.condiciones[0].fuente = 'variable';
    setGrupos([...borrador.grupos, nuevo]);
  }
  function delGrupo(gi: number) { setGrupos(borrador.grupos.filter((_, i) => i !== gi)); }

  function setCons(patch: Partial<Consecuencia>) { onChange({ ...borrador, consecuencia: { ...borrador.consecuencia, ...patch } }); }

  const campoActual = borrador.grupos[0]?.condiciones[0]?.campo;
  const reusa = !!campoActual && reglas.some(r => r.id !== borrador.id && r.grupos.some(g => g.condiciones.some(c => c.campo === campoActual)));

  const qDe = (c: Condicion) => (c.fuente === 'response' ? preguntaById(c.campo) : undefined);
  const todasCompletas = borrador.grupos.every(g => g.condiciones.every(c => condicionLista(c, qDe(c))));
  const todasValidas = borrador.grupos.every(g => g.condiciones.every(c => !errorCondicion(c, qDe(c))));
  // Una regla solo puede afectar lo que el encuestado aún no ha visto: la
  // pregunta que la dispara y su página ya se mostraron. Se valida contra el
  // momento anclado (foco), no el derivado del contenido: con foco, la regla
  // se guardará en momentoFijo aunque su 1ª condición termine siendo de
  // variable (mezcla de condiciones, ítem 5).
  const errDestino = errorDestino(borrador, momentoFijo ?? undefined);
  const consecuenciaOk = !!borrador.consecuencia.destino && !errDestino;
  const puedeGuardar = todasCompletas && todasValidas && consecuenciaOk;
  const motivoBloqueo = !todasValidas ? 'Corrige las condiciones no válidas'
    : !todasCompletas ? 'Completa todas las condiciones'
    : errDestino ? 'Corrige el destino de la consecuencia'
    : !borrador.consecuencia.destino ? 'Elige el destino de la consecuencia' : '';

  // Opciones de destino, ya acotadas al alcance permitido por el momento anclado.
  const opcPregunta = (id: string) => {
    const q = preguntaById(id)!;
    return { value: id, label: `${q.pnum} · ${q.texto.slice(0, 22)}` };
  };
  const preguntasPosteriores = preguntasAfectables(momentoMostrado).map(n => opcPregunta(n.refId!));
  // "Hacer obligatoria" solo aplica a preguntas que se responden: una Expresión
  // es un elemento de presentación, no tiene respuesta que exigir.
  const preguntasObligables = preguntasAfectables(momentoMostrado)
    .filter(n => { const q = preguntaById(n.refId!); return !!q && esRespondible(q); })
    .map(n => opcPregunta(n.refId!));
  const paginasPosibles = paginasAfectables(momentoMostrado).map(p => ({ value: `pag_${p.n}`, label: p.nombre }));
  // Si el destino guardado quedó fuera de alcance (p. ej. al cambiar la pregunta
  // disparadora), se muestra como opción deshabilitada para que se lea el nombre
  // en vez del valor crudo — el error explica por qué no es válido.
  const conDestinoInvalido = <T extends { value: string; label: string }>(opts: T[], label: string) => {
    const d = borrador.consecuencia.destino;
    return d && !opts.some(o => o.value === d)
      ? [...opts, { value: d, label, disabled: true } as unknown as T]
      : opts;
  };
  const nombrePaginaDe = (destino?: string) => {
    const n = Number((destino ?? '').replace('pag_', ''));
    return PAGINAS.find(p => p.n === n)?.nombre ?? `Página ${n}`;
  };
  const despedidas = DESPEDIDAS.map(d => ({ value: d.id, label: d.nombre }));
  // "la página" se deshabilita si el estudio tiene una sola página o si no queda
  // ninguna página posterior a la pregunta que dispara la regla.
  const sinPaginasPosibles = paginasPosibles.length === 0;
  const paginaDeshabilitada = ESTUDIO.totalPaginas <= 1 || sinPaginasPosibles;
  const motivoPaginaDeshabilitada = ESTUDIO.totalPaginas <= 1
    ? 'No puedes ocultar la única página del estudio — dejaría un camino sin ninguna pregunta visible.'
    : 'No quedan páginas posteriores a la pregunta que dispara esta regla: su página y las anteriores ya se mostraron.';

  const CONS_HELP: Record<ConsecuenciaTipo, string> = {
    mostrar: 'La pregunta o página será visible únicamente si se cumple la condición.',
    ir_a: 'El encuestado saltará directamente a la pregunta seleccionada.',
    obligatoria: 'Cuando la condición se cumpla, la pregunta se vuelve obligatoria.',
    terminar: 'Cuando la condición se cumpla, se redirigirá a la página de despedida.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Encabezado estandarizado (Volver a la izquierda, acción a la derecha) */}
      <SidebarHeader
        onVolver={onCancelar}
        title={modoForm === 'crear' ? 'Nueva regla' : 'Editar regla'}
        subtitle={
          fuenteBloqueada || momentoFijo || primeraEsRespuesta
            ? <>Editando en <span style={{ color: T85 }}>{tituloMomento(momentoMostrado)}</span></>
            : <span style={{ color: T45 }}>Regla del estudio</span>
        }
        right={
          <button type="button" onClick={onVerEjemplos} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#1890ff', padding: 0, flexShrink: 0 }}>
            <BoxIcon name="bx-bulb" size={14} color="#1890ff" />
            <span style={{ fontFamily: FONT, fontSize: 14 }}>Ver ejemplos</span>
          </button>
        }
      />

      {/* Cuerpo scrolleable. El contenedor de scroll es un BLOQUE plano y el
          contenido va en un hijo flex: si el scroll fuera a la vez flex-column,
          su scrollHeight no incluye la última tarjeta y la consecuencia queda
          cortada e inalcanzable. */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
       <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionDivider label="Condición/es" />

        {borrador.grupos.map((g, gi) => (
          <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Tarjeta del grupo (condición padre) */}
            <div style={cardStyle}>
              <CardHeader>
                {gi === 0
                  ? <span style={{ fontFamily: FONT, fontSize: 14, color: T85, flex: 1 }}>Si:</span>
                  : <>
                      <YOToggle value={g.conector} onChange={(v) => setConectorGrupo(gi, v)} />
                      <span style={{ fontFamily: FONT, fontSize: 14, color: T85, flex: 1 }}>se cumple que…</span>
                    </>}
                <RoundIconBtn icon="bx-git-branch" rotate={90} title="Agregar sub-condición" onClick={() => addHija(gi)} />
                {borrador.grupos.length > 1 && (
                  <Popconfirm
                    title="¿Eliminar esta condición?"
                    okText="Sí, eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}
                    onConfirm={() => delGrupo(gi)}
                  >
                    <span><RoundIconBtn icon="bx-trash" danger title="Eliminar condición" /></span>
                  </Popconfirm>
                )}
              </CardHeader>
              <CondBody>
                <CondFields c={g.condiciones[0]} bloqueada={fuenteBloqueada} onChange={(p) => updateCond(gi, 0, p)} />
                {/* Sub-condiciones anidadas */}
                {g.condiciones.slice(1).map((h, k) => (
                  <div key={h.id} style={{ ...cardStyle, marginLeft: 16 }}>
                    <CardHeader>
                      <YOToggle value={g.conectoresHijas[k] ?? 'O'} onChange={(v) => setConectorHija(gi, k, v)} />
                      <span style={{ fontFamily: FONT, fontSize: 14, color: T85, flex: 1 }}>se cumple que…</span>
                      <Popconfirm
                        title="¿Eliminar esta sub-condición?"
                        okText="Sí, eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}
                        onConfirm={() => delHija(gi, k + 1)}
                      >
                        <span><RoundIconBtn icon="bx-trash" danger title="Eliminar sub-condición" /></span>
                      </Popconfirm>
                    </CardHeader>
                    <CondBody>
                      <CondFields c={h} bloqueada={fuenteBloqueada} onChange={(p) => updateCond(gi, k + 1, p)} />
                    </CondBody>
                  </div>
                ))}
                {/* Reuso */}
                {gi === 0 && reusa && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: '#E6F7FF', border: '1px solid #BAE7FF', borderRadius: 6, padding: '6px 8px' }}>
                    <BoxIcon name="bx-info-circle" size={14} color="#0050B3" style={{ marginTop: 1 }} />
                    <span style={{ fontFamily: FONT, fontSize: 12, color: '#0050B3', lineHeight: '16px' }}>Ya tienes otra regla que usa esta pregunta. Se evaluarán en orden, de arriba hacia abajo.</span>
                  </div>
                )}
              </CondBody>
            </div>
          </div>
        ))}

        {/* Agregar condición */}
        <button type="button" onClick={addGrupo}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', border: '1px dashed #69c0ff', borderRadius: 8, background: '#fff', padding: '8px 9px', cursor: 'pointer', color: '#1890ff', boxShadow: '0px 2px 0px rgba(0,0,0,0.02)' }}>
          <BoxIcon name="bx-plus" size={14} color="#1890ff" />
          <span style={{ fontFamily: FONT, fontSize: 14 }}>Agregar condición</span>
        </button>

        <SectionDivider label="Consecuencia" />

        {/* Tarjeta Entonces */}
        <div style={cardStyle}>
          <CardHeader>
            <span style={{ fontFamily: FONT, fontSize: 14, color: T85, flex: 1 }}>Entonces:</span>
          </CardHeader>
          <CondBody>
            {/* Ayuda con "?" */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 100, background: '#e6f7ff', flexShrink: 0 }}>
                <BoxIcon name="bx-question-mark" size={12} color={T45} />
              </span>
              <span style={{ fontFamily: FONT, fontSize: 12, color: T45, lineHeight: '16px' }}>{CONS_HELP[borrador.consecuencia.tipo]}</span>
            </div>
            {/* Tipo de consecuencia */}
            <Select value={borrador.consecuencia.tipo} style={{ width: '100%' }}
              onChange={(v) => setCons({ tipo: v as ConsecuenciaTipo, destino: undefined, destinoClase: v === 'mostrar' ? 'pregunta' : undefined })}
              options={[
                { value: 'mostrar', label: 'Mostrar' },
                { value: 'ir_a', label: 'Ir a la pregunta' },
                { value: 'obligatoria', label: 'Hacer pregunta obligatoria' },
                { value: 'terminar', label: 'Terminar encuesta' },
              ]} />
            {/* Destino — acotado a lo que el encuestado aún no ha visto */}
            {borrador.consecuencia.tipo === 'mostrar' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, width: '100%' }}>
                <Select value={borrador.consecuencia.destinoClase ?? 'pregunta'}
                  onChange={(v) => setCons({ destinoClase: v as 'pregunta' | 'pagina', destino: undefined })}
                  options={[
                    { value: 'pregunta', label: 'la pregunta' },
                    { value: 'pagina', label: paginaDeshabilitada ? <Tooltip title={motivoPaginaDeshabilitada}>la página</Tooltip> : 'la página', disabled: paginaDeshabilitada },
                  ]} />
                {borrador.consecuencia.destinoClase !== 'pagina'
                  ? <Select showSearch optionFilterProp="label" placeholder="Pregunta a mostrar" value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })}
                      options={conDestinoInvalido(preguntasPosteriores, preguntaById(borrador.consecuencia.destino ?? '')?.pnum ?? (borrador.consecuencia.destino ?? ''))} />
                  : <Select showSearch optionFilterProp="label" placeholder="Página a mostrar" value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })}
                      options={conDestinoInvalido(paginasPosibles, nombrePaginaDe(borrador.consecuencia.destino))} />}
              </div>
            ) : borrador.consecuencia.tipo === 'ir_a' ? (
              <Select showSearch optionFilterProp="label" style={{ width: '100%' }} placeholder="Pregunta destino (no puede retroceder)" value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })} options={preguntasPosteriores} />
            ) : borrador.consecuencia.tipo === 'obligatoria' ? (
              <Select showSearch optionFilterProp="label" style={{ width: '100%' }} placeholder="Pregunta que se vuelve obligatoria" value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })} options={preguntasObligables} />
            ) : (
              <Select showSearch optionFilterProp="label" style={{ width: '100%' }} placeholder="Despedida" value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })} options={despedidas} />
            )}
            {/* Error de alcance: el destino ya se mostró (p. ej. su propia página) */}
            {errDestino && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, width: '100%' }}>
                <BoxIcon name="bx-error-circle" size={14} color="#ff4d4f" style={{ marginTop: 2 }} />
                <span style={{ fontFamily: FONT, fontSize: 13, color: '#ff4d4f', lineHeight: '18px' }}>{errDestino}</span>
              </div>
            )}
            {/* Aviso cuando la regla no puede afectar nada posterior */}
            {preguntasPosteriores.length === 0 && borrador.consecuencia.tipo !== 'terminar' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, width: '100%' }}>
                <BoxIcon name="bx-info-circle" size={14} color={T45} style={{ marginTop: 2 }} />
                <span style={{ fontFamily: FONT, fontSize: 12, color: T45, lineHeight: '17px' }}>
                  Esta es la última pregunta del flujo: no hay preguntas posteriores que afectar. Usa “Terminar encuesta”.
                </span>
              </div>
            )}
          </CondBody>
        </div>
       </div>
      </div>

      {/* Pie */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '12px 24px', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0, boxShadow: '0px -3px 8px rgba(0,0,0,0.04)' }}>
        {!puedeGuardar && <span style={{ fontFamily: FONT, fontSize: 12, color: T45, marginRight: 'auto' }}>{motivoBloqueo}</span>}
        <Button onClick={onCancelar}>Cancelar</Button>
        <Button type="primary" disabled={!puedeGuardar} onClick={onGuardar}>Guardar</Button>
      </div>
    </div>
  );
}
