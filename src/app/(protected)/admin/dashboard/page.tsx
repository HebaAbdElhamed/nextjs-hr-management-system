'use client';

import React, { useMemo } from 'react';
import { Users, Building2, CalendarCheck, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDepartment } from '@/src/hooks/useDepartment';
import { useEmployee } from '@/src/hooks/useEmployee';
import { useAttendance } from '@/src/hooks/useAttendance';
import { useLeaves } from '@/src/hooks/useLeave';
import { usePayroll } from '@/src/hooks/usePayroll';

export default function AdminDashboard() {
  // 1. جلب التاريخ الحالي ديناميكياً لاستخدامه في الـ Payroll
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // الأشهر في JS تبدأ من 0
  const currentYear = now.getFullYear();

  // 2. استدعاء جميع الـ Hooks المتاحة
  const { useGetAttendances } = useAttendance();
  const { data: attendances, isLoading: isAttendanceLoading } = useGetAttendances();

  const { useAdminIndex } = useLeaves();
  const { data: leaves, isLoading: isLeavesLoading } = useAdminIndex();

  const { useGetDepartments } = useDepartment();
  const { data: departments, isLoading: isDeptLoading } = useGetDepartments();

  const { useGetEmployee } = useEmployee();
  const { data: employees, isLoading: isEmpLoading } = useGetEmployee();

  // جلب بيانات الـ Payroll للشهر والسنة الحالية ديناميكياً
  const { useAdminPayrolls, useGeneratePayroll } = usePayroll();
  const { data: payrolls, isLoading: isPayrollsLoading } = useAdminPayrolls(currentMonth, currentYear);
  const { mutate: generatePayroll, isPending: isGenerating } = useGeneratePayroll();

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

  // 3. معالجة وحساب البيانات بأمان وسرعة (Memoized)
  const deptStats = useMemo(() => {
    return departments?.map((d: any, i: number) => ({
      name: d.name,
      value: d.users_count || 0,
      color: COLORS[i % COLORS.length]
    })) || [];
  }, [departments]);

  const leavesArray = useMemo(() => {
    return Array.isArray(leaves) ? leaves : (leaves?.data && Array.isArray(leaves.data) ? leaves.data : []);
  }, [leaves]);

  const pendingLeavesCount = useMemo(() => {
    return leavesArray.filter((leave: any) => leave.status === 'pending').length;
  }, [leavesArray]);

  const calculateAttendanceRate = () => {
    if (isEmpLoading || isAttendanceLoading || !employees?.length) return "0";
    const attendanceArray = Array.isArray(attendances) ? attendances : (attendances?.data && Array.isArray(attendances.data) ? attendances.data : []);
    if (attendanceArray.length === 0) return "0%";
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendances = attendanceArray.filter((att: any) => att.created_at?.startsWith(todayStr));
    const rate = (todayAttendances.length / employees.length) * 100;
    return `${Math.round(rate)}%`;
  };

  const generateWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyCounts: { [key: string]: number } = { Sat: 0, Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0 };
    const attendanceArray = Array.isArray(attendances) ? attendances : (attendances?.data && Array.isArray(attendances.data) ? attendances.data : []);
    attendanceArray.forEach((att: any) => {
      if (att.created_at) {
        const date = new Date(att.created_at);
        const dayName = days[date.getDay()];
        if (weeklyCounts[dayName] !== undefined) {
          weeklyCounts[dayName]++;
        }
      }
    });
    return Object.keys(weeklyCounts).map(day => ({ day, count: weeklyCounts[day] }));
  };

  const dynamicWeeklyAttendance = generateWeeklyData();

  // 4. العمليات الحسابية الديناميكية للـ Payroll الخاص بالشهر الحالي
  const payrollStats = useMemo(() => {
    const payrollArray = Array.isArray(payrolls) ? payrolls : (payrolls?.data && Array.isArray(payrolls.data) ? payrolls.data : []);

    // حساب إجمالي الرواتب ديناميكياً (تغيير الحقل net_salary أو salary حسب الـ API لديك)
    const total = payrollArray.reduce((sum: number, item: any) => sum + Number(item.net_salary || item.salary || 0), 0);

    // تحديد حالة الـ Payroll بناءً على وجود عناصر غير مدفوعة
    const hasUnpaid = payrollArray.some((item: any) => item.status === 'unpaid' || item.status === 'pending');
    const status = payrollArray.length === 0 ? "Not Generated" : (hasUnpaid ? "Pending" : "Paid");

    return {
      total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total),
      status
    };
  }, [payrolls]);

  // دالة التعامل مع كليك زر توليد الرواتب وتمرير المتغيرات المطلوبة
  const handleGeneratePayroll = () => {
    // نمرر كائن يحتوي على الشهر والسنة الحالية لأن دالة الـ store بالسيرفر تحتاج معرفة لأي شهر تولد الرواتب
    const payrollData = {
      month: currentMonth,
      year: currentYear
    };
    // تشغيل الـ Mutation بالداتا المطلوبة لكي يستجيب السيرفر
    generatePayroll(payrollData as any);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* الـ Welcome Banner */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Core Dashboard</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-black text-slate-800 italic">{now.toDateString()}</p>
          <span className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1 rounded-full mt-1 inline-block">Admin Access Enabled</span>
        </div>
      </div>

      {/* 4 كروت إحصائية ديناميكية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Employees" value={isEmpLoading ? "..." : (employees?.length || 0)} icon={<Users />} color="blue" />
        <StatCard label="Departments" value={isDeptLoading ? "..." : (departments?.length || 0)} icon={<Building2 />} color="purple" />
        <StatCard label="Attendance Rate" value={calculateAttendanceRate()} icon={<CalendarCheck />} color="green" />
        <StatCard label="Pending Leaves" value={isLeavesLoading ? "..." : String(pendingLeavesCount).padStart(2, '0')} icon={<AlertCircle />} color="orange" />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* الرسم البياني للحضور الأسبوعي */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 italic">
              <TrendingUp className="text-blue-600" /> Weekly Presence Log
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicWeeklyAttendance}>
                <defs>
                  <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={4} fill="url(#colorVis)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* توزيع الموظفين على الأقسام */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-4">Department Mix</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptStats} innerRadius={60} outerRadius={80} dataKey="value">
                  {deptStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {deptStats.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2 text-slate-500">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  {item.name}
                </span>
                <span className="text-slate-900">{item.value} Staff</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* بطاقة الـ Payroll الديناميكية بالكامل */}
      <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black italic flex items-center gap-3">
            <Wallet className="text-blue-400" /> Current Payroll Status
          </h3>
          <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-blue-600/30">
            Month: {currentMonth} / {currentYear}
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex gap-10">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Estimated</p>
              <p className="text-3xl font-black">{isPayrollsLoading ? "$..." : payrollStats.total}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Status</p>
              <p className={`text-3xl font-black italic font-serif tracking-widest ${payrollStats.status === 'Paid' ? 'text-green-400' : 'text-orange-400'}`}>
                {isPayrollsLoading ? "..." : payrollStats.status}
              </p>
            </div>
          </div>
          <button
            onClick={handleGeneratePayroll}
            disabled={isGenerating || isPayrollsLoading}
            className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
          >
            {isGenerating ? "Generating..." : "Generate Slips"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const themes: any = {
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
  };
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 ${themes[color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all`}>
        {icon}
      </div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
  );
}
