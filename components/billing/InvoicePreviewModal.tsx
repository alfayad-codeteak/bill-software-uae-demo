"use client";

import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useBillsStore } from "@/store/useBillsStore";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, getShareableBillUrl } from "@/lib/utils";
import { sendOrderToYaadro } from "@/lib/yaadro";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import { Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceiptPreview } from "./ReceiptPreview";
import { QRCodeCanvas } from "qrcode.react";
import { InvoiceTemplate } from "./InvoiceTemplate";

// Helper to generate Invoice ID (mock)
const generateInvoiceId = () => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

export function InvoicePreviewModal() {
    const { customer, items, getSubtotal, getTotalTax, getGrandTotal, viewMode, setViewMode, resetInvoice, invoiceNumber, date } = useInvoiceStore();
    const { saveBill } = useBillsStore();
    const [internalOpen, setInternalOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Control dialog open state based on viewMode or user interaction
    const isOpen = viewMode || internalOpen;
    const onOpenChange = (open: boolean) => {
        if (viewMode) {
            // If in view mode, closing means "Back to Editor" logic? 
            // Or maybe we forbid closing via normal means and force simple "Back" button
            if (!open) {
                // User tried to close (esc or click outside)
                // We could treat this as "Back to Editor"
                setViewMode(false);
                resetInvoice(); // Clear the loaded shared bill
            }
        } else {
            setInternalOpen(open);
        }
    };

    const handleBackToEditor = () => {
        setViewMode(false);
        resetInvoice();
    };

    const getCurrentBill = () => ({
        invoiceNumber,
        date,
        customer,
        items,
        subtotal: getSubtotal(),
        tax: getTotalTax(),
        total: getGrandTotal(),
    });

    const handlePreviewClick = async () => {
        if (items.length === 0) {
            toast.error("Add items before previewing");
            return;
        }
        const bill = getCurrentBill();
        await saveBill(bill);
        const yaadroResult = await sendOrderToYaadro(bill);
        if (yaadroResult.ok) toast.success("Bill saved · Order sent to Yaadro");
        else if (yaadroResult.error && !yaadroResult.error.includes("not configured")) toast.error("Bill saved · Yaadro: " + yaadroResult.error);
        else toast.success("Bill saved");
        setInternalOpen(true);
    };

    const handleDownloadPdf = async () => {
        const bill = getCurrentBill();
        const result = await sendOrderToYaadro(bill);
        if (result.ok) toast.success("Order sent to Yaadro");
        else if (result.error && !result.error.includes("not configured")) toast.error("Yaadro: " + result.error);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    const subtotal = getSubtotal();
    const tax = getTotalTax();
    const total = getGrandTotal();

    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [barcodeUrl, setBarcodeUrl] = useState<string>("");

    useEffect(() => {
        if (!invoiceNumber) return;

        // Short URL by id – bill loads from Supabase when opened
        const shareUrl = getShareableBillUrl({ invoiceNumber });
        if (!shareUrl) return;
        import("qrcode").then((QRCode) => {
            QRCode.toDataURL(shareUrl, { width: 100, margin: 1 }, (err, url) => {
                if (!err) setQrCodeUrl(url);
            });
        });

        // Generate Barcode
        import("jsbarcode").then((JsBarcode) => {
            const canvas = document.createElement("canvas");
            JsBarcode.default(canvas, invoiceNumber, {
                format: "CODE128",
                displayValue: true,
                width: 2,
                height: 40,
                fontSize: 14,
                margin: 0
            });
            setBarcodeUrl(canvas.toDataURL("image/png"));
        });
    }, [invoiceNumber]);

    if (!isClient) return null; // Prevent hydration error for PDFDownloadLink

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {!viewMode && (
                <DialogTrigger asChild>
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" onClick={handlePreviewClick}>
                        <Eye className="w-4 h-4 mr-2" /> Print Bill
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="fixed inset-0 translate-x-0 translate-y-0 w-full h-full max-w-none max-h-none m-0 p-0 bg-white rounded-none overflow-hidden shadow-lg flex flex-col sm:inset-4 sm:rounded-lg sm:w-[calc(100vw-2rem)] sm:h-[calc(100vh-2rem)] sm:max-w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-2rem)]">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-background flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                        <DialogTitle className="text-base sm:text-lg truncate">{viewMode ? `Shared • ${invoiceNumber}` : "Invoice Preview"}</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">{viewMode ? "Read-only shared bill." : "Review and download."}</DialogDescription>
                    </div>
                    {viewMode && (
                        <Button variant="outline" onClick={handleBackToEditor}>
                            Back to Editor
                        </Button>
                    )}
                </DialogHeader>

                <Tabs defaultValue="standard" className="flex-1 flex flex-col min-h-0 bg-white">
                    <div className="px-4 sm:px-6 py-2 border-b bg-muted/20 flex justify-center">
                        <TabsList className="grid w-full max-w-2xl grid-cols-2">
                            <TabsTrigger value="standard">Standard Invoice</TabsTrigger>
                            <TabsTrigger value="receipt">Thermal Receipt</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Standard Invoice Tab */}
                    <TabsContent value="standard" className="flex-1 overflow-hidden p-0 m-0 data-[state=active]:flex flex-col h-full">
                        <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
                            <InvoiceTemplate invoiceId={invoiceNumber} date={date} />
                        </div>
                    </TabsContent>

                    {/* Receipt Tab */}
                    <TabsContent value="receipt" className="flex-1 overflow-hidden bg-muted/30 p-0 m-0 data-[state=active]:flex flex-col h-full">
                        <ReceiptPreview />
                    </TabsContent>
                </Tabs>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-background flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                        {qrCodeUrl && (
                            <div className="flex flex-col items-center mr-4">
                                <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
                                <span className="text-[10px] text-muted-foreground">Scan to Share</span>
                            </div>
                        )}
                        <PDFDownloadLink
                            document={<InvoicePDF customer={customer} items={items} invoiceId={invoiceNumber} date={date} qrCodeUrl={qrCodeUrl} barcodeUrl={barcodeUrl} />}
                            fileName={`Invoice-${invoiceNumber}.pdf`}
                        >
                            {({ loading }) => (
                                <Button disabled={loading || items.length === 0} onClick={handleDownloadPdf}>
                                    <Download className="w-4 h-4 mr-2" />
                                    {loading ? 'Generating PDF...' : 'Download PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
