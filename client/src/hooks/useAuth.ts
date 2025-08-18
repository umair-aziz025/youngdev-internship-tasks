import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  password: string | null;
  role: string;
  status: string;
  contributionsCount: number;
  heartsReceived: number;
  experiencePoints: number;
  level: number;
  badges: string[];
  preferences: any;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
    setIsInitialized(true);
  }, []);

  const { data: user, isLoading: isUserLoading, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<User> => {
      if (!token) {
        throw new Error("No token available");
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If token is invalid, remove it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      return data.user;
    },
    enabled: !!token && isInitialized,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Prevent excessive refetching
    refetchOnMount: false, // Prevent excessive refetching
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    window.location.href = "/";
  };

  const isLoading = !isInitialized || (token && isUserLoading);
  const isAuthenticated = !!token && !!user && !error;

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    logout,
  };
}