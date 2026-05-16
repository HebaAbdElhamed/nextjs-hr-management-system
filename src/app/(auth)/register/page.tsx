'use client';
import RegisterCard from "./components/RegisterCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUp() {
    return (
        <div className="relative min-h-screen bg-slate-50 overflow-hidden">
            {/* Background Shape */}
            <div className="bg-blue-600 w-full h-80 rounded-ee-[250px] absolute top-0 left-0 z-0 shadow-lg"></div>

            {/* Back to Home Link */}
            <div className="relative z-20 p-6 max-w-7xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold transition-all"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>
            </div>

            {/* The Form */}
            <div className="relative z-10">
                <RegisterCard />
            </div>
        </div>
    );
}
