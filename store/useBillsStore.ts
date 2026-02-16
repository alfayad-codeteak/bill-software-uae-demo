import { create } from 'zustand';
import { db } from '@/lib/db';
import { Bill } from '@/lib/types'; // Assuming Bill is in types, or I'll fix it

interface BillsStore {
    bills: Bill[];
    isLoading: boolean;
    loadBills: () => Promise<void>;
    saveBill: (bill: Bill) => Promise<void>;
    deleteBill: (invoiceNumber: string) => Promise<void>;
}

export const useBillsStore = create<BillsStore>((set) => ({
    bills: [],
    isLoading: false,

    loadBills: async () => {
        set({ isLoading: true });
        try {
            const bills = await db.bills.toArray();
            set({ bills: bills.reverse() }); // Newest first
        } catch (error) {
            console.error('Failed to load bills:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    saveBill: async (bill) => {
        try {
            await db.bills.put(bill);
            // Reload to update list
            const bills = await db.bills.toArray();
            set({ bills: bills.reverse() });
        } catch (error) {
            console.error('Failed to save bill:', error);
        }
    },

    deleteBill: async (invoiceNumber) => {
        try {
            await db.bills.delete(invoiceNumber);
            // Reload to update list (or filter locally for speed)
            set((state) => ({
                bills: state.bills.filter(b => b.invoiceNumber !== invoiceNumber)
            }));
        } catch (error) {
            console.error('Failed to delete bill:', error);
        }
    },
}));
