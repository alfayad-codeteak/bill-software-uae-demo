import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Customer, InvoiceItem, Product, InvoiceState } from '@/lib/types';

// Use crypto.randomUUID if available, else a simplefallback
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 9);
};

interface InvoiceStore extends InvoiceState {
    setCustomer: (customer: Partial<Customer>) => void;
    addItem: (product: Product) => void;
    removeItem: (itemId: string) => void;
    updateQty: (itemId: string, qty: number) => void;
    resetInvoice: () => void;

    // View Mode for Shared Bills
    viewMode: boolean;
    setViewMode: (mode: boolean) => void;

    // Actions
    setInvoiceNumber: (id: string) => void;
    setDate: (date: Date) => void;
    loadInvoice: (bill: any) => void; // Using any to avoid circular dep or import issues right now, but better to use Bill interface

    // Computed (actions returning values)
    getSubtotal: () => number;
    getTotalTax: () => number;
    getGrandTotal: () => number;
}

export const useInvoiceStore = create<InvoiceStore>()(
    persist(
        (set, get) => ({
            customer: {
                name: '',
                email: '',
                phone: '',
                address: '',
            },
            items: [],
            invoiceNumber: '', // Will be set on hydration or component mount if empty
            date: new Date(),

            viewMode: false,

            setCustomer: (customer) => set((state) => ({
                customer: { ...state.customer, ...customer }
            })),

            addItem: (product) => set((state) => {
                const existingItem = state.items.find((i) => i.productId === product.id);
                if (existingItem) {
                    // Increment qty if already exists
                    return {
                        items: state.items.map((i) =>
                            i.productId === product.id
                                ? { ...i, qty: i.qty + 1, amount: (i.qty + 1) * i.rate, gstAmount: ((i.qty + 1) * i.rate) * (i.gstRate / 100) }
                                : i
                        )
                    };
                }

                const newItem: InvoiceItem = {
                    id: generateId(),
                    productId: product.id,
                    name: product.name,
                    qty: 1,
                    unit: product.unit,
                    rate: product.price,
                    gstRate: product.gstRate,
                    amount: product.price * 1,
                    gstAmount: (product.price * 1) * (product.gstRate / 100),
                };

                return { items: [...state.items, newItem] };
            }),

            removeItem: (itemId) => set((state) => ({
                items: state.items.filter((i) => i.id !== itemId)
            })),

            updateQty: (itemId, qty) => set((state) => ({
                items: state.items.map((i) => {
                    if (i.id !== itemId) return i;
                    const newQty = Math.max(0, qty); // Prevent negative
                    const newAmount = newQty * i.rate;
                    const newGstAmount = newAmount * (i.gstRate / 100);
                    return { ...i, qty: newQty, amount: newAmount, gstAmount: newGstAmount };
                })
            })),

            resetInvoice: () => set({
                customer: { name: '', email: '', phone: '', address: '' },
                items: [],
                invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                date: new Date(),
                viewMode: false
            }),

            setViewMode: (mode) => set({ viewMode: mode }),
            setInvoiceNumber: (id) => set({ invoiceNumber: id }),
            setDate: (date) => set({ date }),

            loadInvoice: (bill) => set({
                customer: bill.customer,
                items: bill.items,
                invoiceNumber: bill.invoiceNumber,
                date: bill.date,
                viewMode: true
            }),

            // Getters
            getSubtotal: () => {
                return get().items.reduce((sum, item) => sum + item.amount, 0);
            },
            getTotalTax: () => {
                return get().items.reduce((sum, item) => sum + item.gstAmount, 0);
            },
            getGrandTotal: () => {
                const sub = get().getSubtotal();
                const tax = get().getTotalTax();
                return sub + tax;
            },
        }),
        {
            name: 'invoice-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
