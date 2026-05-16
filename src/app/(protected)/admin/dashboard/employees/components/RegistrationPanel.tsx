'use client';
import { useEffect, useState } from 'react';
import { X, ArrowRight, Mail, Briefcase, Lock, User, Eye, EyeOff, Phone, MapPin, UploadCloud, Camera, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEmployee } from '@/src/hooks/useEmployee';
import { useDepartment } from '@/src/hooks/useDepartment';

export default function RegistrationPanel({ onClose, data }: any) {
    const isEdit = !!data;

    const { register, handleSubmit, setError, reset, formState: { errors, isDirty } } = useForm({
        defaultValues: {
            ...data,
            // تنسيق التاريخ ليظهر في الـ input (YYYY-MM-DD)
            join_date: data?.join_date ? data.join_date.split('T')[0] : '',
            role: 'employee'
        }
    });

    const { useAddEmployee, useUpdateEmployee } = useEmployee();
    const { useGetDepartments } = useDepartment();
    const { data: departments } = useGetDepartments();

    const addMutation = useAddEmployee();
    const updateMutation = useUpdateEmployee();

    const [showPass, setShowPass] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
        if (data) {
            reset({
                ...data,
                join_date: data.join_date ? data.join_date.split('T')[0] : '',
                role: 'employee'
            });
        }
    }, [data, reset]);
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreview(URL.createObjectURL(file));
    };

    const isPending = addMutation.isPending || updateMutation.isPending;

    const onSubmit = (formData: any) => {
        const submissionData = new FormData();

        Object.keys(formData).forEach((key) => {
            if (key === 'image') {
                // التعديل هنا: نبعت حقل الصورة فقط لو المستخدم اختار ملف جديد فعلاً
                // بنعرف ده لو كانت القيمة FileList وطولها أكبر من 0
                if (formData.image instanceof FileList && formData.image.length > 0) {
                    submissionData.append('image', formData.image[0]);
                }
                // ملحوظة: لو مفيش صورة جديدة، مش هنضيف مفتاح "image" للـ FormData أصلاً
            } else if (formData[key] !== null && formData[key] !== undefined) {
                submissionData.append(key, formData[key]);
            }
        });

        // التعديل التاني: حركة الـ _method عشان لارفيل يفهم الـ PUT مع الـ FormData
        if (isEdit) {
            submissionData.append('_method', 'PUT');
        }

        if (!submissionData.has('role')) {
            submissionData.append('role', 'employee');
        }

        const mutation = isEdit ? updateMutation : addMutation;

        // في حالة التعديل، لارفيل بيفضل إن الريكويست يتبعت POST 
        // بس الـ _method اللي ضفناها فوق هي اللي بتعرفه إنه PUT
        const payload = isEdit ? { id: data.id, data: submissionData } : submissionData;

        mutation.mutate(payload as any, {
            onSuccess: () => onClose(),
            onError: (error: any) => {
                const serverErrors = error.response?.data?.errors;
                if (serverErrors) {
                    Object.keys(serverErrors).forEach((field) => {
                        setError(field as any, {
                            type: "server",
                            message: Array.isArray(serverErrors[field]) ? serverErrors[field][0] : serverErrors[field]
                        });
                    });
                }
            },
        });
    };



    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 p-12 flex flex-col overflow-y-auto border-l border-white">

                <button onClick={onClose} className="w-14 h-14 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-black mb-10 shrink-0 transition-all">
                    <X size={24} />
                </button>

                <div className="mb-10 shrink-0">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 italic">
                        {isEdit ? 'Update Profile' : 'New Talent'}
                    </h2>
                    <p className="text-slate-400 font-bold border-l-8 border-blue-600 pl-6 uppercase text-[10px] tracking-[0.4em]">
                        Corporate Onboarding • Phase 1
                    </p>
                </div>

                <form className="space-y-10 pb-10" onSubmit={handleSubmit(onSubmit)}>

                    {/* Identity Section */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-3 text-xs font-black text-blue-600 uppercase tracking-[0.3em]">
                            <User size={16} /> Identity Details
                        </h4>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2">Full Name</label>
                                <input {...register("name", { required: "Name is required" })} className="w-full h-16 px-8 border-2 border-slate-50 rounded-[1.2rem] bg-slate-50/30 outline-none focus:border-blue-600 transition-all font-bold" />
                                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{errors.name.message as string}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2 italic">Phone Number</label>
                                    <input {...register("phone", { required: "Phone is required" })} type="tel" className="w-full h-16 px-8 border-2 border-slate-50 rounded-[1.2rem] bg-slate-50/30 outline-none focus:border-blue-600 font-bold" placeholder="+20..." />
                                    {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{errors.phone.message as string}</p>}
                                </div>
                                <div className="relative group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2 italic">Current Address</label>
                                    <input {...register("address", { required: "Address is required" })} className="w-full h-16 px-8 border-2 border-slate-50 rounded-[1.2rem] bg-slate-50/30 outline-none focus:border-blue-600 font-bold" />
                                    {errors.address && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{errors.address.message as string}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Credentials Section */}
                    <div className="space-y-8 p-10 bg-slate-900 rounded-[3rem] shadow-2xl">
                        <h4 className="flex items-center gap-3 text-xs font-black text-blue-400 uppercase tracking-[0.3em]">
                            <Lock size={16} /> Security
                        </h4>
                        <div className="space-y-8">
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest absolute -top-2 left-6 bg-slate-900 px-2 italic">Corporate Email</label>
                                <input {...register("email", { required: "Email is required" })} type="email" className="w-full h-16 px-8 border-2 border-slate-800 rounded-[1.2rem] bg-transparent outline-none focus:border-blue-500 text-white font-bold" />
                                {errors.email && <p className="text-blue-400 text-[10px] font-bold mt-1 ml-4 italic">{errors.email.message as string}</p>}
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest absolute -top-2 left-6 bg-slate-900 px-2 italic">Password</label>
                                <div className="relative">
                                    <input
                                        {...register("password", {
                                            required: !isEdit ? "Password is required" : false,
                                            minLength: !isEdit
                                                ? { value: 8, message: "Min 8 characters" }
                                                : undefined
                                        })}
                                        type={showPass ? "text" : "password"}
                                        placeholder={
                                            isEdit
                                                ? "Leave empty if you don't want to change password"
                                                : "Enter password"
                                        }
                                        className="w-full h-16 px-8 border-2 border-slate-800 rounded-[1.2rem] bg-transparent outline-none focus:border-blue-500 text-white font-bold"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-[10px] font-bold mt-1 ml-4 italic">{errors.password.message as string}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="space-y-6 pt-4">
                        <h4 className="flex items-center gap-3 text-xs font-black text-purple-600 uppercase tracking-[0.3em]">
                            <Briefcase size={16} /> Employment Terms
                        </h4>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2">Job Title</label>
                                <input {...register("job_title", { required: "Title is required" })} className="w-full h-16 px-8 border-2 border-slate-50 rounded-[1.2rem] bg-slate-50/30 outline-none focus:border-purple-600 font-bold" />
                                {errors.job_title && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{errors.job_title.message as string}</p>}
                            </div>
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2 italic">Department</label>
                                <select {...register("department_id", { required: "Department is required" })} className="w-full h-16 px-8 border-2 border-slate-50 rounded-[1.2rem] bg-slate-50/30 outline-none font-black text-slate-700 appearance-none">
                                    <option value="">Select Department</option>
                                    {departments?.map((d: any) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {errors.department_id && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{errors.department_id.message as string}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2">Net Salary ($)</label>
                                <input {...register("salary", { required: "Salary is required" })} type="number" className="w-full h-16 px-8 border-2 border-slate-50 rounded-[1.2rem] bg-slate-50/30 outline-none focus:border-green-500 font-black text-green-600 text-xl" />
                                {errors.salary && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{errors.salary.message as string}</p>}
                            </div>
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2">Joined Date</label>
                                <input {...register("join_date", { required: "Date is required" })} type="date" className="w-full h-16 px-8 border-2 border-slate-50 rounded-[1.2rem] bg-slate-50/30 outline-none font-bold text-slate-500" />
                                {errors.join_date && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{errors.join_date.message as string}</p>}
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest absolute -top-2 left-6 bg-white px-2">Account Status</label>
                            <select {...register("status", { required: "Status is required" })} className="w-full h-16 px-8 border-2 border-slate-50 rounded-[1.2rem] bg-slate-50/30 outline-none font-black text-slate-700 appearance-none">
                                <option value="active">🟢 Active Duty</option>
                                <option value="inactive">🔴 Inactive</option>
                            </select>
                            {errors.status && <p className="text-red-500 text-[10px] font-bold mt-1 ml-4 italic">{errors.status.message as string}</p>}
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="space-y-4 pt-4">
                        <h4 className="flex items-center gap-3 text-xs font-black text-orange-600 uppercase tracking-[0.3em]">
                            <Camera size={16} /> Profile Image
                        </h4>
                        <div className="relative group">
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer overflow-hidden">

                                {/* المنطق الجديد هنا */}
                                {preview || data?.image ? (
                                    <img
                                        // لو فيه صورة لسه مختاراها اعرضيها، لو مفيش اعرضي اللي جاية من الباك بالرابط الكامل
                                        src={preview || (data?.image?.startsWith('http') ? data.image : `http://localhost:8000/storage/${data.image}`)}
                                        className="w-full h-full object-cover"
                                        alt="profile"
                                    />

                                ) : (
                                    <div className="text-center">
                                        <UploadCloud className="mx-auto text-slate-300 mb-2" size={32} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Member Photo</p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    {...register("image", {
                                        onChange: (e) => {
                                            handleImageChange(e); // تحديث الـ Preview
                                        }
                                    })}
                                />
                            </label>
                        </div>
                    </div>


                    <button
                        // الزرار هيكون disabled في حالتين: 
                        // 1. لو فيه طلب بيتبعت حالياً (isPending)
                        // 2. لو إحنا في حالة تعديل (isEdit) واليوزر مغيرش أي حاجة خالص (!isDirty)
                        disabled={isPending || (isEdit && !isDirty)}
                        className="w-full h-24 bg-blue-600 text-white rounded-full font-black text-2xl flex items-center justify-center gap-6 hover:bg-slate-900 transition-all shadow-[0_30px_60px_-10px_rgba(37,99,235,0.4)] mt-10 active:scale-95 group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : (
                            <>{isEdit ? 'Update Talent' : 'Finalize Onboarding'} <ArrowRight className="group-hover:translate-x-3 transition-transform" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
