import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'Om Oliver',
  description:
    'Lär känna Oliver Skifs – en svensk konstnär bosatt i Kungsör, känd för unika konstverk i läder, akryl och mixed media på canvas.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return <AboutClient />;
}
