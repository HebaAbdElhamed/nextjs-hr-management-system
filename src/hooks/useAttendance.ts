'use client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { attendanceService } from "../services/attendanceService";

export const useAttendance = () => {
    const queryClient = useQueryClient();

    const useGetAttendances = () => {
        return useQuery({
            queryKey: ['attendances'],
            queryFn: async () => {
                const res = await attendanceService.index();
                return res.data;
            },
        });
    };

    const useCheckIn = () => {
        return useMutation({
            mutationFn: (data: { lat: number; lng: number }) => attendanceService.checkIn(data),
            onSuccess: async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                await  queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
                await  queryClient.invalidateQueries({ queryKey: ['attendances'] });
                toast.success("Checked in successfully! 🚀");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to check in");
            }
        });
    };


    const useCheckOut = () => {
        return useMutation({
            mutationFn: (data: { lat: number; lng: number }) => attendanceService.checkOut(data),
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
                await queryClient.invalidateQueries({ queryKey: ['attendances'] });
                toast.success("Checked out! Have a safe trip. 👋");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to check out");
            }
        });
    };

    const useGetMyHistory = () => {
        return useQuery({
            queryKey: ['attendance-history'],
            queryFn: async () => {
                const res = await attendanceService.myHistory();
                return res.data;
            },
        });
    };


    const getWorkingDaysInMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0); // آخر يوم في الشهر

        let workingDays = 0;
        let day = new Date(firstDay);

        while (day <= lastDay) {
            const dayOfWeek = day.getDay();
            // 5 = الجمعة, 6 = السبت (في JavaScript getDay يبدأ من الأحد=0)
            if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                workingDays++;
            }
            day.setDate(day.getDate() + 1);
        }
        return workingDays;
    };





    return {
        useGetAttendances,
        useCheckIn,
        useCheckOut,
        useGetMyHistory,
        getWorkingDaysInMonth
    };
};