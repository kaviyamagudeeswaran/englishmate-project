import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;
const PROGRESS_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/progress`;

axios.defaults.baseURL = API_BASE;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // REGISTER
  const register = async (userData) => {
    setError("");
    try {
      setLoading(true);

      const res = await axios.post("/register", userData);

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      setLoading(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err.response?.status,
        err.response?.data || err.message,
      );

      setError(err.response?.data?.message || "Signup failed");
      setLoading(false);

      return {
        success: false,
        error: err.response?.data,
      };
    }
  };

  // LOGIN
  const login = async (email, password) => {
    setError("");
    try {
      setLoading(true);

      const res = await axios.post("/login", {
        email,
        password,
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      setLoading(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err.response?.status,
        err.response?.data || err.message,
      );

      setError(err.response?.data?.message || "Login failed");
      setLoading(false);

      return {
        success: false,
        error: err.response?.data,
      };
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // UPDATE PROFILE
  const updateProfile = async (updates) => {
    if (!user?.email) {
      return {
        success: false,
        error: "User not found",
      };
    }

    try {
      setLoading(true);

      const res = await axios.put(`/update/${user.email}`, updates, {
        headers: getAuthHeaders(),
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setLoading(false);

      return {
        success: true,
        user: res.data.user,
      };
    } catch (err) {
      console.error(
        "PROFILE UPDATE ERROR:",
        err.response?.status,
        err.response?.data || err.message,
      );

      setError(err.response?.data?.message || "Profile update failed");
      setLoading(false);

      return {
        success: false,
        error: err.response?.data,
      };
    }
  };

  // FETCH PROGRESS
  const fetchProgress = async (email) => {
    try {
      const res = await axios.get(`${PROGRESS_BASE}/${email}`, {
        headers: getAuthHeaders(),
      });

      return res.data;
    } catch (err) {
      console.error(
        "FETCH PROGRESS ERROR:",
        err.response?.status,
        err.response?.data || err.message,
      );

      return [];
    }
  };

  // SAVE PROGRESS
  const saveProgress = async ({
    level,
    moduleType,
    watched,
    quizScore,
    practiceScore,
    completed,
  }) => {
    if (!user?.email) return null;

    try {
      const res = await axios.post(
        `${PROGRESS_BASE}/update`,
        {
          email: user.email,
          level,
          moduleType,
          watched,
          quizScore,
          practiceScore,
          completed,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      return res.data;
    } catch (err) {
      console.error(
        "SAVE PROGRESS ERROR:",
        err.response?.status,
        err.response?.data || err.message,
      );

      return null;
    }
  };

  // RESET PROGRESS
  const resetProgress = async ({ level, moduleType }) => {
    if (!user?.email) return null;

    try {
      const res = await axios.post(
        `${PROGRESS_BASE}/reset`,
        {
          email: user.email,
          level,
          moduleType,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      return res.data;
    } catch (err) {
      console.error(
        "RESET PROGRESS ERROR:",
        err.response?.status,
        err.response?.data || err.message,
      );

      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        fetchProgress,
        saveProgress,
        resetProgress,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
