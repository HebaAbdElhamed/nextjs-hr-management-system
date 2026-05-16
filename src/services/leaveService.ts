import api from "../lib/axios";

export const leaveService ={
    myLeaves: () => api.get('/my-leaves'),
    store: (data:any) => api.post('/leaves/apply', data),
    cancel: (id:number) => api.delete(`/leaves/${id}/cancel`),
    getBalances: () => api.get('/leaves/balances'),
    adminIndex: () => api.get('/leaves'),
    adminDecision: (id:number, data:any) => api.patch(`/leaves/${id}/decision`,data),
}