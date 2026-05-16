'use client';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteConfirm({ onClose, onConfirm, deptName }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in-95">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Unit?</h2>
        <p className="text-slate-500 mb-8 font-medium">
          Are you sure you want to delete <span className="text-red-600 font-black italic underline">"{deptName}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-600 transition-all flex items-center justify-center gap-2">
            <Trash2 size={18} /> Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
