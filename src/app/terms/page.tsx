import type { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Köpvillkor',
  description: "Läs köpvillkoren för Oliver's Konst. Information om betalning, frakt, returer och ångerrätt.",
  alternates: { canonical: '/terms/' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return <TermsClient />;
}
