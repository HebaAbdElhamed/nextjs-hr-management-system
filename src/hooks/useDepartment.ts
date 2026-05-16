'use client';
import { departmentService } from "../services/departmentService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDepartment = () => {
    const queryClient = useQueryClient();


    const useGetDepartments = () => {
        return useQuery({
            queryKey: ['departments'],
            queryFn: async () => {
                const res = await departmentService.index();
                return res.data;
            },
        });
    };

    const useAddDepartments = () => {
        return useMutation({
            mutationFn: (data: any) => departmentService.store(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['departments'] });
                toast.success("Department created! 🎉");
            },
            onError: () => {
                toast.error("Failed to create department");
            }
        });
    };


    const useUpdateDepartments = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: number; data: any }) => departmentService.update(id, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['departments'] });
                toast.success("Department updated! 🎉");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to update department");
            }
        });
    };

    const useDeleteDepartments = () => {
        return useMutation({
            mutationFn: ( id:number ) => departmentService.destroy(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['departments'] });
                toast.success("Department Deleted! 🎉");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to delete department");
            }
        });
    };




    return { useGetDepartments, useAddDepartments, useUpdateDepartments, useDeleteDepartments };
};