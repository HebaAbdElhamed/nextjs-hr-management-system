import api from "../lib/axios";

export const attendanceService ={
    index: () => api.get('/attendance'),
    checkIn: (data: { lat: number; lng: number }) => api.post('/attendance/check-in', data),
    checkOut: (data: { lat: number; lng: number }) => api.post('/attendance/check-out',data),
    myHistory: () => api.get('/attendance/my-history')
}