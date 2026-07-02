import '@make-kits/ant-design-adaptado-para-plugthem/style.css';
import { App as AntApp, ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { Toaster } from 'sonner';
import BoostersPage from "@/imports/BoostersPage/index";

export default function App() {
  return (
    <ConfigProvider locale={esES}>
      <AntApp>
        <div className="w-full h-screen overflow-hidden">
          <Toaster position="bottom-right" richColors />
          <BoostersPage />
        </div>
      </AntApp>
    </ConfigProvider>
  );
}
