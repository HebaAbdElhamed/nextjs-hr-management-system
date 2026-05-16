'use client';

import { useForm } from "react-hook-form";
import { useAuth } from "@/src/hooks/useAuth";

export default function RegisterCard() {
    const { register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm();
    const { register: registerUser } = useAuth();
    const onSubmit = (data) => registerUser(data);
    return (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">

                <div className="text-center mb-6 border-b border-gray-100 pb-5">
                    <img src="images/logo.png" alt="Company Logo" className="mx-auto h-12 mb-2" />
                    <h1 className="text-xl font-black text-gray-600 tracking-tight">Payroll Hub</h1>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
                    <p className="text-slate-500 mt-1 text-sm">Join the payroll system</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="full-name" className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                        <input type="text" id="full-name" {...register("name", { required: "Full name is required" })} placeholder="e.g. Ahmed Ali" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="work-email" className="block text-sm font-semibold text-slate-700 mb-1">Work Email</label>
                        <input type="email" id="work-email" {...register("email", { required: "Work email is required" })} placeholder="ahmed@company.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters"
                                },
                                pattern: {
                                    // Updated regex to ensure letters, numbers, and symbols are present
                                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).*$/,
                                    message: "Password must contain letters, numbers, and symbols"
                                }
                            })}
                            placeholder="Min. 8 characters"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Role Indicator */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Account Role</p>
                        <p className="text-sm font-bold text-slate-700">Employee</p>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.95] mt-2">
                        Complete Registration
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Already have an account? <a href="/login" className="text-blue-600 font-bold hover:underline">Log in here</a>
                </p>
            </div>
        </div>
    );
}