'use client';
import { useForm } from "react-hook-form";
import { useAuth } from "@/src/hooks/useAuth";

export default function LoginCard() {
    const { register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm();
    const {login} = useAuth();
    const onSubmit =  (data) => login(data);
    return (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">

                {/* Header: Logo & Name */}
                <div className="text-center mb-6 border-b border-gray-100 pb-5">
                    <img src="/images/logo.png" alt="Company Logo" className="mx-auto h-12 mb-2" />
                    <h1 className="text-xl font-black text-gray-600 tracking-tight">Payroll Hub</h1>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Login Account</h2>
                    <p className="text-slate-500 mt-1 text-sm">Welcome back to the system</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="work-email" className="block text-sm font-semibold text-slate-700 mb-1">
                            Work Email
                        </label>
                        <input
                            {...register("email", { required: "Email is required" })}
                            type="email"
                            id="work-email"
                            placeholder="ahmed@company.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                            Password
                        </label>
                        <input
                            {...register("password", { required: "Password is required" })}
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-[0.95] mt-2"
                    >
                        Login
                    </button>
                </form>

                {/* Footer Link */}
                <p className="mt-8 text-center text-sm text-slate-500">
                    New to the system? <span className="text-blue-600 font-bold">Connect the HR team</span>
                    {/* <a href="/register" className="text-green-500 font-bold hover:underline">Create an account</a> */}
                </p>
            </div>
        </div>
    );
}