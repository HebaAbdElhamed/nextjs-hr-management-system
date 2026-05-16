import api from "../lib/axios";

export const authService ={
    register: (data:any) => api.post('/register',{...data, role:'employee'}),
    login: (data: any) => api.post('/login', data),
    logout: () => api.post('/logout'),
}