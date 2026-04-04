import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'Om Oliver',
  description:
    'Lär känna Oliver – en svensk konstnär bosatt i Göteborg, känd för expressiva målningar i olja, akvarell och akryl.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return <AboutClient />;
}
