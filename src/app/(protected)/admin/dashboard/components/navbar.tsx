'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useEmployee } from '@/src/hooks/useEmployee';

export default function Navbar() {
  const [userId, setUserId] = useState<string | null>(null);
  const { useShowEmployee } = useEmployee();

  // 1. قراءة الـ ID الخاص بالمستخدم المسجل من الـ localStorage عند تحميل الصفحة
  useEffect(() => {
    // تأكد من مطابقة اسم المفتاح (key) لما هو مخزن لديك عند تسجيل الدخول (مثلاً 'user_id' أو 'id')
    const savedId = Cookies.get('user_id');
    setUserId(savedId);
  }, []);

  // 2. استدعاء الهوك الحالي لديك مباشرة باستخدام الـ ID المستخرج
  // الهوك لن يقوم بأي ريكويست إذا كان الـ userId غير موجود بفضل خاصية (enabled: !!id) التي كتبتيها
  const { data: user, isLoading } = useShowEmployee(userId || undefined);

  // دالة لاستخراج أول حرف من الاسم
  const getInitials = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="h-24 flex items-center justify-end px-10 bg-white/60 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">

          {/* بيانات المستخدم الديناميكية المستخرجة من دالة show */}
          <div className="text-right hidden sm:block">
            <p className="font-black text-slate-800 text-sm leading-none mb-1">
              {isLoading ? "Loading..." : (user?.name || "Guest")}
            </p>
            <p className="text-xs text-blue-600 font-bold italic">
              {user?.role || 'Employee'}
            </p>
          </div>

          {/* الصورة الشخصية أو أول حرف من الاسم */}
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl p-0.5 shadow-lg shadow-blue-100 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                className="w-full h-full rounded-[0.9rem] object-cover"
                alt={user?.name || "User"}
              />
            ) : (
              <div className="w-full h-full rounded-[0.9rem] bg-slate-900 flex items-center justify-center text-white font-black text-lg">
                {getInitials(user?.name || "")}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
