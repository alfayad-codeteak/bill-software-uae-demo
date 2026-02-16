"use client";

import { useInvoiceStore } from "@/store/useInvoiceStore";
import { formatCurrency, getShareableBillUrl } from "@/lib/utils";
import Barcode from "react-barcode";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function ReceiptPreview() {
    const { customer, items, getSubtotal, getTotalTax, getGrandTotal, invoiceNumber, date } = useInvoiceStore();

    // Calculate totals
    const subtotal = getSubtotal();
    const tax = getTotalTax();
    const total = getGrandTotal();

    const shareBillUrl = getShareableBillUrl({ invoiceNumber });

    return (
        <div className="w-full h-full flex justify-center p-8 bg-muted/20 overflow-y-auto">
            {/* Ticket Container */}
            <div className="relative w-[340px] bg-white rounded-3xl shadow-xl flex flex-col h-fit my-auto">

                {/* Header - Success Message */}
                <div className="pt-8 px-6 pb-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                        🎉
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
                    <p className="text-gray-500 text-sm">
                        Your ticket has been issued successfully
                    </p>
                </div>

                {/* Perforated Line Visual */}
                <div className="relative h-6 w-full flex items-center justify-center">
                    {/* Left Cutout */}
                    <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-muted/20 rounded-full" />

                    {/* Dashed Line */}
                    <div className="w-[80%] border-t-2 border-dashed border-gray-200" />

                    {/* Right Cutout */}
                    <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-muted/20 rounded-full" />
                </div>

                {/* Ticket Details */}
                <div className="px-6 py-6 space-y-6">

                    {/* ID and Date Row */}
                    <div className="flex justify-between items-start border-b border-dashed border-gray-200 pb-4">
                        <div>
                            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">TICKET NO.</p>
                            <p className="text-gray-900 font-mono font-bold text-lg">{invoiceNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">DATE</p>
                            <p className="text-gray-900 font-medium text-sm">
                                {format(new Date(date), "dd/MM/yyyy")}
                            </p>
                            <p className="text-gray-500 text-xs">
                                {format(new Date(date), "h:mm a")}
                            </p>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="border-b border-dashed border-gray-200 pb-4">
                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-2">CUSTOMER</p>
                        <p className="font-bold text-gray-900 text-sm">
                            {customer.name || "Walk-in Customer"}
                        </p>
                        {customer.phone && (
                            <p className="text-sm text-gray-600 mt-0.5">{customer.phone}</p>
                        )}
                        {customer.address && (
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{customer.address}</p>
                        )}
                        {customer.gstin && (
                            <p className="text-xs text-gray-500 mt-1">TRN: {customer.gstin}</p>
                        )}
                    </div>

                    {/* Items List */}
                    <div>
                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-3">ITEMS ({items.length})</p>
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.id} className="text-sm">
                                    <div className="flex justify-between font-medium text-gray-900">
                                        <span className="flex-1 pr-2">{item.name}</span>
                                        <span>{formatCurrency(item.amount + item.gstAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                                        <span>{item.qty} {item.unit} x {formatCurrency(item.rate)}</span>
                                        <span>VAT: {formatCurrency(item.gstAmount)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>VAT (5%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-900 pt-3 mt-2">
                            <span>TOTAL</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>

                </div>

                {/* Bottom Perforated Line */}
                <div className="relative h-6 w-full flex items-center justify-center">
                    <div className="w-full border-t-2 border-dashed border-gray-200" />
                </div>

                {/* Footer - Barcode & QR */}
                <div className="px-6 py-6 pb-8 flex flex-col items-center">
                    <div className="w-full overflow-hidden flex justify-center mb-6">
                        <Barcode
                            value={invoiceNumber || "INV-000"}
                            width={1.5}
                            height={50}
                            displayValue={true}
                            format="CODE128"
                            background="transparent"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <QRCodeCanvas value={shareBillUrl} size={100} />
                        <p className="text-[10px] text-gray-400 mt-2 text-center">Scan for digital receipt</p>
                    </div>
                </div>

                {/* Bottom Decor (Scalloped edge simulation) */}
                <div className="absolute bottom-[-10px] left-0 right-0 flex justify-between px-2 overflow-hidden"
                    style={{ filter: "drop-shadow(0 -5px 0 white)" }}>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="w-6 h-6 bg-muted/20 rounded-full shrink-0 -ml-1" />
                    ))}
                </div>
            </div>
        </div>
    );
}
