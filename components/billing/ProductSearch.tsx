"use client";

import * as React from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { PRODUCTS } from "@/lib/products";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export function ProductSearch() {
    const [open, setOpen] = React.useState(false);
    const addItem = useInvoiceStore((state) => state.addItem);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSelect = (productId: string) => {
        const product = PRODUCTS.find((p) => p.id === productId);
        if (product) {
            addItem(product);
            toast.success(`Added ${product.name}`);
            setOpen(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-start text-sm text-muted-foreground relative"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                Search products...
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Products">
                        {PRODUCTS.map((product) => (
                            <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => handleSelect(product.id)}
                            >
                                <div className="flex justify-between w-full items-center">
                                    <div className="flex flex-col">
                                        <span>{product.name}</span>
                                        <span className="text-xs text-muted-foreground">{product.category}</span>
                                    </div>
                                    <span className="text-sm font-bold text-black">{formatCurrency(product.price)}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
