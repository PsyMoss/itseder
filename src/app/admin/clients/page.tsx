'use client';

import { useState, useEffect } from 'react';
import { supabase, Client, Device } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const DEVICE_TYPES = [
  { type: 'Windows PC', category: 'Workstations' },
  { type: 'Mac', category: 'Workstations' },
  { type: 'Linux PC', category: 'Workstations' },
  { type: 'Windows Server', category: 'Servers' },
  { type: 'Linux Server', category: 'Servers' },
  { type: 'NAS / Storage', category: 'Servers' },
  { type: 'Switch', category: 'Network' },
  { type: 'Router / Firewall', category: 'Network' },
  { type: 'Access Point WiFi', category: 'Network' },
  { type: 'Rack Cabinet', category: 'Network' },
  { type: 'Printer / MFP', category: 'Other' },
  { type: 'IP Camera', category: 'Other' },
  { type: 'IP Phone', category: 'Other' },
];

type ClientWithDevices = Client & { devices: Device[] };

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithDevices[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' });
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load pricing
    const { data: pricingData } = await supabase.from('pricing').select('*');
    if (pricingData) {
      const priceMap: Record<string, number> = {};
      pricingData.forEach(p => { priceMap[p.name] = p.monthly_price; });
      setPrices(priceMap);
    }

    // Load clients with devices
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*, devices(*)')
      .order('created_at', { ascending: false });

    if (clientsData) {
      setClients(clientsData.map(c => ({ ...c, devices: c.devices || [] })));
    }
    setLoading(false);
  };

  const addClient = async () => {
    if (!newClient.name) return;
    const { data } = await supabase
      .from('clients')
      .insert({ ...newClient, status: 'active' })
      .select()
      .single();
    if (data) {
      setClients(prev => [{ ...data, devices: [] }, ...prev]);
      setNewClient({ name: '', phone: '', email: '' });
      setOpen(false);
    }
  };

  const addDevice = async (clientId: string, deviceType: string) => {
    const price = prices[deviceType] ?? 100;
    const { data } = await supabase
      .from('devices')
      .insert({ client_id: clientId, name: deviceType, type: deviceType, monthly_price: price })
      .select()
      .single();
    if (data) {
      setClients(prev => prev.map(c =>
        c.id === clientId ? { ...c, devices: [...c.devices, data] } : c
      ));
    }
  };

  const removeDevice = async (clientId: string, deviceId: string) => {
    await supabase.from('devices').delete().eq('id', deviceId);
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, devices: c.devices.filter(d => d.id !== deviceId) } : c
    ));
  };

  const toggleStatus = async (client: ClientWithDevices) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    await supabase.from('clients').update({ status: newStatus }).eq('id', client.id);
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, status: newStatus } : c));
  };

  const monthlyTotal = (client: ClientWithDevices) =>
    client.devices.reduce((s, d) => s + d.monthly_price, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#DDD5C8] mb-1">Clients</h1>
          <p className="text-[#9A9188]">{clients.length} total · ₪{clients.reduce((s, c) => s + monthlyTotal(c), 0).toLocaleString()}/mo</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger style={{ background: '#E8931E', color: '#0A0908' }}
          className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
           + Add Client
</DialogTrigger>
          <DialogContent style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }}>
            <DialogHeader>
              <DialogTitle className="text-[#DDD5C8]">New Client</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <Input placeholder="Company / Name" value={newClient.name}
                onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))}
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
              <Input placeholder="Phone" value={newClient.phone}
                onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))}
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
              <Input placeholder="Email" value={newClient.email}
                onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))}
                style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.1)', color: '#DDD5C8' }} />
              <button onClick={addClient}
                style={{ background: '#E8931E', color: '#0A0908' }}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all mt-2">
                Create Client
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="text-center py-16 text-[#9A9188]">Loading...</div>
      )}

      {!loading && clients.length === 0 && (
        <div className="text-center py-24 rounded-2xl"
          style={{ border: '1px dashed rgba(255,255,255,0.1)', background: '#111009' }}>
          <div className="text-5xl mb-4">👥</div>
          <p className="text-[#9A9188] text-lg mb-2">No clients yet</p>
          <p className="text-[#9A9188] text-sm">Click "Add Client" to get started</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {clients.map(client => (
          <div key={client.id} className="rounded-2xl p-5"
            style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: 'rgba(232,147,30,0.15)', color: '#E8931E' }}>
                  {client.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-[#DDD5C8]">{client.name}</div>
                  <div className="text-sm text-[#9A9188]">{client.phone} · {client.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: '#4A9E7A' }}>
                    ₪{monthlyTotal(client).toLocaleString()}
                  </div>
                  <div className="text-xs text-[#9A9188]">per month</div>
                </div>
                <button onClick={() => toggleStatus(client)}>
                  <Badge style={{
                    background: client.status === 'active' ? 'rgba(74,158,122,0.15)' : 'rgba(154,145,136,0.15)',
                    color: client.status === 'active' ? '#4A9E7A' : '#9A9188',
                    border: `1px solid ${client.status === 'active' ? 'rgba(74,158,122,0.3)' : 'rgba(154,145,136,0.3)'}`,
                    cursor: 'pointer',
                  }}>
                    {client.status}
                  </Badge>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {client.devices.map(device => (
                <div key={device.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.08)', color: '#DDD5C8' }}>
                  <span>{device.name}</span>
                  <span style={{ color: '#E8931E' }}>₪{device.monthly_price}</span>
                  <button onClick={() => removeDevice(client.id, device.id)}
                    className="text-[#9A9188] hover:text-red-400 transition-colors ml-1">×</button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[#9A9188] self-center mr-1">Add device:</span>
              {DEVICE_TYPES.map(dt => (
                <button key={dt.type} onClick={() => addDevice(client.id, dt.type)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: 'rgba(232,147,30,0.06)', border: '1px solid rgba(232,147,30,0.2)', color: '#E8931E' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,147,30,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(232,147,30,0.06)')}>
                  + {dt.type}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}