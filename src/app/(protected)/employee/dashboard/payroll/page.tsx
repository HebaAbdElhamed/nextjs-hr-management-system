'use client';
import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { usePayroll } from '@/src/hooks/usePayroll'; // تأكد إن الـ Hook فيه دالة useMyPayrolls

export default function EmployeePayrollPage() {
  const { useMyPayrolls } = usePayroll(); // دالة تجيب GET /employee/my-payrolls
  const { data: payrolls = [], isLoading } = useMyPayrolls();
  const [selectedMonth, setSelectedMonth] = useState<any | null>(null);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
      <Wallet size={48} className="text-slate-200 mb-4" />
      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Loading Salary History...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="text-left">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">My Payroll</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">View your salary slips and history</p>
      </header>

      {/* Latest Month Highlight Card */}
      {payrolls.length > 0 && (
        <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-blue-100 font-bold uppercase text-[10px] tracking-[0.2em] mb-2">Latest Payout</p>
            <h3 className="text-5xl font-black italic tracking-tighter mb-6">
              ${parseFloat(payrolls[0].net_salary).toLocaleString()}
            </h3>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                payrolls[0].status === 'paid' ? 'bg-white/20 border-white/30' : 'bg-amber-400 text-amber-900 border-none'
              }`}>
                {payrolls[0].status === 'paid' ? 'Successfully Received' : 'Processing Payment'}
              </span>
              <p className="text-blue-200 text-xs font-bold italic">
                {new Date(payrolls[0].year, payrolls[0].month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <Wallet className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      )}

      {/* Payroll History List */}
      <div className="space-y-6">
        <h4 className="text-xl font-black text-slate-800 italic flex items-center gap-2">
          <FileText size={22} className="text-blue-600" /> Payment History
        </h4>
        
        <div className="grid grid-cols-1 gap-4">
          {payrolls.map((record: any) => (
            <div 
              key={record.id}
              onClick={() => setSelectedMonth(record)}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  record.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-lg">
                    {new Date(record.year, record.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Status: <span className={record.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}>{record.status}</span>
                  </p>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Net Salary</p>
                  <p className="text-xl font-black text-slate-800">${parseFloat(record.net_salary).toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowDownRight size={20} />
                </div>
              </div>
            </div>
          ))}
          
          {payrolls.length === 0 && (
            <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <AlertCircle size={40} className="mx-auto text-slate-300 mb-4" />
               <p className="text-slate-400 font-bold italic">No payroll records generated yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Payslip Modal */}
      {selectedMonth && (
        <PayslipModal payroll={selectedMonth} onClose={() => setSelectedMonth(null)} />
      )}
    </div>
  );
}

// --- Detailed Payslip Modal Component ---
function PayslipModal({ payroll, onClose }: { payroll: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
          <XCircle size={28} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 italic">Payslip Details</h2>
          <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-1">
            {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-500 text-sm">Basic Salary</span>
            <span className="font-black text-slate-800">${parseFloat(payroll.basic_salary).toLocaleString()}</span>
          </div>

          {/* Deductions Breakdown */}
          <div className="p-6 border-2 border-dashed border-red-100 rounded-3xl bg-red-50/30">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Deductions</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-500">Late Minutes ({payroll.details?.late_minutes || 0}m)</span>
                <span className="font-black text-red-500">-${payroll.details?.late_deduction || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-500">Absent Days ({payroll.details?.absent_days || 0}d)</span>
                <span className="font-black text-red-500">-${payroll.details?.absent_deduction || 0}</span>
              </div>
              <div className="pt-3 border-t border-red-100 flex justify-between">
                <span className="font-black text-slate-700 text-xs uppercase tracking-tighter">Total Deduction</span>
                <span className="font-black text-red-600">-${parseFloat(payroll.deductions).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Final Amount */}
          <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-slate-200 flex justify-between items-center">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-1">Net Received</p>
              <p className="text-3xl font-black italic tracking-tighter">${parseFloat(payroll.net_salary).toLocaleString()}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${payroll.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              {payroll.status === 'paid' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 font-black text-slate-400 hover:text-slate-800 transition-all text-xs uppercase tracking-widest"
        >
          Close Slip
        </button>
      </div>
    </div>
  );
}
