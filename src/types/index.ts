export interface LocalizedString {
  sv: string;
  en: string;
}

export interface DigitalAsset {
  fileUrl: string;
  fileType: string;
}

export interface Product {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  price: number;
  currency: string;
  category: string;
  dimensions: string;
  technique: LocalizedString;
  imageUrl: string;
  images?: string[];
  status: 'available' | 'sold' | 'reserved';
  productType: 'physical' | 'digital';
  digitalAsset?: DigitalAsset;
  /** Stripe Payment Link URL from Stripe Dashboard */
  stripePaymentLink?: string;
  /** Shipping cost in SEK (0 = free shipping) */
  shippingCost?: number;
  /** Optional list of accepted payment providers for this product (future use) */
  paymentMethods?: ('klarna' | 'stripe')[];
  /** If true, extra delivery/pickup info is shown on the product page */
  skrymmande?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExhibitionStatus = 'upcoming' | 'active' | 'past';

export interface Exhibition {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  location: LocalizedString;
  startDate: string;
  endDate: string;
  imageUrl: string;
  mapUrl?: string;
  status: ExhibitionStatus;
  createdAt: string;
}

export interface FaqItem {
  question: LocalizedString;
  answer: LocalizedString;
}

export interface SiteContent {
  biography: LocalizedString;
  profileQuote: LocalizedString;
  aboutTitle: LocalizedString;
  contactEmail: string;
  contactPhone?: string;
  contactAddress?: LocalizedString;
  socialLinks: {
    instagram: string;
    facebook: string;
  };
  selectedProducts?: string[];
  /** Email addresses that receive order notifications (comma-separated) */
  notificationEmails?: string;
  /** Purchase terms / Köpvillkor */
  purchaseTerms?: LocalizedString;
  /** FAQ items shown on the homepage */
  faqItems?: FaqItem[];
}

export interface Category {
  id: string;
  name: LocalizedString;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  deliveryMethod: 'shipping' | 'pickup';
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalProducts: number;
  totalShipping: number;
  totalAmount: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  shippingCost: number;
  title: LocalizedString;
  imageUrl: string;
  productType: 'physical' | 'digital';
  stripePaymentLink?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}
