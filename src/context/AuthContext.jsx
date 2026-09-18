import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import client from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Normalize or use standard path handled by client alias if needed
      const response = await client.get("/users/me/");

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Auth check failed:", error);
      
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      localStorage.removeItem("access");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (identifier, password, role) => {
    // Correct endpoint mapping based on typical django-rest configuration or aliases
    const response = await client.post("/auth/login/", {
      username: identifier,
      password,
      role,
    });

    const access =
      response.data.access ||
      response.data.token ||
      response.data.access_token;

    const refresh =
      response.data.refresh ||
      response.data.refresh_token;

    if (!access) {
      throw new Error("Authentication failed: No token received.");
    }

    localStorage.setItem("access_token", access);
    if (refresh) {
      localStorage.setItem("refresh_token", refresh);
    }

    // Fetch user details right after successful login
    const userResponse = await client.get("/users/me/");
    const actualUser = userResponse.data;

    localStorage.setItem("role", actualUser.role || role);
    localStorage.setItem("user", JSON.stringify(actualUser));
    if (actualUser.id) {
      localStorage.setItem("user_id", actualUser.id);
    }

    setUser(actualUser);
    return actualUser;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const can = (resource, action = "view") => {
    if (!user) return false;
    if (user.role === "ADMIN" || user.is_superuser || user.role === "SALES") {
      return true;
    }

    const permissions = user.custom_role_details?.permissions || {};
    return permissions[resource]?.includes(action) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        fetchUser,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);