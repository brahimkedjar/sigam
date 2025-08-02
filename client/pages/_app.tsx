// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import ClientLayout from '../utils/ClientLayout';
import { StepGuardProvider } from '@/src/hooks/StepGuardContext';
import { ConfigProvider } from 'antd';
import { LoadingProvider } from '@/components/globalspinner/LoadingContext';
import { GlobalSpinner } from '@/components/globalspinner/GlobalSpinner';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LoadingProvider>
      <StepGuardProvider>
        <ConfigProvider componentSize="small">
          <ClientLayout>
            <GlobalSpinner />
            <Component {...pageProps} />
          </ClientLayout>
        </ConfigProvider>
      </StepGuardProvider>
    </LoadingProvider>
  );
}

export default MyApp;