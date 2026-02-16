export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: "Nos" | "pcs" | "hrs" | "month" | "year" | "project";
  gstRate: 0 | 5 | 12 | 18 | 28;
  image?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number;
  amount: number; // qty * rate
  gstAmount: number; // amount * (gstRate/100)
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  gstin?: string;
  address?: string;
  placeOfSupply?: string;
}

export interface InvoiceState {
  customer: Customer;
  items: InvoiceItem[];
  invoiceNumber: string;
  date: Date;
}

export interface Bill {
  invoiceNumber: string;
  date: Date;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}
