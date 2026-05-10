'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/LangContext';

interface Device {
  id: string;
  name: string;
  type: string;
  monthly_price: number;
}

interface Invoice {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: { description: string; qty: number; price: number }[];
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  devices: Device[];
  invoices: Invoice[];
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  paid:      { bg: 'rgba(74,158,122,0.1)',  color: '#4A9E7A', border: 'rgba(74,158,122,0.3)' },
  pending:   { bg: 'rgba(232,147,30,0.1)',  color: '#E8931E', border: 'rgba(232,147,30,0.3)' },
  cancelled: { bg: 'rgba(255,80,80,0.1)',   color: '#ff5050', border: 'rgba(255,80,80,0.3)' },
};

const DEVICE_ICONS: Record<string, string> = {
  'Windows PC': '🪟', 'Mac': '🍎', 'Linux PC': '🐧',
  'Windows Server': '🗄️', 'Linux Server': '🗄️', 'NAS / Storage': '💾',
  'Switch': '🔀', 'Router / Firewall': '🛡️', 'Access Point WiFi': '📡',
  'Rack Cabinet': '🗃️', 'Printer / MFP': '🖨️', 'IP Camera': '📷', 'IP Phone': '📞',
};

const LANGS = [
  { code: 'he' as const, label: 'עב' },
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
];

export default function PortalPage() {
  const router = useRouter();
  const { t, lang, setLang, dir } = useLang();
  const p = t.portal;

  const [user, setUser] = useState<{ email: string; name: string; avatar: string } | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'invoices' | 'add' | 'orders' | 'profile'>('overview');
  const [profile, setProfile] = useState({
    company_name: '',
    tax_id: '',
    address: '',
    city: '',
    contact_name: '',
    phone: '',
    email: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pricing, setPricing] = useState<{id:string;category:string;name:string;price:number;unit:string;service_type:string;active:boolean}[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [requestSent, setRequestSent] = useState(false);
  const [orders, setOrders] = useState<{
    id: string;
    created_at: string;
    status: string;
    service_level: string;
    total: number;
    items: { name: string; qty: number; price: number; total: number }[];
  }[]>([]);

  const loadOrders = async (clientId?: string) => {
    const id = clientId || clientData?.id;
    if (!id) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const [isVip, setIsVip] = useState(false);
  const VIP_MULTIPLIER = 1.75;
  const [pricingFilter, setPricingFilter] = useState<'monthly'|'onetime'|'hourly'>('monthly');

  useEffect(() => {
    supabase.from('pricing').select('*').order('category').then(({ data }) => {
      if (data) setPricing(data);
    });
  }, []);

  const cartTotal = pricing
    .filter(item => cart[item.id] > 0)
    .reduce((s, item) => s + Math.round(item.price * (cart[item.id] || 0) * (isVip ? VIP_MULTIPLIER : 1)), 0);

  const cartItems = pricing.filter(item => cart[item.id] > 0);

  const sendRequest = async () => {
    if (!clientData) return;

    const orderItems = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      service_type: item.service_type,
      qty: cart[item.id],
      price: item.price,
      total: Math.round(item.price * cart[item.id] * (isVip ? VIP_MULTIPLIER : 1)),
    }));

    const { data: order, error } = await supabase.from('orders').insert({
      client_id: clientData.id,
      client_name: clientData.name,
      client_email: clientData.email,
      service_level: isVip ? 'vip' : 'standard',
      items: orderItems,
      total: cartTotal,
      status: 'pending',
    }).select().single();

    console.log('order created:', order);
    console.log('order error:', error);

    setRequestSent(true);
    setCart({});

    // Обновляем список заказов
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', clientData.id)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);

    setTimeout(() => setRequestSent(false), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/portal/login'); return; }
      const u = session.user;
      setUser({
        email: u.email!,
        name: u.user_metadata?.full_name || u.email!,
        avatar: u.user_metadata?.avatar_url || '',
      });
      loadClientData(u.email!);
    });
  }, [router]);

  const loadClientData = async (email: string) => {
    const { data: client } = await supabase
      .from('clients').select('*, devices(*)').eq('email', email).single();
    if (!client) { setNotFound(true); setLoading(false); return; }
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });
    console.log('client id:', client.id);
    console.log('invoices:', invoices);
    setClientData({ id: client.id, name: client.name, email: client.email, devices: client.devices || [], invoices: invoices || [] });
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);
    setProfile({
      company_name: client.company_name || '',
      tax_id: client.tax_id || '',
      address: client.address || '',
      city: client.city || '',
      contact_name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
    });
    setLoading(false);
  };

  const downloadPDF = async (invoice: Invoice) => {
    try {
      const res = await fetch('/api/invoice-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice,
          client: {
            ...profile,
            company_name: profile.company_name || clientData?.name,
          }
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF error:', e);
    }
  };

  const saveProfile = async () => {
    if (!clientData) return;
    setProfileSaving(true);
    const { error } = await supabase.from('clients').update({
      company_name: profile.company_name,
      tax_id: profile.tax_id,
      address: profile.address,
      city: profile.city,
      name: profile.contact_name,
      phone: profile.phone,
    }).eq('id', clientData.id);
    console.log('save error:', error);
    console.log('client id:', clientData.id);
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const monthlyTotal = clientData?.devices.reduce((s, d) => s + d.monthly_price, 0) ?? 0;
  const pendingInvoices = clientData?.invoices.filter(i => i.status === 'pending').length ?? 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0908' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: '#E8931E', borderTopColor: 'transparent' }} />
        <div className="text-sm" style={{ color: '#9A9188' }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" dir={dir} style={{ background: '#0A0908' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b px-5 py-3 flex items-center justify-between"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,9,8,0.97)', backdropFilter: 'blur(12px)' }}>
        <div className="font-bold text-lg cursor-pointer" style={{ fontFamily: 'Verdana, sans-serif', color: '#DDD5C8' }}
          onClick={() => router.push('/')}>
          IT<span style={{ color: '#E8931E' }}>Seder</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Lang switcher */}
          <div className="flex gap-1">
            {LANGS.map(({ code, label }) => (
              <button key={code} onClick={() => setLang(code)}
                className="px-2 py-1 rounded-full text-xs border transition-all"
                style={{
                  background: lang === code ? 'rgba(232,147,30,0.1)' : 'transparent',
                  border: `1px solid ${lang === code ? '#E8931E' : 'rgba(255,255,255,0.1)'}`,
                  color: lang === code ? '#E8931E' : '#9A9188',
                }}>
                {label}
              </button>
            ))}
          </div>

          {user?.avatar && (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover"
              style={{ border: '2px solid rgba(232,147,30,0.3)' }} />
          )}
          <button onClick={signOut}
            className="text-xs px-3 py-1.5 rounded-lg border transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9188' }}>
            {p.signOut}
          </button>
        </div>
      </header>

      {/* Not found */}
      {notFound && (
        <div className="max-w-md mx-auto px-5 py-16 text-center">
          <div className="rounded-2xl p-8" style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-[#DDD5C8] mb-2">{p.notFound}</h2>
            <p className="text-sm mb-2" style={{ color: '#9A9188' }}>{p.notFoundDesc}</p>
            <p className="text-xs mb-6 px-3 py-2 rounded-lg font-mono" style={{ background: '#111009', color: '#E8931E' }}>
              {user?.email}
            </p>
            <a href="https://wa.me/972525983311" target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium w-full justify-center"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}>
              📱 {p.contactAccess}
            </a>
          </div>
        </div>
      )}

      {clientData && (
        <div className="max-w-2xl mx-auto px-5 py-6">

          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#DDD5C8]">
              {p.welcome}, {clientData.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9A9188' }}>{p.subtitle}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl p-4 text-center"
              style={{ background: '#1A1815', border: '1px solid rgba(232,147,30,0.2)' }}>
              <div className="text-2xl font-bold" style={{ color: '#E8931E' }}>₪{monthlyTotal}</div>
              <div className="text-xs mt-1" style={{ color: '#9A9188' }}>{p.monthly}</div>
            </div>
            <div className="rounded-xl p-4 text-center"
              style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-2xl font-bold text-[#DDD5C8]">{clientData.devices.length}</div>
              <div className="text-xs mt-1" style={{ color: '#9A9188' }}>{p.devices}</div>
            </div>
            <div className="rounded-xl p-4 text-center"
              style={{ background: '#1A1815', border: `1px solid ${pendingInvoices > 0 ? 'rgba(232,147,30,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
              <div className="text-2xl font-bold" style={{ color: pendingInvoices > 0 ? '#E8931E' : '#DDD5C8' }}>
                {pendingInvoices}
              </div>
              <div className="text-xs mt-1" style={{ color: '#9A9188' }}>{p.pending}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {[
              { key: 'overview', label: p.overview },
              { key: 'devices', label: p.devicesTab },
              { key: 'invoices', label: p.invoicesTab },
              { key: 'add', label: `➕ ${p.addDevices}` },
              { key: 'orders', label: '📦 ' + (lang === 'he' ? 'הזמנות' : lang === 'ru' ? 'Заказы' : 'Orders') },
              { key: 'profile', label: '👤 ' + (lang === 'he' ? 'פרופיל' : lang === 'ru' ? 'Профиль' : 'Profile') },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.key ? 'rgba(232,147,30,0.1)' : 'transparent',
                  border: `1px solid ${activeTab === tab.key ? 'rgba(232,147,30,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: activeTab === tab.key ? '#E8931E' : '#9A9188',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl p-5"
                style={{ background: 'linear-gradient(135deg,rgba(232,147,30,0.1),rgba(74,158,122,0.06))', border: '1px solid rgba(232,147,30,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-[#DDD5C8]">{p.monthlySubscription}</div>
                  <div className="text-xs px-2 py-1 rounded-full"
                    style={{ background: 'rgba(74,158,122,0.1)', color: '#4A9E7A', border: '1px solid rgba(74,158,122,0.3)' }}>
                    {p.active}
                  </div>
                </div>
                <div className="text-4xl font-bold mb-1" style={{ color: '#E8931E' }}>₪{monthlyTotal}</div>
                <div className="text-sm" style={{ color: '#9A9188' }}>
                  {clientData.devices.length} {p.devices} · {p.billedMonthly}
                </div>
              </div>

              {clientData.devices.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-[#DDD5C8]">{p.recentDevices}</div>
                    <button onClick={() => setActiveTab('devices')} className="text-xs" style={{ color: '#E8931E' }}>{p.viewAll}</button>
                  </div>
                  {clientData.devices.slice(0, 3).map(device => (
                    <div key={device.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span>{DEVICE_ICONS[device.type] || '💻'}</span>
                        <span className="text-sm text-[#DDD5C8]">{device.name}</span>
                      </div>
                      <span className="text-sm" style={{ color: '#E8931E' }}>₪{device.monthly_price}/{p.perMonth.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              )}

              {clientData.invoices.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-[#DDD5C8]">{p.recentInvoices}</div>
                    <button onClick={() => setActiveTab('invoices')} className="text-xs" style={{ color: '#E8931E' }}>{p.viewAll}</button>
                  </div>
                  {clientData.invoices.slice(0, 3).map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between py-1">
                      <div>
                        <div className="text-sm font-mono" style={{ color: '#E8931E' }}>{invoice.id}</div>
                        <div className="text-xs" style={{ color: '#9A9188' }}>
                          {new Date(invoice.created_at).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: '#4A9E7A' }}>₪{invoice.total}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={STATUS_STYLE[invoice.status]}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl p-5 text-center" style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-sm mb-3" style={{ color: '#9A9188' }}>{p.needHelp}</p>
                <a href="https://wa.me/972525983311" target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}>
                  📱 {p.contactWa}
                </a>
              </div>
            </div>
          )}

          {/* Devices */}
          {activeTab === 'devices' && (
            <div className="flex flex-col gap-3">
              {clientData.devices.length === 0 ? (
                <div className="text-center py-12 rounded-2xl"
                  style={{ background: '#1A1815', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div className="text-4xl mb-3">🖥️</div>
                  <p className="text-[#9A9188]">{p.noDevices}</p>
                  <p className="text-xs mt-1" style={{ color: '#9A9188' }}>{p.noDevicesDesc}</p>
                </div>
              ) : clientData.devices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {DEVICE_ICONS[device.type] || '💻'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#DDD5C8]">{device.name}</div>
                      <div className="text-xs" style={{ color: '#9A9188' }}>{device.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: '#E8931E' }}>₪{device.monthly_price}</div>
                    <div className="text-xs" style={{ color: '#9A9188' }}>{p.perMonth}</div>
                  </div>
                </div>
              ))}
              {clientData.devices.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl mt-2"
                  style={{ background: 'rgba(232,147,30,0.05)', border: '1px solid rgba(232,147,30,0.2)' }}>
                  <span className="text-sm font-medium text-[#DDD5C8]">{p.totalMonthly}</span>
                  <span className="text-lg font-bold" style={{ color: '#E8931E' }}>₪{monthlyTotal}</span>
                </div>
              )}
            </div>
          )}

          {/* Invoices */}
          {activeTab === 'invoices' && (
            <div className="flex flex-col gap-3">
              {clientData.invoices.length === 0 ? (
                <div className="text-center py-12 rounded-2xl"
                  style={{ background: '#1A1815', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div className="text-4xl mb-3">🧾</div>
                  <p className="text-[#9A9188]">{p.noInvoices}</p>
                </div>
              ) : clientData.invoices.map(invoice => (
                <div key={invoice.id} className="rounded-xl p-4"
                  style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold font-mono" style={{ color: '#E8931E' }}>{invoice.id}</div>
                      <div className="text-xs" style={{ color: '#9A9188' }}>
                        {new Date(invoice.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold" style={{ color: '#4A9E7A' }}>₪{invoice.total}</div>
                      <div className="text-xs px-2 py-1 rounded-full" style={STATUS_STYLE[invoice.status]}>
                        {invoice.status}
                      </div>
                      <button onClick={() => downloadPDF(invoice)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(122,142,232,0.1)', border: '1px solid rgba(122,142,232,0.3)', color: '#7A8EE8' }}>
                        📄 PDF
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(invoice.items as { description: string; qty: number; price: number }[]).map((item, i) => (
                      <div key={i} className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.06)', color: '#9A9188' }}>
                        {item.description} × {item.qty}
                        <span style={{ color: '#E8931E' }}> ₪{item.qty * item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl p-5"
                style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 className="text-base font-bold text-[#DDD5C8] mb-4">
                  {lang === 'he' ? 'פרטי העסק' : lang === 'ru' ? 'Данные компании' : 'Business Details'}
                </h2>
                <div className="flex flex-col gap-3">

                  {/* Company name */}
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>
                      {lang === 'he' ? 'שם העסק' : lang === 'ru' ? 'Название компании' : 'Company name'}
                    </label>
                    <input value={profile.company_name}
                      onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
                  </div>

                  {/* Tax ID */}
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>
                      {lang === 'he' ? 'ח.פ / ע.מ' : lang === 'ru' ? 'Номер компании (ח.פ/ע.מ)' : 'Tax ID (ח.פ/ע.מ)'}
                    </label>
                    <input value={profile.tax_id}
                      onChange={e => setProfile(p => ({ ...p, tax_id: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
                  </div>

                  {/* Contact name */}
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>
                      {lang === 'he' ? 'איש קשר' : lang === 'ru' ? 'Контактное лицо' : 'Contact person'}
                    </label>
                    <input value={profile.contact_name}
                      onChange={e => setProfile(p => ({ ...p, contact_name: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>
                      {lang === 'he' ? 'טלפון' : lang === 'ru' ? 'Телефон' : 'Phone'}
                    </label>
                    <input value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>
                      {lang === 'he' ? 'כתובת' : lang === 'ru' ? 'Адрес' : 'Address'}
                    </label>
                    <input value={profile.address}
                      onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>
                      {lang === 'he' ? 'עיר' : lang === 'ru' ? 'Город' : 'City'}
                    </label>
                    <input value={profile.city}
                      onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
                  </div>

                  {/* Email — readonly */}
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9A9188' }}>
                      Email
                    </label>
                    <input value={profile.email} readOnly
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#9A9188' }} />
                  </div>

                </div>

                <button onClick={saveProfile} disabled={profileSaving}
                  className="w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: profileSaved ? '#4A9E7A' : '#E8931E',
                    color: '#0A0908',
                  }}>
                  {profileSaved
                    ? (lang === 'he' ? '✓ נשמר!' : lang === 'ru' ? '✓ Сохранено!' : '✓ Saved!')
                    : profileSaving
                    ? (lang === 'he' ? 'שומר...' : lang === 'ru' ? 'Сохраняем...' : 'Saving...')
                    : (lang === 'he' ? 'שמור שינויים' : lang === 'ru' ? 'Сохранить' : 'Save changes')
                  }
                </button>
              </div>

              {/* Info box */}
              <div className="rounded-xl p-4"
                style={{ background: 'rgba(74,158,122,0.06)', border: '1px solid rgba(74,158,122,0.2)' }}>
                <p className="text-xs" style={{ color: '#4A9E7A' }}>
                  {lang === 'he'
                    ? '📋 הפרטים האלה ישמשו ליצירת חשבוניות מס'
                    : lang === 'ru'
                    ? '📋 Эти данные будут использованы для создания налоговых счетов'
                    : '📋 These details will be used for tax invoice generation'}
                </p>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-3">
              {orders.length === 0 ? (
                <div className="text-center py-12 rounded-2xl"
                  style={{ background: '#1A1815', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div className="text-4xl mb-3">📦</div>
                  <p style={{ color: '#9A9188' }}>
                    {lang === 'he' ? 'אין הזמנות עדיין' : lang === 'ru' ? 'Заказов пока нет' : 'No orders yet'}
                  </p>
                </div>
              ) : orders.map(order => (
                <div key={order.id} className="rounded-2xl p-4"
                  style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>

                  {/* Order header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs font-mono" style={{ color: '#9A9188' }}>
                        {new Date(order.created_at).toLocaleDateString('en-GB')} · {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {order.service_level === 'vip' && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(232,212,30,0.15)', color: '#E8D41E', border: '1px solid rgba(232,212,30,0.3)' }}>
                            ⚡ VIP
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: order.status === 'paid' ? 'rgba(74,158,122,0.1)' : order.status === 'approved' ? 'rgba(122,142,232,0.1)' : 'rgba(232,147,30,0.1)',
                            color: order.status === 'paid' ? '#4A9E7A' : order.status === 'approved' ? '#7A8EE8' : '#E8931E',
                            border: `1px solid ${order.status === 'paid' ? 'rgba(74,158,122,0.3)' : order.status === 'approved' ? 'rgba(122,142,232,0.3)' : 'rgba(232,147,30,0.3)'}`,
                          }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: '#E8931E' }}>₪{order.total}</div>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="flex flex-col gap-1">
                    {(order.items as { name: string; qty: number; total: number }[]).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#9A9188' }}>{item.name} × {item.qty}</span>
                        <span style={{ color: '#E8931E' }}>₪{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Devices */}
          {activeTab === 'add' && (
            <div className="flex flex-col gap-4">

              {/* VIP Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: isVip ? 'rgba(232,212,30,0.06)' : '#1A1815',
                  border: `1px solid ${isVip ? 'rgba(232,212,30,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all .3s'
                }}>
                <div>
                  <div className="font-semibold text-sm" style={{ color: isVip ? '#E8D41E' : '#DDD5C8' }}>
                    {isVip ? '⚡ VIP Service' : 'Standard Service'}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#9A9188' }}>
                    {isVip
                      ? (lang === 'he' ? 'מענה תוך 8 שעות עבודה' : lang === 'ru' ? 'Ответ в течение 8 рабочих часов' : 'Response within 8 working hours')
                      : (lang === 'he' ? 'מענה תוך 24 שעות עבודה' : lang === 'ru' ? 'Ответ в течение 24 рабочих часов' : 'Response within 24 working hours')
                    }
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isVip && (
                    <span className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(232,212,30,0.15)', color: '#E8D41E', border: '1px solid rgba(232,212,30,0.3)' }}>
                      75% VIP price
                    </span>
                  )}
                  <button onClick={() => { setIsVip(p => !p); setCart({}); }}
                    className="w-12 h-6 rounded-full transition-all relative"
                    style={{ background: isVip ? 'rgba(232,212,30,0.4)' : 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute top-1 w-4 h-4 rounded-full transition-all"
                      style={{
                        background: isVip ? '#E8D41E' : '#9A9188',
                        left: isVip ? '26px' : '4px',
                      }} />
                  </button>
                </div>
              </div>

              {/* Service type filter */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'monthly', label: '📅 ' + (lang === 'he' ? 'חודשי' : lang === 'ru' ? 'Ежемесячно' : 'Monthly') },
                  { key: 'onetime', label: '⚡ ' + (lang === 'he' ? 'חד פעמי' : lang === 'ru' ? 'Разово' : 'One-time') },
                  { key: 'hourly',  label: '⏱ ' + (lang === 'he' ? 'לפי שעה' : lang === 'ru' ? 'Почасово' : 'Hourly') },
                ].map(st => (
                  <button key={st.key}
                    onClick={() => { setCart({}); setPricingFilter(st.key as 'monthly'|'onetime'|'hourly'); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: pricingFilter === st.key ? 'rgba(232,147,30,0.1)' : 'transparent',
                      border: `1px solid ${pricingFilter === st.key ? 'rgba(232,147,30,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: pricingFilter === st.key ? '#E8931E' : '#9A9188',
                    }}>
                    {st.label}
                  </button>
                ))}
              </div>

              <p className="text-sm" style={{ color: '#9A9188' }}>{p.selectDevices}</p>

              {/* Grouped by category */}
              {['Workstations', 'Servers', 'Network', 'Other', 'Special'].map(cat => {
                const catItems = pricing.filter(item =>
                  item.category === cat && item.service_type === pricingFilter && item.active
                );
                if (!catItems.length) return null;
                const CAT_COLORS: Record<string, string> = {
                  Workstations: '#E8931E', Servers: '#4A9E7A',
                  Network: '#7A8EE8', Other: '#9A9188', Special: '#E85C5C'
                };
                return (
                  <div key={cat} className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="px-4 py-2 flex items-center gap-2"
                      style={{ background: '#1A1815', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[cat] }} />
                      <span className="text-xs font-semibold" style={{ color: CAT_COLORS[cat] }}>{cat}</span>
                    </div>
                    {catItems.map(item => (
                      <div key={item.id}
                        className="flex items-center justify-between px-4 py-3"
                        style={{ background: '#0F0E0C', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div>
                          <div className="text-sm text-[#DDD5C8]">
                            {DEVICE_ICONS[item.name.split(' —')[0]] || '💻'} {item.name}
                          </div>
                          <div className="text-xs" style={{ color: '#E8931E' }}>
                            ₪{item.price}/{item.unit === 'month' ? 'mo' : item.unit === 'hour' ? 'hr' : 'flat'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCart(c => ({ ...c, [item.id]: Math.max(0, (c[item.id] || 0) - 1) }))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-lg transition-all"
                            style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}>
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-bold"
                            style={{ color: (cart[item.id] || 0) > 0 ? '#E8931E' : '#9A9188' }}>
                            {cart[item.id] || 0}
                          </span>
                          <button
                            onClick={() => setCart(c => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-lg transition-all"
                            style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}>
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Summary */}
              {cartItems.length > 0 && (
                <div className="rounded-2xl p-5"
                  style={{ background: '#1A1815', border: '1px solid rgba(232,147,30,0.25)' }}>
                  <div className="text-sm font-semibold text-[#DDD5C8] mb-3">{p.yourRequest}</div>
                  <div className="flex flex-col gap-2 mb-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span style={{ color: '#9A9188' }}>{item.name} × {cart[item.id]}</span>
                        <span style={{ color: '#E8931E' }}>₪{item.price * cart[item.id]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <div className="text-xs" style={{ color: '#9A9188' }}>{p.totalMonthly}</div>
                      <div className="text-2xl font-bold" style={{ color: '#E8931E' }}>₪{cartTotal}</div>
                    </div>
                    <button onClick={sendRequest}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: requestSent ? '#4A9E7A' : '#E8931E', color: '#0A0908' }}>
                      {requestSent ? `✓ ${p.requestSent}` : p.sendRequest}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}