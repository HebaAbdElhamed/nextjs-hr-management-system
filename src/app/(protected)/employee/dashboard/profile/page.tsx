'use client';
import React from 'react';
import Cookies from 'js-cookie';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  Calendar, DollarSign, BadgeCheck, Building2, 
  Fingerprint, Loader2
} from 'lucide-react';
import { useEmployee } from '@/src/hooks/useEmployee';

export default function MyProfilePage() {
  const { useShowEmployee } = useEmployee();
  const userId = Cookies.get('user_id');
  const { data: user, isLoading } = useShowEmployee(userId);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600 mb-2" size={30} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Profile...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 animate-in fade-in duration-500">
      
      {/* Header Banner - تصميم هادي وملموم */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-3xl border-4 border-slate-800 overflow-hidden bg-white shrink-0">
            {user?.image ? (
              <img src={`http://localhost:8000/storage/${user.image}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-200"><User size={40}/></div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">{user?.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <BadgeCheck size={12} /> {user?.job_title}
              </span>
              <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                ID: {user?.code}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Grid - تقسيم ثنائي بسيط مبيخرجش بره */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Personal Details */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black text-slate-800 italic uppercase text-xs border-b pb-4 flex items-center gap-2">
            <User size={16} className="text-blue-600" /> Personal Information
          </h3>
          <div className="space-y-5">
            <InfoField label="Full Name" value={user?.name} />
            <InfoField label="Email Address" value={user?.email} />
            <InfoField label="Phone Number" value={user?.phone || 'Not provided'} />
            <InfoField label="Location" value={user?.address || 'Not provided'} />
          </div>
        </div>

        {/* Work Details */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black text-slate-800 italic uppercase text-xs border-b pb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-blue-600" /> Employment Details
          </h3>
          <div className="space-y-5">
            <InfoField label="Department" value={user?.department?.name} />
            <InfoField label="Position" value={user?.job_title} />
            <InfoField label="Joined Date" value={user?.join_date?.split('T')[0]} />
            <InfoField label="Monthly Salary" value={`$${user?.salary}`} color="text-blue-600" />
          </div>
        </div>

        {/* Footer Note */}
        <div className="md:col-span-2 p-6 bg-blue-50/50 rounded-[1.5rem] border border-blue-100/50 text-center">
          <p className="text-[10px] font-bold text-blue-600/70 uppercase italic tracking-tighter">
            Profile data is managed by HR. Contact your department for any updates.
          </p>
        </div>
      </div>
    </div>
  );
}

// مكون صغير لعرض البيانات بدون تكرار
function InfoField({ label, value, color = "text-slate-700" }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</span>
      <div className={`px-5 py-3 bg-slate-50 rounded-2xl font-bold text-[13px] italic ${color}`}>
        {value || '---'}
      </div>
    </div>
  );
}
