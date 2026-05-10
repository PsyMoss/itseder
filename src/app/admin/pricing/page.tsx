'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PricingItem {
  id: string;
  category: string;
  name: string;
  service_type: string;
  device_condition: string;
  price: number;
  unit: string;
  active: boolean;
  sort_order: number;
}

const CATEGORIES = ['Workstations', 'Servers', 'Network', 'Other', 'Special', 'Cabling'];
const CAT_COLORS: Record<string, string> = {
  Workstations: '#E8931E', Servers: '#4A9E7A',
  Network: '#7A8EE8', Other: '#9A9188',
  Special: '#E85C5C', Cabling: '#E8D41E',
};
const SERVICE_LABELS: Record<string, { label: string; color: string }> = {
  monthly: { label: '📅 Monthly', color: '#4A9E7A' },
  onetime: { label: '⚡ One-time', color: '#7A8EE8' },
  hourly:  { label: '⏱ Hourly',   color: '#E8931E' },
};
const UNIT_LABELS: Record<string, string> = {
  month: '/mo', hour: '/hr', flat: 'flat',
};

const EMPTY_FORM = {
  category: 'Workstations',
  name: '',
  service_type: 'monthly',
  device_condition: 'any',
  price: 100,
  unit: 'month',
};

export default function PricingPage() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'monthly' | 'onetime' | 'hourly'>('all');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [addingLoading, setAddingLoading] = useState(false);

  useEffect(() => { loadPricing(); }, []);

  const loadPricing = async () => {
    setLoading(true);
    const { data } = await supabase.from('pricing').select('*').order('sort_order');
    if (data) setItems(data);
    setLoading(false);
  };

  const updatePrice = (id: string, value: number) => {
    setItems(p => p.map(item => item.id === id ? { ...item, price: value } : item));
    setEdited(p => new Set(p).add(id));
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('pricing').update({ active: !active }).eq('id', id);
    setItems(p => p.map(item => item.id === id ? { ...item, active: !active } : item));
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await supabase.from('pricing').delete().eq('id', id);
    setItems(p => p.filter(item => item.id !== id));
  };

  const saveAll = async () => {
    setSaving(true);
    await Promise.all(
      items.filter(p => edited.has(p.id)).map(item =>
        supabase.from('pricing').update({ price: item.price }).eq('id', item.id)
      )
    );
    setEdited(new Set());
    setSaving(false);
  };

  const addService = async () => {
    if (!form.name.trim()) return;
    setAddingLoading(true);
    const maxOrder = Math.max(...items.map(i => i.sort_order), 0);
    const { data } = await supabase.from('pricing').insert({
      ...form,
      active: true,
      sort_order: maxOrder + 1,
    }).select().single();
    if (data) {
      setItems(p => [...p, data]);
      setForm(EMPTY_FORM);
      setAdding(false);
    }
    setAddingLoading(false);
  };

  // Auto-set unit based on service_type
  const handleServiceTypeChange = (type: string) => {
    const unit = type === 'monthly' ? 'month' : type === 'hourly' ? 'hour' : 'flat';
    setForm(p => ({ ...p, service_type: type, unit }));
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.service_type === filter);

  if (loading) return <div className="p-8 text-[#9A9188]">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#DDD5C8] mb-1">Pricing</h1>
          <p className="text-[#9A9188]">{items.length} services total</p>
        </div>
        <div className="flex gap-2">
          {edited.size > 0 && (
            <button onClick={saveAll} disabled={saving}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: '#4A9E7A', color: '#fff', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : `Save ${edited.size} changes`}
            </button>
          )}
          <button onClick={() => setAdding(p => !p)}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{ background: adding ? 'rgba(255,80,80,0.1)' : '#E8931E', color: adding ? '#ff5050' : '#0A0908' }}>
            {adding ? '✕ Cancel' : '+ Add Service'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: '#1A1815', border: '1px solid rgba(232,147,30,0.3)' }}>
          <h2 className="text-base font-bold text-[#DDD5C8] mb-4">New Service</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">

            {/* Category */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>Category</label>
              <select value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Service type */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>Service Type</label>
              <select value={form.service_type}
                onChange={e => handleServiceTypeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}>
                <option value="monthly">📅 Monthly</option>
                <option value="onetime">⚡ One-time</option>
                <option value="hourly">⏱ Hourly</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>Service Name</label>
              <input value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Windows PC — New Setup"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>Device Condition</label>
              <select value={form.device_condition}
                onChange={e => setForm(p => ({ ...p, device_condition: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}>
                <option value="any">Any</option>
                <option value="new">New</option>
                <option value="existing">Existing</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>Price ₪</label>
              <input type="number" min="0" value={form.price}
                onChange={e => setForm(p => ({ ...p, price: +e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
            </div>

            {/* Unit */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>Unit</label>
              <select value={form.unit}
                onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}>
                <option value="month">/month</option>
                <option value="hour">/hour</option>
                <option value="flat">flat rate</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
            style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div className="text-sm font-medium text-[#DDD5C8]">{form.name || 'Service name...'}</div>
              <div className="text-xs mt-0.5" style={{ color: CAT_COLORS[form.category] }}>{form.category}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${SERVICE_LABELS[form.service_type]?.color}15`, color: SERVICE_LABELS[form.service_type]?.color }}>
                {form.service_type}
              </span>
              <span className="font-bold" style={{ color: '#E8931E' }}>
                ₪{form.price}{UNIT_LABELS[form.unit]}
              </span>
            </div>
          </div>

          <button onClick={addService} disabled={addingLoading || !form.name.trim()}
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: form.name.trim() ? '#E8931E' : 'rgba(255,255,255,0.05)',
              color: form.name.trim() ? '#0A0908' : '#9A9188',
              cursor: form.name.trim() ? 'pointer' : 'not-allowed',
            }}>
            {addingLoading ? 'Adding...' : '+ Add Service'}
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'monthly', 'onetime', 'hourly'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === f ? 'rgba(232,147,30,0.1)' : 'transparent',
              border: `1px solid ${filter === f ? 'rgba(232,147,30,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: filter === f ? '#E8931E' : '#9A9188',
            }}>
            {f === 'all' ? '📋 All' : SERVICE_LABELS[f].label}
          </button>
        ))}
        <div className="ml-auto text-sm" style={{ color: '#9A9188' }}>
          {filteredItems.length} items
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-6">
        {CATEGORIES.map(cat => {
          const catItems = filteredItems.filter(i => i.category === cat);
          if (!catItems.length) return null;
          const color = CAT_COLORS[cat];
          return (
            <div key={cat} className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background: '#1A1815', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <h2 className="font-semibold text-sm" style={{ color }}>{cat}</h2>
                <span className="text-xs" style={{ color: '#9A9188' }}>({catItems.length})</span>
              </div>

              <div className="grid grid-cols-12 gap-3 px-5 py-2 text-xs"
                style={{ background: '#111009', color: '#9A9188', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="col-span-4">Service</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Condition</div>
                <div className="col-span-2 text-center">Price ₪</div>
                <div className="col-span-1 text-center">Unit</div>
                <div className="col-span-1 text-center">•</div>
              </div>

              {catItems.map(item => (
                <div key={item.id}
                  className="grid grid-cols-12 gap-3 px-5 py-3 items-center group"
                  style={{
                    background: edited.has(item.id) ? 'rgba(232,147,30,0.04)' : '#0F0E0C',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    opacity: item.active ? 1 : 0.4,
                  }}>
                  <div className="col-span-4 text-sm text-[#DDD5C8] font-medium truncate">{item.name}</div>
                  <div className="col-span-2">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${SERVICE_LABELS[item.service_type]?.color}15`,
                        color: SERVICE_LABELS[item.service_type]?.color,
                        border: `1px solid ${SERVICE_LABELS[item.service_type]?.color}30`,
                      }}>
                      {item.service_type}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs" style={{ color: '#9A9188' }}>
                    {item.device_condition === 'any' ? '—' : item.device_condition}
                  </div>
                  <div className="col-span-2 flex items-center gap-1 justify-center">
                    <span className="text-xs" style={{ color: '#9A9188' }}>₪</span>
                    <input type="number" min="0" value={item.price}
                      onChange={e => updatePrice(item.id, +e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg text-sm text-center outline-none"
                      style={{
                        background: '#1A1815',
                        border: `1px solid ${edited.has(item.id) ? 'rgba(232,147,30,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        color: '#DDD5C8',
                      }} />
                  </div>
                  <div className="col-span-1 text-center text-xs" style={{ color: '#9A9188' }}>
                    {UNIT_LABELS[item.unit]}
                  </div>
                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <button onClick={() => toggleActive(item.id, item.active)}
                      className="w-7 h-4 rounded-full transition-all relative"
                      style={{
                        background: item.active ? 'rgba(74,158,122,0.3)' : 'rgba(255,255,255,0.1)',
                      }}>
                      <div className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                        style={{
                          background: item.active ? '#4A9E7A' : '#9A9188',
                          left: item.active ? '14px' : '2px',
                        }} />
                    </button>
                    <button onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs transition-all ml-1"
                      style={{ color: '#ff5050' }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}