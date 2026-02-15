import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyComplaints } from "../api/complaints";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) {
      // AuthContext handles initial load, but if no token, redirect happens there or here
      // user might be null initially
      return;
    }

    const loadComplaints = async () => {
      try {
        const data = await getMyComplaints();
        if (data.success) {
          setComplaints(data.data);
        }
      } catch (err) {
        console.error("Error fetching complaints:", err);
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        } else {
          setError("Failed to load complaints");
        }
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [token, logout, navigate]);

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  // Calculate stats
  const stats = {
    open: complaints.filter((c) => c.status === "Open").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-orange-100 text-orange-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Complaints Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Complaints Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Open Complaints Card */}
          <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white/90 text-sm font-medium mb-1">
                  Open complaints
                </p>
                <p className="text-4xl font-bold">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white/90 text-sm font-medium mb-1">
                  In Progress
                </p>
                <p className="text-4xl font-bold">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Resolved Card */}
          <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white/90 text-sm font-medium mb-1">
                  Resolved
                </p>
                <p className="text-4xl font-bold">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Complaints Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Recent Complaints
              </h3>
              <button
                onClick={() => navigate("/raise-complaint")}
                className="bg-primary hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                + New Complaint
              </button>
            </div>
            <div className="overflow-x-auto">
              {complaints.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="font-medium">No complaints yet</p>
                  <p className="text-sm mt-1">
                    Click "New Complaint" to submit your first complaint
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {complaints.map((complaint) => (
                      <tr
                        key={complaint._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {complaint.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(complaint.status)}`}
                          >
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {formatDate(complaint.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewComplaint(complaint)}
                            id="viewComplaintBtn"
                            className="text-primary hover:text-blue-800 font-medium text-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Status Chart & Actions */}
        <div className="space-y-6">
          {/* Status Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Complaint Status
            </h3>

            {/* Donut Chart */}
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                {complaints.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No data
                  </div>
                ) : (
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="#fb923c"
                      strokeWidth="20"
                      strokeDasharray={`${(stats.open / complaints.length) * 220} 220`}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="20"
                      strokeDasharray={`${(stats.inProgress / complaints.length) * 220} 220`}
                      strokeDashoffset={`-${(stats.open / complaints.length) * 220}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="#5eead4"
                      strokeWidth="20"
                      strokeDasharray={`${(stats.resolved / complaints.length) * 220} 220`}
                      strokeDashoffset={`-${((stats.open + stats.inProgress) / complaints.length) * 220}`}
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Open</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.open}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.inProgress}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-teal-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">Resolved</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.resolved}
                </span>
              </div>
            </div>
          </div>

          {/* Raise Complaint Button */}
          <button
            onClick={() => navigate("/raise-complaint")}
            className="w-full bg-primary hover:bg-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Raise Complaint
          </button>
        </div>
      </div>

      {/* View Complaint Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Complaint Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Title
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {selectedComplaint.title}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Description
                </label>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Status
                </label>
                <span
                  className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}
                >
                  {selectedComplaint.status}
                </span>
              </div>

              {/* Date Submitted */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Date Submitted
                </label>
                <p className="text-gray-900">
                  {formatDate(selectedComplaint.createdAt)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={closeModal}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
