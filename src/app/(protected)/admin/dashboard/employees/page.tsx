'use client';
import { useState } from 'react';
import { Plus, Building, CreditCard, ChevronRight, MoreHorizontal, ShieldCheck, Briefcase, Hash, Calendar, Mail, Trash2, Edit2, Eye, AlertCircle, Loader2 } from 'lucide-react';
import RegistrationPanel from './components/RegistrationPanel';
import EmpDetailsDrawer from './components/EmpDetailsDrawer';
import toast from 'react-hot-toast';
import { useEmployee } from '@/src/hooks/useEmployee';

export default function EmployeesPage() {

    const { useGetEmployee, useDeleteEmployee } = useEmployee()
    const deleteMutation = useDeleteEmployee();
    const { data: employees, isLoading, isError } = useGetEmployee();

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<any>(null);

    // --- منطق الحذف ---
    const handleDeleteClick = (emp: any) => {
        setSelectedEmp(emp);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (selectedEmp) {
            deleteMutation.mutate(selectedEmp.id, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                },
                onError: () => {
                    toast.error("Failed to delete employee");
                }
            });
        }
    };

    if (isLoading) return (
        <div className="h-96 flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-black italic">Loading Organization Structure...</p>
        </div>
    );


    if (isError) return (
        <div className="p-10 text-red-500 font-bold bg-red-50 rounded-3xl border border-red-100">
            ❌ Failed to connect to Laravel. Check if the server is running or your Token is valid.
        </div>
    );
    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-8">
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">Staff <span className="text-slate-300 font-light">Hub</span></h1>
                <button onClick={() => { setSelectedEmp(null); setIsPanelOpen(true); }} className="h-16 px-10 bg-slate-900 text-white rounded-full font-black flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 active:scale-95">
                    <Plus size={24} /> Onboard Talent
                </button>
            </div>

            {/* Grid List */}
            <div className="space-y-4">
                {employees.map((emp) => (
                    <div key={emp.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-50 hover:border-blue-100 hover:shadow-2xl hover:shadow-slate-100 transition-all flex items-center gap-10 relative overflow-hidden">

                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all" />

                        <div className="flex items-center gap-6 w-1/3">
                            <div className="w-20 h-20 bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-blue-600 italic shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 overflow-hidden">
                                {emp.image ? (
                                    <img
                                        src={emp.image.startsWith('http') ? emp.image : `http://localhost:8000/storage/${emp.image}`}
                                        className="w-full h-full object-cover"
                                        alt={emp.name}
                                    />
                                ) : (
                                    emp.name.charAt(0)
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors capitalize">{emp.name}</h3>
                                <p className="text-sm font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tighter mt-1 italic">
                                    <Briefcase size={14} className="text-blue-400" /> {emp.job_title}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-1 justify-around border-l border-slate-50 pl-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Placement</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700 capitalize">{emp.department?.name || 'No Department'}</span>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${emp.status === 'active' ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Net Package</p>
                                <p className="text-sm font-black text-green-600 italic">${emp.salary}</p>
                            </div>
                            <div className="space-y-1 hidden xl:block">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Joined On</p>
                                <p className="text-sm font-bold text-slate-500 flex items-center gap-1"><Calendar size={14} className="text-blue-300" /> {emp.join_date ? new Date(emp.join_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : '---'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pr-4">
                            <button onClick={() => { setSelectedEmp(emp); setIsDrawerOpen(true); }} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye size={20} /></button>
                            <button onClick={() => { setSelectedEmp(emp); setIsPanelOpen(true); }} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Edit2 size={20} /></button>
                            <button onClick={() => handleDeleteClick(emp)} className="w-12 h-12 bg-slate-50 text-red-200 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))}
                {employees.length === 0 && (
                    <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black italic text-xl uppercase tracking-widest">No Talents Found</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-white animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Delete Talent?</h3>
                        <p className="text-slate-500 font-medium mb-8">You are about to remove <span className="text-red-600 font-black italic">"{selectedEmp?.name}"</span>. This action is permanent and will wipe all linked records.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase text-xs tracking-widest">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-600 transition-all uppercase text-xs tracking-widest">Yes, Wipe</button>
                        </div>
                    </div>
                </div>
            )}

            {isPanelOpen && <RegistrationPanel data={selectedEmp} onClose={() => setIsPanelOpen(false)} />}
            {isDrawerOpen && <EmpDetailsDrawer employee={selectedEmp} onClose={() => setIsDrawerOpen(false)} />}
        </div>
    );
}
