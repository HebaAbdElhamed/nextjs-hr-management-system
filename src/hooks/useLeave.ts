'use client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { leaveService } from "../services/leaveService";

export const useLeaves = () => {
    const queryClient = useQueryClient();

    const useMyLeaves = () => {
    return useQuery({
        queryKey: ['leaves'],
        queryFn: async () => {
            const res = await leaveService.myLeaves();
            return res.data.data; // لأن لارافل بترجع ['data' => $leaves]
        },
    });
};

    const useStoreLeave = () => {
        return useMutation({
            mutationFn: (data) => leaveService.store(data),
            onSuccess: async (res) => {
                queryClient.invalidateQueries({ queryKey: ['leaves'] });
                queryClient.invalidateQueries({ queryKey: ['balances'] });
                toast.success(res.data.message || "Leave requested successfully! 🚀");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to store leave");
            }
        });
    };


    const useCancelLeave = () => {
        return useMutation({
            mutationFn: (id: number) => leaveService.cancel(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['leaves'] });
                toast.success("Leave cancelled successfully");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to cancel leave");
            }
        });
    };

const useGetBalances = () => {
    return useQuery({
        queryKey: ['balances'],
        queryFn: async () => {
            const res = await leaveService.getBalances();
            return res.data; // لأن لارافل بترجع الأوبجكت مباشرة
        },
    });
};


    const useAdminIndex = () => {
        return useQuery({
            queryKey: ['admin_leaves'],
            queryFn: async () => {
                const res = await leaveService.adminIndex();
                return res.data.data;
            },
        });
    };


    const useAdminDecision = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: number, data: any }) => leaveService.adminDecision(id, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['admin_leaves'] });
                toast.success("Decision updated successfully");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to update decision");
            }
        });
    };


    return {
        useAdminDecision,
        useAdminIndex,
        useGetBalances,
        useCancelLeave,
        useStoreLeave,
        useMyLeaves
    };
};