'use client';

import { useState, useEffect } from 'react';
import { supabase, Invoice, Client } from '@/lib/supabase';

const statusColor: Record<string, { bg: string; color: string; border: string }> = {
  pending:   { bg: 'rgba(232,147,30,0.1)',  color: '#E8931E', border: 'rgba(232,147,30,0.3)' },
  paid:      { bg: 'rgba(74,158,122,0.1)',  color: '#4A9E7A', border: 'rgba(74,158,122,0.3)' },
  cancelled: { bg: 'rgba(255,80,80,0.1)',   color: '#ff5050', border: 'rgba(255,80,80,0.3)' },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    client_id: '',
    client_name: '',
    phone: '',
    items: [{ description: '', qty: 1, price: 100 }]
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: inv }, { data: cli }] = await Promise.all([
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').eq('status', 'active'),
    ]);
    if (inv) setInvoices(inv);
    if (cli) setClients(cli);
    setLoading(false);
  };

  const selectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setForm(p => ({ ...p, client_id: clientId, client_name: client.name, phone: client.phone }));
    }
  };

  const addItem = () =>
    setForm(p => ({ ...p, items: [...p.items, { description: '', qty: 1, price: 100 }] }));

  const removeItem = (i: number) =>
    setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const updateItem = (i: number, field: string, value: string | number) =>
    setForm(p => ({ ...p, items: p.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }));

  const total = form.items.reduce((s, i) => s + i.qty * i.price, 0);

  const createInvoice = async () => {
    if (!form.client_name) return;
    const id = `INV-${Date.now().toString().slice(-4)}`;
    const { data } = await supabase.from('invoices').insert({
      id,
      client_id: form.client_id || null,
      client_name: form.client_name,
      phone: form.phone,
      status: 'pending',
      total,
      items: form.items,
    }).select().single();
    if (data) {
      setInvoices(p => [data, ...p]);
      setForm({ client_id: '', client_name: '', phone: '', items: [{ description: '', qty: 1, price: 100 }] });
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('invoices').update({ status }).eq('id', id);
    setInvoices(p => p.map(inv => inv.id === id ? { ...inv, status: status as Invoice['status'] } : inv));
  };

  const sendWhatsApp = (invoice: Invoice) => {
    const lines = invoice.items.map((i: {description:string;qty:number;price:number}) =>
      `• ${i.description} × ${i.qty} — ₪${i.qty * i.price}`).join('%0A');
    const msg = `Invoice ${invoice.id}%0ADate: ${new Date(invoice.created_at).toLocaleDateString('en-GB')}%0A%0A${lines}%0A%0ATotal: ₪${invoice.total}`;
    window.open(`https://wa.me/972${invoice.phone?.replace(/\D/g,'').slice(-9)}?text=${msg}`, '_blank');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#DDD5C8] mb-1">Invoices</h1>
          <p className="text-[#9A9188]">{invoices.length} total</p>
        </div>
        <button onClick={() => setCreating(p => !p)}
          className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          style={{ background: '#E8931E', color: '#0A0908' }}>
          {creating ? '✕ Cancel' : '+ New Invoice'}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: '#1A1815', border: '1px solid rgba(232,147,30,0.25)' }}>
          <h2 className="text-lg font-bold text-[#DDD5C8] mb-4">New Invoice</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <select
              value={form.client_id}
              onChange={e => selectClient(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}>
              <option value="">Select client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <div className="grid grid-cols-12 gap-2 text-xs text-[#9A9188] px-1">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Price ₪</div>
              <div className="col-span-2 text-center">Total</div>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-6 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}
                  placeholder="Service description"
                  value={item.description}
                  onChange={e => updateItem(i, 'description', e.target.value)} />
                <input className="col-span-2 px-2 py-2 rounded-lg text-sm text-center outline-none"
                  style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}
                  type="number" min="1" value={item.qty}
                  onChange={e => updateItem(i, 'qty', +e.target.value)} />
                <input className="col-span-2 px-2 py-2 rounded-lg text-sm text-center outline-none"
                  style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}
                  type="number" min="0" value={item.price}
                  onChange={e => updateItem(i, 'price', +e.target.value)} />
                <div className="col-span-1 text-center text-sm font-semibold" style={{ color: '#4A9E7A' }}>
                  ₪{item.qty * item.price}
                </div>
                <button onClick={() => removeItem(i)}
                  className="col-span-1 text-center text-[#9A9188] hover:text-red-400 transition-colors text-lg">×</button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={addItem} className="text-sm" style={{ color: '#E8931E' }}>+ Add line</button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-[#9A9188]">Total</div>
                <div className="text-2xl font-bold" style={{ color: '#E8931E' }}>₪{total}</div>
              </div>
              <button onClick={createInvoice}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                style={{ background: '#E8931E', color: '#0A0908' }}>
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-center py-16 text-[#9A9188]">Loading...</div>}

      {!loading && invoices.length === 0 && !creating && (
        <div className="text-center py-24 rounded-2xl"
          style={{ border: '1px dashed rgba(255,255,255,0.1)', background: '#111009' }}>
          <div className="text-5xl mb-4">🧾</div>
          <p className="text-[#9A9188] text-lg mb-2">No invoices yet</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {invoices.map(invoice => (
          <div key={invoice.id} className="rounded-2xl p-5"
            style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm font-bold" style={{ color: '#E8931E' }}>{invoice.id}</div>
                <div className="font-semibold text-[#DDD5C8]">{invoice.client_name}</div>
                <div className="text-sm text-[#9A9188]">
                  {new Date(invoice.created_at).toLocaleDateString('en-GB')}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-bold text-lg" style={{ color: '#4A9E7A' }}>₪{invoice.total}</div>
                <div className="text-xs px-2 py-1 rounded-full"
                  style={statusColor[invoice.status]}>
                  {invoice.status}
                </div>
                <button onClick={() => sendWhatsApp(invoice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}>
                  📱 Send
                </button>
                <div className="flex gap-1">
                  {['pending','paid','cancelled'].map(s => (
                    <button key={s} onClick={() => updateStatus(invoice.id, s)}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{
                        background: invoice.status === s ? statusColor[s].bg : 'transparent',
                        color: invoice.status === s ? statusColor[s].color : '#9A9188',
                        border: `1px solid ${invoice.status === s ? statusColor[s].border : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(invoice.items as {description:string;qty:number;price:number}[]).map((item, i) => (
                <div key={i} className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.06)', color: '#9A9188' }}>
                  {item.description} × {item.qty} — <span style={{ color: '#E8931E' }}>₪{item.qty * item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}