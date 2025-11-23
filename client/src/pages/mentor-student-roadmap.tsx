import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, RotateCcw, ArrowLeft, Award, ExternalLink, GripVertical, Pencil } from "lucide-react";
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
  isIndividual?: boolean;
}

const addSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  description: z.string().optional(),
});

type AddSkillFormData = z.infer<typeof addSkillSchema>;

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
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isEditSkillOpen, setIsEditSkillOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillWithItems | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteSkillConfirmId, setDeleteSkillConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editItemTitle, setEditItemTitle] = useState("");
  const [editItemResourceUrl, setEditItemResourceUrl] = useState("");
  const [editSkillName, setEditSkillName] = useState("");
  const [editSkillDescription, setEditSkillDescription] = useState("");
  const { toast } = useToast();

  const skillForm = useForm<AddSkillFormData>({
    resolver: zodResolver(addSkillSchema),
  });

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

  // Track if roadmap has any individual customizations
  const hasCustomization = roadmap && roadmap.some(skill => skill.isIndividual);

  const addSkillMutation = useMutation({
    mutationFn: (data: AddSkillFormData) => {
      const nextOrder = roadmap?.length || 0;
      return apiRequest("POST", `/api/roadmap/individual/${menteeId}/skills`, {
        name: data.name,
        description: data.description || null,
        order: nextOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      setIsAddSkillOpen(false);
      skillForm.reset();
      toast({
        title: "Skill added!",
        description: "New skill has been added to the roadmap",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add skill",
        description: error.message,
      });
    },
  });

  const editSkillMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSkill) throw new Error("No skill selected");
      return apiRequest("PATCH", `/api/roadmap/individual/${menteeId}/skills/${selectedSkill.id}`, {
        name: editSkillName,
        description: editSkillDescription || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      setIsEditSkillOpen(false);
      setEditSkillName("");
      setEditSkillDescription("");
      setSelectedSkill(null);
      toast({
        title: "Skill updated!",
        description: "Skill has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update skill",
        description: error.message,
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: string) =>
      apiRequest("DELETE", `/api/roadmap/individual/${menteeId}/skills/${skillId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      setDeleteSkillConfirmId(null);
      toast({
        title: "Skill deleted!",
        description: "Skill has been removed from the roadmap",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete skill",
        description: error.message,
      });
    },
  });

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
      itemForm.reset();
      toast({
        title: "Part added!",
        description: "New part has been added to the roadmap",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add part",
        description: error.message,
      });
    },
  });

  const editItemMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItem) throw new Error("No part selected");
      return apiRequest("PATCH", `/api/roadmap/individual/${menteeId}/items/${selectedItem.id}`, {
        title: editItemTitle,
        resourceUrl: editItemResourceUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      setIsEditItemOpen(false);
      setEditItemTitle("");
      setEditItemResourceUrl("");
      setSelectedItem(null);
      toast({
        title: "Part updated!",
        description: "Part has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update part",
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
        title: "Part deleted!",
        description: "Part has been removed from the roadmap",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete part",
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

  const onAddSkillSubmit = (data: AddSkillFormData) => {
    addSkillMutation.mutate(data);
  };

  const onAddItemSubmit = (data: AddItemFormData) => {
    addItemMutation.mutate(data);
  };

  const openAddItemForSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    itemForm.setValue("skillId", skillId);
    setIsAddItemOpen(true);
  };

  const openEditSkill = (skill: SkillWithItems) => {
    setSelectedSkill(skill);
    setEditSkillName(skill.name);
    setEditSkillDescription(skill.description || "");
    setIsEditSkillOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
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
        <Button
          onClick={() => setIsAddSkillOpen(true)}
          data-testid="button-add-skill"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      <div className="flex gap-2">
        {hasCustomization && (
          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            data-testid="button-reset-roadmap"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Global
          </Button>
        )}
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAddItemForSkill(skill.id)}
                        data-testid={`button-add-part-${skill.id}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Part
                      </Button>
                      {skill.isIndividual && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditSkill(skill)}
                            data-testid={`button-edit-skill-${skill.id}`}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteSkillConfirmId(skill.id)}
                            data-testid={`button-delete-skill-${skill.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                    </div>
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
                              {item.resourceUrl && (
                                <a href={item.resourceUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                </a>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setEditItemTitle(item.title);
                                  setEditItemResourceUrl(item.resourceUrl || "");
                                  setIsEditItemOpen(true);
                                }}
                                data-testid={`button-edit-item-${item.id}`}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(item.id)}
                                data-testid={`button-delete-item-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No parts in this skill</p>
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
              This student is using the global roadmap. Add skills or parts to create a personalized path.
            </p>
            <Button onClick={() => setIsAddSkillOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Skill Dialog */}
      <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
        <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogDescription>
              Add a new skill to this student's roadmap
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={skillForm.handleSubmit(onAddSkillSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                placeholder="Skill name"
                {...skillForm.register("name")}
                data-testid="input-skill-name"
              />
              {skillForm.formState.errors.name && (
                <p className="text-sm text-destructive">{skillForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-description">Description (Optional)</Label>
              <Textarea
                id="skill-description"
                placeholder="Skill description"
                className="resize-none"
                rows={3}
                {...skillForm.register("description")}
                data-testid="textarea-skill-description"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={addSkillMutation.isPending}
              data-testid="button-submit-skill"
            >
              {addSkillMutation.isPending ? "Adding..." : "Add Skill"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Skill Dialog */}
      <Dialog open={isEditSkillOpen} onOpenChange={setIsEditSkillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>
              Update the skill details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-skill-name">Skill Name</Label>
              <Input
                id="edit-skill-name"
                value={editSkillName}
                onChange={(e) => setEditSkillName(e.target.value)}
                data-testid="input-edit-skill-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-skill-description">Description (Optional)</Label>
              <Textarea
                id="edit-skill-description"
                placeholder="Skill description"
                className="resize-none"
                rows={3}
                value={editSkillDescription}
                onChange={(e) => setEditSkillDescription(e.target.value)}
                data-testid="textarea-edit-skill-description"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditSkillOpen(false);
                  setEditSkillName("");
                  setEditSkillDescription("");
                  setSelectedSkill(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => editSkillMutation.mutate()}
                disabled={!editSkillName.trim() || editSkillMutation.isPending}
                data-testid="button-submit-edit-skill"
              >
                {editSkillMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add Part</DialogTitle>
            <DialogDescription>
              Add a new part to this skill
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={itemForm.handleSubmit(onAddItemSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skillId">Skill</Label>
              <select
                id="skillId"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                {...itemForm.register("skillId")}
                data-testid="select-skill"
              >
                <option value="">Select a skill</option>
                {roadmap?.map((skill) => (
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

      {/* Edit Part Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
            <DialogDescription>
              Update the part details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-title">Part Title</Label>
              <Input
                id="edit-item-title"
                value={editItemTitle}
                onChange={(e) => setEditItemTitle(e.target.value)}
                data-testid="input-edit-item-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-resource">Resource URL (Optional)</Label>
              <Input
                id="edit-item-resource"
                placeholder="https://example.com"
                value={editItemResourceUrl}
                onChange={(e) => setEditItemResourceUrl(e.target.value)}
                data-testid="input-edit-item-resource"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditItemOpen(false);
                  setEditItemTitle("");
                  setEditItemResourceUrl("");
                  setSelectedItem(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => editItemMutation.mutate()}
                disabled={!editItemTitle.trim() || editItemMutation.isPending}
                data-testid="button-submit-edit-item"
              >
                {editItemMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => {
        if (!open) setDeleteConfirmId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Part</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this part? This action cannot be undone.
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

      <AlertDialog open={deleteSkillConfirmId !== null} onOpenChange={(open) => {
        if (!open) setDeleteSkillConfirmId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this skill? All parts in this skill will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteSkillConfirmId) {
                  deleteSkillMutation.mutate(deleteSkillConfirmId);
                }
              }}
              disabled={deleteSkillMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-skill"
            >
              {deleteSkillMutation.isPending ? "Deleting..." : "Delete"}
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
