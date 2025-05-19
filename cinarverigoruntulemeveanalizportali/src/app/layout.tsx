import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Çınar Portal - Veri Görüntüleme ve Analiz Portali",
  description: "Çınar Çevre Laboratuvarı için veri yönetimi, görselleştirme ve analiz platformu",
  keywords: ["çevre laboratuvarı", "veri analizi", "çınar", "laboratuvar portal"],
  authors: [{ name: "Çınar Çevre Laboratuvarı" }],
  creator: "Çınar Çevre Laboratuvarı",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/cinar-yaprak.svg",
    apple: "/cinar-yaprak.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Navbar />
        <div>{children}</div>
      </body>
    </html>
  );
}
