import { Button, Switch, Empty } from 'antd';
import {
  PlusOutlined, EditOutlined, HistoryOutlined, ShareAltOutlined, EyeOutlined,
  HomeOutlined, AppstoreOutlined, SettingOutlined, LinkOutlined, GlobalOutlined,
} from '@ant-design/icons';
import { ESTUDIO, FLUJO, DESPEDIDAS, FlujoNodo } from '@/app/data/estudio';

const FONT = "'Roboto', sans-serif";

// ─── Vertical icon rail ───────────────────────────────────────────────────────

function Rail() {
  const iconBtn = (icon: React.ReactNode, active = false) => (
    <div style={{
      width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: active ? '#1890ff' : 'rgba(0,0,0,0.45)', background: active ? 'rgba(24,144,255,0.08)' : 'transparent',
      cursor: 'pointer', fontSize: 18,
    }}>
      {icon}
    </div>
  );
  return (
    <div style={{ width: 72, height: '100%', background: '#fff', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0, padding: '16px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 4, background: '#4338CA', boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.15)', marginBottom: 12 }} />
        {iconBtn(<HomeOutlined />)}
        {iconBtn(<AppstoreOutlined />, true)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {iconBtn(<SettingOutlined />)}
        {iconBtn(<LinkOutlined />)}
        {iconBtn(<GlobalOutlined />)}
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', marginTop: 4 }} />
      </div>
    </div>
  );
}

// ─── Topbar: breadcrumb + Studio Stepper + tools ──────────────────────────────

const STEPS = ['Estructura', 'Look&Feel', 'Variables', 'Lógica', 'Potenciadores', 'Envíos'];

function Topbar() {
  return (
    <div style={{ height: 59, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, background: '#fff' }}>

      {/* Breadcrumb + activo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: FONT, fontSize: 14, color: '#1890ff', cursor: 'pointer' }}>Miqui</span>
        <span style={{ color: 'rgba(0,0,0,0.25)' }}>›</span>
        <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>{ESTUDIO.nombre}</span>
        <EditOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', cursor: 'pointer' }} />
        <Switch checked={ESTUDIO.activo} checkedChildren="ACTIVO" unCheckedChildren="INACTIVO" style={{ background: ESTUDIO.activo ? '#52c41a' : undefined }} />
      </div>

      {/* Studio Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {STEPS.map((step, i) => {
          const active = step === 'Lógica';
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                fontFamily: FONT, fontSize: 14, padding: '19.6px 0',
                color: active ? '#1890ff' : 'rgba(0,0,0,0.45)',
                borderBottom: active ? '2px solid #1890ff' : '2px solid transparent',
                cursor: 'pointer',
              }}>
                {step}
              </span>
              {i < STEPS.length - 1 && <span style={{ color: '#f0f0f0' }}>|</span>}
            </div>
          );
        })}
      </div>

      {/* Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {[HistoryOutlined, ShareAltOutlined, EyeOutlined].map((Icon, i) => (
          <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(0,0,0,0.45)' }}>
            <Icon style={{ fontSize: 14 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar: reglas de lógica del estudio (estado vacío) ────────────────────

function LogicsSidebar() {
  return (
    <div style={{ width: 576, height: '100%', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#fff' }}>
      <div style={{ height: 50, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', flexShrink: 0 }}>
        <div>
          <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.85)', margin: 0, lineHeight: '16px' }}>
            Reglas de lógica del estudio
          </p>
          <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '4px 0 0 0', lineHeight: '14px' }}>
            Todavía no has creado ninguna.
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }}>
          Crear regla
        </Button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
              <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.85)' }}>
                Aún no hay reglas en este estudio.
              </span>
              <span style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>
                Selecciona una pregunta del diagrama, o usa Crear regla arriba, para configurar la primera.
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
}

// ─── Diagrama del flujo real del estudio ─────────────────────────────────────

function nodeStyle(tipo: FlujoNodo['tipo']) {
  if (tipo === 'bienvenida') return { border: '1px solid #C7D2FE', background: '#EEF2FF', color: '#4338CA' };
  if (tipo === 'despedida')  return { border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#059669' };
  return { border: '1px solid #d9d9d9', background: '#fff', color: 'rgba(0,0,0,0.85)' };
}

function FlowNode({ nodo }: { nodo: FlujoNodo }) {
  const s = nodeStyle(nodo.tipo);
  return (
    <div
      style={{
        minWidth: 200, padding: '8px 16px', borderRadius: 8, textAlign: 'center',
        fontFamily: FONT, fontSize: 14, fontWeight: 500, cursor: 'pointer',
        boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
        ...s,
      }}
    >
      {nodo.label}
    </div>
  );
}

function Connector() {
  return <div style={{ width: 1, height: 25, background: '#d9d9d9' }} />;
}

function DespedidasSinUsarPanel() {
  const sinUsar = DESPEDIDAS.filter(d => !d.usada);
  if (sinUsar.length === 0) return null;
  return (
    <div style={{
      position: 'absolute', top: 16, left: 24, width: 220,
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8,
      boxShadow: '0px 4px 6px rgba(15,23,42,0.07), 0px 2px 4px rgba(15,23,42,0.05)',
      padding: 12,
    }}>
      <p style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.65)', margin: '0 0 10px 0', lineHeight: '18px' }}>
        Despedidas sin usar en el flujo del estudio.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sinUsar.map(d => (
          <div key={d.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 100,
            padding: '5px 12px',
          }}>
            <LinkOutlined style={{ fontSize: 12, color: '#DC2626' }} />
            <span style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(0,0,0,0.85)' }}>{d.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SurveyDiagram() {
  return (
    <div style={{ flex: 1, position: 'relative', background: '#FAFAFA', overflow: 'auto' }}>
      <DespedidasSinUsarPanel />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
        {FLUJO.map((nodo, i) => (
          <div key={nodo.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FlowNode nodo={nodo} />
            {i < FLUJO.length - 1 && <Connector />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LogicaScreen() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#fff' }}>
      <Rail />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <LogicsSidebar />
          <SurveyDiagram />
        </div>
      </div>
    </div>
  );
}
