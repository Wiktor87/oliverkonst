'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { useEffect, useRef, useState } from 'react';
import { saveOrder } from '@/lib/orders';
import type { Order } from '@/types';

interface PendingOrderData {
  order: Order;
  notificationRecipients: string;
  orderText: string;
}

export default function CheckoutSuccessPage() {
  const { lang } = useLanguage();
  const { clearCart } = useCart();
  const processed = useRef(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [mailtoUrl, setMailtoUrl] = useState<string | null>(null);
  const sv = lang === 'sv';

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    clearCart();

    // Read order data from sessionStorage, save it, and build notification email
    try {
      const data = sessionStorage.getItem('pendingOrder');
      if (data) {
        const pending: PendingOrderData = JSON.parse(data);
        setOrder(pending.order);
        sessionStorage.removeItem('pendingOrder');

        // Save order to the repository (GitHub API)
        saveOrder(pending.order);

        // Build mailto URL for notification
        const subject = encodeURIComponent(
          `Beställning genomförd – Oliver's Konst – ${pending.order.customerName}`
        );
        const body = encodeURIComponent(pending.orderText);
        const mailto = `mailto:${pending.notificationRecipients}?subject=${subject}&body=${body}`;
        setMailtoUrl(mailto);

        // Attempt to open the email client automatically
        try {
          window.open(mailto, '_blank');
        } catch {
          // Popup blocked or mailto not supported – user can click the fallback link
        }
      }
    } catch {
      // ignore
    }
  }, [clearCart]);

  return (
    <div className="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" className="empty-state-icon" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#16a34a' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h1 className="empty-state-title">
        {sv ? 'Tack för ditt köp!' : 'Thank you for your purchase!'}
      </h1>
      <p className="empty-state-text">
        {sv
          ? 'Din betalning har genomförts. Vi kontaktar dig med leveransinformation.'
          : 'Your payment has been processed. We will contact you with delivery information.'}
      </p>

      {order && (
        <div className="checkout-success-details">
          <h3>{sv ? 'Orderdetaljer' : 'Order details'}</h3>
          <p><strong>{sv ? 'Kund' : 'Customer'}:</strong> {order.customerName}</p>
          <p><strong>{sv ? 'E-post' : 'Email'}:</strong> {order.customerEmail}</p>
          {order.customerPhone && (
            <p><strong>{sv ? 'Telefon' : 'Phone'}:</strong> {order.customerPhone}</p>
          )}
          {order.deliveryMethod === 'shipping' && order.customerAddress && (
            <p><strong>{sv ? 'Adress' : 'Address'}:</strong> {order.customerAddress}, {order.customerPostalCode} {order.customerCity}</p>
          )}
          <p><strong>{sv ? 'Leverans' : 'Delivery'}:</strong> {order.deliveryMethod === 'shipping' ? (sv ? 'Frakt' : 'Shipping') : (sv ? 'Upphämtning' : 'Pickup')}</p>
          <ul>
            {order.items.map((item, i) => (
              <li key={i}>{item.title[lang]} x{item.quantity} – {(item.price * item.quantity).toLocaleString('sv-SE')} SEK</li>
            ))}
          </ul>
          <p><strong>{sv ? 'Totalt' : 'Total'}:</strong> {order.totalAmount.toLocaleString('sv-SE')} SEK</p>
        </div>
      )}

      {mailtoUrl && (
        <a href={mailtoUrl} className="btn-secondary" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          {sv ? 'Skicka orderbekräftelse via e-post' : 'Send order confirmation via email'}
        </a>
      )}

      <Link href="/shop" className="btn-primary">
        {sv ? 'Tillbaka till konsten' : 'Back to the shop'}
      </Link>
    </div>
  );
}
