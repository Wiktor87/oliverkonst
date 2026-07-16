import type { Metadata } from 'next';
import { readData } from '@/lib/data';
import { Craft } from '@/types';
import CraftsClient from './CraftsClient';

const siteUrl = 'https://www.oliverskifs.se';

export const metadata: Metadata = {
  title: 'Hantverk – läderrustningar, lajv-vapen, rekvisita & masker',
  description:
    'Oliver Skifs hantverk i läder och skum: rustningar, lajv-vapen, rekvisita, masker och props. Handgjorda unika verk – portfolio och beställningsarbeten.',
  alternates: { canonical: '/crafts/' },
  openGraph: {
    title: 'Hantverk av Oliver Skifs – rustningar, lajv-vapen & rekvisita',
    description:
      'Handgjorda läderrustningar, lajv-vapen i skum, rekvisita och masker av Oliver Skifs.',
    url: `${siteUrl}/crafts/`,
    type: 'website',
  },
};

function getCrafts(): Craft[] {
  try {
    return readData<Craft[]>('crafts.json');
  } catch {
    return [];
  }
}

export default function CraftsPage() {
  const crafts = getCrafts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Hantverk av Oliver Skifs',
    url: `${siteUrl}/crafts/`,
    about: { '@type': 'Person', name: 'Oliver Skifs' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: crafts.map((craft, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/crafts/${craft.id}/`,
        name: craft.title.sv,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CraftsClient />
    </>
  );
}
