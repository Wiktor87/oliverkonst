'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useCart } from '@/components/CartContext';
import { siteConfig } from '@/lib/config';

export default function CartPage() {
  const { t, lang } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  const handleCheckout = () => {
    const itemLines = items
      .map((i) => `- ${i.title[lang]} x${i.quantity} = ${(i.price * i.quantity).toLocaleString('sv-SE')} SEK`)
      .join('\n');
    const subject = encodeURIComponent("Beställningsförfrågan – Oliver's Konst");
    const body = encodeURIComponent(
      `Hej Oliver!\n\nJag är intresserad av att beställa följande:\n\n${itemLines}\n\nTotalt: ${totalPrice.toLocaleString('sv-SE')} SEK\n\nVänligen kontakta mig för att slutföra köpet.\n\nMed vänliga hälsningar`,
    );
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="font-serif text-3xl text-stone-700 mb-4">{t.cart.title}</h1>
        <p className="text-stone-500 mb-8">{t.cart.empty}</p>
        <Link href="/shop" className="btn-primary inline-block">{t.cart.continueShopping}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl text-stone-800 mb-8">{t.cart.title}</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 bg-white border border-stone-100 rounded-lg p-4 shadow-sm">
            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-stone-50">
              <Image src={item.imageUrl} alt={item.title[lang]} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-stone-800 truncate">{item.title[lang]}</h3>
              <p className="text-sm text-stone-500">{item.price.toLocaleString('sv-SE')} SEK</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded border border-stone-200 flex items-center justify-center hover:bg-stone-50"
              >
                −
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded border border-stone-200 flex items-center justify-center hover:bg-stone-50"
              >
                +
              </button>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-amber-800">{(item.price * item.quantity).toLocaleString('sv-SE')} SEK</p>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                {t.cart.remove}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-stone-700">{t.cart.total}</span>
          <span className="text-2xl font-bold text-amber-800">{totalPrice.toLocaleString('sv-SE')} SEK</span>
        </div>
        <div className="bg-white rounded p-4 mb-4 text-sm text-stone-600 border border-amber-100">
          <p className="font-medium text-stone-700 mb-1">{t.cart.checkout}</p>
          <p>{t.cart.contactMessage}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCheckout} className="flex-1 btn-primary text-center">
            {t.cart.checkout}
          </button>
          <Link href="/shop" className="btn-secondary">
            {t.cart.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  );
}
