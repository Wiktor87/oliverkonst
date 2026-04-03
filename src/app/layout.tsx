import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartContext';
import { LanguageProvider } from '@/components/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Oliver's Konst",
  description: 'Originalmålningar av konstnären Oliver – Oil, watercolor, acrylic and mixed media.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
