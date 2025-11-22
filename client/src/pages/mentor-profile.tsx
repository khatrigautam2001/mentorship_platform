import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, User as UserIcon, Save, LogOut } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  photo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function MentorProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      name: profile.name,
      phone: profile.phone || "",
      photo: profile.photo || "",
    } : undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiRequest("PATCH", "/api/mentor/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", {}),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your mentor account
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : profile ? (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6 flex-wrap">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.photo || undefined} />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold" data-testid="text-profile-name">
                    {profile.name}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {profile.phone}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="mt-3 capitalize">
                    <UserIcon className="h-3 w-3 mr-1" />
                    {profile.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    data-testid="input-profile-name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    data-testid="input-profile-phone"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo URL</Label>
                  <Input
                    id="photo"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    data-testid="input-profile-photo"
                    {...register("photo")}
                  />
                  {errors.photo && (
                    <p className="text-sm text-destructive">{errors.photo.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to your profile photo
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
