interface StatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
}

export default function StatCard({ label, value, icon, bg }: StatProps) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 group">
      {/* الدائرة اللي فيها الأيقونة */}
      <div className={`w-16 h-16 ${bg} rounded-3xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      
      {/* النصوص */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          {label}
        </p>
        <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
