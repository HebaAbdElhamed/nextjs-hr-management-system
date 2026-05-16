"use client";
import { useState, useMemo } from 'react';
import { Plus, Calendar, Clock, CheckCircle2, Trash2, AlignLeft, ChevronDown, ChevronUp, Loader2, Info, X, CalendarDays, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaves } from '@/src/hooks/useLeave';

export default function EmployeeLeavesPage() {
    const { useMyLeaves, useStoreLeave, useCancelLeave, useGetBalances } = useLeaves();

    // سحب البيانات مع وضع قيم افتراضية لمنع الأخطاء
    const { data: leaves = [], isLoading: isLeavesLoading } = useMyLeaves();
    const { data: balances } = useGetBalances();

    // سحب الـ Mutations (الأكشنز)
    const storeLeaveMutation = useStoreLeave();
    const cancelLeaveMutation = useCancelLeave();

    // 2. الحالات الخاصة بالـ UI
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ type: 'annual', start_date: '', end_date: '', reason: '' });



    


    // 2. حالة الفورم

    // تاريخ النهاردة للمقارنة
    const today = new Date().toISOString().split('T')[0];

    // حسبة عدد الأيام
    const diffDays = useMemo(() => {
        if (!formData.start_date || !formData.end_date) return 0;
        const s = new Date(formData.start_date);
        const e = new Date(formData.end_date);
        const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return diff;
    }, [formData.start_date, formData.end_date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // --- الـ Validation ---
        if (formData.start_date < today) return toast.error("Start date cannot be in the past!");
        if (formData.end_date < formData.start_date) return toast.error("End date cannot be before start date!");
        if (formData.reason.length < 10) return toast.error("Please provide a reason (min 10 characters)");

        storeLeaveMutation.mutate(formData, {
            onSuccess: () => {
                setShowModal(false);
                setFormData({ type: 'annual', start_date: '', end_date: '', reason: '' });
            }
        });
    };

    const handleConfirmDelete = () => {
        if (deleteId) {
            cancelLeaveMutation.mutate(deleteId, {
                onSuccess: () => setDeleteId(null)
            });
        }
    };

    const statusStyles: any = {
        pending: "bg-orange-50 text-orange-500",
        approved: "bg-emerald-50 text-emerald-500",
        rejected: "bg-red-50 text-red-500",
    };


    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">My Leaves</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Manage your time-off</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black italic shadow-xl hover:bg-slate-900 transition-all active:scale-95">
                    <Plus size={20} /> New Request
                </button>
            </header>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BalanceCard label="Available Casual Leave" value={balances?.casual_balance ?? 0} total="7" color="text-blue-600" bg="bg-blue-50" />
                <BalanceCard label="Available Annual Leave" value={balances?.annual_balance ?? 0} total="21" color="text-indigo-600" bg="bg-indigo-50" />
            </div>

            {/* Leaves List (Table Alternative) */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-black text-slate-900 italic flex items-center gap-2">
                        <CalendarDays className="text-blue-600" /> History
                    </h3>

                </div>
                <div className="space-y-4 min-h-[200px]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {leaves.map((leave: any) => (
                            <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} key={leave.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-8 flex items-center justify-between">
                                    <div className="flex items-center gap-6 text-left">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center${statusStyles[leave.status] || 'bg-slate-50'}`}>
                                            {leave.status === 'pending' && <Clock size={20} className="opacity-80" />}
                                            {leave.status === 'approved' && <CheckCircle2 size={20} className="opacity-80" />}
                                            {leave.status === 'rejected' && <XCircle size={20} className="opacity-80" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 italic">{leave.type}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {leave.start_date} to {leave.end_date} • <span className="text-blue-600">{leave.days_requested} Days</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setExpandedId(expandedId === leave.id ? null : leave.id)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-2 text-[10px] font-black uppercase">
                                            {expandedId === leave.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Details
                                        </button>
                                        {leave.status === 'pending' && (
                                            <button onClick={() => setDeleteId(leave.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedId === leave.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 pb-8">
                                            <div className="pt-6 border-t border-slate-50 flex gap-4">
                                                <div className="bg-blue-50 p-4 rounded-2xl h-fit"><AlignLeft size={18} className="text-blue-600" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                                                    <p className="text-sm text-slate-600 font-medium italic">"{leave.reason}"</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}

                    </AnimatePresence>
                </div>
            </div>

            {/* Custom Delete Confirmation */}
            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto"><Trash2 size={32} /></div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 italic">Delete Request?</h4>
                                <p className="text-slate-400 font-bold text-sm">Are you sure? This cannot be undone.</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setDeleteId(null)} className="flex-1 p-5 rounded-2xl bg-slate-100 font-black text-slate-600">Cancel</button>
                                <button
                                    onClick={handleConfirmDelete} // Calling the function that triggers the Mutation
                                    disabled={cancelLeaveMutation.isPending}
                                    className="flex-1 p-5 rounded-2xl bg-red-500 font-black text-white shadow-lg shadow-red-100 disabled:opacity-50"
                                >
                                    {cancelLeaveMutation.isPending ? <Loader2 className="animate-spin mx-auto" /> : "Yes, Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Request Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl">
                            <h3 className="text-3xl font-black text-slate-900 italic mb-8">New Request</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="p-5 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
                                    <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                                    <p className="text-[10px] text-amber-800 font-bold italic">
                                        {formData.type === 'Casual Leave'
                                            ? "CASUAL: Automatically approved & deducted immediately from balance."
                                            : "ANNUAL: Requires Admin approval before being deducted."}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Leave Type</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-700 outline-none">
                                        <option value="annual">Annual Leave</option>
                                        <option value="casual">Casual Leave</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Start Date</label>
                                        <input type="date" min={today} required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-700 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">End Date</label>
                                        <input type="date" min={formData.start_date || today} required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-700 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Reason (Required)</label>
                                    <textarea required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Why are you requesting this leave?" className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-700 h-28 resize-none outline-none" />
                                </div>
                                <button
                                    disabled={storeLeaveMutation.isPending}
                                    className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black italic text-lg hover:bg-blue-600 transition-all flex justify-center shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {storeLeaveMutation.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        `Submit Request (${diffDays} Days)`
                                    )}
                                </button>

                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BalanceCard({ label, value, total, color, bg }: any) {
    return (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-5xl font-black ${color} italic`}>{value} <span className="text-xl text-slate-200">/ {total}</span></p>
            </div>
            <div className={`w-16 h-16 ${bg} rounded-[1.5rem] flex items-center justify-center`}><Calendar className={color} size={28} /></div>
        </div>
    );
}
