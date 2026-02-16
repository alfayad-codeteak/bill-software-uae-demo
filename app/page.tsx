"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCatalog } from "@/components/billing/ProductCatalog";
import { CustomerForm } from "@/components/billing/CustomerForm";
import { InvoiceTable } from "@/components/billing/InvoiceTable";
import { InvoiceSummary } from "@/components/billing/InvoiceSummary";
import { InvoicePreviewModal } from "@/components/billing/InvoicePreviewModal";
import { SharedBillPage } from "@/components/billing/SharedBillPage";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { db } from "@/lib/db";
import type { Bill } from "@/lib/types";
import { parseBillFromShareUrl } from "@/lib/utils";
import { validateYaadroCustomer, sendOrderToYaadro } from "@/lib/yaadro";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function HomeContent() {
  const { setViewMode, setCustomer, items, setInvoiceNumber, setDate, resetInvoice, viewMode, loadInvoice, invoiceNumber, date, customer, getSubtotal, getTotalTax, getGrandTotal } = useInvoiceStore();
  const { saveBill } = useBillsStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"catalog" | "bill">("catalog");

  // Swipe gesture: track touch start X for mobile tab switch
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const SWIPE_THRESHOLD = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX == null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) {
      setMobileTab("bill");
    } else {
      setMobileTab("catalog");
    }
    setTouchStartX(null);
  };

  function normalizeBill(bill: Bill): Bill {
    return {
      invoiceNumber: bill.invoiceNumber,
      date: bill.date instanceof Date ? bill.date : new Date(bill.date as string | number),
      customer: bill.customer ?? { name: "", email: "", phone: "", address: "" },
      items: Array.isArray(bill.items) ? bill.items : [],
      subtotal: Number(bill.subtotal),
      tax: Number(bill.tax),
      total: Number(bill.total),
      yaadroSentAt: bill.yaadroSentAt,
    };
  }

  const handleOpenSavedBill = (bill: Bill) => {
    loadInvoice(normalizeBill(bill));
    setViewMode(true);
    router.replace(`/?view=${encodeURIComponent(bill.invoiceNumber)}`);
    setIsHistoryOpen(false);
  };

  const handleEditBill = (bill: Bill) => {
    loadInvoice(normalizeBill(bill));
    setViewMode(false);
    router.replace("/");
    setIsHistoryOpen(false);
  };

  const handleSendToYaadro = async (bill: Bill) => {
    const normalized = normalizeBill(bill);
    const result = await sendOrderToYaadro(normalized);
    if (result.ok) {
      await saveBill({ ...normalized, yaadroSentAt: new Date().toISOString() });
      toast.success("Order sent to Yaadro");
    } else {
      toast.error(result.error ?? "Failed to send to Yaadro");
    }
  };

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
          let bill: Awaited<ReturnType<typeof db.bills.get>> = await db.bills.get(viewId);
          if (!bill) {
            const res = await fetch(`/api/bills/${encodeURIComponent(viewId)}`);
            if (res.ok) {
              const data = (await res.json()) as Bill & { date: string };
              const fetchedBill: Bill = {
                ...data,
                date: new Date(data.date),
                items: Array.isArray(data.items) ? data.items : [],
                customer: data.customer ?? { name: "", email: "", phone: "", address: "" },
              };
              bill = fetchedBill;
              await saveBill(fetchedBill);
            }
          }
          if (!bill) {
            const fromHash = parseBillFromShareUrl();
            if (fromHash) {
              await saveBill(fromHash);
              bill = fromHash;
            }
          }
          if (bill) {
            const b = bill as Bill;
            const normalizedBill: Bill = {
              invoiceNumber: b.invoiceNumber,
              date: b.date instanceof Date ? b.date : new Date(b.date as string | number),
              customer: b.customer ?? { name: "", email: "", phone: "", address: "" },
              items: Array.isArray(b.items) ? b.items : [],
              subtotal: Number(b.subtotal),
              tax: Number(b.tax),
              total: Number(b.total),
            };
            loadInvoice(normalizedBill);
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
  }, [searchParams, setViewMode, loadInvoice, saveBill]);

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
    const name = (customer.name || "").trim();
    if (name.length < 2) {
      toast.error("Customer name is required (at least 2 characters)");
      return;
    }
    const phoneValidation = validateYaadroCustomer(customer);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error ?? "Valid UAE phone is required");
      return;
    }

    // Create bill object (preserve yaadroSentAt if updating an existing bill)
    const existing = await db.bills.get(invoiceNumber);
    const bill: Bill = {
      invoiceNumber: invoiceNumber,
      date: date,
      customer: customer,
      items: items,
      subtotal: getSubtotal(),
      tax: getTotalTax(),
      total: getGrandTotal(),
      ...(existing?.yaadroSentAt && { yaadroSentAt: existing.yaadroSentAt }),
    };

    await saveBill(bill);
    toast.success("Bill saved successfully");
    setIsHistoryOpen(true);
  };

  // Keyboard shortcuts (when not in viewMode)
  useEffect(() => {
    if (viewMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName) || target?.isContentEditable;
      if (isInput) return;

      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setIsHistoryOpen(true);
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, items.length, invoiceNumber, date, customer, getSubtotal, getTotalTax, getGrandTotal]); // eslint-disable-line react-hooks/exhaustive-deps -- handlers are stable

  if (!isClient) return null;

  if (notFound) {
    return <SharedBillNotFound />;
  }

  // When viewing a shared bill (e.g. from QR scan), show thermal print + Download PDF
  if (viewMode) {
    return (
      <main className="min-h-screen w-screen bg-muted/20">
        <SharedBillPage />
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-background min-h-0">
      {/* Mobile: tabs for Catalog | Bill */}
      <div className="flex flex-col h-full w-full md:hidden overflow-hidden">
        <header className="shrink-0 px-4 py-3 border-b flex justify-between items-center bg-background gap-2">
          <h2 className="text-base font-bold truncate">Invoice</h2>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={items.length === 0} className="min-h-10 touch-manipulation">
              <Save className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Save</span>
            </Button>
            <Button variant="ghost" size="sm" className="min-h-10 touch-manipulation" onClick={() => setIsHistoryOpen(true)}>
              <History className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">History</span>
            </Button>
          </div>
        </header>
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "catalog" | "bill")} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 px-4 pt-3 pb-2 border-b bg-muted/20">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="catalog" className="touch-manipulation">Catalog</TabsTrigger>
              <TabsTrigger value="bill" className="touch-manipulation">Bill</TabsTrigger>
            </TabsList>
          </div>
          <div
            className="flex-1 flex flex-col min-h-0 overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <TabsContent value="catalog" className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="flex-1 overflow-y-auto min-h-0">
                <ProductCatalog />
              </div>
            </TabsContent>
            <TabsContent value="bill" className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain pb-32">
                <div className="p-4 space-y-6">
                  <section className="bg-card rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Customer</h3>
                      <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive text-xs min-h-9">
                        <RotateCcw className="w-3 h-3 mr-1" /> Reset
                      </Button>
                    </div>
                    <CustomerForm />
                  </section>
                  <section>
                    <InvoiceTable />
                  </section>
                  <section>
                    <InvoiceSummary />
                  </section>
                  <div className="h-24 shrink-0" aria-hidden />
                </div>
              </div>
              <footer className="fixed bottom-0 left-0 right-0 p-4 pt-3 border-t bg-background z-10 md:relative md:bottom-auto md:left-auto md:right-auto">
                <InvoicePreviewModal />
              </footer>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Desktop: catalog | single right section */}
      <div className="hidden md:flex h-full w-full rounded-lg border overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full" id="main-layout">
          <ResizablePanel defaultSize={45} minSize={28} maxSize={65}>
            <div className="h-full border-r flex flex-col bg-muted/10">
              <ProductCatalog />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={55} minSize={35} maxSize={72}>
            <div className="h-full flex flex-col min-h-0 bg-background">
              <header className="shrink-0 px-6 py-4 border-b flex justify-between items-center bg-muted/20">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Invoice</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Draft • {new Date().toLocaleDateString()}</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1" title="Keyboard shortcuts">
                    <kbd className="rounded px-1 bg-muted">⌘P</kbd> Print
                    <span className="mx-1">·</span>
                    <kbd className="rounded px-1 bg-muted">⌘S</kbd> Save
                    <span className="mx-1">·</span>
                    <kbd className="rounded px-1 bg-muted">⌘⇧H</kbd> History
                    <span className="mx-1">·</span>
                    <kbd className="rounded px-1 bg-muted">⌘⇧R</kbd> Reset
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={items.length === 0}>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(true)}>
                    <History className="w-4 h-4 mr-2" /> History
                  </Button>
                </div>
              </header>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-6 py-6 max-w-3xl mx-auto space-y-8">
                  <section className="bg-card rounded-lg border p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Customer details</h3>
                      <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive h-8 text-xs">
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                      </Button>
                    </div>
                    <CustomerForm />
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Items</h3>
                    <InvoiceTable />
                  </section>
                  <section className="flex justify-end">
                    <div className="w-full max-w-sm">
                      <InvoiceSummary />
                    </div>
                  </section>
                </div>
              </div>
              <footer className="shrink-0 px-6 py-4 border-t bg-background">
                <InvoicePreviewModal />
              </footer>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Single shared History sheet (avoids two sidebars when both layouts use same state) */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="w-[100vw] max-w-[100%] sm:max-w-[420px] flex flex-col p-0 overflow-hidden">
          <SheetHeader className="shrink-0 px-4 sm:px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="text-lg font-semibold">Saved Bills</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5">
            <BillHistory onOpenBill={handleOpenSavedBill} onEditBill={handleEditBill} onSendToYaadro={handleSendToYaadro} />
          </div>
        </SheetContent>
      </Sheet>
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
