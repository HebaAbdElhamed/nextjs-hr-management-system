'use client';
import React, { useState, useMemo } from 'react';
import {
    CheckCircle2, XCircle, Clock, Search, Info,
    CalendarCheck2, AlertCircle, Inbox, History, Send
} from 'lucide-react';
import { useLeaves } from '@/src/hooks/useLeave';

// --- Internal Components (StatCard) ---
interface StatProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

function StatCard({ title, value, icon, color }: StatProps) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}






// --- Main Page ---
export default function AdminLeavesPage() {

    const { useAdminIndex, useAdminDecision } = useLeaves();


    const { data: serverData = [], isLoading } = useAdminIndex();
    const { mutate: updateDecision } = useAdminDecision();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeave, setSelectedLeave] = useState<any | null>(null);

    const normalizedData = useMemo(() => {
        return serverData.map((item: any) => ({
            ...item,
            employeeName: item.user?.name || "Unknown",
            requestDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A",
            status: item.status?.toLowerCase() || 'pending',
            type: item.type?.toLowerCase() || 'annual'
        }));
    }, [serverData]);

   const stats = useMemo(() => {
  const today = new Date().toISOString().split('T')[0]; // تاريخ اليوم بصيغة YYYY-MM-DD

  return {
    pending: normalizedData.filter((l: any) => l.status === 'pending').length,
    approved: normalizedData.filter((l: any) => l.status === 'approved').length,
    rejected: normalizedData.filter((l: any) => l.status === 'rejected').length,
    
    // المنطق الجديد لفلترة الموظفين اللي في إجازة حالياً:
    onLeaveToday: normalizedData.filter((l: any) => {
      return (
        l.status === 'approved' && // لازم تكون موافق عليها
        today >= l.start_date &&   // النهاردة بعد أو بيساوي تاريخ البداية
        today <= l.end_date        // النهاردة قبل أو بيساوي تاريخ النهاية
      );
    }).length,
  };
}, [normalizedData]);


    // 3. الفلترة والبحث
    const filteredSortedData = useMemo(() => {
        return [...normalizedData]
            .filter((item: any) => item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => b.id - a.id); // الأحدث فوق
    }, [normalizedData, searchTerm]);

    const pendingRequests = filteredSortedData.filter((item: any) => item.status === 'pending');
    const allHistory = filteredSortedData;

    if (isLoading) {
        return (
            <div className="p-20 text-center font-bold text-blue-600 animate-pulse tracking-widest">LOADING...</div>
        );
    }
    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Leave Management</h1>
                    <p className="text-slate-500 font-medium">Review and auto-sorted requests by date</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text" placeholder="Search employee..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pending Actions" value={stats.pending} icon={<AlertCircle size={24} className="text-amber-600" />} color="bg-amber-50" />
                <StatCard title="Approved Total" value={stats.approved} icon={<CheckCircle2 size={24} className="text-emerald-600" />} color="bg-emerald-50" />
                <StatCard title="Rejected Total" value={stats.rejected} icon={<XCircle size={24} className="text-red-600" />} color="bg-red-50" />
                <StatCard title="On Leave Today" value={stats.onLeaveToday} icon={<CalendarCheck2 size={24} className="text-blue-600" />} color="bg-blue-50" />
            </div>

            {/* Section 1: Pending Approval */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                    <Inbox size={22} className="text-blue-600" />
                    <h2 className="text-xl font-black tracking-tight">Pending Approval</h2>
                    <span className="bg-blue-100 text-blue-600 px-3 py-0.5 rounded-full text-xs font-bold">{pendingRequests.length}</span>
                </div>
                <LeaveTable data={pendingRequests} onViewDetail={setSelectedLeave} onAction={(id: number, s: string) => updateDecision({ id, data: { status: s } })} showActions={true} />
            </div>

            {/* Section 2: Full History Log */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                    <History size={22} className="text-slate-400" />
                    <h2 className="text-xl font-black tracking-tight">Full History Log</h2>
                </div>
                <LeaveTable data={allHistory} onViewDetail={setSelectedLeave} showActions={false} />
            </div>

            {/* Modal */}
            {selectedLeave && <DetailsModal leave={selectedLeave} onClose={() => setSelectedLeave(null)} />}
        </div>
    );
}

// --- Table Component ---
function LeaveTable({ data, onViewDetail, onAction, showActions }: any) {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-sm text-slate-700">
            {data.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-medium">No requests match your criteria.</div>
            ) : (
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="p-6 text-slate-400 font-bold uppercase tracking-wider">Request Date</th>
                            <th className="p-6 text-slate-400 font-bold uppercase tracking-wider">Employee</th>
                            <th className="p-6 text-slate-400 font-bold uppercase tracking-wider text-center">Type</th>
                            <th className="p-6 text-slate-400 font-bold uppercase tracking-wider">Vacation Period</th>
                            <th className="p-6 text-slate-400 font-bold uppercase tracking-wider text-center">Status</th>
                            <th className="p-6 text-slate-400 font-bold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[13px]">
                        {data.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors animate-in fade-in duration-500">
                                <td className="p-6 text-slate-400 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Send size={14} className="text-slate-300" /> {item.created_at ? item.created_at.split('T')[0] : 'N/A'}
                                    </div>
                                </td>
                                <td className="p-6 font-bold text-slate-700 underline decoration-slate-100 underline-offset-4">{item.user.name}</td>
                                <td className="p-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${item.type === 'Casual' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}>{item.type}</span>
                                </td>
                                <td className="p-6 text-slate-600 font-bold">
                                    {item.start_date} <span className="text-slate-300 mx-1">→</span> {item.end_date}
                                    <span className="ml-2 text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg text-[11px]">{item.days_requested}d</span>
                                </td>
                                <td className="p-6 text-center">
                                    <div className={`flex justify-center items-center gap-1.5 font-bold uppercase text-[11px] ${item.status?.toLowerCase() === 'approved' ? 'text-emerald-500' :
                                            item.status?.toLowerCase() === 'rejected' ? 'text-red-500' :
                                                'text-orange-500'
                                        }`}>
                                        {/* إضافة نقطة ملونة بجانب النص لشكل أشيك (اختياري) */}
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status?.toLowerCase() === 'approved' ? 'bg-emerald-500' :
                                                item.status?.toLowerCase() === 'rejected' ? 'bg-red-500' :
                                                    'bg-orange-500'
                                            }`}></span>

                                        {item.status}
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {showActions && (
                                            <>
                                                <button onClick={() => onAction(item.id, 'approved')} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"><CheckCircle2 size={18} /></button>
                                                <button onClick={() => onAction(item.id, 'rejected')} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white border border-red-100 transition-all"><XCircle size={18} /></button>
                                            </>
                                        )}
                                        <button onClick={() => onViewDetail(item)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white border border-slate-100 transition-all"><Info size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// --- Detail Modal ---
function DetailsModal({ leave, onClose }: { leave: any, onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in duration-200 text-slate-700">
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"><XCircle size={28} /></button>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><CalendarCheck2 size={28} /></div>
                    <div><h2 className="text-xl font-black text-slate-800">Review Application</h2><p className="text-slate-400 font-bold text-xs uppercase">Submitted on {leave.created_at ? leave.created_at.split('T')[0] : 'N/A'}</p></div>
                </div>
                <div className="space-y-6 text-left">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee Statement</h4>
                        <p className="text-slate-700 font-medium italic text-base">"{leave.reason}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Casual Bal.</p>
                            <p className="text-xl font-black text-slate-800">{leave?.user?.casual_balance ?? 0} Days</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Annual Bal.</p>
                            <p className="text-xl font-black text-slate-800">{leave?.user?.annual_balance ?? 0} Days</p>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-slate-200">Close Preview</button>
            </div>
        </div>
    );
}
