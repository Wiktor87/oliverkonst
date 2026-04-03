import fs from 'fs';
import path from 'path';
import ProductDetailClient from './ProductDetailClient';

interface ProductId {
  id: string;
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ProductId[];
  return products.map((p) => ({ id: p.id }));
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
