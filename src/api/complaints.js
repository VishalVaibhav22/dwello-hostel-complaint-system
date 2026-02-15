import api from './axios';
import { API_ROUTES } from '../utils/constants';

export const getMyComplaints = async () => {
    const response = await api.get(API_ROUTES.myComplaints);
    return response.data;
};

export const createComplaint = async (complaintData) => {
    const response = await api.post(API_ROUTES.createComplaint, complaintData);
    return response.data;
};

export const getComplaintById = async (id) => {
    const response = await api.get(`${API_ROUTES.createComplaint}/${id}`);
    return response.data;
};

// Admin endpoints
export const getAllComplaints = async () => {
    const response = await api.get(API_ROUTES.allComplaints);
    return response.data;
};

export const updateComplaintStatus = async (id, status) => {
    const response = await api.put(`${API_ROUTES.allComplaints}/${id}/status`, { status });
    return response.data;
};
