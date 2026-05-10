import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Браузерный клиент — хранит сессию в cookies
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Types
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  notes: string;
  created_at: string;
}

export interface Device {
  id: string;
  client_id: string;
  name: string;
  type: string;
  monthly_price: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  client_name: string;
  phone: string;
  status: 'pending' | 'paid' | 'cancelled';
  total: number;
  items: InvoiceItem[];
  created_at: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

export interface Pricing {
  id: string;
  category: string;
  name: string;
  monthly_price: number;
  hourly_price: number;
}