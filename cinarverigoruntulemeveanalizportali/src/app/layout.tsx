import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Çınar Veri Görüntüleme ve Analiz Portalı',
  description: 'Çınar Çevre Laboratuvarı veri görüntüleme, işleme ve analiz portalı',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: '/cinar.svg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className={`${inter.className} min-h-screen`}>
        <div className="flex flex-col min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
