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
    default: "Oliver Skifs Konst – Originalmålningar av konstnären Oliver Skifs",
    template: "%s | Oliver Skifs Konst",
  },
  description:
    'Originalmålningar och läderkonst av konstnären Oliver Skifs – läder, akryl, canvas och mixed media. Unika handgjorda konstverk från Kungsör.',
  keywords: [
    'Oliver Skifs',
    'konst',
    'konstnär',
    'originalmålningar',
    'läder',
    'akryl',
    'canvas',
    'mixed media',
    'Kungsör',
    'svensk konst',
    'köp konst online',
    'konstgalleri',
    'handgjord konst',
    'tavlor till salu',
    'läderkonst',
    'unika konstverk',
    'konstutställning',
    'beställ tavla',
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Oliver Skifs Konst – Originalmålningar och läderkonst",
    description:
      'Unika handgjorda konstverk av Oliver Skifs – läder, akryl, canvas och mixed media från Kungsör. Köp original direkt från konstnären.',
    url: siteUrl,
    siteName: "Oliver Skifs Konst",
    locale: 'sv_SE',
    type: 'website',
    images: [
      {
        url: '/img/profile-large.webp',
        width: 1200,
        height: 630,
        alt: 'Oliver Skifs – konstnär och målare',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Oliver Skifs Konst – Originalmålningar och läderkonst",
    description:
      'Unika handgjorda konstverk av Oliver Skifs – läder, akryl, canvas och mixed media från Kungsör.',
    images: ['/img/profile-large.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Oliver Skifs',
  jobTitle: 'Konstnär',
  url: siteUrl,
  image: `${siteUrl}/img/profile-large.webp`,
  description:
    'Svensk konstnär bosatt i Kungsör, känd för expressiva och känslosamma konstverk i läder, akryl och canvas.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kungsör',
    addressCountry: 'SE',
  },
  sameAs: ['https://www.instagram.com/oliverskifskonst/'],
  makesOffer: {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'VisualArtwork',
      artform: 'Painting',
      artMedium: 'Leather, acrylic, canvas, mixed media',
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

