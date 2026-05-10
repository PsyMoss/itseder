import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark" dir="ltr">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-[#0A0908] text-[#DDD5C8]">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}