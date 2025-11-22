import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mail, Phone, DollarSign, Edit, Award } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

interface MenteeWithProgress extends User {
  progressPercentage: number;
  badgeCount: number;
  currentSkill?: string;
}

const createMenteeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  totalFee: z.string().min(1, "Total fee is required"),
  initialPayment: z.string().min(1, "Initial payment is required"),
});

type CreateMenteeFormData = z.infer<typeof createMenteeSchema>;

export default function MentorStudents() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: students, isLoading } = useQuery<MenteeWithProgress[]>({
    queryKey: ["/api/mentor/students"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateMenteeFormData>({
    resolver: zodResolver(createMenteeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      totalFee: "",
      initialPayment: "",
    },
  });

  const createMenteeMutation = useMutation({
    mutationFn: (data: CreateMenteeFormData) =>
      apiRequest("POST", "/api/mentor/create-mentee", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentor/students"] });
      setGeneratedCredentials(data.credentials);
      reset();
      toast({
        title: "Student created successfully!",
        description: `Created account for ${data.mentee.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create student",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: CreateMenteeFormData) => {
    createMenteeMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">All Students</h1>
          <p className="text-muted-foreground mt-2">
            Manage your mentees and track their progress
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-student">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Student</DialogTitle>
              <DialogDescription>
                Add a new student and set their fee structure
              </DialogDescription>
            </DialogHeader>
            {generatedCredentials ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <p className="text-sm font-medium">Account Created Successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    Share these credentials with the student:
                  </p>
                  <div className="space-y-1 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Email:</span>
                      <span className="text-sm font-mono font-medium">{generatedCredentials.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Password:</span>
                      <span className="text-sm font-mono font-medium">{generatedCredentials.password}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setGeneratedCredentials(null);
                    setIsCreateDialogOpen(false);
                  }}
                  className="w-full"
                  data-testid="button-close-credentials"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Student name"
                    data-testid="input-student-name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    data-testid="input-student-email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    data-testid="input-student-phone"
                    {...register("phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFee">Total Fee (₹)</Label>
                  <Input
                    id="totalFee"
                    type="number"
                    placeholder="25000"
                    data-testid="input-total-fee"
                    {...register("totalFee")}
                  />
                  {errors.totalFee && (
                    <p className="text-sm text-destructive">{errors.totalFee.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialPayment">Initial Payment (₹)</Label>
                  <Input
                    id="initialPayment"
                    type="number"
                    placeholder="8000"
                    data-testid="input-initial-payment"
                    {...register("initialPayment")}
                  />
                  {errors.initialPayment && (
                    <p className="text-sm text-destructive">{errors.initialPayment.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMenteeMutation.isPending}
                  data-testid="button-submit-create-student"
                >
                  {createMenteeMutation.isPending ? "Creating..." : "Create Student"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : students && students.length > 0 ? (
        <div className="space-y-4">
          {students.map((student) => (
            <Card key={student.id} className="hover-elevate cursor-pointer" onClick={() => setLocation(`/mentor/students/${student.id}`)}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 flex-wrap">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={student.photo || undefined} />
                    <AvatarFallback className="text-lg">
                      {student.name?.charAt(0)?.toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold" data-testid={`text-student-name-${student.id}`}>
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        {student.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </span>
                        )}
                        {student.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-bold" data-testid={`text-progress-${student.id}`}>
                          {student.progressPercentage}%
                        </span>
                      </div>
                      <Progress value={student.progressPercentage} className="h-2" />
                      {student.currentSkill && (
                        <p className="text-xs text-muted-foreground">
                          Currently learning: <span className="font-medium">{student.currentSkill}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {student.badgeCount} {student.badgeCount === 1 ? 'Badge' : 'Badges'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/mentor/students/${student.id}/roadmap`);
                      }}
                      data-testid={`button-edit-roadmap-${student.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Roadmap
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/mentor/payments?student=${student.id}`);
                      }}
                      data-testid={`button-add-payment-${student.id}`}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Add Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No students yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by adding your first student
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
