"use client";
import { useState, useMemo } from 'react';
import { Timer, CheckCircle2, History, Loader2, Filter, FileText } from 'lucide-react';
import { useAttendance } from '@/src/hooks/useAttendance';

export default function EmployeeAttendancePage() {
    const { useGetMyHistory, getWorkingDaysInMonth } = useAttendance();
    const { data: history, isLoading: isHistoryLoading } = useGetMyHistory();

    // 1. تحديد الشهر الحالي (May 2026 حسب طلبك)
    const currentMonth = new Date('2026-05-01');
    const [filterMonth, setFilterMonth] = useState('2026-05');
    const getPassedWorkingDays = () => {
        const today = new Date(); // بيفترض إنه 12 مايو 2026 حسب جهازك
        let count = 0;
        const tempDate = new Date(today.getFullYear(), today.getMonth(), 1);

        while (tempDate <= today) {
            const dayOfWeek = tempDate.getDay();
            // استبعاد الجمعة (5) والسبت (6) - عدليها حسب نظام شركتك
            if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                count++;
            }
            tempDate.setDate(tempDate.getDate() + 1);
        }
        return count;
    };


    // 2. حساب آخر 3 شهور ديناميكياً والتأكد من وجود بيانات لهم
    const availableMonths = useMemo(() => {
        const months = [];
        for (let i = 0; i < 3; i++) {
            const d = new Date(currentMonth);
            d.setMonth(currentMonth.getMonth() - i);
            const value = d.toISOString().slice(0, 7); // YYYY-MM
            const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            // التأكد إن الموظف عنده سجل واحد على الأقل في الشهر ده
            const hasData = history?.some((log: any) => log.date.startsWith(value));

            if (hasData || i === 0) { // دائماً نظهر الشهر الحالي حتى لو فاضي
                months.push({ label, value });
            }
        }
        return months;
    }, [history]);

    const format12hr = (timeStr: string) => {
        if (!timeStr) return "--:--";
        const [hours, minutes] = timeStr.split(':');
        let h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    };

    const filteredHistory = history?.filter((log: any) => log.date.startsWith(filterMonth));

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <header>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Attendance Log</h2>
                <p className="text-slate-400 font-bold mt-1 uppercase tracking-[0.2em] text-xs">May 2026 • Performance Overview</p>
            </header>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* 1. أيام الحضور */}
                <StatCard
                    label="Monthly Presence"
                    value={`${filteredHistory?.length || 0} / ${getWorkingDaysInMonth()} Days`}
                    icon={<CheckCircle2 className="text-emerald-500" />}
                    bg="bg-emerald-50"
                />

                {/* 2. إجمالي التأخير بالساعات والدقائق */}
                <StatCard
                    label="Total Late Time"
                    value={(() => {
                        const totalMinutes = filteredHistory?.reduce((acc: number, log: any) => acc + (log.late_minutes || 0), 0) || 0;
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                    })()}
                    icon={<Timer className="text-orange-500" />}
                    bg="bg-orange-50"
                />

                {/* 3. أيام الغياب (مفيد جداً للموظف) */}
                <StatCard
                    label="Absent Days"
                    value={`${Math.max(0, getPassedWorkingDays() - (filteredHistory?.length || 0))} Days`}
                    icon={<History className="text-red-500" />}
                    bg="bg-red-50"
                />

            </div>


            {/* Main Table Block */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                        <History className="text-blue-600" /> Detailed Activity
                    </h3>

                    {/* الفلتر بقى فوق الجدول علطول وديناميكي */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {availableMonths.map((month) => (
                            <button
                                key={month.value}
                                onClick={() => setFilterMonth(month.value)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterMonth === month.value
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {month.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Date</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Punch In</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Punch Out</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isHistoryLoading ? (
                                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                            ) : (
                                filteredHistory?.map((log: any) => (
                                    <tr key={log.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-10 py-8 font-black text-slate-900">{log.date}</td>
                                        <td className="px-10 py-8 font-black text-slate-700 italic">{format12hr(log.check_in)}</td>
                                        <td className="px-10 py-8 font-black text-slate-700 italic">{format12hr(log.check_out)}</td>
                                        <td className="px-10 py-8">
                                            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${log.status === 'late' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!isHistoryLoading && filteredHistory?.length === 0 && (
                                <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold italic">No records found for this month.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, bg }: any) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
            <div className={`w-16 h-16 ${bg} rounded-[1.5rem] flex items-center justify-center shrink-0`}>{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1 leading-none">{value}</p>
            </div>
        </div>
    );
}
