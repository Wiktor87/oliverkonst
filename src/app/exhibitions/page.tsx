import type { Metadata } from 'next';
import ExhibitionsClient from './ExhibitionsClient';

export const metadata: Metadata = {
  title: 'Utställningar',
  description:
    'Se Oliver Skifs kommande och tidigare konstutställningar. Österlen Konstrundan och fler.',
  alternates: { canonical: '/exhibitions/' },
};

export default function ExhibitionsPage() {
  return <ExhibitionsClient />;
}
