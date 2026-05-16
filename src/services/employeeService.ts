import api from "../lib/axios";

export const employeeService ={
    index: () => api.get('/employees'),
    store: (data:any) =>api.post('/employees',data),
    update: (id:number , data:any) =>api.put(`/employees/${id}`,data),
    destroy: (id: number) => api.delete(`/employees/${id}`),
    show: (id: number) => api.get(`/employees/${id}`),
}
