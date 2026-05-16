"use client";
import LoginCard from "./components/LoginCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Background Shape - Green for Login */}
      <div className="bg-blue-600 w-full h-80 rounded-ee-[250px] absolute top-0 left-0 z-0 shadow-lg"></div>

      {/* Back to Home Button */}
      <div className="relative z-20 p-6 max-w-7xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/90 hover:text-white font-bold transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      {/* The Login Card */}
      <div className="relative z-10">
        <LoginCard />
      </div>
    </div>
  );
}
