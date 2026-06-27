import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: { absolute: 'Oliver Skifs Konst – Läderkonst & originalmålningar' },
  description:
    'Läderkonst och originalmålningar av konstnären Oliver Skifs – unika handgjorda verk i läder, akryl, canvas och mixed media. Köp original direkt från konstnären.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <HomeClient />;
}
