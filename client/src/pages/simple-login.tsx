import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function SimpleLogin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      // Mock admin login by creating a JWT token for the admin user
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminAccess: true }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setLocation("/admin");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click below to access the admin panel for testing purposes.
          </p>
          <Button 
            onClick={handleAdminLogin} 
            disabled={loading}
            className="w-full"
            data-testid="button-admin-login"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            className="w-full"
            data-testid="button-back-home"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}