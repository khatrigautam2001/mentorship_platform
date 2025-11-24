import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import type { User } from "@shared/schema";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";  
import MentorOverview from "@/pages/mentor-overview";
import MentorStudents from "@/pages/mentor-students";
import MentorStudentRoadmap from "@/pages/mentor-student-roadmap";
import MentorRequests from "@/pages/mentor-requests";
import MentorAllRequests from "@/pages/mentor-all-requests";
import MentorPayments from "@/pages/mentor-payments";
import MentorRoadmap from "@/pages/mentor-roadmap";
import MentorProfile from "@/pages/mentor-profile";
import MenteeLearning from "@/pages/mentee-learning";
import MenteeBadges from "@/pages/mentee-badges";
import MenteeProfile from "@/pages/mentee-profile";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ 
  component: Component, 
  requiredRole 
}: { 
  component: React.ComponentType; 
  requiredRole?: string;
}) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === "mentor" ? "/mentor/overview" : "/mentee/learning";
    return <Redirect to={redirectPath} />;
  }

  return <Component />;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return (
    <Switch>
      <Route path="/">
        {user ? (
          <Redirect to={user.role === "mentor" ? "/mentor/overview" : "/mentee/learning"} />
        ) : (
          <Redirect to="/home" />
        )}
      </Route>
      
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/mentor/overview">
        <DashboardLayout>
          <ProtectedRoute component={MentorOverview} requiredRole="mentor" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentor/students">
        <DashboardLayout>
          <ProtectedRoute component={MentorStudents} requiredRole="mentor" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentor/students/:menteeId/roadmap">
        <DashboardLayout>
          <ProtectedRoute component={MentorStudentRoadmap} requiredRole="mentor" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentor/requests">
        <DashboardLayout>
          <ProtectedRoute component={MentorRequests} requiredRole="mentor" />
        </DashboardLayout>
      </Route>

      <Route path="/mentor/all-requests">
        <DashboardLayout>
          <ProtectedRoute component={MentorAllRequests} requiredRole="mentor" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentor/payments">
        <DashboardLayout>
          <ProtectedRoute component={MentorPayments} requiredRole="mentor" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentor/roadmap">
        <DashboardLayout>
          <ProtectedRoute component={MentorRoadmap} requiredRole="mentor" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentor/profile">
        <DashboardLayout>
          <ProtectedRoute component={MentorProfile} requiredRole="mentor" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentee/learning">
        <DashboardLayout>
          <ProtectedRoute component={MenteeLearning} requiredRole="mentee" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentee/badges">
        <DashboardLayout>
          <ProtectedRoute component={MenteeBadges} requiredRole="mentee" />
        </DashboardLayout>
      </Route>
      
      <Route path="/mentee/profile">
        <DashboardLayout>
          <ProtectedRoute component={MenteeProfile} requiredRole="mentee" />
        </DashboardLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
