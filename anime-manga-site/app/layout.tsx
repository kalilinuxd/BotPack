import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const tajawal = Tajawal({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["arabic"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "موقع الأنمي والمانغا - شاهد واقرأ أفضل الأنمي والمانغا",
  description: "موقع متكامل لمشاهدة الأنمي وقراءة المانغا مع بيانات محدثة يومياً من أفضل المصادر",
  keywords: "أنمي, مانغا, anime, manga, مشاهدة أنمي, قراءة مانغا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        <Navbar />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
        <footer className="glass border-t border-purple-500/20 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p className="text-gray-400">
              © 2025 موقع الأنمي والمانغا. جميع الحقوق محفوظة.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              البيانات مقدمة من Jikan API و MangaDex API
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
