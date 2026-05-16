'use client';
import { useState } from 'react';
import { Plus, Building2, Users, ArrowRight, Edit2, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import DeptModal from './components/DeptModal';
import DeleteConfirm from './components/DeleteConfirm';
import { useDepartment } from '@/src/hooks/useDepartment';

export default function DepartmentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<any>(null);

    const { useGetDepartments } = useDepartment();
    const { data: departments, isLoading, isError } = useGetDepartments();


    const handleEdit = (dept: any) => {
        setSelectedDept(dept);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (dept: any) => {
        setSelectedDept(dept);
        setIsDeleteOpen(true);
    };
    const { useDeleteDepartments } = useDepartment();
    const deleteMutation = useDeleteDepartments();
    const confirmDelete = () => {
        if (selectedDept) {
            deleteMutation.mutate(selectedDept.id, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Departments</h1>
                    <p className="text-slate-400 font-medium">Managing Organization Structure</p>
                </div>
                <button
                    onClick={() => { setSelectedDept(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-blue-100"
                >
                    <Plus size={20} /> New Department
                </button>
            </div>
            
            {/* Grid Layout (The "Pretty" Version) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div key={dept.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <Building2 size={28} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => handleEdit(dept)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={18} /></button>
                                <button onClick={() => handleDeleteClick(dept)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-1 leading-tight capitalize">{dept.name}</h3>
                        <p className="text-sm font-mono font-black text-slate-400 uppercase tracking-widest mb-6">{dept.code}</p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-slate-500 font-bold">
                                <Users size={18} />
                                <span>{dept.users_count ?? 0} Members</span>
                            </div>
                            <Link href={`/admin/dashboard/departments/${dept.id}`} className="text-blue-600 font-black flex items-center gap-1 hover:gap-2 transition-all">
                                View Team <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {isModalOpen && <DeptModal onClose={() => setIsModalOpen(false)} data={selectedDept} />}
            {isDeleteOpen && <DeleteConfirm onClose={() => setIsDeleteOpen(false)} onConfirm={confirmDelete} deptName={selectedDept?.name} />}
        </div>
    );
}
