import api from "./axios";
import { API_ROUTES } from "../utils/constants";

export const getMyComplaints = async () => {
  const response = await api.get(API_ROUTES.myComplaints);
  return response.data;
};

export const createComplaint = async (
  complaintData,
  imageFiles = [],
  availability = [],
) => {
  const formData = new FormData();
  formData.append("title", complaintData.title);
  formData.append("description", complaintData.description);

  if (availability.length > 0) {
    formData.append("availability", JSON.stringify(availability));
  }

  imageFiles.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post(API_ROUTES.createComplaint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
  const response = await api.put(`${API_ROUTES.allComplaints}/${id}/status`, {
    status,
  });
  return response.data;
};

export const rejectComplaint = async (id, rejectionReason) => {
  const response = await api.put(`${API_ROUTES.allComplaints}/${id}/reject`, {
    rejectionReason,
  });
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await api.get(API_ROUTES.adminAnalytics);
  return response.data;
};

export const getImageUrl = (filename) => {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${baseURL}/uploads/complaints/${filename}`;
};

// Notification endpoints
export const getNotifications = async () => {
  const response = await api.get(API_ROUTES.notifications);
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`${API_ROUTES.notifications}/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put(`${API_ROUTES.notifications}/read-all`);
  return response.data;
};

// Announcement endpoints
export const getAnnouncements = async () => {
  const response = await api.get(API_ROUTES.announcements);
  return response.data;
};

export const getUnseenAnnouncementCount = async () => {
  const response = await api.get(`${API_ROUTES.announcements}/unseen-count`);
  return response.data;
};

export const markAnnouncementsSeen = async () => {
  const response = await api.put(`${API_ROUTES.announcements}/mark-seen`);
  return response.data;
};

export const createAnnouncement = async (data) => {
  const response = await api.post(API_ROUTES.announcements, data);
  return response.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await api.delete(`${API_ROUTES.announcements}/${id}`);
  return response.data;
};

// Student management endpoints (Admin only)
export const getAllStudents = async () => {
  const response = await api.get(API_ROUTES.allStudents);
  return response.data;
};

export const getStudentDetails = async (studentId) => {
  const response = await api.get(`${API_ROUTES.allStudents}/${studentId}`);
  return response.data;
};
