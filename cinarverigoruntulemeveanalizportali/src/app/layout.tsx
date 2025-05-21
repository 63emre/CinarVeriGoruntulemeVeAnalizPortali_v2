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
    <html lang="tr" className="h-full">
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 w-full m-0 p-0`}>
        <div className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
