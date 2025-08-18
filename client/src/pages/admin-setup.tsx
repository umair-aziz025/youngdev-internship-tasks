import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import { Cookie } from "lucide-react";
import { Link } from "wouter";

export default function AdminSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [adminData, setAdminData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    // Basic validation
    if (adminData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }
    
    if (!adminData.email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    
    if (adminData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Admin creation failed");
      }
      
      setSuccess("Admin account created successfully! You can now log in.");
      setAdminData({ username: "", email: "", password: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-cream dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-light-beige/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warm-teal to-warm-brown rounded-full flex items-center justify-center text-white text-xl float-animation">
                <Cookie className="w-5 h-5 icon-animate" />
              </div>
              <div>
                <h1 className="font-serif font-semibold text-xl text-gray-800 dark:text-white">Cookie's Someone Somewhere</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Setup</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link href="/">
                <Button variant="outline" size="sm" className="btn-animate">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="card-hover">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Admin Account
            </CardTitle>
            <CardDescription>
              Set up the first administrator account for your storytelling community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Admin Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={adminData.username}
                  onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-warm-teal text-white hover:bg-warm-teal/90 btn-animate"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Admin...
                  </>
                ) : (
                  "Create Admin Account"
                )}
              </Button>
            </form>

            {success && (
              <div className="mt-4 text-center">
                <Link href="/auth">
                  <Button variant="outline" className="btn-animate">
                    Go to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
