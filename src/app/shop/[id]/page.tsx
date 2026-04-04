import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { Product } from '@/types';

function getProducts(): Product[] {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Product[];
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return getProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const products = getProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return { title: 'Konstverk' };
  }

  const title = product.title.sv;
  const description =
    product.description.sv ||
    `${title} – originalmålning av Oliver. ${product.technique?.sv || ''}`;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${id}/` },
    openGraph: {
      title: `${title} | Oliver's Konst`,
      description,
      images: product.imageUrl
        ? [{ url: product.imageUrl, alt: title }]
        : undefined,
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
