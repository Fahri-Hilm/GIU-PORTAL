import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GIU Intelligence Portal',
  description: 'Premium intelligence dashboard for monitoring criminal organizations across San Andreas.',
  icons: { icon: '/logo-giu.jpg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-body-md antialiased">
        {children}
      </body>
    </html>
  );
}
