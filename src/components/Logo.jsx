import React from 'react';

const Logo = ({ className = "", textSize = "text-2xl", isDark = false }) => {
    const textColor = isDark ? "text-white" : "text-primary";
    const subtitleColor = isDark ? "text-white/80" : "text-secondary";
    const iconFill = isDark ? "#FFFFFF" : "#1E3A8A";
    const shieldStroke = isDark ? "#FFFFFF" : "#1E3A8A";
    const shieldFill = isDark ? "rgba(255,255,255,0.1)" : "rgba(30,58,138,0.1)";

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            {/* Logo Icon - Shield with Building */}
            <div className="relative">
                <svg width="48" height="48" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Shield */}
                    <path d="M50 5 L85 20 L85 55 Q85 85 50 110 Q15 85 15 55 L15 20 Z" fill={shieldFill} stroke={shieldStroke} strokeWidth="3" />

                    {/* Building */}
                    <rect x="38" y="35" width="24" height="35" fill={iconFill} rx="1" />
                    <rect x="32" y="40" width="6" height="10" fill={isDark ? "#93C5FD" : "#5B9BD5"} rx="1" />
                    <rect x="62" y="40" width="6" height="10" fill={isDark ? "#93C5FD" : "#5B9BD5"} rx="1" />

                    {/* Windows */}
                    <rect x="42" y="42" width="4" height="5" fill={isDark ? "#BFDBFE" : "#87CEEB"} />
                    <rect x="54" y="42" width="4" height="5" fill={isDark ? "#BFDBFE" : "#87CEEB"} />
                    <rect x="42" y="52" width="4" height="5" fill={isDark ? "#BFDBFE" : "#87CEEB"} />
                    <rect x="54" y="52" width="4" height="5" fill={isDark ? "#BFDBFE" : "#87CEEB"} />
                    <rect x="42" y="62" width="4" height="5" fill={isDark ? "#BFDBFE" : "#87CEEB"} />
                    <rect x="54" y="62" width="4" height="5" fill={isDark ? "#BFDBFE" : "#87CEEB"} />

                    {/* Flag */}
                    <line x1="50" y1="35" x2="50" y2="25" stroke={iconFill} strokeWidth="2" />
                    <path d="M50 25 L58 28 L50 31 Z" fill={iconFill} />

                    {/* Wave */}
                    <path d="M32 70 Q38 68 44 70 T56 70 T68 70" stroke={isDark ? "#5EEAD4" : "#0D9488"} strokeWidth="2" fill="none" />

                    {/* Complaint Bubble */}
                    <circle cx="25" cy="60" r="12" fill={isDark ? "#5EEAD4" : "#0D9488"} />
                    <text x="25" y="67" fontSize="18" fill={isDark ? "#1E3A8A" : "white"} textAnchor="middle" fontWeight="bold">!</text>
                </svg>
            </div>

            {/* Logo Text */}
            <div>
                <h1 className={`${textSize} font-bold ${textColor}`}>Dwello</h1>
                <p className={`text-xs ${subtitleColor} font-medium`}>Hostel Complaints</p>
            </div>
        </div>
    );
};

export default Logo;
