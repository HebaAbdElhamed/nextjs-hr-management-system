"use client"; // ضروري عشان نستخدم usePathname

import { User, Calendar, Clock, LogOut, Home, LayoutDashboard, CreditCard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/hooks/useAuth';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();
    const pathname = usePathname();

    // مصفوفة المنيو عشان الكود يكون أنظف
    const menuItems = [
        { icon: <Home size={20} />, label: "Overview", href: "/employee/dashboard" },
        { icon: <Clock size={20} />, label: "Attendance", href: "/employee/dashboard/attendance" },
        { icon: <Calendar size={20} />, label: "My Leaves", href: "/employee/dashboard/leaves" },
        { icon: <CreditCard size={20} />, label: "Payroll", href: "/employee/dashboard/payroll" },
        { icon: <User size={20} />, label: "Profile", href: "/employee/dashboard/profile" },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar - Fixed Height */}
            <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col shrink-0 h-full">
                <div className="mb-10 px-2">
                    <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">PAYROLL.</h1>
                </div>

                <nav className="space-y-2 flex-1">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                // المقارنة اللي بتخلي الزرار ينور
                                active={pathname === item.href}
                            />
                        </Link>
                    ))}
                </nav>

                <button onClick={logout} className="flex items-center gap-3 p-4  font-bold text-red-500 transition-colors mt-auto border-t border-slate-50 pt-6">
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all duration-300 group
      ${active
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-1'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
            <span className={active ? 'text-white' : 'group-hover:text-blue-600 transition-colors'}>
                {icon}
            </span>
            {label}
        </div>
    );
}
