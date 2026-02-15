import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Notifications State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Complaint Resolved",
            message: "Your complaint regarding 'Leaking Tap' has been marked as Resolved.",
            time: "2 hours ago",
            read: false,
            type: "success"
        },
        {
            id: 2,
            title: "Status Updated",
            message: "Complaint 'WiFi Issue' is now In Progress.",
            time: "5 hours ago",
            read: true,
            type: "info"
        },
        {
            id: 3,
            title: "New Announcement",
            message: "Hostel night curfew timings have been updated.",
            time: "1 day ago",
            read: true,
            type: "warning"
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMobileMenu}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`w-64 bg-gradient-to-b from-primary to-blue-900 text-white flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-blue-800 flex justify-between items-center">
                    <Logo isDark={true} />
                    <button
                        onClick={closeMobileMenu}
                        className="md:hidden text-white/80 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => { navigate('/dashboard'); closeMobileMenu(); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/dashboard')
                            ? 'bg-white/10 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
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
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        <span>Dashboard</span>
                    </button>

                    <button
                        id="raiseComplaintBtn"
                        onClick={() => { navigate('/raise-complaint'); closeMobileMenu(); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/raise-complaint')
                            ? 'bg-white/10 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span>Raise Complaint</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        id="logoutBtn"
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
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 sticky top-0 z-10 flex items-center justify-between">
                    <div className="flex items-center">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="mr-4 md:hidden text-gray-600 hover:text-gray-900"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                                {isActive('/dashboard') ? `Welcome, ${user.fullName || 'Student'}!` : 'Raise a Complaint'}
                            </h1>
                            {isActive('/raise-complaint') && (
                                <p className="text-sm md:text-base text-gray-600 mt-1">Submit a new hostel-related complaint</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowNotifications(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden transform transition-all">
                                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => markAsRead(notification.id)}
                                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''
                                                            }`}
                                                    >
                                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'
                                                            }`}></div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                                    {notification.time}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm leading-relaxed ${!notification.read ? 'text-gray-800' : 'text-gray-500'}`}>
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-500">
                                                    <p>No notifications yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hidden md:block px-4 py-2 bg-blue-50 text-primary rounded-lg text-sm font-medium">
                            Student Dashboard
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-gray-50">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
