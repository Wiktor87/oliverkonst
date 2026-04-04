import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: "Oliver's Konst – Originalmålningar av konstnären Oliver",
  description:
    'Utforska originalmålningar av konstnären Oliver. Unika verk i olja, akvarell, akryl och mixed media skapade med passion och känsla.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <HomeClient />;
}
