import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import CraftDetailClient from './CraftDetailClient';
import { Craft } from '@/types';

function getCrafts(): Craft[] {
  const filePath = path.join(process.cwd(), 'data', 'crafts.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Craft[];
}

/**
 * `output: export` refuses to build a dynamic route with zero params, so when there
 * are no crafts yet we emit a single placeholder page. It is noindex'd and the client
 * redirects it to /crafts, and it disappears as soon as a real craft exists.
 */
const PLACEHOLDER_SLUG = 'kommer-snart';

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const crafts = getCrafts();
  if (crafts.length === 0) return [{ slug: PLACEHOLDER_SLUG }];
  return crafts.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const craft = getCrafts().find((c) => c.id === slug);

  if (!craft) {
    return { title: 'Hantverk', robots: { index: false, follow: true } };
  }

  const title = craft.title.sv;
  const description =
    craft.description.sv ||
    `${title} – handgjort hantverk av Oliver Skifs. ${craft.materials?.sv || ''}`;

  return {
    title,
    description,
    alternates: { canonical: `/crafts/${slug}/` },
    openGraph: {
      title: `${title} | Hantverk av Oliver Skifs`,
      description,
      url: `https://www.oliverskifs.se/crafts/${slug}/`,
      images: craft.imageUrl ? [{ url: craft.imageUrl, alt: title }] : undefined,
    },
  };
}

export default function CraftDetailPage() {
  return <CraftDetailClient />;
}
