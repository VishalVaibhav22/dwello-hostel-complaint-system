import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import Logo from "../components/Logo";

const Register = () => {
  const navigate = useNavigate();

  // Form state with all required fields
  const [formData, setFormData] = useState({
    university: "",
    fullName: "",
    rollNumber: "",
    email: "",
    password: "",
    hostel: "",
    roomNumber: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [rollNumberError, setRollNumberError] = useState("");

  // Predefined university options (no free-text entry allowed)
  const universities = ["Thapar Institute of Engineering and Technology"];

  // Check if Thapar University is selected
  const isThaparUniversity =
    formData.university === "Thapar Institute of Engineering and Technology";

  // Predefined hostel options (ONLY these are allowed)
  // If Thapar University: show only Hostel A
  const hostels = isThaparUniversity
    ? ["Hostel A"]
    : ["Hostel A", "Hostel O", "Hostel M"];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset roll number error when typing
    if (name === "rollNumber") {
      setRollNumberError("");
      // Only allow digits
      if (value && !/^\d*$/.test(value)) {
        return;
      }
      // Limit to 9 digits
      if (value.length > 9) {
        return;
      }
    }

    // Reset hostel when university changes
    if (name === "university") {
      setFormData({
        ...formData,
        [name]: value,
        hostel: "",
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    setRollNumberError("");

    // Validate all required fields
    if (
      !formData.university ||
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.hostel ||
      !formData.roomNumber
    ) {
      setMessage({ type: "error", text: "All fields are required" });
      setLoading(false);
      return;
    }

    // Validate roll number for Thapar University
    if (isThaparUniversity) {
      if (!formData.rollNumber) {
        setRollNumberError(
          "Roll number is required for Thapar University students",
        );
        setLoading(false);
        return;
      }
      if (formData.rollNumber.length !== 9) {
        setRollNumberError("Roll number must be exactly 9 digits");
        setLoading(false);
        return;
      }
    }

    try {
      // Send registration data to backend
      // Default role is "student" (handled by backend)
      const data = await registerUser(formData);

      setMessage({
        type: "success",
        text: data.message || "Registration successful!",
      });

      // Clear form on success
      setFormData({
        university: "",
        fullName: "",
        rollNumber: "",
        email: "",
        password: "",
        hostel: "",
        roomNumber: "",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // Show backend error message
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <div className="w-full px-4 sm:px-8 h-14 flex items-center justify-between">
        <Logo onClick={() => navigate("/")} />
        <div className="text-xs sm:text-sm text-textSecondary text-right">
          <span className="block sm:inline">Already have an account?</span>{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-textPrimary">
              Create your account
            </h2>
            <p className="text-sm text-textSecondary mt-2">
              Join your hostel community
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* University */}
            <div>
              <select
                id="universitySelect"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="">Select University</option>
                {universities.map((uni, index) => (
                  <option key={index} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            {/* Full Name Input */}
            <div>
              <input
                id="fullNameInput"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Roll Number Input - Only for Thapar University */}
            {isThaparUniversity && (
              <div>
                <input
                  id="rollNumberInput"
                  name="rollNumber"
                  type="text"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="Roll Number (9 digits)"
                  maxLength="9"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                    rollNumberError ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {rollNumberError && (
                  <p className="mt-1 text-xs text-red-600">{rollNumberError}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <input
                id="emailInput"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <input
                id="passwordInput"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Hostel */}
            <div>
              <select
                id="hostelInput"
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <option value="">Select Hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel} value={hostel}>
                    {hostel}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Number Input */}
            <div>
              <input
                id="roomInput"
                name="roomNumber"
                type="text"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="Room Number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="signupBtn"
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Sign-Up */}
          <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
