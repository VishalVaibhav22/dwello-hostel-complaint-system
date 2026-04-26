import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import RaiseComplaint from "./pages/RaiseComplaint";
import Announcements from "./pages/Announcements";
import AllComplaints from "./pages/AllComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAllComplaints from "./pages/AdminAllComplaints";
import AdminStudents from "./pages/AdminStudents";
import AdminAnalytics from "./pages/AdminAnalytics";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";

import "./index.css";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/raise-complaint" element={<RaiseComplaint />} />
            <Route path="/all-complaints" element={<AllComplaints />} />
            <Route path="/announcements" element={<Announcements />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/all-complaints"
              element={<AdminAllComplaints />}
            />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
