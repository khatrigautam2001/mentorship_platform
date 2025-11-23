import { LayoutDashboard, Users, Clock, Map, DollarSign, User, Award, BookOpen, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

const mentorMenuItems = [
  { title: "Overview", url: "/mentor/overview", icon: LayoutDashboard },
  { title: "All Students", url: "/mentor/students", icon: Users },
  { title: "Pending Requests", url: "/mentor/requests", icon: Clock },
  { title: "Global Roadmap", url: "/mentor/roadmap", icon: Map },
  { title: "Payments", url: "/mentor/payments", icon: DollarSign },
];

const menteeMenuItems = [
  { title: "My Learning", url: "/mentee/learning", icon: BookOpen },
  { title: "My Badges", url: "/mentee/badges", icon: Award },
  { title: "Profile", url: "/mentee/profile", icon: User },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { data: user } = useQuery<UserType>({ queryKey: ["/api/auth/me"] });
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", {}),
    onSuccess: () => {
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      });
    },
  });

  const menuItems = user?.role === "mentor" ? mentorMenuItems : menteeMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Mentorship</h1>
            <p className="text-xs text-muted-foreground">Progress Tracker</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {user?.role === "mentor" ? "Mentor Dashboard" : "Student Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <Link href={user?.role === "mentor" ? "/mentor/profile" : "/mentee/profile"}>
            <div className="flex items-center gap-3 rounded-md p-2 hover-elevate" data-testid="button-profile">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photo || undefined} />
                <AvatarFallback className="text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role || "Loading..."}</p>
              </div>
            </div>
          </Link>
          {user?.role === "mentee" && (
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center gap-3 rounded-md p-2 hover-elevate text-sm text-muted-foreground hover:text-foreground"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
