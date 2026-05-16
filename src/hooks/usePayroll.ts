import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollService } from "../services/payrollService";
import toast from "react-hot-toast";

export const usePayroll = () => {
  const queryClient = useQueryClient();

  const useAdminPayrolls = (month: number, year: number) => {
    return useQuery({
      queryKey: ['admin_payrolls', month, year],
      queryFn: async () => {
        const res = await payrollService.getAll(month, year);
        return res.data.data;
      },
    });
  };


  const useMyPayrolls = () => {
    return useQuery({
      queryKey: ['my_payrolls'],
      queryFn: async () => {
        const res = await payrollService.getMyPayrolls();
        return res.data.data;
      },
    });
  };

  const useGeneratePayroll = () => {
    return useMutation({
      mutationFn: payrollService.generate,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin_payrolls'] });
        toast.success("Payroll generated successfully! 💰");
      },
    });
  };

  const usePayMutation = () => {
    return useMutation({
      mutationFn: payrollService.markAsPaid,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin_payrolls'] });
        toast.success("Marked as Paid! ✅");
      },
    });
  };

  return { useAdminPayrolls, useGeneratePayroll, usePayMutation,useMyPayrolls  };
};
