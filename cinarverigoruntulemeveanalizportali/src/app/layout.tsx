import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Çınar Veri Görüntüleme ve Analiz Portalı',
  description: 'Çınar Çevre Laboratuvarı veri görüntüleme, işleme ve analiz portalı',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* Preload key assets properly */}
        <link
          rel="preload"
          href="/cinar.svg"
          as="image"
          type="image/svg+xml"
        />
        <link
          rel="preload"
          href="/cinar-yaprak.svg"
          as="image"
          type="image/svg+xml"
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
