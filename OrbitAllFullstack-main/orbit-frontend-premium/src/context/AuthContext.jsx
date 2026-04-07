import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("orbitUser");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  useEffect(() => {
    // Initialized synchronously
  }, []);

  const login = (userData) => {
    console.log("AuthContext login called with:", userData);
    setUser(userData);
    localStorage.setItem("orbitUser", JSON.stringify(userData));
    console.log("User saved to context and localStorage");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("orbitUser");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}