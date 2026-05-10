'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar, SidebarContent, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarFooter,
} from '@/components/ui/sidebar';

const nav = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Clients', href: '/admin/clients', icon: '👥' },
  { label: 'Invoices', href: '/admin/invoices', icon: '🧾' },
  { label: 'Pricing', href: '/admin/pricing', icon: '💰' },
  { label: 'Orders', href: '/admin/orders', icon: '📦' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-5 border-b border-white/8">
        <div className="font-bold text-xl" style={{ fontFamily: 'Verdana, sans-serif', color: '#DDD5C8' }}>
          IT<span style={{ color: '#E8931E' }}>Seder</span>
        </div>
        <p className="text-xs mt-1" style={{ color: '#9A9188' }}>Admin Panel</p>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-widest mb-2" style={{ color: '#9A9188' }}>
            MANAGEMENT
          </SidebarGroupLabel>
          <SidebarMenu>
            {nav.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton isActive={pathname === item.href}>
                  <Link href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all"
                    style={{
                      color: pathname === item.href ? '#E8931E' : '#9A9188',
                      background: pathname === item.href ? 'rgba(232,147,30,0.1)' : 'transparent',
                    }}>
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/8">
        <Link href="/" className="flex items-center gap-2 text-sm hover:text-[#E8931E] transition-colors"
          style={{ color: '#9A9188' }}>
          ← Back to site
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}