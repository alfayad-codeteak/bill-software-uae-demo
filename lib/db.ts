import Dexie, { Table } from 'dexie';
import { Bill } from './types';

export class BillingDB extends Dexie {
    bills!: Table<Bill, string>; // Primary key is invoiceNumber (string)

    constructor() {
        super('BillingDB');
        this.version(1).stores({
            bills: 'invoiceNumber, date, customer.name' // Primary key and indexed props
        });
    }
}

export const db = new BillingDB();
