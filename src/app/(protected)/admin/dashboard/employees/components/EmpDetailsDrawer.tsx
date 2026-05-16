'use client';
import { useState } from 'react';
import {
    X, Hash, Mail, Calendar, ShieldCheck, Landmark,
    Briefcase, User, Phone, MapPin, Lock, Eye, EyeOff, Shield, UserCog, Fingerprint
} from 'lucide-react';

export default function EmpDetailsDrawer({ employee, onClose }: any) {
    const [showPass, setShowPass] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop - التعتيم خلف اللوحة */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={onClose} />

            {/* Drawer Content - محتوى اللوحة المنزلقة */}
            <div className="relative w-full max-w-xl bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l border-slate-100 overflow-y-auto scrollbar-hide">

                {/* Top Actions & Role Badge */}
                <div className="p-8 flex justify-between items-center shrink-0 border-b border-slate-50/50">
                    <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 hover:text-black transition-all hover:rotate-90">
                        <X size={20} />
                    </button>

                    <div className="flex gap-2">
                        {/* بادج الرتبة (Admin/Employee) */}
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 ${employee.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {employee.role === 'admin' ? <UserCog size={12} /> : <User size={12} />}
                            {employee.role}
                        </span>
                        {/* بادج الحالة */}
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${employee.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {employee.status}
                        </span>
                    </div>
                </div>

                {/* Profile Identity - الهوية البصرية */}
                <div className="px-10 py-12 flex flex-col items-center text-center bg-gradient-to-b from-slate-50/50 to-white">
                    <div className="relative mb-6">
                        <div className="w-36 h-36 bg-slate-900 rounded-[3.5rem] flex items-center justify-center text-6xl font-black text-white shadow-2xl shadow-slate-200 italic overflow-hidden border-4 border-white">
                            {employee.image ? (
                                <img src={employee.image.startsWith('http')
                                    ? employee.image
                                    : `http://localhost:8000/storage/${employee.image}`} className="w-full h-full object-cover" alt="profile" />
                            ) : (
                                <span className="opacity-90">{employee.name.charAt(0)}</span>
                            )}
                        </div>
                        {/* الـ Employee Code يظهر كبادج صغير فوق الصورة */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-mono font-bold shadow-lg flex items-center gap-1">
                            <Fingerprint size={12} /> {employee.code || 'IT-001'}
                        </div>
                    </div>

                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{employee.name}</h2>
                    <p className="text-blue-600 font-bold uppercase tracking-[0.4em] text-[9px] mt-2 bg-blue-50 px-4 py-1 rounded-full">{employee.job_title}</p>
                </div>

                {/* Details Grid - شبكة التفاصيل */}
                <div className="p-10 space-y-10 flex-1">

                    {/* Section: Job Info */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2">Organizational Placement</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailBox icon={<Briefcase size={18} />} label="Unit" value={employee.department?.name || 'No Department'} />
                            <DetailBox icon={<Calendar size={18} />} label="Hire Date" value={employee.join_date ? new Date(employee.join_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }) : '---'} />
                            <div className="col-span-2">
                                <DetailBox icon={<Landmark size={18} />} label="Monthly Gross Package" value={`$${employee.salary}`} color="text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Contact */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2">Contact Archive</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <DetailBox icon={<Mail size={18} />} label="Corporate Email" value={employee.email} />
                            <DetailBox icon={<Phone size={18} />} label="Phone Number" value={employee.phone || '+20 100 000 0000'} />
                            <DetailBox icon={<MapPin size={18} />} label="Residential Address" value={employee.address || 'Alexandria, Egypt'} />
                        </div>
                    </div>

                    {/* Section: Security (Password) */}
                    <div className="space-y-4 pb-10">
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2">Cyber Security</h4>
                        <div className="p-6 bg-slate-900 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 border border-white/5">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Portal Password</p>
                                    <p className="text-white font-mono font-bold tracking-[0.3em] mt-1 text-lg">
                                        {showPass ? (employee.password || 'N/A') : '••••••••'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPass(!showPass)}
                                className="w-12 h-12 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 transition-all border border-transparent hover:border-white/10"
                            >
                                {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 shrink-0">
                    <button className="w-full h-16 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <Shield size={16} /> Manage System Permissions
                    </button>
                </div>
            </div>
        </div>
    );
}

// Reusable Detail Box - مكون عرض التفاصيل الصغير
function DetailBox({ icon, label, value, color = "text-slate-700" }: any) {
    return (
        <div className="flex items-center gap-5 p-5 rounded-[2rem] border border-slate-50 bg-white hover:border-blue-100 transition-all group shadow-sm">
            <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{label}</p>
                <p className={`font-black text-sm tracking-tight ${color}`}>{value}</p>
            </div>
        </div>
    )
}
