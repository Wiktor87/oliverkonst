import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { CartProvider } from '@/components/CartContext';
import { LanguageProvider } from '@/components/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const siteUrl = 'https://www.oliverskifs.se';

export const metadata: Metadata = {
  title: {
    default: "Oliver's Konst – Originalmålningar av konstnären Oliver",
    template: "%s | Oliver's Konst",
  },
  description:
    'Originalmålningar av konstnären Oliver – olja, akvarell, akryl och mixed media. Unika konstverk skapade med passion och känsla.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Oliver's Konst – Originalmålningar",
    description:
      'Originalmålningar av konstnären Oliver – olja, akvarell, akryl och mixed media. Unika konstverk skapade med passion och känsla.',
    url: siteUrl,
    siteName: "Oliver's Konst",
    locale: 'sv_SE',
    type: 'website',
    images: [
      {
        url: '/img/profile-large.webp',
        width: 1200,
        height: 630,
        alt: 'Oliver – konstnär och målare',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Oliver's Konst – Originalmålningar",
    description:
      'Originalmålningar av konstnären Oliver – olja, akvarell, akryl och mixed media.',
    images: ['/img/profile-large.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Artist',
  name: 'Oliver',
  url: siteUrl,
  image: `${siteUrl}/img/profile-large.webp`,
  description:
    'Svensk konstnär bosatt i Göteborg, känd för expressiva och känslosamma målningar i olja, akvarell och akryl.',
  sameAs: [],
  makesOffer: {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'VisualArtwork',
      artform: 'Painting',
      artMedium: 'Oil, watercolor, acrylic, mixed media',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RHHZV0KH5N"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RHHZV0KH5N');
          `}
        </Script>
      </head>
      <body>
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

