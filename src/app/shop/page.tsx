import type { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Konst till salu',
  description:
    'Köp originalmålningar av Oliver. Unika konstverk i olja, akvarell, akryl och mixed media – varje målning är ett handgjort original.',
  alternates: { canonical: '/shop/' },
};

export default function ShopPage() {
  return <ShopClient />;
}
