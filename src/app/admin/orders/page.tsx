'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  service_level: string;
  items: { name: string; qty: number; price: number; total: number }[];
  total: number;
  status: string;
  notes: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  pending:  { bg: 'rgba(232,147,30,0.1)',  color: '#E8931E', border: 'rgba(232,147,30,0.3)' },
  approved: { bg: 'rgba(122,142,232,0.1)', color: '#7A8EE8', border: 'rgba(122,142,232,0.3)' },
  paid:     { bg: 'rgba(74,158,122,0.1)',  color: '#4A9E7A', border: 'rgba(74,158,122,0.3)' },
  rejected: { bg: 'rgba(255,80,80,0.1)',   color: '#ff5050', border: 'rgba(255,80,80,0.3)' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(p => p.map(o => o.id === id ? { ...o, status } : o));
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (loading) return <div className="p-8 text-[#9A9188]">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#DDD5C8] mb-1">Orders</h1>
          <p className="text-[#9A9188]">
            {orders.length} total
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(232,147,30,0.15)', color: '#E8931E' }}>
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <button onClick={loadOrders}
          className="px-4 py-2 rounded-xl text-sm border transition-all"
          style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9188' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'paid'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(232,147,30,0.1)' : 'transparent',
              border: `1px solid ${filter === f ? 'rgba(232,147,30,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: filter === f ? '#E8931E' : '#9A9188',
            }}>
            {f === 'all' ? `📋 All (${orders.length})` : `${f} (${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-24 rounded-2xl"
          style={{ border: '1px dashed rgba(255,255,255,0.1)', background: '#111009' }}>
          <div className="text-5xl mb-4">📦</div>
          <p className="text-[#9A9188]">No orders yet</p>
        </div>
      )}

      {/* Orders list */}
      <div className="flex flex-col gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="rounded-2xl p-5"
            style={{
              background: '#1A1815',
              border: `1px solid ${order.status === 'pending' ? 'rgba(232,147,30,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[#DDD5C8]">{order.client_name}</span>
                  {order.service_level === 'vip' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(232,212,30,0.15)', color: '#E8D41E', border: '1px solid rgba(232,212,30,0.3)' }}>
                      ⚡ VIP
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: '#9A9188' }}>
                  {order.client_email} · {new Date(order.created_at).toLocaleDateString('en-GB')} {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: '#E8931E' }}>₪{order.total}</div>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-xl overflow-hidden mb-4"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm"
                  style={{ background: i % 2 === 0 ? '#111009' : '#0F0E0C', borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ color: '#DDD5C8' }}>{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span style={{ color: '#9A9188' }}>× {item.qty}</span>
                    <span style={{ color: '#E8931E' }}>₪{item.total}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Status controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['pending', 'approved', 'paid', 'rejected'].map(s => (
                  <button key={s} onClick={() => updateStatus(order.id, s)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all capitalize"
                    style={{
                      background: order.status === s ? STATUS_COLORS[s].bg : 'transparent',
                      color: order.status === s ? STATUS_COLORS[s].color : '#9A9188',
                      border: `1px solid ${order.status === s ? STATUS_COLORS[s].border : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="text-xs px-2 py-1 rounded-full"
                style={STATUS_COLORS[order.status] || STATUS_COLORS.pending}>
                {order.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}