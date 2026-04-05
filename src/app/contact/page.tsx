import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Kontakta konstnären Oliver Skifs för frågor om konstverk, beställningar, utställningar eller samarbeten.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return <ContactClient />;
}
