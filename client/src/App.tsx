import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Community from "@/pages/community";
import Rooms from "@/pages/rooms";
import Profile from "@/pages/profile";
import AdminPanel from "@/pages/admin";
import AdminSetup from "@/pages/admin-setup";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/admin-setup" component={AdminSetup} />
      <Route path="/community" component={Community} />
      <Route path="/rooms" component={Rooms} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminPanel} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
