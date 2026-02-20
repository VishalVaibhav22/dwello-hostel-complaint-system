import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAllComplaints,
  updateComplaintStatus,
  rejectComplaint,
  getImageUrl,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnalytics,
} from "../api/complaints";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "announcements"
      ? "announcements"
      : "complaints",
  );
  const [analyticsData, setAnalyticsData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    tag: "General",
  });
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadComplaints = async () => {
      try {
        const data = await getAllComplaints();

        if (data.success) {
          const complaintList = data.complaints;
          setComplaints(complaintList);

          // Calculate stats
          setStats({
            total: complaintList.length,
            open: complaintList.filter((c) => c.status === "Open").length,
            inProgress: complaintList.filter((c) => c.status === "In Progress")
              .length,
            resolved: complaintList.filter((c) => c.status === "Resolved")
              .length,
            rejected: complaintList.filter((c) => c.status === "Rejected")
              .length,
          });
          setError("");
        }
      } catch (err) {
        console.error("Error fetching admin complaints:", err);
        const errorMsg =
          err.response?.data?.message || "Failed to load complaints";
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
    loadAnnouncements();
    loadAnalytics();
  }, [token, user, navigate, logout]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "announcements") setActiveTab("announcements");
  }, [searchParams]);

  const loadAnalytics = async () => {
    try {
      const data = await getAdminAnalytics();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (err) {
      console.error("Error loading announcements:", err);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      alert("Title and content are required");
      return;
    }
    try {
      const data = await createAnnouncement(announcementForm);
      if (data.success) {
        setAnnouncements([data.data, ...announcements]);
        setShowAnnouncementModal(false);
        setAnnouncementForm({ title: "", content: "", tag: "General" });
      }
    } catch (err) {
      console.error("Error creating announcement:", err);
      alert("Failed to create announcement");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert("Failed to delete announcement");
    }
  };

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
        rejected: updatedComplaints.filter((c) => c.status === "Rejected")
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

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowRejectModal(false);
    setSelectedComplaint(null);
    setRejectionReason("");
  };

  const handleRejectClick = () => {
    setShowModal(false);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    if (rejectionReason.length > 200) {
      alert("Rejection reason cannot exceed 200 characters");
      return;
    }

    try {
      const response = await rejectComplaint(
        selectedComplaint.id,
        rejectionReason.trim(),
      );

      // Update local state
      const updatedComplaints = complaints.map((c) =>
        c.id === selectedComplaint.id
          ? {
              ...c,
              status: "Rejected",
              rejectionReason: rejectionReason.trim(),
              rejectedAt: new Date(),
            }
          : c,
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
        rejected: updatedComplaints.filter((c) => c.status === "Rejected")
          .length,
      });

      closeModal();
    } catch (err) {
      console.error("Error rejecting complaint:", err);
      console.error("Error response:", err.response);
      alert(
        err.response?.data?.message ||
          "Failed to reject complaint. Please try again.",
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-orange-100 text-orange-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Resolved":
        return "bg-teal-100 text-teal-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
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
    <>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {activeTab === "complaints" && (
            <>
              {/* Stat Cards — clean white */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-sm font-medium">Total</p>
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-slate-600"
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
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-sm font-medium">Open</p>
                    <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.open}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-sm font-medium">
                      In Progress
                    </p>
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-500"
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
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-sm font-medium">
                      Resolved
                    </p>
                    <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-500"
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
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.resolved}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-sm font-medium">
                      Rejected
                    </p>
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.rejected}
                  </p>
                </div>
              </div>

              {/* Two-column: Recent Complaints + Analytics Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Complaints Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">
                      Recent Complaints
                    </h3>
                    <button
                      onClick={() => navigate("/admin/all-complaints")}
                      className="text-primary hover:text-blue-800 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <span>View all</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: "500px" }}>
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
                          {complaints.slice(0, 10).map((complaint) => (
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
                                        handleStatusUpdate(
                                          complaint.id,
                                          "Resolved",
                                        )
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

                {/* Analytics Preview */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-fit lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">
                      Analytics
                    </h3>
                    <button
                      onClick={() => navigate("/admin/analytics")}
                      className="text-primary hover:text-blue-800 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <span>Full report</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                  {(() => {
                    const sd = analyticsData?.statusDistribution || {
                      open: 0,
                      inProgress: 0,
                      resolved: 0,
                      rejected: 0,
                      total: 0,
                    };
                    const t = sd.total || 1;
                    // Use larger radius for better visibility
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;

                    // Calculate percentages
                    const openPercent = (sd.open / t) * 100;
                    const inProgressPercent = (sd.inProgress / t) * 100;
                    const resolvedPercent = (sd.resolved / t) * 100;
                    const rejectedPercent = (sd.rejected / t) * 100;

                    // Calculate arc lengths
                    const openArc = (openPercent / 100) * circumference;
                    const inProgressArc =
                      (inProgressPercent / 100) * circumference;
                    const resolvedArc = (resolvedPercent / 100) * circumference;
                    const rejectedArc = (rejectedPercent / 100) * circumference;

                    return (
                      <div className="flex flex-col items-center">
                        <div className="relative w-44 h-44 mb-6 flex-shrink-0">
                          {sd.total === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                              No data
                            </div>
                          ) : (
                            <>
                              <svg
                                className="w-full h-full transform -rotate-90"
                                viewBox="0 0 100 100"
                              >
                                {/* Background circle */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="none"
                                  stroke="#f3f4f6"
                                  strokeWidth="12"
                                />
                                {/* Open segment */}
                                {sd.open > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke="#fb923c"
                                    strokeWidth="12"
                                    strokeDasharray={`${openArc} ${circumference}`}
                                    strokeDashoffset="0"
                                  />
                                )}
                                {/* In Progress segment */}
                                {sd.inProgress > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="12"
                                    strokeDasharray={`${inProgressArc} ${circumference}`}
                                    strokeDashoffset={`-${openArc}`}
                                  />
                                )}
                                {/* Resolved segment */}
                                {sd.resolved > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke="#14b8a6"
                                    strokeWidth="12"
                                    strokeDasharray={`${resolvedArc} ${circumference}`}
                                    strokeDashoffset={`-${openArc + inProgressArc}`}
                                  />
                                )}
                                {/* Rejected segment */}
                                {sd.rejected > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="12"
                                    strokeDasharray={`${rejectedArc} ${circumference}`}
                                    strokeDashoffset={`-${openArc + inProgressArc + resolvedArc}`}
                                  />
                                )}
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">
                                  {sd.total}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">
                                  Total
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="w-full space-y-3 mb-5">
                          <div className="flex items-center justify-between py-1.5">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-3 h-3 bg-orange-400 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 font-medium">
                                Open
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {sd.open}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1.5">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 font-medium">
                                In Progress
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {sd.inProgress}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1.5">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-3 h-3 bg-teal-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 font-medium">
                                Resolved
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {sd.resolved}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1.5">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 font-medium">
                                Rejected
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {sd.rejected}
                            </span>
                          </div>
                        </div>
                        {analyticsData?.responseRate !== undefined && (
                          <div className="w-full pt-5 border-t border-gray-200">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600 font-medium">
                                Response Rate
                              </span>
                              <span className="font-bold text-gray-900">
                                {analyticsData.responseRate}%
                              </span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(analyticsData.responseRate, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}

          {/* Announcements Management */}
          {activeTab === "announcements" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary">
                  Manage Announcements
                </h2>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex items-center space-x-2 bg-primary hover:bg-blue-800 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>New Announcement</span>
                </button>
              </div>

              {announcements.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
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
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                  <p className="font-medium text-gray-500">
                    No announcements yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Create one to notify students.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((a) => {
                    const tagColors = {
                      Urgent: "bg-red-100 text-red-700",
                      Maintenance: "bg-amber-100 text-amber-700",
                      Notice: "bg-blue-100 text-blue-700",
                      Event: "bg-purple-100 text-purple-700",
                      General: "bg-gray-100 text-gray-700",
                    };
                    return (
                      <div
                        key={a._id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {a.title}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  tagColors[a.tag] || tagColors.General
                                }`}
                              >
                                {a.tag}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-line mb-3">
                              {a.content}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(a.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}{" "}
                              at{" "}
                              {new Date(a.createdAt).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                              {a.createdBy?.fullName &&
                                ` · by ${a.createdBy.fullName}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAnnouncement(a._id)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete announcement"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                New Announcement
              </h3>
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementForm({
                    title: "",
                    content: "",
                    tag: "General",
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Announcement title"
                  maxLength={200}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Write your announcement..."
                  rows={4}
                  maxLength={5000}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <select
                  value={announcementForm.tag}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({ ...f, tag: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm bg-white"
                >
                  <option value="General">General</option>
                  <option value="Notice">Notice</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Event">Event</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementForm({
                    title: "",
                    content: "",
                    tag: "General",
                  });
                }}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={
                  !announcementForm.title.trim() ||
                  !announcementForm.content.trim()
                }
                className="px-5 py-2.5 bg-primary hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="p-4 sm:p-6 space-y-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

              {selectedComplaint.student?.rollNumber && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Roll Number
                  </label>
                  <p className="text-gray-900">
                    {selectedComplaint.student.rollNumber}
                  </p>
                </div>
              )}

              {/* Location Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

              {/* Attached Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Attached Images
                </label>
                {selectedComplaint.images &&
                selectedComplaint.images.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {selectedComplaint.images.map((filename, idx) => {
                      const url = getImageUrl(filename);
                      const token = localStorage.getItem("token");
                      const authUrl = `${url}?token=${token}`;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightboxImage(authUrl)}
                          className="w-28 h-28 rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-primary transition-all focus:outline-none"
                        >
                          <img
                            src={authUrl}
                            alt={`Attachment ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "";
                              e.target.parentElement.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">Failed</div>';
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No images attached
                  </p>
                )}
              </div>

              {/* Student Availability */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Student Availability
                </label>
                {selectedComplaint.availability &&
                selectedComplaint.availability.length > 0 ? (
                  <div className="space-y-2">
                    {selectedComplaint.availability.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg px-3 py-2"
                      >
                        <svg
                          className="w-4 h-4 text-blue-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {new Date(slot.date + "T00:00:00").toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                        <span className="text-gray-400">&bull;</span>
                        <span className="text-gray-700">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No availability provided
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between gap-3">
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedComplaint.status !== "Resolved" &&
                  selectedComplaint.status !== "Rejected" && (
                    <button
                      onClick={handleRejectClick}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-sm"
                    >
                      Reject
                    </button>
                  )}
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
        </div>
      )}

      {/* Reject Complaint Modal */}
      {showRejectModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                Reject Complaint
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedComplaint.title}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Complaint does not fall under hostel maintenance"
                maxLength={200}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Brief explanation for the student
                </p>
                <p className="text-xs text-gray-500">
                  {rejectionReason.length}/200
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Complaint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close lightbox"
          >
            <svg
              className="w-8 h-8"
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
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
