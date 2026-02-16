"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

const customerSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal('')),
    gstin: z.string().optional(),
    address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomerForm() {
    const { customer, setCustomer } = useInvoiceStore();

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer,
        mode: "onBlur"
    });

    // Sync form with store on change
    // Alternatively, can use useForm's watch and useEffect
    const watchedValues = form.watch();

    useEffect(() => {
        const subscription = form.watch((value) => {
            setCustomer(value as Partial<CustomerFormValues>);
        });
        return () => subscription.unsubscribe();
    }, [form.watch, setCustomer]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                        id="name"
                        placeholder="Business or Person Name"
                        {...form.register("name")}
                        className={form.formState.errors.name ? "border-red-500" : ""}
                    />
                    {form.formState.errors.name && <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+91 98765 43210" {...form.register("phone")} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="billing@company.com" {...form.register("email")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gstin">TRN (Optional)</Label>
                    <Input id="gstin" placeholder="1002..." {...form.register("gstin")} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Billing Address</Label>
                <Input id="address" placeholder="Street, City, State, Zip" {...form.register("address")} />
            </div>
        </div>
    );
}
