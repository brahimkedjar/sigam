// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import ClientLayout from '../utils/ClientLayout';
import { StepGuardProvider } from '@/src/hooks/StepGuardContext';
import { ConfigProvider } from 'antd';
import { LoadingProvider } from '@/components/globalspinner/LoadingContext';
import { GlobalSpinner } from '@/components/globalspinner/GlobalSpinner';
import '../src/hooks/api-interceptor';

// ✅ Import react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LoadingProvider>
      <StepGuardProvider>
        <ConfigProvider componentSize="small">
          <ClientLayout>
            <GlobalSpinner />

            {/* ✅ Toast container available globally */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />

            <Component {...pageProps} />
          </ClientLayout>
        </ConfigProvider>
      </StepGuardProvider>
    </LoadingProvider>
  );
}

export default MyApp;
