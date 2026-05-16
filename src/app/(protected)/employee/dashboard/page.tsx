"use client";

import { useEffect, useState, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useEmployee } from '@/src/hooks/useEmployee';
import { useAttendance } from '@/src/hooks/useAttendance';
import { MapPin, Clock, Timer, CheckCircle2, Calendar, Loader2, UserCheck, Wallet, PieChart as PieIcon, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
    const [userId, setUserId] = useState<string | null>(null);
    const { useShowEmployee } = useEmployee();

    useEffect(() => {
        const savedId = Cookies.get('user_id');
        setUserId(savedId || null);
    }, []);

    const { data: profile, isLoading: isProfileLoading } = useShowEmployee(userId || undefined);
    const { useGetMyHistory, useCheckIn, useCheckOut, getWorkingDaysInMonth } = useAttendance();
    const { data: history, isLoading: isHistoryLoading } = useGetMyHistory();
    const checkInMutation = useCheckIn();
    const checkOutMutation = useCheckOut();

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const safeHistory = useMemo(() => {
        return Array.isArray(history) ? history : [];
    }, [history]);

    const today = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    const todayRecord = safeHistory.find((log: any) => log.date === today);
    const isCheckedIn = (!!todayRecord && !todayRecord.check_out) || checkInMutation.isSuccess;
    const isCheckedOut = !!todayRecord?.check_out || checkOutMutation.isSuccess;

    const userFullName = profile?.name || "Employee";
    const firstName = userFullName.split(' ')[0];
    const userSalary = profile?.salary || 0;

    const monthlyStats = useMemo(() => {
        const currentMonthStr = today.substring(0, 7);
        const thisMonthLogs = safeHistory.filter((log: any) => log.date?.startsWith(currentMonthStr));

        const presentDays = thisMonthLogs.length;
        const lateDays = thisMonthLogs.filter((log: any) => String(log.status).toLowerCase() === 'late').length;
        const onTimeDays = Math.max(0, presentDays - lateDays);
        const workingDaysInMonth = getWorkingDaysInMonth();

        return {
            presentDays,
            lateDays,
            onTimeDays,
            workingDaysInMonth,
        };
    }, [safeHistory, today, getWorkingDaysInMonth]);

    // Explicit color assignments to match slice positions perfectly
    const pieChartData = useMemo(() => {
        return [
            { name: 'On Time', value: monthlyStats.onTimeDays, color: '#3b82f6' }, // Cyber Blue
            { name: 'Late', value: monthlyStats.lateDays, color: '#f59e0b' }     // Safety Amber
        ].filter(item => item.value > 0);
    }, [monthlyStats]);

    const handleAttendance = () => {
        if (!navigator.geolocation) return toast.error("GPS coordinates unsupported by system profile.");
        toast.loading("Locking operational satellite signals...", { id: "gps_sync" });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                toast.dismiss("gps_sync");
                const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                if (!isCheckedIn) {
                    checkInMutation.mutate(coords);
                } else {
                    checkOutMutation.mutate(coords);
                }
            },
            () => {
                toast.dismiss("gps_sync");
                toast.error("Security bypass denied. Geolocation check is mandatory.");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const loading = checkInMutation.isPending || checkOutMutation.isPending;

    if (isHistoryLoading || isProfileLoading) return (
        <div className="h-[70vh] flex flex-col items-center justify-center gap-4 bg-slate-50/50 rounded-[3rem]">
            <Loader2 className="animate-spin text-blue-600" size={44} />
            <p className="text-slate-900 font-black text-sm uppercase tracking-[0.2em] animate-pulse">Initializing Terminal...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">

            {/* Header Container */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">
                        {isCheckedOut ? `Shift Logged, ${firstName}! ✨` : isCheckedIn ? `On the Clock, ${firstName}! 🚀` : `Welcome Back, ${firstName}! 👋`}
                    </h2>
                    <p className="text-slate-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">
                        Alexandria Corporate Base HQ
                    </p>
                </div>
                <div className="text-left md:text-right font-mono bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-900/10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-lg font-black tracking-tight mt-0.5">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
                </div>
            </header>

            {/* SECTION 1: Action Panel & Analytics Grid placed directly at the top */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Modern Punch In / Out Dashboard Board (Moved up) */}
                <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden transition-all hover:shadow-2xl group">
                    <div className="absolute top-0 right-0 p-10">
                        <span className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${isCheckedIn ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-blue-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                            {isCheckedIn ? 'Session Active' : 'Beacon In Range'}
                        </span>
                    </div>

                    <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-700 ${isCheckedIn ? 'bg-gradient-to-tr from-slate-900 to-slate-800 scale-105' : 'bg-gradient-to-tr from-blue-600 to-blue-500 rotate-12 group-hover:rotate-0'}`}>
                        <MapPin size={36} className={isCheckedIn ? "" : "animate-bounce"} />
                    </div>

                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{isCheckedOut ? "Shift Locked Out" : isCheckedIn ? "Active Work Session" : "Ready to Initialize?"}</h3>
                        <p className="text-slate-400 font-bold max-w-xs mx-auto mt-2 text-sm">{isCheckedOut ? "Your business tracking for today has concluded." : "Corporate encryption verified. Geolocation parameters ready."}</p>
                    </div>

                    {!isCheckedOut ? (
                        <button
                            onClick={handleAttendance}
                            disabled={loading}
                            className={`w-full max-w-md h-24 rounded-3xl text-xl font-black transition-all shadow-2xl flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${isCheckedIn ? 'bg-slate-900 hover:bg-red-600 text-white shadow-slate-900/10' : 'bg-blue-600 hover:bg-slate-900 text-white shadow-blue-600/20'}`}
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : <>{isCheckedIn ? 'Terminate Shift' : 'Punch Network Now'} <ArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                        </button>
                    ) : (
                        <div className="py-4 px-10 bg-emerald-950 text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 border border-emerald-900 shadow-xl shadow-emerald-950/10">
                            <CheckCircle2 size={16} /> Operational Target Completed
                        </div>
                    )}
                </div>

                {/* Re-designed Minimalist Integrity Matrix Chart (Color Logic Fixed) */}
                <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col justify-between min-h-[380px]">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <PieIcon className="text-blue-600" size={16} /> Integrity Breakdown
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Operational discipline index</p>
                    </div>

                    <div className="h-[180px] w-full relative flex items-center justify-center">
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieChartData} innerRadius={60} outerRadius={75} dataKey="value" paddingAngle={4}>
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-xs text-slate-400 font-bold italic uppercase tracking-wider">No active metrics recorded</div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-5 border-slate-50">
                        <div className="bg-slate-50/50 p-3 rounded-2xl text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-blue-500" /> On Time
                            </div>
                            <p className="text-lg font-black text-slate-800 mt-0.5 tabular-nums">{monthlyStats.onTimeDays}d</p>
                        </div>
                        <div className="bg-slate-50/50 p-3 rounded-2xl text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-amber-500" /> Late
                            </div>
                            <p className="text-lg font-black text-slate-800 mt-0.5 tabular-nums">{monthlyStats.lateDays}d</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* SECTION 2: Premium KPI Overview Cards moved below the main action panels */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Monthly Presence"
                    value={`${monthlyStats.presentDays}/${monthlyStats.workingDaysInMonth}`}
                    sub="Valid system entries compiled"
                    icon={<UserCheck size={22} />}
                    variant="blue"
                />
                <StatCard
                    label="Late Arrival Metrics"
                    value={monthlyStats.lateDays}
                    sub="Logged entries post 09:00 AM"
                    icon={<Timer size={22} />}
                    variant="orange"
                />
                <StatCard
                    label="Contract Base Salary"
                    value={userSalary > 0 ? `$${Number(userSalary).toLocaleString('en-US')}` : "---"}
                    sub="Gross payroll valuation"
                    icon={<Wallet size={22} />}
                    variant="dark"
                />
            </section>

        </div>
    );
}

function StatCard({ label, value, sub, icon, variant }: { label: string; value: string | number; sub: string; icon: React.ReactNode; variant: 'blue' | 'orange' | 'dark' }) {
    const styles = {
        blue: {
            card: "bg-white border-slate-100",
            iconWrapper: "bg-blue-50 text-blue-600",
            valueText: "text-slate-900"
        },
        orange: {
            card: "bg-white border-slate-100",
            iconWrapper: "bg-orange-50 text-orange-600",
            valueText: "text-slate-900"
        },
        dark: {
            card: "bg-slate-950 border-slate-900 shadow-slate-950/20 text-white",
            iconWrapper: "bg-white/10 text-blue-400 border border-white/5",
            valueText: "text-white"
        }
    };

    return (
        <div className={`p-8 rounded-[3rem] border shadow-xl flex items-center justify-between group hover:shadow-2xl transition-all duration-300 ${styles[variant].card}`}>
            <div className="overflow-hidden">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1.5">{label}</p>
                <h3 className={`text-3xl font-black tabular-nums tracking-tight tracking-tighter ${styles[variant].valueText}`} dir="ltr" style={{ textAlign: 'left' }}>
                    {value}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1.5 truncate opacity-80">{sub}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${styles[variant].iconWrapper}`}>
                {icon}
            </div>
        </div>
    );
}
