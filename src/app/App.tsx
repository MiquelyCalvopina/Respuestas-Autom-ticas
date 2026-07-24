import '@make-kits/ant-design-adaptado-para-plugthem/style.css';
import { useState } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { Toaster } from 'sonner';
import BoostersPage from "@/imports/BoostersPage/index";
import LogicaScreen from "@/imports/LogicaPage/index";

// Switcher temporal de desarrollo entre los módulos que se están construyendo.
// Quitar cuando Lógica tenga su propio punto de entrada en el shell real.
type DevScreen = 'potenciadores' | 'logica';

export default function App() {
  const [screen, setScreen] = useState<DevScreen>('logica');

  return (
    <ConfigProvider locale={esES}>
      <AntApp>
        <div className="w-full h-screen overflow-hidden relative">
          <Toaster position="bottom-right" richColors />
          <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 1000, display: 'flex', gap: 4, background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setScreen('logica')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, background: screen === 'logica' ? '#1890ff' : 'transparent', color: screen === 'logica' ? '#fff' : 'rgba(0,0,0,0.65)' }}>Lógica</button>
            <button onClick={() => setScreen('potenciadores')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, background: screen === 'potenciadores' ? '#1890ff' : 'transparent', color: screen === 'potenciadores' ? '#fff' : 'rgba(0,0,0,0.65)' }}>Potenciadores</button>
          </div>
          {screen === 'logica' ? <LogicaScreen /> : <BoostersPage />}
        </div>
      </AntApp>
    </ConfigProvider>
  );
}
