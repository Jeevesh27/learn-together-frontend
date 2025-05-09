
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface UserData {
  name: string;
  userId: string;
  role: "student" | "mentor";
  email: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  apiError: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword: string, role: "student" | "mentor") => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<boolean>(false);
  
  const API_URL = "https://311a-160-22-60-12.ngrok-free.app/api/v1";

  const checkAuth = async () => {
    try {
      // We'll use a simple request to check if user is logged in 
      // since the API is using cookies for authentication
      const response = await fetch(`${API_URL}/user/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.userData);
        setApiError(false);
      } else {
        setUser(null);
        // Don't set API error for normal auth failures (like not logged in)
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.data.userData);
      setApiError(false);
      toast.success("Login successful!");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setApiError(true);
        toast.error("Unable to connect to the server. Please try again later.");
      } else {
        toast.error(error.message || "Login failed");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    role: "student" | "mentor"
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      toast.success("Signup successful! Please login.");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      setUser(null);
      toast.success("Logged out successfully!");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        apiError,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
