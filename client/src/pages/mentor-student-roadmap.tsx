import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCcw, ArrowLeft, ExternalLink, GripVertical, Pencil } from "lucide-react";
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

interface IndividualSkillWithItems {
  id: string;
  name: string;
  description?: string;
  items: any[];
  isIndividual?: boolean;
}

const addSkillSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  description: z.string().optional(),
});

type AddSkillFormData = z.infer<typeof addSkillSchema>;

export default function MentorStudentRoadmap() {
  const [, params] = useRoute("/mentor/students/:menteeId/roadmap");
  const [, setLocation] = useLocation();
  const menteeId = params?.menteeId as string;
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditSkillOpen, setIsEditSkillOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<IndividualSkillWithItems | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [deleteConfirmSkillId, setDeleteConfirmSkillId] = useState<string | null>(null);
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editSkillName, setEditSkillName] = useState("");
  const [editSkillDescription, setEditSkillDescription] = useState("");
  const [editItemTitle, setEditItemTitle] = useState("");
  const [editItemResourceUrl, setEditItemResourceUrl] = useState("");
  const [newPartTitle, setNewPartTitle] = useState("");
  const [newPartResourceUrl, setNewPartResourceUrl] = useState("");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [draggedSkillId, setDraggedSkillId] = useState<string | null>(null);
  const [dragOverSkillId, setDragOverSkillId] = useState<string | null>(null);
  const { toast } = useToast();

  const skillForm = useForm<AddSkillFormData>({
    resolver: zodResolver(addSkillSchema),
    defaultValues: { name: "", description: "" },
  });

  const { data: roadmap, isLoading, refetch } = useQuery<SkillWithItems[]>({
    queryKey: [`/api/roadmap/individual/${menteeId}`],
  });

  const { data: individualSkills } = useQuery<any[]>({
    queryKey: [`/api/roadmap/individual/${menteeId}/skills`],
    queryFn: () => apiRequest("GET", `/api/roadmap/individual/${menteeId}/skills`),
  });

  const { data: allSkills } = useQuery<Skill[]>({
    queryKey: ["/api/roadmap/global"],
  });

  const addSkillMutation = useMutation({
    mutationFn: (data: AddSkillFormData) =>
      apiRequest("POST", `/api/roadmap/individual/${menteeId}/skills`, {
        name: data.name,
        description: data.description || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}/skills`] });
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
      setIsAddSkillOpen(false);
      skillForm.reset({ name: "", description: "" });
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
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}/skills`] });
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
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
      apiRequest("DELETE", `/api/roadmap/individual/${menteeId}/skills/${skillId}` as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}/skills`] });
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
      setDeleteConfirmSkillId(null);
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
    mutationFn: async () => {
      if (!selectedSkill) throw new Error("No skill selected");
      const isIndividualSkill = (selectedSkill as any).menteeId !== undefined;
      const nextOrder = selectedSkill.items?.length || 0;
      return apiRequest("POST", `/api/roadmap/individual/${menteeId}/items`, {
        skillId: isIndividualSkill ? null : selectedSkill.id,
        individualSkillId: isIndividualSkill ? selectedSkill.id : null,
        title: newPartTitle,
        resourceUrl: newPartResourceUrl || null,
        order: nextOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}/skills`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
      setIsAddItemOpen(false);
      setNewPartTitle("");
      setNewPartResourceUrl("");
      setSelectedSkill(null);
      toast({
        title: "Part added!",
        description: "New part has been added to the skill",
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
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
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
      apiRequest("DELETE", `/api/roadmap/individual/${menteeId}/items/${itemId}` as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
      setDeleteConfirmItemId(null);
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

  const reorderItemMutation = useMutation({
    mutationFn: (data: { itemId: string; newOrder: number }) =>
      apiRequest("PATCH", `/api/roadmap/individual/${menteeId}/items/${data.itemId}/reorder`, { order: data.newOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
      setDraggedItemId(null);
      setDragOverItemId(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to reorder part",
        description: error.message,
      });
      setDraggedItemId(null);
      setDragOverItemId(null);
    },
  });

  const reorderSkillMutation = useMutation({
    mutationFn: (data: { skillId: string; newOrder: number }) =>
      apiRequest("PATCH", `/api/roadmap/individual/${menteeId}/skills/${data.skillId}/reorder`, { order: data.newOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
      setDraggedSkillId(null);
      setDragOverSkillId(null);
      toast({
        title: "Skill reordered!",
        description: "Skill order has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to reorder skill",
        description: error.message,
      });
      setDraggedSkillId(null);
      setDragOverSkillId(null);
    },
  });

  const resetRoadmapMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/roadmap/individual/${menteeId}/reset`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/roadmap/individual/${menteeId}/skills`] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
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

  const onSubmitSkill = (data: AddSkillFormData) => {
    addSkillMutation.mutate(data);
  };

  // Use roadmap directly (backend now returns both global and individual skills combined)
  const combinedSkills = roadmap || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/mentor/students")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Customize Student Roadmap</h1>
            <p className="text-muted-foreground mt-1">
              Create a personalized learning path for this student
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            skillForm.reset();
            setIsAddSkillOpen(true);
          }}
          data-testid="button-add-skill"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add a Skill
        </Button>
      </div>

      <div className="flex gap-2">
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
      ) : combinedSkills.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {combinedSkills.map((skill, skillIndex) => (
            <Card 
              key={skill.id}
              draggable
              onDragStart={() => setDraggedSkillId(skill.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverSkillId(skill.id);
              }}
              onDragLeave={() => setDragOverSkillId(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedSkillId && draggedSkillId !== skill.id) {
                  reorderSkillMutation.mutate({
                    skillId: draggedSkillId,
                    newOrder: skillIndex,
                  });
                }
                setDraggedSkillId(null);
                setDragOverSkillId(null);
              }}
              className={`cursor-grab active:cursor-grabbing transition-all ${
                draggedSkillId === skill.id
                  ? "opacity-50 bg-muted"
                  : dragOverSkillId === skill.id
                  ? "bg-accent/50 border-accent"
                  : ""
              }`}
            >
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
                        onClick={() => {
                          setSelectedSkill(skill);
                          setIsAddItemOpen(true);
                        }}
                        data-testid={`button-add-part-${skill.id}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Part
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSkill(skill);
                          setEditSkillName(skill.name);
                          setEditSkillDescription(skill.description || "");
                          setIsEditSkillOpen(true);
                        }}
                        data-testid={`button-edit-skill-${skill.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirmSkillId(skill.id)}
                        disabled={deleteSkillMutation.isPending}
                        data-testid={`button-delete-skill-${skill.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                            draggable
                            onDragStart={() => setDraggedItemId(item.id)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOverItemId(item.id);
                            }}
                            onDragLeave={() => setDragOverItemId(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedItemId && draggedItemId !== item.id) {
                                reorderItemMutation.mutate({
                                  itemId: draggedItemId,
                                  newOrder: itemIndex,
                                });
                              }
                              setDraggedItemId(null);
                              setDragOverItemId(null);
                            }}
                            className={`flex items-center justify-between gap-4 rounded-md border p-3 transition-all ${
                              draggedItemId === item.id
                                ? "opacity-50 bg-muted"
                                : dragOverItemId === item.id
                                ? "bg-accent/50 border-accent"
                                : "hover-elevate"
                            }`}
                            data-testid={`item-${item.id}`}
                          >
                            <div className="flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing">
                              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <Badge variant="outline" className="min-w-[2rem] justify-center">
                                {itemIndex + 1}
                              </Badge>
                              <span className="text-sm font-medium" data-testid={`text-item-${item.id}`}>
                                {item.title}
                              </span>
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
                                onClick={() => setDeleteConfirmItemId(item.id)}
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
              Start building by adding your first skill
            </p>
            <Button onClick={() => setIsAddSkillOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add a Skill
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Skill Dialog */}
      <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
        <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Create a new skill for this student
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={skillForm.handleSubmit(onSubmitSkill)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                placeholder="e.g., Excel, SQL, Power BI"
                {...skillForm.register("name")}
                data-testid="input-skill-name"
              />
              {skillForm.formState.errors.name && (
                <p className="text-sm text-destructive">{skillForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of the skill"
                {...skillForm.register("description")}
                data-testid="input-skill-description"
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
              <Input
                id="edit-skill-description"
                value={editSkillDescription}
                onChange={(e) => setEditSkillDescription(e.target.value)}
                data-testid="input-edit-skill-description"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Part to {selectedSkill?.name}</DialogTitle>
            <DialogDescription>
              Add a new part/item to this skill
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="part-title">Part Title</Label>
              <Input
                id="part-title"
                placeholder="e.g., Basic Functions"
                value={newPartTitle}
                onChange={(e) => setNewPartTitle(e.target.value)}
                data-testid="input-add-part-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part-resource">Resource URL (Optional)</Label>
              <Input
                id="part-resource"
                placeholder="https://example.com"
                value={newPartResourceUrl}
                onChange={(e) => setNewPartResourceUrl(e.target.value)}
                data-testid="input-add-part-resource"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddItemOpen(false);
                  setNewPartTitle("");
                  setNewPartResourceUrl("");
                  setSelectedSkill(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => addItemMutation.mutate()}
                disabled={!newPartTitle.trim() || addItemMutation.isPending}
                data-testid="button-submit-add-part"
              >
                {addItemMutation.isPending ? "Adding..." : "Add Part"}
              </Button>
            </div>
          </div>
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

      {/* Delete Skill Confirmation */}
      <AlertDialog open={deleteConfirmSkillId !== null} onOpenChange={(open) => {
        if (!open) setDeleteConfirmSkillId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this skill and all its parts? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmSkillId) {
                  deleteSkillMutation.mutate(deleteConfirmSkillId);
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

      {/* Delete Part Confirmation */}
      <AlertDialog open={deleteConfirmItemId !== null} onOpenChange={(open) => {
        if (!open) setDeleteConfirmItemId(null);
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
                if (deleteConfirmItemId) {
                  deleteItemMutation.mutate(deleteConfirmItemId);
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

      {/* Reset Confirmation */}
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
