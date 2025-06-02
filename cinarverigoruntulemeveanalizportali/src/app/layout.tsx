import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import { NotificationContainer } from '@/components/ui/Notification';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Çınar Çevre Laboratuvarı - Veri Görüntüleme ve Analiz Portalı',
  description: 'Çevre analiz verilerini görüntüleme ve analiz etme platformu',
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
        <NotificationContainer />
      </body>
    </html>
  );
}
