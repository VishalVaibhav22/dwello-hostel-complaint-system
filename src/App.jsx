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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
