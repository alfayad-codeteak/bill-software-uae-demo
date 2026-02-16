"use client";

import { useInvoiceStore } from "@/store/useInvoiceStore";
import { formatCurrency, getShareableBillUrl } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";

interface InvoiceTemplateProps {
    invoiceId: string;
    date: Date;
}

export function InvoiceTemplate({ invoiceId, date }: InvoiceTemplateProps) {
    const { customer, items, getSubtotal, getGrandTotal } = useInvoiceStore();
    const subtotal = getSubtotal();
    const total = getGrandTotal();

    const shareBillUrl = getShareableBillUrl({ invoiceNumber: invoiceId });

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-y-auto">

            {/* Professional Header */}
            <div className="bg-primary/5 px-4 sm:px-8 lg:px-12 py-6 sm:py-12 flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-primary/10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                            B
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">INVOICE</h1>
                    </div>
                    <p className="text-muted-foreground font-medium ml-1 text-sm sm:text-base">#{invoiceId}</p>
                </div>
                <div className="flex gap-4 sm:gap-8 items-start flex-wrap">
                    <div className="text-right">
                        <div className="font-bold text-xl text-foreground">Bill Software UAE</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            123 Business Bay<br />
                            Dubai, UAE<br />
                            support@billsoftware.ae
                        </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                        <QRCodeCanvas value={shareBillUrl} size={80} />
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-8 lg:p-12 flex-1 flex flex-col">
                {/* Bill To Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 sm:mb-12">
                    <div className="w-full sm:w-1/2 sm:pr-8 min-w-0">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Bill To</h3>
                        <div className="text-sm">
                            <div className="font-bold text-lg text-foreground mb-1">{customer.name || "Walk-in Customer"}</div>
                            {customer.address && <div className="text-muted-foreground mb-1">{customer.address}</div>}
                            {customer.email && <div className="text-muted-foreground mb-1">{customer.email}</div>}
                            {customer.phone && <div className="text-muted-foreground">{customer.phone}</div>}
                        </div>
                    </div>
                    <div className="w-full sm:w-1/2 sm:pl-8 flex flex-col items-start sm:items-end mt-4 sm:mt-0">
                        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 text-right w-full sm:w-auto">
                            <div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Date</div>
                                <div className="text-sm font-medium">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Status</div>
                                <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md inline-block">Paid</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-8 sm:mb-12 ring-1 ring-gray-200 rounded-lg overflow-x-auto overflow-hidden">
                    <table className="w-full text-left min-w-[400px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-3 px-3 sm:px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider w-[50%]">Item Description</th>
                                <th className="py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right w-[20%]">Rate</th>
                                <th className="py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right w-[15%]">Qty</th>
                                <th className="py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right w-[15%]">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-4 align-top font-medium text-gray-900">{item.name}</td>
                                    <td className="py-4 px-4 text-right align-top text-gray-600">{formatCurrency(item.rate)}</td>
                                    <td className="py-4 px-4 text-right align-top text-gray-600">{item.qty} {item.unit}</td>
                                    <td className="py-4 px-4 text-right align-top font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-muted-foreground italic">No items added to invoice</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mt-auto">
                    <div className="w-full sm:w-5/12 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="my-4 border-t border-gray-200"></div>
                        <div className="flex justify-between items-end">
                            <span className="text-base font-bold text-gray-900">Grand Total</span>
                            <div className="text-2xl font-bold text-primary">{formatCurrency(total)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="bg-gray-50 px-4 sm:px-12 py-4 sm:py-6 border-t border-gray-100 text-center">
                <p className="text-sm text-muted-foreground">Thank you for your business!</p>
                <p className="text-xs text-gray-400 mt-1">Authorized Signature</p>
            </div>
        </div>
    );
}
