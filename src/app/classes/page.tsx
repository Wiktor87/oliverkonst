import type { Metadata } from 'next';
import ClassesClient from './ClassesClient';

export const metadata: Metadata = {
  title: 'Konstkurser',
  description:
    'Lär dig skapa konst med Oliver Skifs. Konstkurser för alla nivåer i en inspirerande ateljémiljö.',
  alternates: { canonical: '/classes/' },
};

export default function ClassesPage() {
  return <ClassesClient />;
}
