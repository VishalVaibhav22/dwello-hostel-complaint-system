import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import AdminDashboard from './pages/AdminDashboard';

// Layouts
import StudentLayout from './layouts/StudentLayout';

import './index.css';

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
                    </Route>

                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
