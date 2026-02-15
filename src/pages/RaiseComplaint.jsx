import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createComplaint } from '../api/complaints';

const RaiseComplaint = () => {
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title cannot exceed 200 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length > 2000) {
            newErrors.description = 'Description cannot exceed 2000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            if (!token) {
                navigate('/login');
                return;
            }

            // Submit complaint to backend
            const response = await createComplaint({
                title: formData.title.trim(),
                description: formData.description.trim()
            });

            if (response.success) {
                // Show success message and redirect to dashboard
                alert('Complaint submitted successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);

            if (error.response?.status === 401) {
                // Token invalid, logout and redirect
                logout();
                navigate('/login');
            } else if (error.response?.data?.errors) {
                // Validation errors from backend
                const backendErrors = {};
                error.response.data.errors.forEach(err => {
                    backendErrors[err.param] = err.msg;
                });
                setErrors(backendErrors);
            } else {
                setSubmitError(error.response?.data?.message || 'Failed to submit complaint. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    {submitError && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Title Field */}
                        <div className="mb-6">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                Complaint Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Water leakage in bathroom"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                maxLength={200}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                {formData.title.length}/200 characters
                            </p>
                        </div>

                        {/* Description Field */}
                        <div className="mb-8">
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide a detailed description of the issue..."
                                rows={8}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                maxLength={2000}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                {formData.description.length}/2000 characters
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                id="submitComplaintBtn"
                                disabled={isSubmitting}
                                className={`flex-1 bg-primary hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Text */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Tips for submitting a complaint:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Be specific and clear in your description</li>
                                <li>Include relevant details like location and time</li>
                                <li>Your complaint will be automatically set to "Open" status</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RaiseComplaint;
