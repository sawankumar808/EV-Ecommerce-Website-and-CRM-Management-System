import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load User Data
  const fetchUser = async () => {
    const token = 
      localStorage.getItem("access_token") || 
      localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await client.get("/auth/me/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Updated to accept (username, password, role) directly
  const login = async (username, password, selectedRole) => {

    const res = await client.post("/api/auth/login/", {username, password});
    
    // Check all common JWT key names
    const token = res.data.access || res.data.token || res.data.access_token;
    
    if (!token) throw new Error("Authentication failed");
    

      localStorage.setItem("access_token", token);

      client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Fetch user profile after storing token
      const userRes = await client.get("/auth/me/");
      const actualUser = userRes.data;
       
       if (selectedRole && actualUser.role!==selectedRole){
        localStorage.removeItem("access_token");
        delete client.defaults.headers.commom["Authorization"];
        throw new Error(`Account mismath: This user is not registered as ${selectedRole}.`);

       }
       setUser(actualUser);
       return actualUser;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    delete client.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);