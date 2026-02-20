import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Animated counter states
  const [campuses, setCampuses] = useState(0);
  const [users, setUsers] = useState(0);
  const [complaints, setComplaints] = useState(0);
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Rotating Text State
  const phrases = [
    "Simply Delivered",
    "Effortlessly Managed",
    "Instant Updates",
  ];
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Features Data
  const features = [
    {
      id: 0,
      tab: "Reporting",
      title: "Digital Reporting",
      description:
        "Report hostel issues in seconds with structured details for faster, accurate resolution.",
      theme: {
        main: "blue-600",
        bg: "bg-blue-600",
        text: "text-blue-600",
        border: "group-hover:border-blue-600",
        shadow: "group-hover:shadow-blue-500/20",
      },
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 1,
      tab: "Tracking",
      title: "Status Tracking",
      description:
        "Track your complaint in real time from submission to final resolution.",
      theme: {
        main: "green-500",
        bg: "bg-green-500",
        text: "text-green-500",
        border: "group-hover:border-green-500",
        shadow: "group-hover:shadow-green-500/20",
      },
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 2,
      tab: "Communications",
      title: "Notifications",
      description:
        "Get timely updates whenever your complaint status is updated.",
      theme: {
        main: "purple-600",
        bg: "bg-purple-600",
        text: "text-purple-600",
        border: "group-hover:border-purple-600",
        shadow: "group-hover:shadow-purple-500/20",
      },
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
  ];

  // Interactive Phone Mock Data
  const [mockComplaints, setMockComplaints] = useState([
    {
      id: 1,
      title: "Plumbing",
      date: "12 Feb 2026",
      status: "Open",
      description: "Bathroom ceiling leaking...",
    },
    {
      id: 2,
      title: "Food",
      date: "11 Feb 2026",
      status: "In Progress",
      description: "Food quality concerns...",
    },
    {
      id: 3,
      title: "Electrical",
      date: "10 Feb 2026",
      status: "Resolved",
      description: "Power outage in room...",
    },
    {
      id: 4,
      title: "Room Cleaning",
      date: "09 Feb 2026",
      status: "Open",
      description: "Floor needs sweeping...",
    },
  ]);

  const handleCardClick = (id) => {
    setMockComplaints((prev) =>
      prev.map((complaint) => {
        if (complaint.id === id) {
          let nextStatus;
          if (complaint.status === "Open") nextStatus = "In Progress";
          else if (complaint.status === "In Progress") nextStatus = "Resolved";
          else nextStatus = "Open";

          return { ...complaint, status: nextStatus };
        }
        return complaint;
      }),
    );
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

  // Animated counter effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animate all counters with same duration for synchronized finish
          animateValue(setCampuses, 0, 5, 1500);
          animateValue(setUsers, 0, 10, 1500);
          animateValue(setComplaints, 0, 100, 1500);
        }
      },
      { threshold: 0.3 },
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  // Animation helper function
  const animateValue = (setter, start, end, duration) => {
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);

      setter(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 h-14 flex justify-between items-center">
          <Logo
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />

          <div className="flex items-center space-x-1 sm:space-x-2">
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setShowHowItWorks(true)}
              onMouseLeave={() => setShowHowItWorks(false)}
            >
              <button className="flex items-center space-x-1 text-textSecondary hover:text-textPrimary hover:bg-gray-50 transition-all px-3 py-2 rounded-lg text-sm font-medium">
                <span>How It Works</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showHowItWorks ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top-right ${
                  showHowItWorks
                    ? "opacity-100 scale-100 visible"
                    : "opacity-0 scale-95 invisible"
                }`}
              >
                <div className="p-2">
                  <div className="group p-4 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
                        <span className="text-primary font-bold group-hover:text-white">
                          1
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                          Submit a Complaint
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Report hostel issues through the online form
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
                        <span className="text-primary font-bold group-hover:text-white">
                          2
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                          Automatic Categorization
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Issues are categorized and assigned to the relevant
                          department
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
                        <span className="text-primary font-bold group-hover:text-white">
                          3
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                          Track Progress
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          View the status of your complaint at any time
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
                        <span className="text-primary font-bold group-hover:text-white">
                          4
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                          Resolution
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Receive confirmation when the issue has been resolved
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="sm:hidden text-textSecondary hover:text-textPrimary hover:bg-gray-50 transition-all px-4 py-2 rounded-lg text-sm font-medium min-h-[44px]"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:block text-textSecondary hover:text-textPrimary hover:bg-gray-50 transition-all px-4 py-2 rounded-lg text-sm font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="hidden sm:block bg-primary hover:bg-blue-800 text-white px-4 py-2 sm:px-6 rounded-lg font-medium transition-all shadow-sm hover:shadow-md text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="relative bg-white py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-white">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                            linear-gradient(to right, rgba(20,184,166,0.20) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(20,184,166,0.20) 1px, transparent 1px)
                        `,
              backgroundSize: "80px 80px",
            }}
          ></div>
        </div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <div className="max-w-3xl">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-textPrimary mb-4 sm:mb-6"
                style={{ lineHeight: "1.1", letterSpacing: "-0.02em" }}
              >
                Complaint Management
                <span className="block text-primary mt-2">
                  for Hostel Residents
                </span>
              </h1>

              <p
                className="text-base sm:text-lg md:text-xl text-textSecondary mb-6 sm:mb-8 md:mb-10"
                style={{ lineHeight: "1.7", letterSpacing: "-0.01em" }}
              >
                A centralized platform for hostel residents to report issues,
                track their status, and receive updates in a structured and
                transparent manner.
              </p>

              <div className="mb-8 sm:mb-12 md:mb-16 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <button
                  id="getStartedBtn"
                  onClick={() => navigate("/register")}
                  className="bg-primary hover:bg-blue-800 text-white font-medium py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center group"
                >
                  <span>Get Started</span>
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
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
                <button
                  onClick={() => {
                    const featuresSection = document.getElementById("features");
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="bg-white hover:bg-gray-50 text-textSecondary border border-gray-200 font-medium py-3 px-6 sm:py-4 sm:px-8 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center group"
                >
                  <span>Learn More</span>
                </button>
              </div>

              <div
                ref={statsRef}
                className="grid grid-cols-3 gap-3 sm:gap-5 md:gap-8"
              >
                <div>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                      {campuses}
                    </span>
                    <span className="text-2xl font-bold text-primary ml-1">
                      +
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Campuses</div>
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                      {users}k
                    </span>
                    <span className="text-2xl font-bold text-primary ml-1">
                      +
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Users</div>
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                      {complaints}k
                    </span>
                    <span className="text-2xl font-bold text-primary ml-1">
                      +
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Complaints Registered
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:flex justify-center items-center perspective-1000">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-64 h-8 bg-gray-900/10 rounded-full blur-2xl transform transition-all duration-500"
                  style={{
                    transform: "translateY(13rem)",
                    transitionTimingFunction:
                      "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                ></div>
              </div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  y: [0, -10, 0],
                }}
                transition={{
                  x: { duration: 0.8, ease: "easeOut" },
                  opacity: { duration: 0.8 },
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="relative w-[290px] h-[600px] select-none cursor-pointer transform transition-all duration-500 group"
                style={{
                  perspective: "1000px",
                  transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.25))",
                  background: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(1000px) rotateY(-2deg) rotateX(1deg) translateY(-8px) scale(1.02)";
                  const shadow =
                    e.currentTarget.parentElement.querySelector(".blur-2xl");
                  if (shadow) {
                    shadow.style.transform = "translateY(14rem) scale(1.2)";
                    shadow.style.opacity = "0.3";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "perspective(1000px) rotateY(-5deg) rotateX(2deg)";
                  const shadow =
                    e.currentTarget.parentElement.querySelector(".blur-2xl");
                  if (shadow) {
                    shadow.style.transform = "translateY(13rem) scale(1)";
                    shadow.style.opacity = "1";
                  }
                }}
              >
                <div
                  className="absolute inset-0 z-20 pointer-events-none rounded-[3rem]"
                  style={{
                    background:
                      "linear-gradient(120deg, #e3e3e3 0%, #b0b0b0 20%, #f8f8f8 60%, #b0b0b0 100%)",
                    boxShadow:
                      "0 12px 40px 0 rgba(31,38,135,0.22), 0 2px 16px 0 #fff8 inset, 0 0 0 8px #e5e7eb inset, 0 0 32px 0 #b0b0b0 inset",
                    border: "3.5px solid #e5e7eb",
                    borderRadius: "3rem",
                    padding: "0.5rem",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "8%",
                      left: "10%",
                      width: "80%",
                      height: "18%",
                      background:
                        "linear-gradient(120deg,rgba(255,255,255,0.45) 0%,rgba(255,255,255,0.12) 100%)",
                      borderRadius: "2.5rem",
                      filter: "blur(2px)",
                      zIndex: 30,
                    }}
                  ></div>

                  <div
                    style={{
                      position: "absolute",
                      bottom: "6%",
                      left: "18%",
                      width: "64%",
                      height: "10%",
                      background:
                        "linear-gradient(0deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0) 100%)",
                      borderRadius: "2rem",
                      filter: "blur(1.5px)",
                      zIndex: 30,
                    }}
                  ></div>
                </div>
                <div className="absolute top-28 -left-2 w-2 h-8 bg-gradient-to-b from-gray-300 to-gray-600 rounded-l-xl shadow-lg opacity-80"></div>{" "}
                {/* Mute */}
                <div className="absolute top-44 -left-2 w-2 h-16 bg-gradient-to-b from-gray-200 to-gray-500 rounded-l-xl shadow-lg opacity-80"></div>{" "}
                {/* Vol Up */}
                <div className="absolute top-72 -left-2 w-2 h-16 bg-gradient-to-b from-gray-200 to-gray-500 rounded-l-xl shadow-lg opacity-80"></div>{" "}
                {/* Vol Down */}
                <div className="absolute top-60 -right-2 w-2 h-24 bg-gradient-to-b from-gray-400 to-gray-700 rounded-r-xl shadow-lg opacity-80"></div>{" "}
                {/* Power */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
                  <div className="w-16 h-4 bg-gradient-to-b from-gray-900 to-black rounded-b-2xl flex items-center justify-center relative shadow-lg">
                    <div className="absolute left-2 top-1 w-2 h-2 bg-gradient-to-br from-blue-200 to-blue-900 rounded-full shadow-inner border border-blue-100"></div>
                    <div className="absolute right-2 top-1 w-6 h-1.5 bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="w-24 h-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-b-xl mt-0.5 opacity-80"></div>
                </div>
                <div className="relative w-full h-full bg-black rounded-[2.7rem] border-[12px] border-black overflow-hidden ring-2 ring-white/10 z-30">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gradient-to-b from-gray-900 to-black rounded-b-xl z-40 flex justify-center items-center shadow-lg">
                    <div className="w-16 h-3 bg-gray-900/80 rounded-full flex items-center justify-end px-1.5 space-x-1.5">
                      <div className="w-1 h-1 bg-blue-900/50 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-800 rounded-full border border-gray-700/50"></div>
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 pointer-events-none z-40"
                    style={{
                      background:
                        "linear-gradient(120deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.04) 60%,rgba(255,255,255,0.13) 100%)",
                      borderRadius: "2.2rem",
                    }}
                  ></div>
                  <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2.2rem] overflow-hidden relative">
                    <div className="flex justify-between items-center mb-2 text-white text-[10px] pl-6 pr-3 pt-3 font-medium select-none">
                      <span>17:30</span>
                      <div className="flex items-center space-x-1">
                        {/* Cellular Signal (iOS Style) */}
                        <svg
                          className="w-3.5 h-3"
                          viewBox="0 0 24 20"
                          fill="currentColor"
                        >
                          <path d="M2.5 14C2.5 13.1716 3.17157 12.5 4 12.5H4.5V18.5H4C3.17157 18.5 2.5 17.8284 2.5 17V14Z" />
                          <path d="M7.5 10C7.5 9.17157 8.17157 8.5 9 8.5H9.5V18.5H9C8.17157 18.5 7.5 17.8284 7.5 17V10Z" />
                          <path d="M12.5 6C12.5 5.17157 13.1716 4.5 14 4.5H14.5V18.5H14C13.1716 18.5 12.5 17.8284 12.5 17V6Z" />
                          <path d="M17.5 2C17.5 1.17157 18.1716 0.5 19 0.5H19.5V18.5H19C18.1716 18.5 17.5 17.8284 17.5 17V2Z" />
                        </svg>
                        {/* Wifi Icon */}
                        <svg
                          className="w-3.5 h-3"
                          viewBox="0 0 24 18"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2.5C16.6358 2.5 20.8569 4.29525 24 7.21875L12 18.5L0 7.21875C3.14311 4.29525 7.36417 2.5 12 2.5Z"
                          />
                        </svg>
                        {/* Battery Icon */}
                        <div className="relative w-5 h-2.5 border border-white/40 rounded-[3px] ml-1 p-0.5">
                          <div className="w-full h-full bg-white rounded-[1.5px]"></div>
                          <div className="absolute top-1/2 -right-[2px] transform -translate-y-1/2 w-[1.5px] h-1 bg-white/40 rounded-r-sm"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 px-5">
                      <button className="text-white hover:scale-125 transition-transform duration-200">
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <h2 className="text-white font-bold text-base">
                        Complaints
                      </h2>
                      <button className="text-white hover:scale-125 transition-transform duration-200">
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    <motion.div
                      className="space-y-2.5 px-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.15,
                            delayChildren: 0.2,
                          },
                        },
                      }}
                    >
                      {mockComplaints.map((complaint) => (
                        <motion.div
                          key={complaint.id}
                          variants={{
                            hidden: { y: 30, opacity: 0 },
                            visible: { y: 0, opacity: 1 },
                          }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          whileHover={{
                            scale: 1.03,
                            y: -2,
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
                            zIndex: 50,
                          }}
                          className="bg-white rounded-lg p-3 cursor-pointer shadow-sm relative border border-gray-100/50"
                          onClick={() => handleCardClick(complaint.id)}
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-900 mb-0.5">
                                {complaint.title}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {complaint.date}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full transition-colors duration-300 ${getStatusColor(complaint.status)}`}
                            >
                              {complaint.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 line-clamp-1">
                            {complaint.description}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative py-12 sm:py-16 md:py-24 bg-gray-50 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-teal-100/50 blur-3xl"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
          <div className="text-center mb-10 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-textPrimary mb-4 tracking-tight flex flex-col md:flex-row justify-center items-center md:items-baseline gap-1 md:gap-2">
                <span>Powerful Features, </span>
                <span className="relative h-[1.8em] overflow-hidden w-auto text-left">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={activePhraseIndex}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-100%" }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-0 left-0 whitespace-nowrap flex items-start gap-1.5"
                    >
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 py-1 pb-2">
                        {phrases[activePhraseIndex]}
                      </span>
                      {/* Superscript Dot */}
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 mt-3 shadow-md shadow-blue-500/50 flex-shrink-0 animate-pulse"></div>
                    </motion.span>
                  </AnimatePresence>
                  {/* Invisible placeholder to maintain width - using largest phrase + dot */}
                  <span className="opacity-0 pointer-events-none py-1 pb-2 flex items-start gap-1.5">
                    {phrases[1]}
                    <div className="w-2.5 h-2.5 rounded-full mt-3 flex-shrink-0"></div>
                  </span>
                </span>
              </h2>
              <p className="text-base sm:text-lg text-textSecondary max-w-2xl mx-auto">
                Everything you need to manage hostel life efficiently, wrapped
                in a beautiful experience.
              </p>
            </motion.div>
          </div>

          {/* Diagonal Feature Stack */}
          <div className="flex flex-col items-center relative py-8 sm:py-12 md:py-20">
            <div className="w-full max-w-6xl relative mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    zIndex: 30,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    },
                  }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  style={{
                    position: "relative",
                    zIndex: index,
                  }}
                  className={`
                    w-full max-w-[340px] lg:w-[340px] min-h-[280px] lg:h-[340px]
                    ${index === 1 ? "lg:mt-[60px]" : index === 2 ? "lg:mt-[120px]" : ""}
                    bg-white flex flex-col justify-between p-6 sm:p-8
                    transition-shadow duration-300 border border-gray-200
                    hover:shadow-xl ${feature.theme.border} ${feature.theme.shadow}
                    group shadow-lg
                  `}
                >
                  {/* Decorative Background Watermark */}
                  <div
                    className={`absolute -bottom-10 -right-10 w-48 h-48 text-${feature.theme.main} opacity-[0.03] transform -rotate-12 pointer-events-none`}
                  >
                    {feature.icon}
                  </div>

                  {/* Header: Number & Icon */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-2 relative z-10">
                    <span className="text-sm font-bold tracking-widest text-gray-400 font-mono">
                      0{index + 1}
                    </span>
                    <div
                      className={`${feature.theme.text} opacity-50 group-hover:opacity-100 transition-opacity`}
                    >
                      {feature.icon}
                    </div>
                  </div>

                  {/* Body: Typography */}
                  <div className="flex-1 flex flex-col justify-center relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-semibold text-textPrimary mb-4 leading-none tracking-tight">
                      {feature.title}
                    </h3>
                    <div className="w-8 h-1 bg-gray-100 mb-4 group-hover:w-16 transition-all duration-500 ease-out"></div>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-[90%]">
                      {feature.description}
                    </p>
                  </div>

                  {/* Footer: Action */}
                  <div className="flex justify-between items-end pt-6 border-t border-gray-50 relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 group-hover:text-gray-900 transition-colors">
                      Explore
                    </span>
                    <svg
                      className={`w-5 h-5 ${feature.theme.text} transform -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div>
              <Logo variant="dark" className="mb-4" />
              <p className="text-gray-400 leading-relaxed">
                A digital complaint management system for streamlined hostel
                administration and resident communication.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate("/register")}
                    className="group inline-block"
                  >
                    <span className="relative text-gray-400 group-hover:text-white transition-colors">
                      Get Started
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="group inline-block"
                  >
                    <span className="relative text-gray-400 group-hover:text-white transition-colors">
                      Sign In
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </button>
                </li>
                <li>
                  <button className="group inline-block">
                    <span className="relative text-gray-400 group-hover:text-white transition-colors">
                      About
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </button>
                </li>
                <li>
                  <button className="group inline-block">
                    <span className="relative text-gray-400 group-hover:text-white transition-colors">
                      Contact
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">
                Built for Better Hostel Living
              </h4>
              <p className="text-gray-400 leading-relaxed">
                Dwello helps residents report issues easily and stay informed,
                while enabling hostel teams to resolve problems faster and more
                transparently.
              </p>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">© 2026 Dwello. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
