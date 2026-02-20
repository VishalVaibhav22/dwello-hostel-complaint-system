import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAdminAnalytics,
} from "../api/complaints";

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendView, setTrendView] = useState("daily");

  useEffect(() => {
    if (!token) return;
    const loadAnalytics = async () => {
      try {
        const data = await getAdminAnalytics();
        if (data.success) {
          setAnalytics(data.data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [token, user, navigate, logout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const sd = analytics?.statusDistribution || {
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    total: 0,
  };
  const total = sd.total || 1;

  // Donut chart math
  const circumference = 2 * Math.PI * 35;
  const openArc = (sd.open / total) * circumference;
  const inProgressArc = (sd.inProgress / total) * circumference;
  const resolvedArc = (sd.resolved / total) * circumference;
  const rejectedArc = (sd.rejected / total) * circumference;

  // Bar chart data
  const trendData =
    trendView === "daily"
      ? analytics?.dailyTrend || []
      : analytics?.weeklyTrend || [];
  const maxCount = Math.max(...trendData.map((d) => d.count), 1);

  return (
    <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Complaints
              </p>
              <p className="text-3xl font-bold text-gray-900">{sd.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Response Rate
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics?.responseRate || 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Complaints acknowledged
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Avg. Resolution Time
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics?.avgResolutionHours !== undefined
                  ? analytics.avgResolutionHours < 24
                    ? `${analytics.avgResolutionHours}h`
                    : `${Math.round(analytics.avgResolutionHours / 24)}d`
                  : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                From submission to resolved
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <p className="text-gray-500 text-sm font-medium mb-1">
                Currently Open
              </p>
              <p className="text-3xl font-bold text-orange-500">{sd.open}</p>
              <p className="text-xs text-gray-400 mt-1">Requires attention</p>
            </div>
          </div>

          {/* Two-column: Donut Chart + Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Status Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Status Distribution
              </h3>

              <div className="flex justify-center mb-6">
                <div className="relative w-48 h-48">
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
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="16"
                        />
                        {sd.open > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="#fb923c"
                            strokeWidth="16"
                            strokeDasharray={`${openArc} ${circumference}`}
                            strokeDashoffset="0"
                          />
                        )}
                        {sd.inProgress > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="16"
                            strokeDasharray={`${inProgressArc} ${circumference}`}
                            strokeDashoffset={`-${openArc}`}
                          />
                        )}
                        {sd.resolved > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="#14b8a6"
                            strokeWidth="16"
                            strokeDasharray={`${resolvedArc} ${circumference}`}
                            strokeDashoffset={`-${openArc + inProgressArc}`}
                          />
                        )}
                        {sd.rejected > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="16"
                            strokeDasharray={`${rejectedArc} ${circumference}`}
                            strokeDashoffset={`-${openArc + inProgressArc + resolvedArc}`}
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {sd.total}
                        </span>
                        <span className="text-xs text-gray-400">Total</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Open</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {sd.open}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {sd.inProgress}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Resolved</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {sd.resolved}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Rejected</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {sd.rejected}
                  </span>
                </div>
              </div>
            </div>

            {/* Complaint Trends */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Complaint Trends
                </h3>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setTrendView("daily")}
                    className={`px-4 py-2 text-xs font-semibold transition-all ${trendView === "daily" ? "bg-primary text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTrendView("weekly")}
                    className={`px-4 py-2 text-xs font-semibold transition-all ${trendView === "weekly" ? "bg-primary text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              {/* Bar chart with better design */}
              <div className="relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-12 bottom-8 flex flex-col justify-between text-xs text-gray-400 pr-2">
                  <span>{maxCount}</span>
                  <span>{Math.round(maxCount * 0.75)}</span>
                  <span>{Math.round(maxCount * 0.5)}</span>
                  <span>{Math.round(maxCount * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-8">
                  {/* Grid lines + bars */}
                  <div className="relative h-64 mb-2 mt-12">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      <div className="border-t border-gray-100"></div>
                      <div className="border-t border-gray-100"></div>
                      <div className="border-t border-gray-100"></div>
                      <div className="border-t border-gray-100"></div>
                      <div className="border-t border-gray-200"></div>
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end gap-px sm:gap-1">
                      {trendData.map((d, i) => {
                        const height =
                          maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                        const isWeekly = trendView === "weekly";
                        const showLabel =
                          isWeekly || i % 5 === 0 || i === trendData.length - 1;

                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center justify-end h-full group relative min-w-0"
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                              <div className="font-semibold">
                                {d.count} complaint{d.count !== 1 ? "s" : ""}
                              </div>
                              {trendView === "daily" ? (
                                <div className="text-gray-300 text-[10px] mt-0.5">
                                  {new Date(
                                    d.date + "T00:00:00",
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              ) : (
                                <div className="text-gray-300 text-[10px] mt-0.5">
                                  Week starting{" "}
                                  {new Date(
                                    d.start + "T00:00:00",
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Bar with gradient */}
                            <div
                              className="w-full rounded-t-md transition-all duration-200 group-hover:opacity-80 relative overflow-hidden"
                              style={{
                                height: `${Math.max(height, 1)}%`,
                                background:
                                  d.count > 0
                                    ? "linear-gradient(to top, #3b82f6, #60a5fa)"
                                    : "#e5e7eb",
                              }}
                            >
                              {/* Shine effect on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex items-start gap-px sm:gap-1 mt-1 overflow-hidden">
                    {trendData.map((d, i) => {
                      const isWeekly = trendView === "weekly";
                      const showLabel =
                        isWeekly || i % 5 === 0 || i === trendData.length - 1;
                      const label =
                        trendView === "daily"
                          ? new Date(d.date + "T00:00:00").toLocaleDateString(
                              "en-US",
                              { day: "numeric" },
                            )
                          : `W${d.week}`;

                      return (
                        <div key={i} className="flex-1 text-center min-w-0">
                          {showLabel && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              {label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium">
                  {trendView === "daily" ? "Last 30 days" : "Last 12 weeks"}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-blue-400"></div>
                  <span className="text-xs text-gray-600">Complaints</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status progress bars */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Status Breakdown
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Open</span>
                    <span className="font-medium text-gray-900">
                      {sd.total > 0
                        ? Math.round((sd.open / sd.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all"
                      style={{
                        width: `${sd.total > 0 ? (sd.open / sd.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-medium text-gray-900">
                      {sd.total > 0
                        ? Math.round((sd.inProgress / sd.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{
                        width: `${sd.total > 0 ? (sd.inProgress / sd.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Resolved</span>
                    <span className="font-medium text-gray-900">
                      {sd.total > 0
                        ? Math.round((sd.resolved / sd.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full transition-all"
                      style={{
                        width: `${sd.total > 0 ? (sd.resolved / sd.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Rejected</span>
                    <span className="font-medium text-gray-900">
                      {sd.total > 0
                        ? Math.round((sd.rejected / sd.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full transition-all"
                      style={{
                        width: `${sd.total > 0 ? (sd.rejected / sd.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-5">
                Key Insights
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Awaiting Response
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {sd.open} complaint{sd.open !== 1 ? "s" : ""} need
                        attention
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-900">
                      {sd.open}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        In Progress
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Being actively worked on
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-900">
                      {sd.inProgress}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Response Rate
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(analytics?.responseRate || 0) >= 80
                          ? "Excellent performance"
                          : "Needs improvement"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics?.responseRate || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
};

export default AdminAnalytics;
