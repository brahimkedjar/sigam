// app/layout.tsx
import ClientLayout from '../../utils/ClientLayout'; 
export const metadata = {
  title: 'SIGAM App',
  description: 'SIGAM app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
