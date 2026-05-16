'use client';
import React from 'react';
import Link from 'next/link';
import { 
  LogIn, UserPlus, Fingerprint, Clock, 
  Wallet, ShieldCheck, FileText, Smartphone 
} from 'lucide-react';

export default function EmployeePortal() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-black text-slate-800 tracking-tighter">Payroll Hub</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            <LogIn className="w-4 h-4" />
            Portal Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Welcome Text */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 leading-tight">
              Welcome to your <br />
              <span className="text-blue-600 font-extrabold italic">Workforce Portal</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-md">
              Access your personalized dashboard to manage attendance, track your payroll, and stay connected with your team.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 group">
              Sign In to Dashboard
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* <Link href="/register" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
              <UserPlus className="w-5 h-5" />
              New Employee?
            </Link> */}
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 w-fit">
            <ShieldCheck className="text-green-600 w-6 h-6" />
            <span className="text-sm font-bold text-green-800">Secure AES-256 Encrypted Portal</span>
          </div>
        </div>

        {/* Right Side: Visual Services Grid */}
        <div className="grid grid-cols-2 gap-4">
          <ServiceBox 
            icon={<Fingerprint className="text-blue-600" />} 
            title="Attendance" 
            desc="GPS & Biometric Check-in" 
          />
          <ServiceBox 
            icon={<Wallet className="text-green-600" />} 
            title="Payroll" 
            desc="Monthly Slips & Bonuses" 
          />
          <ServiceBox 
            icon={<FileText className="text-purple-600" />} 
            title="Contracts" 
            desc="View & Sign Documents" 
          />
          <ServiceBox 
            icon={<Clock className="text-orange-600" />} 
            title="Leave Requests" 
            desc="Manage your vacations" 
          />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="p-8 text-center border-t border-slate-100 bg-white">
        <p className="text-slate-400 text-sm font-medium">
          Internal Corporate System — Powered by <span className="text-slate-900 font-bold">Payroll Hub</span>
        </p>
      </footer>
    </div>
  );
}

function ServiceBox({ icon, title, desc }) {
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 font-medium leading-tight">{desc}</p>
    </div>
  );
}
