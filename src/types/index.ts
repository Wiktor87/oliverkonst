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
  /** Optional list of accepted payment providers for this product (future use) */
  paymentMethods?: ('klarna' | 'stripe')[];
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

export interface SiteContent {
  biography: LocalizedString;
  profileQuote: LocalizedString;
  aboutTitle: LocalizedString;
  contactEmail: string;
  socialLinks: {
    instagram: string;
    facebook: string;
  };
  selectedProducts?: string[];
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
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  title: LocalizedString;
  imageUrl: string;
  productType: 'physical' | 'digital';
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}
