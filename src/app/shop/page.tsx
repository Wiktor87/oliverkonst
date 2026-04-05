import type { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Konst till salu',
  description:
    'Köp originalmålningar och läderkonst av Oliver Skifs. Unika konstverk i läder, akryl och mixed media – varje verk är ett handgjort original.',
  alternates: { canonical: '/shop/' },
};

export default function ShopPage() {
  return <ShopClient />;
}
