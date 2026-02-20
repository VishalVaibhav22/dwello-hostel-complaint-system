import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyComplaints, getImageUrl } from "../api/complaints";

const AllComplaints = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (!token) return;

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-orange-100 text-orange-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimelineColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-orange-400";
      case "In Progress":
        return "bg-blue-400";
      case "Resolved":
        return "bg-teal-400";
      case "Rejected":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  // Filtered and sorted complaints
  const filteredComplaints = complaints
    .filter((c) => statusFilter === "All" || c.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-textPrimary">
            All Complaints
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredComplaints.length} complaint
            {filteredComplaints.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status filter */}
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

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Complaints table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[700px]">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="font-medium">No complaints found</p>
              {statusFilter !== "All" && (
                <p className="text-sm mt-1">Try changing the status filter</p>
              )}
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
                {filteredComplaints.map((complaint) => (
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
                  Current Status
                </label>
                <span
                  className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}
                >
                  {selectedComplaint.status}
                </span>
                {selectedComplaint.updatedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated: {formatDateTime(selectedComplaint.updatedAt)}
                  </p>
                )}
              </div>

              {/* Rejection Details */}
              {selectedComplaint.status === "Rejected" &&
                selectedComplaint.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-red-800 mb-2">
                      Rejection Reason
                    </label>
                    <p className="text-sm text-red-900 mb-2 break-words">
                      {selectedComplaint.rejectionReason}
                    </p>
                    {selectedComplaint.rejectedAt && (
                      <p className="text-xs text-red-600">
                        Rejected on{" "}
                        {formatDateTime(selectedComplaint.rejectedAt)}
                      </p>
                    )}
                  </div>
                )}

              {selectedComplaint.statusHistory &&
                selectedComplaint.statusHistory.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                      Status Timeline
                    </label>
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-gray-200"></div>
                      {selectedComplaint.statusHistory.map((entry, idx) => (
                        <div key={idx} className="relative flex items-start">
                          <div
                            className={`absolute left-[-15px] w-[18px] h-[18px] rounded-full border-2 border-white shadow ${getTimelineColor(entry.status)}`}
                          ></div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {entry.status === "Open"
                                ? "Submitted"
                                : entry.status}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                      const authToken = localStorage.getItem("token");
                      const authUrl = `${url}?token=${authToken}`;
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

              {/* Availability Slots */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Selected Time Slots
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
                    No time slots selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Date Submitted
                </label>
                <p className="text-gray-900">
                  {formatDate(selectedComplaint.createdAt)}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4">
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
    </div>
  );
};

export default AllComplaints;
