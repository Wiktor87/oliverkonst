import type { Metadata } from 'next';
import ExhibitionsClient from './ExhibitionsClient';

export const metadata: Metadata = {
  title: 'Utställningar',
  description:
    'Se Olivers kommande och tidigare konstutställningar i Göteborg, Stockholm och runt om i Sverige.',
  alternates: { canonical: '/exhibitions/' },
};

export default function ExhibitionsPage() {
  return <ExhibitionsClient />;
}
