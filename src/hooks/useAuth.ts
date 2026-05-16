'use client';

import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export const useAuth = () => {
    const router = useRouter();

    const register = async (data: any) => {
        try {
            await authService.register(data);
            toast.success("Account created successfully 🎉");
            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Registration failed";
            toast.error(errorMessage);
        }
    };


    const login = async (data: any) => {
        try {
            const response = await authService.login(data);
            const res = response.data;

            Cookies.set("access_token", res.access_token, { expires: 1 });
            Cookies.set("role", res.user.role, { expires: 1 });
            Cookies.set("user_id", res.user.id, { expires: 1 });

            toast.success("login successfully 🎉");
            setTimeout(() => {
                res.user.role === 'admin'
                    ? router.push("/admin/dashboard")
                    : router.push("/employee/dashboard");
            }, 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Login failed";
            toast.error(errorMessage);
        }
    };


    const logout = async () => {
        try {
            await authService.logout();
            toast.success("Logged out successfully 🎉");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            Cookies.remove("access_token");
            Cookies.remove("role");
            Cookies.remove("user_id");

            router.push("/login");
            router.refresh();
        }
    };


    return { register, login, logout };
}