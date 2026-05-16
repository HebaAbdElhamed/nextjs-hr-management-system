'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useDepartment } from '@/src/hooks/useDepartment';

export default function DepartmentDetails() {
  const { id } = useParams();
  const router = useRouter();

  const { useGetDepartments } = useDepartment();
  const { data: departments, isLoading, isError } = useGetDepartments();
  // في الحقيقة هتعمل Fetch للموظفين اللي الـ department_id بتاعهم = id
  const departmentInfo = departments?.find((dept:any) => String(dept.id) === String(id));


  const team =departmentInfo?.users || [];

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
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-blue-600 shadow-sm transition-all">
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{departmentInfo.name}</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Team Roster • {departmentInfo.code}</p>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-left">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase">Employee</th>
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase">Position</th>
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase">Contact</th>
              <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {team.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <User size={20} />
                    </div>
                    <span className="font-black text-slate-700 text-lg">{emp.name}</span>
                  </div>
                </td>
                <td className="px-10 py-7 font-bold text-slate-500">{emp.job_title}</td>
                <td className="px-10 py-7">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1"><Mail size={14} className="text-slate-300"/> {emp.email}</span>
                  </div>
                </td>
                <td className="px-10 py-7 text-right">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black ${emp.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
