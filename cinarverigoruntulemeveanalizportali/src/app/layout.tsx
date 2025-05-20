import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Çınar Çevre Laboratuvarı",
  description: "Çınar Çevre Laboratuvarı Veri Görüntüleme ve Analiz Portali",
  keywords: ["çevre laboratuvarı", "veri analizi", "çınar", "laboratuvar portal"],
  authors: [{ name: "Çınar Çevre Laboratuvarı" }],
  creator: "Çınar Çevre Laboratuvarı",
  icons: {
    icon: [
      {
        url: "/cinar-yaprak.svg",
        href: "/cinar-yaprak.svg",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
