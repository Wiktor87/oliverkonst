import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sidan hittades inte',
  description: 'Sidan du letar efter finns inte. Gå tillbaka till startsidan.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">404 – Sidan hittades inte</h1>
        <p className="page-subtitle">
          Tyvärr kunde vi inte hitta sidan du letade efter.
        </p>
      </div>

      <div className="not-found-actions">
        <Link href="/" className="btn-primary">
          Gå till startsidan
        </Link>
      </div>
    </div>
  );
}
