"use client";
import { useState, useMemo } from 'react';
import {
  UserCheck, Search, MapPin, X, ArrowUpRight,
  Calendar, FileDown, Timer, UserMinus, ChevronDown, Loader2
} from 'lucide-react';
import { useAttendance } from '@/src/hooks/useAttendance';
import { useLeaves } from '@/src/hooks/useLeave';

export default function AdminAttendanceAdvanced() {
  const { useGetAttendances } = useAttendance();
  const { data: response, isLoading, error } = useGetAttendances();
  const { useAdminIndex } = useLeaves();
  const { data: leaves } = useAdminIndex();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const DATA = useMemo(() => {
    return Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);
  }, [response]);

  // جلب إجمالي الموظفين الفعلي من الـ API أو طول المصفوفة كـ Fallback
  const totalEmployeesCount = response?.total_employee_count || response?.total || DATA.length || 0;

  const approvedLeavesCount = useMemo(() => {
    const leavesArray = Array.isArray(leaves) ? leaves : (leaves?.data && Array.isArray(leaves.data) ? leaves.data : []);
    return leavesArray.filter((leave: any) => leave.status === 'approved' || leave.status === 'approved_leaves').length;
  }, [leaves]);


  // --- دالة تحويل الوقت لنظام 12 ساعة ---
  const format12hr = (timeStr: string) => {
    if (!timeStr || timeStr === "--:--" || timeStr === "??") return timeStr;
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12; // تحويل الساعة 0 لـ 12
      return `${h}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const monthsOptions = useMemo(() => {
    const months = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        value: d.toISOString().substring(0, 7), // YYYY-MM
      });
    }
    return months;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(monthsOptions[0].value);

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`; // Generates accurate local "YYYY-MM-DD"
  }, []);


  // 3. فلترة حضور اليوم المطور (Live Status) بحماية شاملة واقتطاع دقيق للتاريخ
  const todayLogs = useMemo(() => {
    return DATA.filter((l: any) => {
      // Ensure we extract only the date portion from records
      const recordDate = l.date || (l.created_at ? l.created_at.split('T')[0] : '');
      const matchesDate = recordDate === todayStr;

      const matchesSearch =
        l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.user?.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDate && matchesSearch;
    });
  }, [DATA, searchTerm, todayStr]);

  // 4. فلترة أرشيف الحضور بالأشهر السابقة
  const historyLogs = useMemo(() => {
    return DATA.filter((l: any) => {
      const recordDate = l.date || l.created_at?.split('T')[0] || l.created_at?.split(' ')[0];

      const isNotToday = recordDate !== todayStr;
      const matchesMonth = recordDate?.startsWith(selectedMonth);
      const matchesSearch =
        l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.user?.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      return isNotToday && matchesMonth && matchesSearch;
    });
  }, [DATA, searchTerm, selectedMonth, todayStr]);

  // 5. حساب عدد المتأخرين الحقيقي اليوم
  const lateTodayCount = useMemo(() => {
    return todayLogs.filter((l: any) => {
      const statusStr = String(l.status || '').toLowerCase();
      // Directly matching your enum values: 'late' or check if late_minutes > 0
      return statusStr === 'late' || (l.late_minutes && Number(l.late_minutes) > 0);
    }).length;
  }, [todayLogs]);

   const downloadCSV = () => {
    if (historyLogs.length === 0) {
      alert("No data available to download for the selected month.");
      return;
    }

    // 1. تحديد عناوين الأعمدة في ملف الإكسيل
    const headers = ["Date", "Employee Name", "Department", "Job Title", "Punch In", "Punch Out", "Status", "Late Minutes"];

    // 2. تحويل صفوف البيانات المفلترة بناءً على اختيار الأدمن
    const rows = historyLogs.map(log => [
      log.date || '---',
      log.user?.name || 'Unknown',
      log.user?.department?.name || '---',
      log.user?.job_title || '---',
      log.check_in || '---',
      log.check_out || '--:--',
      log.status || '---',
      log.late_minutes || '0'
    ]);

    // 3. دمج العناوين مع الصفوف وتحويلهم إلى نص بصيغة CSV ومحاط بـ علامات تنصيص لمنع التداخل
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // 4. إضافة الـ BOM (\uFEFF) لضمان أن برنامج Excel يقرأ الحروف العربية والإنجليزية بشكل سليم دون رموز غريبة
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 5. إنشاء رابط وهمي في المتصفح والضغط عليه أوتوماتيكياً لبدء التحميل فوراً
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    // تسمية الملف باسم الشهر المختار ليكون منظم (مثال: attendance_archive_2026-05.csv)
    link.setAttribute("download", `attendance_archive_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (error) return <div className="p-10 text-center text-red-500 font-bold">Error loading data from server.</div>;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">

      {/* 1. إحصائيات مفيدة (KPIs) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatItem label="Attendance" value={`${todayLogs.length}/${totalEmployeesCount}`} sub="Employees Present" icon={<UserCheck />} color="bg-blue-50 text-blue-600" />
        <StatItem label="Late Today" value={lateTodayCount} sub="Arrived after 9:00 AM" icon={<Timer />} color="bg-orange-50 text-orange-600" />
        <StatItem label="On Leave" value={String(approvedLeavesCount).padStart(2, '0')} sub="Approved requests" icon={<Calendar />} color="bg-purple-50 text-purple-600" />
        <StatItem label="Absent" value={Math.max(0, totalEmployeesCount - todayLogs.length)} icon={<UserMinus />} sub="No check-in signal" color="bg-red-50 text-red-600" />
      </section>

      {/* 2. شريط البحث */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by employee name or department..."
          className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. جدول حضور اليوم (Live Status) */}
      <section className="space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Today's Live Status
        </h3>
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="p-8">Employee</th>
                <th className="p-8">Punch In</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {todayLogs.length > 0 ? todayLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="p-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs uppercase">
                      {/* حل مشكلة الـ substring هنا */}
                      {log.user?.name ? log.user.name.substring(0, 2) : "NA"}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 leading-none">{log.user?.name || "Unknown"}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{log.user?.job_title || 'Staff'}</p>
                    </div>
                  </td>
                  <td className="p-8 font-black text-slate-700 tabular-nums italic">{format12hr(log.check_in)}</td>
                  <td className="p-8"><StatusBadge status={log.status} /></td>
                  <td className="p-8 text-right">
                    <button onClick={() => setSelectedLog(log)} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ArrowUpRight size={18} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">No attendance records for today yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. الأرشيف (History) بفلتر الشهور */}
      <section className="space-y-6 pt-10 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h3 className="text-xl font-black text-slate-900 italic">Attendance Archive</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white border border-slate-200 pl-6 pr-12 py-3 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/5 cursor-pointer shadow-sm"
              >
                {monthsOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button className="bg-slate-900 text-white p-3.5 rounded-2xl hover:bg-blue-600 transition-all shadow-lg" onClick={downloadCSV}
      title="Download Month Archive"><FileDown size={20} /></button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="p-8">Date</th>
                <th className="p-8">Employee</th>
                <th className="p-8">Shift</th>
                <th className="p-8 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyLogs.length > 0 ? historyLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="p-8"><span className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 tabular-nums">{log.date}</span></td>
                  <td className="p-8 font-black text-slate-900 italic">{log.user?.name || "Unknown"}</td>
                  <td className="p-8 font-black text-slate-600 text-sm italic">{format12hr(log.check_in)} → {format12hr(log.check_out) || '--:--'}</td>
                  <td className="p-8 text-right">
                    <button onClick={() => setSelectedLog(log)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">Review Log</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">No records found for the selected period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Modal الشفاف */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`p-12 ${selectedLog.status === 'late' ? 'bg-orange-50' : 'bg-blue-50'} flex justify-between items-center`}>
              <div>
                <h3 className="text-3xl font-black italic text-slate-900 tracking-tighter">{selectedLog.user?.name || "Employee"}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{selectedLog.user?.department?.name || 'Staff'} • {selectedLog.date}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:text-red-500 transition-all shadow-sm"><X size={24} /></button>
            </div>
            <div className="p-12 space-y-8 text-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Punch In</p>
                  <p className="text-2xl font-black text-slate-900 italic tabular-nums">{format12hr(selectedLog.check_in)} </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Punch Out</p>
                  <p className="text-2xl font-black text-slate-900 italic tabular-nums">{format12hr(selectedLog.check_out) || 'Active'}</p>
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex items-center justify-center gap-4 shadow-2xl">
                <MapPin className="text-blue-500 animate-bounce" size={24} />
                <div className="text-left">
                  <p className="text-xs font-black uppercase italic tracking-widest">Office HQ Location Verified</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase italic">Coords: {selectedLog.lat}, {selectedLog.lng}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Components ---
function StatItem({ label, value, sub, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
      <div className={`w-16 h-16 ${color} rounded-3xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 leading-none italic tabular-nums">{value}</p>
        <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">{sub}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isLate = status === 'late';
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${isLate ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isLate ? 'bg-orange-500' : 'bg-emerald-500 animate-pulse'}`} />
      {status}
    </span>
  );
}
