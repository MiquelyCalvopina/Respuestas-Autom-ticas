import { Select, Input, InputNumber, Segmented, Tooltip, Button } from 'antd';
import {
  PREGUNTAS, VARIABLES_DETALLE, DESPEDIDAS, FLUJO, ESTUDIO,
  preguntaById, variableByKey, Pregunta,
} from '@/app/data/estudio';
import { BoxIcon } from './boxicons';
import { Regla, Condicion, GrupoCondicion, Consecuencia, ConsecuenciaTipo, Momento } from './types';
import {
  operadoresPregunta, operadoresVariable, subSelectorDe, condicionLista, tieneModoNotaGrupo,
  SIN_VALOR, RANGO, LISTA_TAGS, MULTI_IGUALDAD,
} from './catalog';
import { emptyCondicion, emptyGrupo, uid } from './seed';
import { nodoDeMomento } from './derive';

const FONT = "'Roboto', sans-serif";
const selStyle: React.CSSProperties = { width: '100%' };

interface Props {
  borrador: Regla;
  modoForm: 'crear' | 'editar';
  reglas: Regla[];
  onChange: (r: Regla) => void;
  onGuardar: () => void;
  onCancelar: () => void;
  onVerEjemplos: () => void;
}

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
  const esNumero = varTipo === 'numero' || (q && ['NPS', 'CSAT', 'CES', 'CLI', 'rating'].includes(q.tipo)) || (q?.tipo === 'matriz' && c.modoMatriz === 'nota') || (q?.tipo === 'formulario' && q.campos?.find(f => f.key === c.subTipo)?.tipo === 'numero');
  const esFecha = varTipo === 'fecha' || (q?.tipo === 'formulario' && q.campos?.find(f => f.key === c.subTipo)?.tipo === 'fecha');

  // Casilla → radio Aceptó/No aceptó
  if (q?.tipo === 'casilla') {
    return (
      <Segmented
        block
        value={c.valor || 'acepto'}
        onChange={(v) => onChange({ valor: v as string })}
        options={[{ value: 'acepto', label: 'Aceptó' }, { value: 'no_acepto', label: 'No aceptó' }]}
      />
    );
  }

  // Rango → dos controles
  if (RANGO.has(c.operador)) {
    const inputA = esFecha
      ? <Input type="date" value={c.valor} onChange={e => onChange({ valor: e.target.value })} />
      : <InputNumber style={{ width: '100%' }} value={c.valor === '' ? null : Number(c.valor)} onChange={v => onChange({ valor: v == null ? '' : String(v) })} placeholder="Desde" />;
    const inputB = esFecha
      ? <Input type="date" value={c.valorB} onChange={e => onChange({ valorB: e.target.value })} />
      : <InputNumber style={{ width: '100%' }} value={c.valorB === '' ? null : Number(c.valorB)} onChange={v => onChange({ valorB: v == null ? '' : String(v) })} placeholder="Hasta" />;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>{inputA}</div>
        <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>y</span>
        <div style={{ flex: 1 }}>{inputB}</div>
      </div>
    );
  }

  // Tags (lista / dominios)
  if (LISTA_TAGS.has(c.operador)) {
    const esDominio = c.operador.includes('dominios');
    return (
      <Select
        mode="tags" style={selStyle} value={c.valores} onChange={(v) => onChange({ valores: v as string[] })}
        placeholder={esDominio ? 'Escribe un dominio y Enter (ej. @gmail.com)' : 'Escribe un valor y Enter'}
        tokenSeparators={[',', ';']} open={false} suffixIcon={null}
      />
    );
  }

  // Igualdad múltiple sobre opciones / grupos / escala
  const esMulti = MULTI_IGUALDAD.has(c.operador);
  // grupos (indicador NPS/CSAT/CES/CLI o Matriz, en modo "Por grupo")
  const modoGrupo = c.modoMatriz === 'grupo' && !!q?.grupos;
  if (modoGrupo) {
    const opts = (q!.grupos ?? []).concat('No aplica').map(g => ({ value: g, label: g }));
    return <Select mode="multiple" showSearch optionFilterProp="label" style={selStyle} value={c.valores} onChange={(v) => onChange({ valores: v as string[] })} options={opts} placeholder="Elige uno o más grupos" />;
  }
  // opciones de selección
  if (q?.opciones && (q.tipo.startsWith('seleccion') || q.tipo === 'dropdown' || q.tipo === 'maxdiff' || q.tipo === 'ranking') && c.subTipo !== 'comentario') {
    const opts = q.opciones.map(o => ({ value: o, label: o }));
    if (esMulti) return <Select mode="multiple" showSearch optionFilterProp="label" style={selStyle} value={c.valores} onChange={(v) => onChange({ valores: v as string[] })} options={opts} placeholder="Elige una o más opciones" />;
    return <Select showSearch optionFilterProp="label" style={selStyle} value={c.valor || undefined} onChange={(v) => onChange({ valor: v as string })} options={opts} placeholder="Elige una opción" />;
  }
  // escala numérica (igualdad múltiple con No aplica)
  if (esNumero && q?.escala && esMulti) {
    const [min, max] = q.escala;
    const nums = Array.from({ length: max - min + 1 }, (_, k) => String(min + k));
    const opts = nums.concat('No aplica').map(n => ({ value: n, label: n }));
    return <Select mode="multiple" showSearch optionFilterProp="label" style={selStyle} value={c.valores} onChange={(v) => onChange({ valores: v as string[] })} options={opts} placeholder="Elige uno o más valores" />;
  }
  // escala numérica comparación (un valor)
  if (esNumero && q?.escala) {
    const [min, max] = q.escala;
    const opts = Array.from({ length: max - min + 1 }, (_, k) => ({ value: String(min + k), label: String(min + k) }));
    return <Select showSearch optionFilterProp="label" style={selStyle} value={c.valor || undefined} onChange={(v) => onChange({ valor: v as string })} options={opts} placeholder="Elige un valor" />;
  }
  // número libre (variable / campo número)
  if (esNumero) {
    return <InputNumber style={{ width: '100%' }} value={c.valor === '' ? null : Number(c.valor)} onChange={v => onChange({ valor: v == null ? '' : String(v) })} placeholder="0" />;
  }
  // fecha
  if (esFecha) {
    return <Input type="date" value={c.valor} onChange={e => onChange({ valor: e.target.value })} />;
  }
  // texto
  return <Input value={c.valor} maxLength={255} onChange={e => onChange({ valor: e.target.value })} placeholder="Escribe un valor…" />;
}

// ── Editor de una condición ────────────────────────────────────────────────
function CondicionEditor({ c, momento, onChange }: { c: Condicion; momento: Momento; onChange: (patch: Partial<Condicion>) => void }) {
  const fuenteLocked = momento === 'inicio';
  const q = c.fuente === 'response' ? preguntaById(c.campo) : undefined;
  const varTipo = c.fuente === 'variable' ? variableByKey(c.campo)?.tipo : undefined;

  const sub = q ? subSelectorDe(q) : null;
  const esMatriz = q?.tipo === 'matriz';
  const conModo = q ? tieneModoNotaGrupo(q) : false; // indicador NPS/CSAT/CES/CLI o Matriz

  const operadores = c.fuente === 'variable'
    ? (varTipo ? operadoresVariable(varTipo) : [])
    : (q ? operadoresPregunta(q, c) : []);

  const lista = condicionLista(c, q);

  // ¿mostrar operador? necesita: campo + (matriz: fila) + (sub-selector resuelto si aplica).
  // El modo nota/grupo por defecto es "nota", así que no bloquea.
  const subResuelto = !sub || !!c.subTipo;
  const matrizResuelto = !esMatriz || !!c.filaMatriz;
  const mostrarOperador = !!c.campo && subResuelto && matrizResuelto && operadores.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Fuente */}
      <Select
        showSearch={false} disabled={fuenteLocked} value={c.fuente} style={selStyle}
        onChange={(v) => onChange({ fuente: v as 'response' | 'variable', campo: '', filaMatriz: undefined, modoMatriz: undefined, subTipo: undefined, operador: '', valor: '', valorB: '', valores: [] })}
        options={[{ value: 'response', label: 'La respuesta a' }, { value: 'variable', label: 'La variable' }]}
      />
      {/* Pregunta / variable */}
      <Select
        showSearch optionFilterProp="label" style={selStyle}
        value={c.campo || undefined}
        placeholder={c.fuente === 'variable' ? 'Selecciona una variable…' : 'Selecciona una pregunta…'}
        onChange={(v) => onChange({ campo: v as string, filaMatriz: undefined, modoMatriz: undefined, subTipo: undefined, operador: '', valor: '', valorB: '', valores: [] })}
        options={c.fuente === 'variable'
          ? VARIABLES_DETALLE.map(v => ({ value: v.key, label: v.label }))
          : PREGUNTAS.map(p => ({ value: p.id, label: labelPregunta(p) }))}
      />
      {/* Matriz: atributo/fila primero */}
      {esMatriz && (
        <Select
          showSearch optionFilterProp="label" style={selStyle} placeholder="Elige el atributo/fila"
          value={c.filaMatriz} onChange={(v) => onChange({ filaMatriz: v as string, operador: '', valor: '', valorB: '', valores: [] })}
          options={(q?.filas ?? []).map(f => ({ value: f, label: f }))}
        />
      )}
      {/* Segmented Por nota / Por grupo — indicadores y Matriz (tras elegir fila) */}
      {conModo && (!esMatriz || !!c.filaMatriz) && (
        <Segmented
          block value={c.modoMatriz ?? 'nota'}
          onChange={(v) => onChange({ modoMatriz: v as 'nota' | 'grupo', operador: '', valor: '', valorB: '', valores: [] })}
          options={[{ value: 'nota', label: 'Por nota' }, { value: 'grupo', label: 'Por grupo' }]}
        />
      )}
      {/* Sub-selector (formulario/opcion-comentario/maxdiff) */}
      {sub && (
        <Select
          showSearch optionFilterProp="label" style={selStyle} placeholder={sub.label}
          value={c.subTipo} onChange={(v) => onChange({ subTipo: v as string, operador: '', valor: '', valorB: '', valores: [] })}
          options={sub.opciones}
        />
      )}
      {/* Operador */}
      {mostrarOperador && (
        <Select
          showSearch optionFilterProp="label" style={selStyle} placeholder="Condición…"
          value={c.operador || undefined} onChange={(v) => onChange({ operador: v as string, valor: '', valorB: '', valores: [] })}
          options={operadores.map(o => ({ value: o, label: o }))}
        />
      )}
      {/* Valor */}
      {c.operador && <ValorControl c={c} q={q} onChange={onChange} />}
      {/* Feedback */}
      {lista && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BoxIcon name="bx-check" size={14} color="#52c41a" />
          <span style={{ fontFamily: FONT, fontSize: 12, color: '#52c41a' }}>Condición lista</span>
        </div>
      )}
    </div>
  );
}

// ── Formulario ─────────────────────────────────────────────────────────────
export default function SidebarForm({ borrador, modoForm, reglas, onChange, onGuardar, onCancelar, onVerEjemplos }: Props) {
  const momento = borrador.momento;

  // Actualizadores inmutables de grupos
  function setGrupos(grupos: GrupoCondicion[]) { onChange({ ...borrador, grupos }); }
  function updateCond(gi: number, ci: number, patch: Partial<Condicion>) {
    setGrupos(borrador.grupos.map((g, i) => i !== gi ? g : { ...g, condiciones: g.condiciones.map((c, j) => j !== ci ? c : { ...c, ...patch }) }));
  }
  function addHija(gi: number) {
    setGrupos(borrador.grupos.map((g, i) => {
      if (i !== gi) return g;
      const padre = g.condiciones[0];
      const hija: Condicion = { ...emptyCondicion(padre.fuente), id: uid('c'), fuente: padre.fuente, campo: padre.campo, filaMatriz: padre.filaMatriz, modoMatriz: padre.modoMatriz, subTipo: padre.subTipo, operador: padre.operador };
      return { ...g, condiciones: [...g.condiciones, hija], conectoresHijas: [...g.conectoresHijas, 'O'] };
    }));
  }
  function delHija(gi: number, ci: number) {
    setGrupos(borrador.grupos.map((g, i) => {
      if (i !== gi) return g;
      return { ...g, condiciones: g.condiciones.filter((_, j) => j !== ci), conectoresHijas: g.conectoresHijas.filter((_, j) => j !== ci - 1) };
    }));
  }
  function setConectorHija(gi: number, hijaIdx: number, val: 'Y' | 'O') {
    setGrupos(borrador.grupos.map((g, i) => i !== gi ? g : { ...g, conectoresHijas: g.conectoresHijas.map((c, j) => j !== hijaIdx ? c : val) }));
  }
  function addGrupo() {
    const nuevo = emptyGrupo();
    if (momento === 'inicio') nuevo.condiciones[0].fuente = 'variable';
    setGrupos([...borrador.grupos, nuevo]);
  }
  function delGrupo(gi: number) { setGrupos(borrador.grupos.filter((_, i) => i !== gi)); }

  // Consecuencia
  function setCons(patch: Partial<Consecuencia>) { onChange({ ...borrador, consecuencia: { ...borrador.consecuencia, ...patch } }); }

  // Reuso: ¿alguna otra regla usa el mismo campo?
  const campoActual = borrador.grupos[0]?.condiciones[0]?.campo;
  const reusa = !!campoActual && reglas.some(r => r.id !== borrador.id && r.grupos.some(g => g.condiciones.some(c => c.campo === campoActual)));

  // Validación de guardado
  const todasListas = borrador.grupos.every(g => g.condiciones.every(c => condicionLista(c, c.fuente === 'response' ? preguntaById(c.campo) : undefined)));
  const consecuenciaOk = borrador.consecuencia.tipo === 'mostrar'
    ? (!!borrador.consecuencia.destino || borrador.consecuencia.destinoClase === 'pagina')
    : !!borrador.consecuencia.destino;
  const puedeGuardar = todasListas && consecuenciaOk;
  const motivoBloqueo = !todasListas ? 'Completa todas las condiciones' : !consecuenciaOk ? 'Elige el destino de la consecuencia' : '';

  // Destinos para consecuencia
  const nodoMomento = nodoDeMomento(momento);
  const iMomento = nodoMomento ? FLUJO.indexOf(nodoMomento) : -1;
  const preguntasPosteriores = FLUJO.filter((n, i) => n.tipo === 'pregunta' && i > iMomento).map(n => ({ value: n.refId!, label: preguntaById(n.refId!)!.pnum + ' · ' + (preguntaById(n.refId!)!.texto.slice(0, 24)) }));
  const todasPreguntas = PREGUNTAS.map(q => ({ value: q.id, label: `${q.pnum} · ${q.texto.slice(0, 24)}` }));
  const despedidas = DESPEDIDAS.map(d => ({ value: d.id, label: d.nombre }));
  const paginaUnica = ESTUDIO.totalPaginas <= 1;

  const CONS_HELP: Record<ConsecuenciaTipo, string> = {
    mostrar: 'La pregunta o página será visible únicamente si se cumple la condición.',
    ir_a: 'El encuestado saltará directamente a la pregunta seleccionada.',
    obligatoria: 'Cuando la condición se cumpla, la pregunta se vuelve obligatoria.',
    terminar: 'Cuando la condición se cumpla, se redirigirá a la página de despedida.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Encabezado */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={onCancelar} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: '#1890ff', padding: 0 }}>
            <BoxIcon name="bx-arrow-back" size={15} color="#1890ff" />
            <span style={{ fontFamily: FONT, fontSize: 13 }}>{modoForm === 'crear' ? 'Nueva regla' : 'Editar regla'}</span>
          </button>
          <button type="button" onClick={onVerEjemplos} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#1890ff', padding: 0 }}>
            <BoxIcon name="bx-bulb" size={14} color="#1890ff" />
            <span style={{ fontFamily: FONT, fontSize: 13 }}>Ver ejemplos</span>
          </button>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '8px 0 0 0' }}>Editando en <strong style={{ color: 'rgba(0,0,0,0.65)' }}>{tituloMomento(momento)}</strong></p>
      </div>

      {/* Cuerpo scrolleable */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Condiciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 11, letterSpacing: 0.4, color: 'rgba(0,0,0,0.35)' }}>SI SE CUMPLE</span>
          {borrador.grupos.map((g, gi) => (
            <div key={g.id}>
              {gi > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.45)', background: '#f0f0f0', borderRadius: 999, padding: '2px 12px' }}>Y</span>
                </div>
              )}
              <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
                {/* Padre */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <CondicionEditor c={g.condiciones[0]} momento={momento} onChange={(p) => updateCond(gi, 0, p)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <IconSq icon="bx-git-branch" title="Agregar sub-condición" onClick={() => addHija(gi)} />
                    {borrador.grupos.length > 1 && <IconSq icon="bx-trash" danger title="Eliminar condición" onClick={() => delGrupo(gi)} />}
                  </div>
                </div>
                {/* Hijas */}
                {g.condiciones.slice(1).map((h, k) => {
                  const ci = k + 1;
                  return (
                    <div key={h.id} style={{ borderLeft: '2px solid #bae7ff', paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Segmented size="small" value={g.conectoresHijas[k] ?? 'O'} onChange={(v) => setConectorHija(gi, k, v as 'Y' | 'O')} options={[{ value: 'Y', label: 'Y' }, { value: 'O', label: 'O' }]} />
                        <span style={{ flex: 1 }} />
                        <IconSq icon="bx-trash" danger title="Eliminar sub-condición" onClick={() => delHija(gi, ci)} />
                      </div>
                      <CondicionEditor c={h} momento={momento} onChange={(p) => updateCond(gi, ci, p)} />
                    </div>
                  );
                })}
                {/* Reuso (solo bajo el primer grupo) */}
                {gi === 0 && reusa && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', background: '#E6F7FF', border: '1px solid #BAE7FF', borderRadius: 6, padding: '6px 8px' }}>
                    <BoxIcon name="bx-info-circle" size={14} color="#0050B3" style={{ marginTop: 1 }} />
                    <span style={{ fontFamily: FONT, fontSize: 12, color: '#0050B3', lineHeight: '16px' }}>Ya tienes otra regla que usa esta pregunta. Se evaluarán en orden, de arriba hacia abajo.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Agregar condición padre */}
          <button
            type="button" onClick={addGrupo}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', border: '1px dashed #69c0ff', borderRadius: 8, background: '#fff', padding: '8px', cursor: 'pointer', color: '#1890ff' }}
          >
            <BoxIcon name="bx-plus" size={14} color="#1890ff" />
            <span style={{ fontFamily: FONT, fontSize: 14 }}>Agregar condición</span>
          </button>
        </div>

        {/* Entonces */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 11, letterSpacing: 0.4, color: 'rgba(0,0,0,0.35)' }}>ENTONCES</span>
          <Select
            value={borrador.consecuencia.tipo} style={selStyle}
            onChange={(v) => setCons({ tipo: v as ConsecuenciaTipo, destino: undefined, destinoClase: v === 'mostrar' ? 'pregunta' : undefined })}
            options={[
              { value: 'mostrar', label: 'Mostrar' },
              { value: 'ir_a', label: 'Ir a la pregunta' },
              { value: 'obligatoria', label: 'Hacer pregunta obligatoria' },
              { value: 'terminar', label: 'Terminar encuesta' },
            ]}
          />
          <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: '16px' }}>{CONS_HELP[borrador.consecuencia.tipo]}</p>

          {borrador.consecuencia.tipo === 'mostrar' && (
            <>
              <Segmented
                block value={borrador.consecuencia.destinoClase ?? 'pregunta'}
                onChange={(v) => setCons({ destinoClase: v as 'pregunta' | 'pagina', destino: undefined })}
                options={[
                  { value: 'pregunta', label: 'Preguntas' },
                  { value: 'pagina', label: paginaUnica ? <Tooltip title="No puedes ocultar la única página del estudio — dejaría un camino sin ninguna pregunta visible.">Páginas</Tooltip> : 'Páginas', disabled: paginaUnica },
                ]}
              />
              {borrador.consecuencia.destinoClase !== 'pagina' && (
                <Select showSearch optionFilterProp="label" style={selStyle} placeholder="Pregunta a mostrar"
                  value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })} options={todasPreguntas} />
              )}
            </>
          )}
          {borrador.consecuencia.tipo === 'ir_a' && (
            <Select showSearch optionFilterProp="label" style={selStyle} placeholder="Pregunta destino (no puede retroceder)"
              value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })} options={preguntasPosteriores} />
          )}
          {borrador.consecuencia.tipo === 'obligatoria' && (
            <Select showSearch optionFilterProp="label" style={selStyle} placeholder="Pregunta que se vuelve obligatoria"
              value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })} options={todasPreguntas} />
          )}
          {borrador.consecuencia.tipo === 'terminar' && (
            <Select showSearch optionFilterProp="label" style={selStyle} placeholder="Despedida"
              value={borrador.consecuencia.destino} onChange={(v) => setCons({ destino: v as string })} options={despedidas} />
          )}
        </div>
      </div>

      {/* Pie */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: 12, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
        {!puedeGuardar && <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)', marginRight: 'auto' }}>{motivoBloqueo}</span>}
        <Button onClick={onCancelar}>Cancelar</Button>
        <Button type="primary" disabled={!puedeGuardar} onClick={onGuardar}>Guardar</Button>
      </div>
    </div>
  );
}

function IconSq({ icon, onClick, danger, title }: { icon: 'bx-git-branch' | 'bx-trash'; onClick: () => void; danger?: boolean; title: string }) {
  return (
    <button
      type="button" onClick={onClick} title={title} aria-label={title}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: '1px solid #f0f0f0', background: '#fff', cursor: 'pointer', color: danger ? '#ff4d4f' : 'rgba(0,0,0,0.65)', transition: 'background .15s ease' }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(255,77,79,0.08)' : 'rgba(0,0,0,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
    >
      <BoxIcon name={icon} size={15} />
    </button>
  );
}
