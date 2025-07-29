// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import ClientLayout from '../utils/ClientLayout';
import { StepGuardProvider } from '@/hooks/StepGuardContext';
import { ConfigProvider } from 'antd';
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StepGuardProvider>
      <ConfigProvider componentSize="small">
        <ClientLayout>
          <Component {...pageProps} />
        </ClientLayout>
      </ConfigProvider>
    </StepGuardProvider>
  );
}
export default MyApp;
