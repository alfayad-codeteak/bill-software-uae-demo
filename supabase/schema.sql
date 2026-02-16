-- Run this in Supabase Dashboard → SQL Editor to create the bills table.

create table if not exists public.bills (
  invoice_number text primary key,
  date timestamptz not null,
  customer jsonb not null default '{}',
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  created_at timestamptz default now()
);
