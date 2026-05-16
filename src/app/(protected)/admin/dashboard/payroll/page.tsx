'use client';
import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowDownCircle,
  Info,
  CalendarDays,
  Loader2,
  XCircle
} from 'lucide-react';
import { usePayroll } from '@/src/hooks/usePayroll';

// --- Internal StatCard Component ---
function StatCard({ title, value, icon, color }: { title: string, value: any, icon: any, color: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>{icon}</div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  );
}

export default function AdminPayrollPage() {
  const { useAdminPayrolls, useGeneratePayroll, usePayMutation } = usePayroll();

  // 1. إدارة التاريخ الحالي (الشهر والسنة)
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState<any | null>(null);

  // 2. ربط البيانات من الـ Database
  const { data: serverData = [], isLoading } = useAdminPayrolls(currentMonth, currentYear);
  const { mutate: generateAction, isPending: isGenerating } = useGeneratePayroll();
  const { mutate: payAction } = usePayMutation();

  // 3. الحسابات الذكية للإحصائيات
  const stats = useMemo(() => {
    const total = serverData.reduce((acc: number, curr: any) => acc + parseFloat(curr.net_salary), 0);
    const paidCount = serverData.filter((p: any) => p.status === 'paid').length;
    const pendingAmount = serverData.filter((p: any) => p.status === 'pending')
      .reduce((acc: number, curr: any) => acc + parseFloat(curr.net_salary), 0);
    return { total, paidCount, pendingAmount };
  }, [serverData]);

  // 4. الفلترة للبحث
  const filteredPayrolls = useMemo(() => {
    return serverData.filter((p: any) =>
      p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [serverData, searchTerm]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Payroll Data...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight italic">Payroll Hub</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Financial Management</p>
        </div>
        <button
          onClick={() => generateAction({ month: currentMonth, year: currentYear })}
          disabled={isGenerating}
          className="bg-blue-600 text-white flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black italic shadow-xl hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 shadow-blue-100"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          {isGenerating ? "Processing..." : `Generate ${new Date().toLocaleString('default', { month: 'long' })}`}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Monthly Cost" value={`$${stats.total.toLocaleString()}`} icon={<DollarSign size={24} />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Pending Payouts" value={`$${stats.pendingAmount.toLocaleString()}`} icon={<Clock size={24} />} color="bg-amber-50 text-amber-600" />
        <StatCard title="Status Paid" value={`${stats.paidCount} / ${serverData.length}`} icon={<CheckCircle2 size={24} />} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <h3 className="font-black text-slate-800 italic flex items-center gap-3 text-xl">
            <CalendarDays size={24} className="text-blue-600" />
            Salaries for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] uppercase font-black text-slate-400 tracking-widest">
              <th className="p-8">Employee Details</th>
              <th className="p-8">Basic</th>
              <th className="p-8 text-red-500">Deductions</th>
              <th className="p-8">Net Payout</th>
              <th className="p-8 text-center">Status</th>
              <th className="p-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPayrolls.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-20 text-center text-slate-300 font-bold italic">No payroll records found for this period.</td>
              </tr>
            ) : (
              filteredPayrolls.map((record: any) => (
                <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-8">
                    <p className="font-black text-slate-700 text-base italic">{record.user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{record.user?.job_title}</p>
                  </td>
                  <td className="p-8 font-bold text-slate-500">${parseFloat(record.basic_salary).toLocaleString()}</td>
                  <td className="p-8 font-black text-red-500">-${parseFloat(record.deductions).toLocaleString()}</td>
                  <td className="p-8">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black italic shadow-lg shadow-blue-100">
                      ${parseFloat(record.net_salary).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-8 text-center">
                    <div className={`flex justify-center items-center gap-2 font-black uppercase text-[10px] ${record.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                      <span className={`w-2 h-2 rounded-full ${record.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                      {record.status}
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3">
                      {record.status === 'pending' && (
                        <button
                          onClick={() => payAction(record.id)}
                          className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-600 shadow-xl shadow-emerald-50 transition-all hover:scale-105 active:scale-95"
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedPayroll(record)}
                        className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
                      >
                        <Info size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedPayroll && (
        <DetailsModal payroll={selectedPayroll} onClose={() => setSelectedPayroll(null)} />
      )}
    </div>
  );
}

// --- Details Modal Component ---
function DetailsModal({ payroll, onClose }: { payroll: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] w-full max-w-md p-12 shadow-2xl relative animate-in zoom-in duration-300 text-left">
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors">
          <XCircle size={32} />
        </button>

        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ArrowDownCircle size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic">Payslip Details</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">{payroll.user?.name}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between p-6 bg-slate-50 rounded-[1.5rem]">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Basic Salary</span>
            <span className="font-black text-slate-800">${parseFloat(payroll.basic_salary).toLocaleString()}</span>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-4">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] text-center mb-4">Deductions Breakdown</p>
            <div className="flex justify-between text-sm font-bold text-slate-600">
              <span className="text-slate-400">Late Minutes ({payroll.details?.late_minutes || 0}m)</span>
              <span className="text-red-500">-${payroll.details?.late_deduction || 0}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-600">
              <span className="text-slate-400">Absent Days ({payroll.details?.absent_days || 0}d)</span>
              <span className="text-red-500">-${payroll.details?.absent_deduction || 0}</span>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between">
              <span className="font-black text-slate-800 text-xs uppercase">Total Deducted</span>
              <span className="font-black text-red-600">-${parseFloat(payroll.deductions).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between p-8 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-100 items-center">
            <div className="text-left">
              <span className="font-bold text-blue-200 text-[10px] uppercase block tracking-widest">Net Payout</span>
              <span className="font-black italic text-2xl tracking-tighter italic">Transfer Amount</span>
            </div>
            <span className="font-black text-4xl tracking-tighter">${parseFloat(payroll.net_salary).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
