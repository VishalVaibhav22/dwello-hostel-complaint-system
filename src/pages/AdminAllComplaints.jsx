import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAllComplaints,
  updateComplaintStatus,
  rejectComplaint,
  getImageUrl,
} from "../api/complaints";

const AdminAllComplaints = () => {
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

  // Filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!token) return;
    const loadComplaints = async () => {
      try {
        const data = await getAllComplaints();
        if (data.success) {
          setComplaints(data.complaints);
          setError("");
        }
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.response?.data?.message || "Failed to load complaints");
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
    if (
      !window.confirm(
        `Are you sure you want to mark this complaint as "${newStatus}"?`,
      )
    )
      return;

    try {
      await updateComplaintStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update status. Please try again.",
      );
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
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaint.id
            ? {
                ...c,
                status: "Rejected",
                rejectionReason: rejectionReason.trim(),
                rejectedAt: new Date(),
              }
            : c,
        ),
      );

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

  // Filtered and sorted complaints
  const filteredComplaints = complaints
    .filter((c) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(query);
        const studentNameMatch = c.student?.name?.toLowerCase().includes(query);
        const studentEmailMatch = c.student?.email
          ?.toLowerCase()
          .includes(query);
        const rollNumberMatch = c.student?.rollNumber
          ?.toLowerCase()
          .includes(query);
        if (
          !titleMatch &&
          !studentNameMatch &&
          !studentEmailMatch &&
          !rollNumberMatch
        )
          return false;
      }
      return true;
    })
    .filter((c) => statusFilter === "All" || c.status === statusFilter)
    .filter((c) => {
      if (!dateFrom && !dateTo) return true;
      const d = new Date(c.dateSubmitted);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setDate(to.getDate() + 1);
        if (d >= to) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dateSubmitted);
      const dateB = new Date(b.dateSubmitted);
      if (sortOrder === "newest") return dateB - dateA;
      if (sortOrder === "oldest") return dateA - dateB;
      if (sortOrder === "status") {
        const order = { Open: 0, "In Progress": 1, Resolved: 2 };
        return (order[a.status] || 0) - (order[b.status] || 0);
      }
      return 0;
    });

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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by complaint title, student name, email, or roll number"
            className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-600 font-medium">
          {filteredComplaints.length} complaint
          {filteredComplaints.length !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="status">By status</option>
          </select>
          {(searchQuery || statusFilter !== "All" || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setDateFrom("");
                setDateTo("");
              }}
              className="text-sm text-primary hover:text-blue-800 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="font-semibold text-gray-900 text-lg mb-1">
                {searchQuery
                  ? "No complaints found matching your search"
                  : "No complaints found"}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : statusFilter !== "All" || dateFrom || dateTo
                    ? "Try changing the filters"
                    : "No complaints have been submitted yet"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    S. No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hostel / Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredComplaints.map((complaint, index) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-500">
                        {index + 1}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {complaint.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">
                        {complaint.student?.name || "Unknown"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {complaint.student?.email || "N/A"}
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
                        <button
                          onClick={() => handleViewDetails(complaint)}
                          className="text-primary hover:text-blue-800 font-medium text-sm"
                        >
                          View
                        </button>
                        {complaint.status === "Open" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(complaint.id, "In Progress")
                            }
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors whitespace-nowrap"
                          >
                            Mark Progress
                          </button>
                        )}
                        {complaint.status === "In Progress" && (
                          <button
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

      {/* View Complaint Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
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
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Title
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {selectedComplaint.title}
                </p>
              </div>
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
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Description
                </label>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Attached Images
                </label>
                {selectedComplaint.images &&
                selectedComplaint.images.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {selectedComplaint.images.map((filename, idx) => {
                      const url = getImageUrl(filename);
                      const tkn = localStorage.getItem("token");
                      const authUrl = `${url}?token=${tkn}`;
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

export default AdminAllComplaints;
