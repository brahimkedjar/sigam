// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import ClientLayout from '../utils/ClientLayout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClientLayout>
      <Component {...pageProps} />
    </ClientLayout>
  );
}

export default MyApp;
