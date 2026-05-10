import DashboardStats from '@/components/admin/DashboardStats';

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#DDD5C8] mb-1">Dashboard</h1>
        <p className="text-[#9A9188]">Overview of key metrics</p>
      </div>
      <DashboardStats />
    </div>
  );
}