import api from "../lib/axios";

export const payrollService = {
    // جلب كل المرتبات (للأدمن)
    getAll: (month: number, year: number) =>
        api.get(`/payrolls`, { params: { month, year } }),

    // إنشاء مرتبات الشهر
    generate: (data: { month: number; year: number }) =>
        api.post(`/payrolls/generate`, data),

    // تحويل الحالة لمدفوع
    markAsPaid: (id: number) =>
        api.patch(`/payrolls/${id}/pay`),

    // سجل مرتبات الموظف
    getMyPayrolls: () =>
        api.get('/my-payrolls'),
};
