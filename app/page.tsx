"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCatalog } from "@/components/billing/ProductCatalog";
import { CustomerForm } from "@/components/billing/CustomerForm";
import { InvoiceTable } from "@/components/billing/InvoiceTable";
import { InvoiceSummary } from "@/components/billing/InvoiceSummary";
import { InvoicePreviewModal } from "@/components/billing/InvoicePreviewModal";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { db } from "@/lib/db";
import { SharedBillNotFound } from "@/components/billing/SharedBillNotFound";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BillHistory } from "@/components/billing/BillHistory";
import { Save, History, RotateCcw } from "lucide-react";
import { useBillsStore } from "@/store/useBillsStore";
import { toast } from "sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

function HomeContent() {
  const { setViewMode, setCustomer, items, setInvoiceNumber, setDate, resetInvoice, viewMode, loadInvoice, invoiceNumber, date, customer, getSubtotal, getTotalTax, getGrandTotal } = useInvoiceStore();
  const { saveBill } = useBillsStore();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize invoice number if missing (e.g. first load)
    if (!useInvoiceStore.getState().invoiceNumber) {
      const newId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setInvoiceNumber(newId);
    }
  }, []);

  useEffect(() => {
    const viewId = searchParams.get('view') || searchParams.get('v');

    if (viewId) {
      const loadSharedBill = async () => {
        try {
          const bill = await db.bills.get(viewId);

          if (bill) {
            loadInvoice(bill);
            toast.success("Loaded shared bill");
          } else {
            setNotFound(true);
          }
        } catch (error) {
          console.error("Error loading bill:", error);
          setNotFound(true);
        }
      };
      loadSharedBill();
    } else {
      setViewMode(false);
      setNotFound(false);
    }
  }, [searchParams, setViewMode, loadInvoice]);

  const handleReset = () => {
    if (viewMode) {
      setViewMode(false);
      resetInvoice();
      // Also clear URL if possible without reload, but viewId logic is in effect.
      // Usually we redirect to '/'.
      window.history.replaceState(null, '', '/');
      return;
    }

    if (confirm("Are you sure you want to clear the current invoice?")) {
      resetInvoice();
      toast.info("Invoice cleared");
    }
  };

  const handleSave = async () => {
    if (!items.length) {
      toast.error("Add items before saving");
      return;
    }

    // Create bill object
    const bill = {
      invoiceNumber: invoiceNumber,
      date: date,
      customer: customer,
      items: items,
      subtotal: getSubtotal(),
      tax: getTotalTax(),
      total: getGrandTotal(),
    };

    await saveBill(bill);
    toast.success("Bill saved successfully");
    setIsHistoryOpen(true);
  };

  if (!isClient) return null;

  if (notFound) {
    return <SharedBillNotFound />;
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-50/50">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full border-r flex flex-col bg-muted/10">
            <ProductCatalog />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={30} minSize={20}>
              <div className="h-full p-6 border-b overflow-y-auto bg-card">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Customer Details</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive h-7 text-xs">
                      <RotateCcw className="w-3 h-3 mr-1" /> {viewMode ? "Exit View Mode" : "Reset"}
                    </Button>
                  </div>
                </div>
                <div className={viewMode ? "pointer-events-none opacity-80" : ""}>
                  <CustomerForm />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={70} minSize={30}>
              <div className="h-full flex flex-col min-h-0 bg-background">
                <header className="px-6 py-3 border-b flex justify-between items-center bg-muted/20">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">{viewMode ? "Viewing Shared Bill" : "Invoice Preview"}</h2>
                    <p className="text-xs text-muted-foreground">{viewMode ? "Read-only mode" : `Draft mode • ${new Date().toLocaleDateString()}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSave} disabled={viewMode || items.length === 0}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>

                    <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <History className="w-4 h-4 mr-2" /> History
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                        <SheetHeader className="mb-4">
                          <SheetTitle>Saved Bills</SheetTitle>
                        </SheetHeader>
                        <BillHistory />
                      </SheetContent>
                    </Sheet>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                  <div className="space-y-6">
                    <section className={viewMode ? "pointer-events-none" : ""}>
                      <InvoiceTable />
                    </section>
                    <section className="flex justify-end">
                      <div className="w-full">
                        <InvoiceSummary />
                      </div>
                    </section>
                  </div>
                </div>

                <footer className="p-4 border-t bg-background mt-auto">
                  <InvoicePreviewModal />
                </footer>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
