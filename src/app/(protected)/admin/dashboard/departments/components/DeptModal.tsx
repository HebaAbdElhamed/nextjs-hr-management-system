'use client';
import { useDepartment } from '@/src/hooks/useDepartment';
import { X, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function DeptModal({ onClose, data }: any) {
    const isEdit = !!data;

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: data
    });

    const { useAddDepartments, useUpdateDepartments } = useDepartment();


    const addMutation = useAddDepartments();
    const updateMutation = useUpdateDepartments();


    const isPending = addMutation.isPending || updateMutation.isPending;

    const onSubmit = (formData: any) => {
        if (isEdit) {

            updateMutation.mutate({ id: data.id, data: formData }, {
                onSuccess: () => onClose(),
            });
        } else {

            addMutation.mutate(formData, {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 relative animate-in zoom-in-95">

                <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-all">
                    <X size={28} />
                </button>

                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    {isEdit ? 'Update Department' : 'Create Unit'}
                </h2>
                <p className="text-slate-400 font-medium mb-8 italic text-sm">
                    {isEdit ? `Editing: ${data.name}` : 'System will auto-generate department code'}
                </p>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 ml-2 italic underline decoration-blue-200">
                            Department Name
                        </label>
                        <input
                            {...register("name", { required: "Department name is required" })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                            placeholder="e.g. Finance & Accounting"
                        />
                        {errors.name && <p className="text-red-500 text-xs ml-2 font-bold">{errors.name.message as string}</p>}
                    </div>

                    {isEdit && (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">System Info</p>
                            <p className="text-sm font-mono font-black text-blue-800 mt-1">Current Code: {data.code}</p>
                        </div>
                    )}

                    <button
                        disabled={isPending}
                        className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                {isEdit ? 'Save Changes' : 'Launch Unit'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
