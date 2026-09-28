'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order, Product } from '@/types';
import { useAdmin } from '@/components/AdminContext';
import { readJsonFile } from '@/lib/github';
import { publicUrl } from '@/lib/config';
import {
  StripeOrder,
  fetchPaymentLinkUrls,
  fetchStripeOrders,
  getStoredStripeKey,
  storeStripeKey,
} from '@/lib/stripeOrders';

const stripQuery = (url: string) => url.split('?')[0].replace(/\/$/, '');
const normalize = (s: string) => s.trim().toLowerCase();

function imageSrc(url: string) {
  return url.startsWith('http') ? url : publicUrl(url);
}

function formatSek(amount: number, currency = 'SEK') {
  return `${amount.toLocaleString('sv-SE')} ${currency}`;
}

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Betald', cls: 'bg-green-100 text-green-800' },
  unpaid: { label: 'Ej betald', cls: 'bg-amber-100 text-amber-800' },
  no_payment_required: { label: 'Ingen betalning', cls: 'bg-stone-100 text-stone-700' },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [stripeKey, setStripeKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [stripeOrders, setStripeOrders] = useState<StripeOrder[]>([]);
  const [paymentLinkUrls, setPaymentLinkUrls] = useState<Record<string, string>>({});
  const [paymentDetailsMissing, setPaymentDetailsMissing] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !token) {
      router.push('/admin/login');
      return;
    }
    Promise.all([
      readJsonFile<Order[]>(token, 'data/orders.json')
        .then(({ data }) => setOrders([...data].reverse()))
        .catch(() => {}),
      readJsonFile<Product[]>(token, 'data/products.json')
        .then(({ data }) => setProducts(data))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, token, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStripeOrders = useCallback(async (key: string) => {
    setStripeLoading(true);
    setStripeError('');
    try {
      const [result, links] = await Promise.all([fetchStripeOrders(key), fetchPaymentLinkUrls(key)]);
      setStripeOrders(result.orders);
      setPaymentDetailsMissing(result.paymentDetailsMissing);
      setPaymentLinkUrls(links);
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : 'Kunde inte hämta beställningar från Stripe');
    } finally {
      setStripeLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredStripeKey();
    if (stored) {
      setStripeKey(stored);
      loadStripeOrders(stored);
    }
  }, [loadStripeOrders]);

  const saveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    storeStripeKey(key);
    setStripeKey(key);
    setKeyInput('');
    loadStripeOrders(key);
  };

  const removeKey = () => {
    storeStripeKey('');
    setStripeKey('');
    setStripeOrders([]);
    setStripeError('');
  };

  /** Find the site product for a Stripe line item: by Payment Link first, then by title. */
  const findProduct = (order: StripeOrder, description: string): Product | undefined => {
    const linkUrl = paymentLinkUrls[order.paymentLinkId];
    if (linkUrl && order.items.length <= 1) {
      const byLink = products.find((p) => p.stripePaymentLink && stripQuery(p.stripePaymentLink) === stripQuery(linkUrl));
      if (byLink) return byLink;
    }
    const d = normalize(description);
    return products.find((p) => normalize(p.title.sv) === d || normalize(p.title.en) === d);
  };

  if (isLoading || loading) return <div className="p-8 text-stone-500">Laddar...</div>;

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-serif text-3xl text-stone-800 mb-6">Beställningar</h1>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium text-stone-700">Stripe-betalningar</h2>
        {stripeKey && (
          <div className="flex gap-4 text-xs">
            <button onClick={() => loadStripeOrders(stripeKey)} className="text-amber-700 hover:text-amber-900">
              Uppdatera
            </button>
            <button onClick={removeKey} className="text-stone-500 hover:text-red-700">
              Ta bort Stripe-nyckel
            </button>
          </div>
        )}
      </div>

      {!stripeKey ? (
        <form onSubmit={saveKey} className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 space-y-3 text-sm text-stone-600 mb-10">
          <p>
            Köp via Stripe betalas direkt hos Stripe och hämtas därför härifrån. Skapa en
            <strong> begränsad nyckel</strong> i Stripe Dashboard (Utvecklare → API-nycklar → Skapa begränsad nyckel)
            med <strong>Läs</strong>-behörighet för <em>Checkout Sessions</em>, <em>PaymentIntents</em>,{' '}
            <em>Charges</em> och <em>Payment Links</em>, och klistra in den nedan.
          </p>
          <p className="text-xs text-stone-400">
            Nyckeln sparas bara i den här webbläsaren och skickas aldrig till GitHub.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              className="flex-1 border border-stone-200 rounded px-3 py-2"
              placeholder="rk_live_..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
            <button type="submit" className="bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-700">
              Spara
            </button>
          </div>
        </form>
      ) : stripeLoading ? (
        <p className="bg-white rounded-lg border border-stone-100 p-8 text-center text-stone-400 mb-10">Hämtar från Stripe...</p>
      ) : stripeError ? (
        <p className="bg-white rounded-lg border border-stone-100 p-8 text-center text-red-700 mb-10">{stripeError}</p>
      ) : stripeOrders.length === 0 ? (
        <p className="bg-white rounded-lg border border-stone-100 p-8 text-center text-stone-400 mb-10">Inga Stripe-betalningar</p>
      ) : (
        <div className="space-y-4 mb-10">
          {paymentDetailsMissing && (
            <p className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded p-3">
              Betalsätt, kvitto och återbetalningar visas inte – ge nyckeln Läs-behörighet för
              PaymentIntents och Charges i Stripe för att se dem.
            </p>
          )}
          {stripeOrders.map((order) => (
            <StripeOrderCard key={order.id} order={order} findProduct={findProduct} />
          ))}
        </div>
      )}

      <h2 className="font-medium text-stone-700 mb-3">Övriga beställningar</h2>
      <div className="bg-white rounded-lg shadow-sm border border-stone-100 overflow-hidden">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-stone-400">Inga beställningar</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-4 py-3 font-medium text-stone-600">Kund</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">E-post</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Artiklar</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Totalt</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-stone-600">Datum</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
                return (
                  <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-800 font-medium">{order.customerName}</td>
                    <td className="px-4 py-3 text-stone-600">{order.customerEmail}</td>
                    <td className="px-4 py-3 text-stone-600">{order.items.length} st</td>
                    <td className="px-4 py-3 text-stone-800">{total.toLocaleString('sv-SE')} SEK</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StripeOrderCard({
  order,
  findProduct,
}: {
  order: StripeOrder;
  findProduct: (order: StripeOrder, description: string) => Product | undefined;
}) {
  const status = PAYMENT_STATUS[order.paymentStatus] || { label: order.paymentStatus, cls: 'bg-stone-100 text-stone-700' };
  const refunded = order.payment?.refunded
    ? 'Återbetald'
    : order.payment && order.payment.amountRefunded > 0
      ? `Delvis återbetald (${formatSek(order.payment.amountRefunded, order.currency)})`
      : '';
  const isPickup = /upphämtning|pickup/i.test(order.deliveryMethod);
  const deliveryAddress = order.shippingAddress || order.siteAddress;
  const date = new Date(order.createdAt);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-100">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <span className="font-medium text-stone-800">{order.customerName || '–'}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
          {refunded && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">{refunded}</span>}
          {!order.livemode && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Testläge</span>}
        </div>
        <div className="text-sm text-stone-500">
          {date.toLocaleDateString('sv-SE')} {date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
          <span className="ml-3 font-semibold text-stone-800">{formatSek(order.amountTotal, order.currency)}</span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {order.items.length === 0 ? (
            <p className="text-stone-400">Inga artiklar</p>
          ) : (
            order.items.map((item, idx) => {
              const product = findProduct(order, item.description);
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded bg-stone-100 overflow-hidden">
                    {product?.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageSrc(product.imageUrl)} alt={item.description} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">{item.description}</p>
                    <p className="text-stone-500">
                      {item.quantity} st{product?.dimensions ? ` · ${product.dimensions}` : ''}
                    </p>
                  </div>
                  <p className="text-stone-800">{formatSek(item.amountTotal, order.currency)}</p>
                </div>
              );
            })
          )}
          <div className="border-t border-stone-100 pt-2 space-y-0.5 text-stone-600">
            {(order.amountShipping > 0 || order.amountDiscount > 0 || order.amountTax > 0) && (
              <Row label="Delsumma" value={formatSek(order.amountSubtotal, order.currency)} />
            )}
            {order.amountShipping > 0 && <Row label="Frakt" value={formatSek(order.amountShipping, order.currency)} />}
            {order.amountDiscount > 0 && <Row label="Rabatt" value={`−${formatSek(order.amountDiscount, order.currency)}`} />}
            {order.amountTax > 0 && <Row label="Moms" value={formatSek(order.amountTax, order.currency)} />}
            <Row label="Totalt" value={formatSek(order.amountTotal, order.currency)} bold />
          </div>
        </div>

        {/* Contact */}
        <Section title="Kontakt">
          {order.customerName && <p>{order.customerName}</p>}
          {order.customerEmail && (
            <p><a href={`mailto:${order.customerEmail}`} className="text-amber-700 hover:underline">{order.customerEmail}</a></p>
          )}
          {order.customerPhone && (
            <p><a href={`tel:${order.customerPhone.replace(/\s/g, '')}`} className="text-amber-700 hover:underline">{order.customerPhone}</a></p>
          )}
        </Section>

        {/* Delivery */}
        <Section title="Leverans">
          <p className="font-medium">{order.deliveryMethod || 'Okänt leveranssätt'}</p>
          {!isPickup && order.shippingName && order.shippingName !== order.customerName && <p>{order.shippingName}</p>}
          {!isPickup && deliveryAddress && <p>{deliveryAddress}</p>}
          {!isPickup && order.shippingAddress && order.siteAddress && order.siteAddress !== order.shippingAddress && (
            <p className="text-xs text-stone-400">Angiven på webbplatsen: {order.siteAddress}</p>
          )}
          {!isPickup && !deliveryAddress && <p className="text-stone-400">Ingen adress angiven</p>}
        </Section>

        {/* Payment */}
        <Section title="Betalning">
          {order.payment ? (
            <>
              <p>{order.payment.method || 'Okänt betalsätt'}</p>
              {order.payment.receiptUrl && (
                <p><a href={order.payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">Kvitto</a></p>
              )}
            </>
          ) : (
            <p className="text-stone-400">Betalsätt ej tillgängligt</p>
          )}
          <p>
            <a href={order.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">
              Öppna i Stripe →
            </a>
          </p>
        </Section>

        {/* Billing + extra */}
        {(order.billingAddress || order.customFields.length > 0) && (
          <Section title="Övrigt">
            {order.billingAddress && <p><span className="text-stone-400">Faktureringsadress:</span> {order.billingAddress}</p>}
            {order.customFields.map((f, i) => (
              <p key={i}><span className="text-stone-400">{f.label}:</span> {f.value}</p>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-1">{title}</h3>
      <div className="space-y-0.5 text-stone-700">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-stone-800' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
