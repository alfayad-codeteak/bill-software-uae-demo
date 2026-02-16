"use client";

import { useBillsStore } from "@/store/useBillsStore";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Trash2, Eye, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getShareableBillUrlWithData } from "@/lib/utils";

export function BillHistory() {
    const { bills, loadBills, deleteBill } = useBillsStore();

    useEffect(() => {
        loadBills();
    }, [loadBills]); // Add loadBills to dependency array

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    }

    if (bills.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>No saved bills yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Bill History</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bills.map((bill) => (
                    <div key={bill.invoiceNumber} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">{bill.customer.name || "Unknown Customer"}</h3>
                                    <p className="text-sm text-muted-foreground">#{bill.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">{formatCurrency(bill.total)}</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(bill.date), "dd MMM yyyy")}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mb-4">
                                {bill.items.length} items
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon" title="Share Bill">
                                        <QrCode className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Share Bill</DialogTitle>
                                        <DialogDescription>
                                            Anyone with this link can view this bill on any device (e.g. scan QR on mobile).
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                                            <QRCodeCanvas value={getShareableBillUrlWithData({ ...bill, date: new Date(bill.date) })} size={200} level="H" />
                                        </div>
                                        <div className="flex w-full items-center space-x-2">
                                            <div className="grid flex-1 gap-2">
                                                <Label htmlFor="link" className="sr-only">
                                                    Link
                                                </Label>
                                                <Input
                                                    id="link"
                                                    defaultValue={getShareableBillUrlWithData({ ...bill, date: new Date(bill.date) })}
                                                    readOnly
                                                    className="h-9"
                                                />
                                            </div>
                                            <Button type="submit" size="sm" className="px-3" onClick={() => handleCopyLink(getShareableBillUrlWithData({ ...bill, date: new Date(bill.date) }))}>
                                                <span className="sr-only">Copy</span>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button variant="ghost" size="icon" onClick={() => deleteBill(bill.invoiceNumber)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
