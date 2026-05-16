'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, CalendarClock, CreditCard, LogOut, CalendarDays } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin/dashboard' },
  { icon: Building2, label: 'Departments', href: '/admin/dashboard/departments' },
  { icon: Users, label: 'Employees', href: '/admin/dashboard/employees' },
  { icon: CalendarClock, label: 'Attendance', href: '/admin/dashboard/attendance' },
   { icon: CalendarDays, label: 'Leaves', href: '/admin/dashboard/leaves' },
  { icon: CreditCard, label: 'Payroll', href: '/admin/dashboard/payroll' },
];

export default function Sidebar() {
  const {logout} = useAuth();
  const pathname = usePathname();
  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">P</div>
          <span className="text-xl font-black text-slate-800 tracking-tighter">Payroll Hub</span>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-5 py-4 rounded-[1.2rem] font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}>
                <item.icon size={20} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-8 border-t border-slate-50">
        <button onClick={logout} className="flex items-center gap-3 px-5 py-4 text-red-500 font-bold w-full hover:bg-red-50 rounded-2xl transition-all">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
