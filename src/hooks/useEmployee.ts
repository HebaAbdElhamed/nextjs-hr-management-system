'use client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { employeeService } from "../services/employeeService";

export const useEmployee = () => {
    const queryClient = useQueryClient();


    const useGetEmployee = () => {
        return useQuery({
            queryKey: ['employees'],
            queryFn: async () => {
                const res = await employeeService.index();
                console.log("Full API Response:", res);
                return res.data;
            },
        });
    };

    const useAddEmployee = () => {
        return useMutation({
            mutationFn: (data: any) => employeeService.store(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['employees'] });
                toast.success("Employee created! 🎉");
            },
            onError: (error: any) => {
                const serverErrors = error.response?.data?.errors;
                const message = error.response?.data?.message;

                if (serverErrors) {
                    // لو فيه أخطاء validation كتير، بنعرض أول رسالة منهم بس في الـ Toast
                    const firstErrorKey = Object.keys(serverErrors)[0];
                    const firstErrorMessage = serverErrors[firstErrorKey][0];
                    toast.error(firstErrorMessage);
                } else if (message) {
                    // لو مفيش أخطاء validation بس فيه رسالة عامة
                    toast.error(message);
                } else {
                    // لو السيرفر واقع خالص أو فيه مشكلة مجهولة
                    toast.error("Server Connection Error ❌");
                }

                // نصيحة: خلي دي دايماً عشان تشوفي الـ Object كامل في الـ Console وأنتي بتبرمجي
                console.error("Laravel Error Details:", error.response?.data);
            }
        });
    };


    const useUpdateEmployee = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: number; data: any }) => employeeService.update(id, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['employees'] });
                toast.success("Employee updated! 🎉");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to update employee");
            }
        });
    };

    const useDeleteEmployee = () => {
        return useMutation({
            mutationFn: (id: number) => employeeService.destroy(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['employees'] });
                toast.success("Employee Deleted! 🎉");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to delete employee");
            }
        });
    };

    const useShowEmployee = (id: number | string | undefined) => {
        return useQuery({
            queryKey: ['employee', id],
            queryFn: async () => {
                const res = await employeeService.show(Number(id));
                return res.data;
            },
            enabled: !!id, // ميعملش ريكويست لو الأي دي مش موجود
        });
    };


    return { useShowEmployee, useDeleteEmployee, useGetEmployee, useAddEmployee, useUpdateEmployee };
};