import type { Metadata } from 'next';
import { readData } from '@/lib/data';
import { SiteContent, PressItem } from '@/types';
import PressClient from './PressClient';

const siteUrl = 'https://www.oliverskifs.se';

export const metadata: Metadata = {
  title: 'Oliver Skifs i media – press & reportage om läderkonsten',
  description:
    'Artiklar, reportage och intervjuer om konstnären Oliver Skifs och hans läderkonst – i NWT, Sveriges Radio, Magazin24, Filipstads Tidning och fler.',
  alternates: { canonical: '/press/' },
  openGraph: {
    title: 'Oliver Skifs i media – press & reportage',
    description:
      'Press, radio och reportage om Oliver Skifs och hans läderkonst.',
    url: `${siteUrl}/press/`,
    type: 'website',
  },
};

function getPressItems(): PressItem[] {
  try {
    const content = readData<SiteContent>('site-content.json');
    return content.pressItems ?? [];
  } catch {
    return [];
  }
}

export default function PressPage() {
  const items = getPressItems();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Oliver Skifs i media',
    url: `${siteUrl}/press/`,
    about: { '@type': 'Person', name: 'Oliver Skifs' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: item.url,
        name: `${item.title} – ${item.outlet}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PressClient items={items} />
    </>
  );
}
