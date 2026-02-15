import api from './axios';
import { API_ROUTES } from '../utils/constants';

export const loginUser = async (credentials) => {
    const response = await api.post(API_ROUTES.LOGIN, credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post(API_ROUTES.REGISTER, userData);
    return response.data;
};
