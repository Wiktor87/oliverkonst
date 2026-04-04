import type { Metadata } from 'next';
import ClassesClient from './ClassesClient';

export const metadata: Metadata = {
  title: 'Konstkurser',
  description:
    'Lär dig måla med Oliver. Konstkurser för alla nivåer i en inspirerande ateljémiljö i Göteborg.',
  alternates: { canonical: '/classes/' },
};

export default function ClassesPage() {
  return <ClassesClient />;
}
