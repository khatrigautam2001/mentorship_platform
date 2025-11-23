import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mail, Phone, DollarSign, Edit, Award, Users, Copy, Check } from "lucide-react";
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedCredentials, setExpandedCredentials] = useState<string | null>(null);
  const [studentCredentials, setStudentCredentials] = useState<Record<string, { email: string; password: string }>>({});
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleCredentials = async (studentId: string) => {
    if (expandedCredentials === studentId) {
      setExpandedCredentials(null);
    } else {
      if (!studentCredentials[studentId]) {
        try {
          const response = await apiRequest("GET", `/api/mentor/students/${studentId}/credentials`);
          setStudentCredentials(prev => ({
            ...prev,
            [studentId]: response
          }));
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to load credentials",
            description: error instanceof Error ? error.message : "Unknown error",
          });
          return;
        }
      }
      setExpandedCredentials(studentId);
    }
  };

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
    onSuccess: (data: any) => {
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
                <div className="rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950 p-4 space-y-3">
                  <p className="text-sm font-bold text-green-900 dark:text-green-100">✓ Account Created Successfully!</p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Share these credentials with the student:
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Email</span>
                        <span className="text-sm font-mono font-medium">{generatedCredentials.email}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCredentials.email, 'email')}
                        data-testid="button-copy-email"
                        className="h-8 w-8"
                      >
                        {copiedField === 'email' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Password</span>
                        <span className="text-sm font-mono font-medium">{generatedCredentials.password}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCredentials.password, 'password')}
                        data-testid="button-copy-password"
                        className="h-8 w-8"
                      >
                        {copiedField === 'password' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
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

                    {expandedCredentials === student.id && studentCredentials[student.id] && (
                      <div className="rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 p-3 space-y-2 mt-2">
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-100">Login Credentials</p>
                        <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
                            <span className="font-mono text-xs">{studentCredentials[student.id].email}</span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(studentCredentials[student.id].email, `email-${student.id}`);
                            }}
                            className="h-6 w-6 flex-shrink-0"
                          >
                            {copiedField === `email-${student.id}` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground block mb-0.5">Password</span>
                            <span className="font-mono text-xs">{studentCredentials[student.id].password}</span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(studentCredentials[student.id].password, `password-${student.id}`);
                            }}
                            className="h-6 w-6 flex-shrink-0"
                          >
                            {copiedField === `password-${student.id}` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCredentials(student.id);
                      }}
                      data-testid={`button-view-credentials-${student.id}`}
                    >
                      {expandedCredentials === student.id ? "Hide Credentials" : "View Credentials"}
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
