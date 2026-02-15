import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllComplaints, updateComplaintStatus } from "../api/complaints";
import Logo from "../components/Logo";
import { ROLES } from "../utils/constants";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    // Check if user is admin
    if (user && user.role !== ROLES.ADMIN) {
      navigate('/dashboard'); // Redirect to student dashboard
      return;
    }

    const loadComplaints = async () => {
      try {
        console.log("Fetching admin complaints...");
        const data = await getAllComplaints();
        console.log("Admin complaints response:", data);

        if (data.success) {
          const complaintList = data.complaints;
          setComplaints(complaintList);

          // Calculate stats
          setStats({
            total: complaintList.length,
            open: complaintList.filter((c) => c.status === "Open").length,
            inProgress: complaintList.filter((c) => c.status === "In Progress").length,
            resolved: complaintList.filter((c) => c.status === "Resolved").length,
          });
          setError("");
        }
      } catch (err) {
        console.error("Error fetching admin complaints:", err);
        const errorMsg = err.response?.data?.message || "Failed to load complaints";
        setError(errorMsg);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [token, user, navigate, logout]);

  const handleStatusUpdate = async (id, newStatus) => {
    // Confirmation prompt
    if (
      !window.confirm(
        `Are you sure you want to mark this complaint as "${newStatus}"?`,
      )
    ) {
      return;
    }

    try {
      const response = await updateComplaintStatus(id, newStatus);

      console.log("Status update response:", response);

      // Optimistic update
      const updatedComplaints = complaints.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c,
      );
      setComplaints(updatedComplaints);

      // Recalculate stats
      setStats({
        total: updatedComplaints.length,
        open: updatedComplaints.filter((c) => c.status === "Open").length,
        inProgress: updatedComplaints.filter((c) => c.status === "In Progress")
          .length,
        resolved: updatedComplaints.filter((c) => c.status === "Resolved")
          .length,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      alert(
        err.response?.data?.message ||
        "Failed to update status. Please try again.",
      );
      // We could refresh here, but optimistic update failure handling comes next
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-orange-100 text-orange-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Resolved":
        return "bg-teal-100 text-teal-700";
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-primary to-blue-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <Logo isDark={true} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 text-white font-medium">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors font-medium mt-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="px-4 py-2 bg-blue-50 text-primary rounded-lg text-sm font-medium">
              Admin Panel
            </div>
          </div>
        </header>

        {/* Content */}
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Complaints Card */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white/90 text-sm font-medium mb-1">
                      Total Complaints
                    </p>
                    <p className="text-4xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </div>

              {/* Open Complaints Card */}
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white/90 text-sm font-medium mb-1">
                      Open Complaints
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
                      Resolved Complaints
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

          {/* Complaints Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                All Complaints
              </h3>
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
                  <p className="font-medium">No complaints found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Complaint Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Hostel / Room
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
                        key={complaint.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {complaint.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {complaint.student?.name || "Unknown"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {complaint.hostel} / {complaint.roomNumber}
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
                            {formatDate(complaint.dateSubmitted)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* View Button */}
                            <button
                              id={`viewComplaintBtn-${complaint.id}`}
                              onClick={() => handleViewDetails(complaint)}
                              className="text-primary hover:text-blue-800 font-medium text-sm"
                            >
                              View
                            </button>

                            {/* Status Actions */}
                            {complaint.status === "Open" && (
                              <button
                                id={`markInProgressBtn-${complaint.id}`}
                                onClick={() =>
                                  handleStatusUpdate(
                                    complaint.id,
                                    "In Progress",
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors whitespace-nowrap"
                              >
                                Mark Progress
                              </button>
                            )}
                            {complaint.status === "In Progress" && (
                              <button
                                id={`markResolvedBtn-${complaint.id}`}
                                onClick={() =>
                                  handleStatusUpdate(complaint.id, "Resolved")
                                }
                                className="text-teal-600 hover:text-teal-800 font-medium text-xs px-2 py-1 rounded hover:bg-teal-50 transition-colors whitespace-nowrap"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

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

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Student Name
                  </label>
                  <p className="text-gray-900">
                    {selectedComplaint.student?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900">
                    {selectedComplaint.student?.email || "N/A"}
                  </p>
                </div>
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Hostel / Room
                  </label>
                  <p className="text-gray-900">
                    {selectedComplaint.hostel} / {selectedComplaint.roomNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Date Submitted
                  </label>
                  <p className="text-gray-900">
                    {formatDate(selectedComplaint.dateSubmitted)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Current Status
                </label>
                <span
                  className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}
                >
                  {selectedComplaint.status}
                </span>
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
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-all"
              >
                Close
              </button>
              {selectedComplaint.status === "Open" && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedComplaint.id, "In Progress");
                    closeModal();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-sm"
                >
                  Mark In Progress
                </button>
              )}
              {selectedComplaint.status === "In Progress" && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedComplaint.id, "Resolved");
                    closeModal();
                  }}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-sm"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
