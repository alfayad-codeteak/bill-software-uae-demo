import { Product } from "./types";
import menuData from "@/data/menu.json";

// Transform menu.json data to Product type
export const PRODUCTS: Product[] = menuData.map((item, index) => ({
    id: `prod-${index + 1}`, // Generate a stable ID
    name: item.name,
    category: item.category,
    price: item.price,
    unit: "Nos", // Default unit for menu items
    gstRate: 0,
    image: item.image
}));
