'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    clients: 0,
    revenue: 0,
    invoices: 0,
    devices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const [
      { count: clients },
      { count: devices },
      { count: invoices },
      { data: deviceData },
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('devices').select('*', { count: 'exact', head: true }),
      supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('devices').select('monthly_price'),
    ]);

    const revenue = deviceData?.reduce((s, d) => s + (d.monthly_price || 0), 0) ?? 0;

    setStats({
      clients: clients ?? 0,
      revenue,
      invoices: invoices ?? 0,
      devices: devices ?? 0,
    });
    setLoading(false);
  };

  const items = [
    { label: 'Active Clients', value: stats.clients.toString(), icon: '👥', color: '#E8931E' },
    { label: 'Monthly Revenue', value: `₪${stats.revenue.toLocaleString()}`, icon: '💰', color: '#4A9E7A' },
    { label: 'Pending Invoices', value: stats.invoices.toString(), icon: '🧾', color: '#7A8EE8' },
    { label: 'Managed Devices', value: stats.devices.toString(), icon: '🖥️', color: '#E8931E' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(stat => (
        <div key={stat.label} className="rounded-2xl p-5"
          style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">{stat.icon}</span>
            {loading ? (
              <div className="w-8 h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
            ) : (
              <span className="text-xs px-2 py-1 rounded-full"
                style={{ background: `${stat.color}20`, color: stat.color }}>
                live
              </span>
            )}
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
            {loading ? '...' : stat.value}
          </div>
          <div className="text-sm" style={{ color: '#9A9188' }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}