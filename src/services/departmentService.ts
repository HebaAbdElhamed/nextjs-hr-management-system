import api from "../lib/axios";

export const departmentService ={
    index: () => api.get('/departments'),
    store: (data:any) =>api.post('/departments',data),
    update: (id:number , data:any) =>api.put(`/departments/${id}`,data),
    destroy: (id: number) => api.delete(`/departments/${id}`),
    show: (id: number) => api.get(`/departments/${id}`),
}