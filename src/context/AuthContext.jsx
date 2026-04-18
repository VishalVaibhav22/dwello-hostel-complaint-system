import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { ROLES } from "../utils/constants";

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_CHECK_INTERVAL_MS = 15 * 1000; // 15 seconds

const getTokenExpiryMs = (jwtToken) => {
  try {
    const parts = jwtToken.split(".");
    if (parts.length !== 3) return null;

    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(paddedPayload));

    if (!payload?.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    // Hydrate state from localStorage on load
    const storedUser = localStorage.getItem("user");
    const storedLastActivity = localStorage.getItem("lastActivityAt");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedLastActivity) {
      const parsed = Number(storedLastActivity);
      if (!Number.isNaN(parsed)) {
        lastActivityRef.current = parsed;
      }
    }

    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivityAt");
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    const now = Date.now();
    localStorage.setItem("lastActivityAt", String(now));
    lastActivityRef.current = now;
    setToken(newToken);
    setUser(newUser);
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    const markActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      localStorage.setItem("lastActivityAt", String(now));
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((eventName) =>
      window.addEventListener(eventName, markActivity, { passive: true }),
    );

    const intervalId = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= INACTIVITY_TIMEOUT_MS) {
        logout();
      }
    }, SESSION_CHECK_INTERVAL_MS);

    const expiresAtMs = getTokenExpiryMs(token);
    let expiryTimeoutId;

    if (expiresAtMs && expiresAtMs <= Date.now()) {
      logout();
    } else if (expiresAtMs) {
      expiryTimeoutId = window.setTimeout(() => {
        logout();
      }, expiresAtMs - Date.now());
    }

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, markActivity),
      );
      window.clearInterval(intervalId);
      if (expiryTimeoutId) {
        window.clearTimeout(expiryTimeoutId);
      }
    };
  }, [token, user, logout]);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated, isAdmin, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
