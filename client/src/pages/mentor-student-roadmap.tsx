import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, RotateCcw, ArrowLeft, Award, ExternalLink, GripVertical } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Skill, RoadmapItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface SkillWithItems extends Skill {
  items: any[];
}

const addItemSchema = z.object({
  skillId: z.string().min(1, "Skill is required"),
  title: z.string().min(1, "Title is required"),
  resourceUrl: z.string().optional(),
  isMockInterview: z.boolean().default(false),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

export default function MentorStudentRoadmap() {
  const [, params] = useRoute("/mentor/students/:menteeId/roadmap");
  const [, setLocation] = useLocation();
  const menteeId = params?.menteeId as string;
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toast } = useToast();

  const itemForm = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      isMockInterview: false,
    },
  });

  const { data: roadmap, isLoading, refetch } = useQuery<SkillWithItems[]>({
    queryKey: [`/api/roadmap/individual/${menteeId}`],
  });

  const { data: allSkills } = useQuery<Skill[]>({
    queryKey: ["/api/roadmap/global"],
  });

  // Track if roadmap is custom (has individual items)
  const isCustomRoadmap = roadmap && roadmap.some(skill => skill.items.some(item => 'menteeId' in item));

  const addItemMutation = useMutation({
    mutationFn: (data: AddItemFormData) =>
      apiRequest("POST", `/api/roadmap/individual/${menteeId}/items`, {
        skillId: data.skillId,
        title: data.title,
        resourceUrl: data.resourceUrl || null,
        order: 0,
        isMockInterview: data.isMockInterview,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      setIsAddItemOpen(false);
      reset();
      toast({
        title: "Item added!",
        description: "New item has been added to the roadmap",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add item",
        description: error.message,
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("DELETE", `/api/roadmap/individual/${menteeId}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      setDeleteConfirmId(null);
      toast({
        title: "Item deleted!",
        description: "Item has been removed from the roadmap",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete item",
        description: error.message,
      });
    },
  });

  const resetRoadmapMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/roadmap/individual/${menteeId}/reset`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      setShowResetConfirm(false);
      toast({
        title: "Roadmap reset!",
        description: "Individual roadmap has been reset to global",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to reset roadmap",
        description: error.message,
      });
    },
  });


  const onSubmit = (data: AddItemFormData) => {
    addItemMutation.mutate(data);
  };


  const openAddItemForSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    itemForm.setValue("skillId", skillId);
    setIsAddItemOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/mentor/students")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Customize Student Roadmap</h1>
          <p className="text-muted-foreground mt-1">
            Create a personalized learning path for this student
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Add Part</DialogTitle>
              <DialogDescription>
                Add a new part to this skill
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={itemForm.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skillId">Skill</Label>
                <select
                  id="skillId"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  {...itemForm.register("skillId")}
                  data-testid="select-skill"
                >
                  <option value="">Select a skill</option>
                  {allSkills?.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
                {itemForm.formState.errors.skillId && (
                  <p className="text-sm text-destructive">{itemForm.formState.errors.skillId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Part Title</Label>
                <Input
                  id="title"
                  placeholder="Part title"
                  {...itemForm.register("title")}
                  data-testid="input-item-title"
                />
                {itemForm.formState.errors.title && (
                  <p className="text-sm text-destructive">{itemForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resourceUrl">Resource URL (Optional)</Label>
                <Input
                  id="resourceUrl"
                  placeholder="https://example.com/resource"
                  {...itemForm.register("resourceUrl")}
                  data-testid="input-item-resource-url"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="isMockInterview"
                  {...itemForm.register("isMockInterview")}
                  data-testid="checkbox-mock-interview"
                />
                <Label htmlFor="isMockInterview" className="font-normal cursor-pointer">
                  This is a mock interview item
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={addItemMutation.isPending}
                data-testid="button-submit-item"
              >
                {addItemMutation.isPending ? "Adding..." : "Add Part"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={() => setShowResetConfirm(true)}
          data-testid="button-reset-roadmap"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Global
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : roadmap && roadmap.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {roadmap.map((skill, skillIndex) => (
            <Card key={skill.id}>
              <AccordionItem value={skill.id} className="border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{skillIndex + 1}</Badge>
                          <AccordionTrigger className="hover:no-underline py-0">
                            <CardTitle className="text-lg" data-testid={`text-skill-${skill.id}`}>
                              {skill.name}
                            </CardTitle>
                          </AccordionTrigger>
                        </div>
                        {skill.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAddItemForSkill(skill.id)}
                      data-testid={`button-add-part-${skill.id}`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Part
                    </Button>
                  </div>
                </CardHeader>
                <AccordionContent>
                  <CardContent className="pt-0">
                    {skill.items && skill.items.length > 0 ? (
                      <div className="space-y-2">
                        {skill.items.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-md border p-3 hover-elevate"
                            data-testid={`item-${item.id}`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Badge variant="outline" className="min-w-[2rem] justify-center">
                                {itemIndex + 1}
                              </Badge>
                              <span className="text-sm font-medium" data-testid={`text-item-${item.id}`}>
                                {item.title}
                              </span>
                              {item.isMockInterview && (
                                <Badge variant="secondary" className="text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  Mock Interview
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(item.id)}
                              data-testid={`button-delete-item-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No items in this skill</p>
                    )}
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">No custom roadmap yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This student is using the global roadmap. Add custom items to create a personalized path.
            </p>
            <Button onClick={() => setIsAddItemOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => {
        if (!open) setDeleteConfirmId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  deleteItemMutation.mutate(deleteConfirmId);
                }
              }}
              disabled={deleteItemMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-item"
            >
              {deleteItemMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Global Roadmap</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset this student's roadmap to the global roadmap? All customizations will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetRoadmapMutation.mutate()}
              disabled={resetRoadmapMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-reset"
            >
              {resetRoadmapMutation.isPending ? "Resetting..." : "Reset"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
