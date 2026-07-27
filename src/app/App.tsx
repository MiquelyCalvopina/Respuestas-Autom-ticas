import '@make-kits/ant-design-adaptado-para-plugthem/style.css';
import { useState } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { Toaster } from 'sonner';
import BoostersPage from "@/imports/BoostersPage/index";
import LogicaScreen from "@/imports/LogicaPage/index";

// Navegación entre pasos del estudio. En el prototipo solo están construidos los
// pasos "Lógica" y "Potenciadores"; se cambia entre ellos desde el tab del
// stepper del estudio (no hay switch de desarrollo).
type Step = 'potenciadores' | 'logica';

export default function App() {
  const [step, setStep] = useState<Step>('logica');

  return (
    <ConfigProvider locale={esES}>
      <AntApp>
        <div className="w-full h-screen overflow-hidden relative">
          <Toaster position="bottom-right" richColors />
          {step === 'logica'
            ? <LogicaScreen onGoPotenciadores={() => setStep('potenciadores')} />
            : <BoostersPage onGoLogica={() => setStep('logica')} />}
        </div>
      </AntApp>
    </ConfigProvider>
  );
}
