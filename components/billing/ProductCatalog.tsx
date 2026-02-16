"use client";

import { useState } from "react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { ProductSearch } from "./ProductSearch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Assuming ScrollArea is not added, I'll use standard div.
// Or I can add ScrollArea. It's better to use standard div if not installed.

const CATEGORIES = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

export function ProductCatalog() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredProducts =
        selectedCategory === "All"
            ? PRODUCTS
            : PRODUCTS.filter((p) => p.category === selectedCategory);

    return (
        <div className="flex flex-col h-full bg-muted/20 border-r">
            <div className="p-4 border-b space-y-4 bg-background">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Product Catalog</h2>
                    <p className="text-sm text-muted-foreground">
                        Browse and add items to invoice
                    </p>
                </div>
                <ProductSearch />

                <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap",
                                selectedCategory === cat
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-muted"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 @container">
                <div className="grid grid-cols-2 @md:grid-cols-3 @xl:grid-cols-4 gap-3">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
