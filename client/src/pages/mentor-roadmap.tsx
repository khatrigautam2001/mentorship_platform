import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Award, ExternalLink, X, Pencil, GripVertical } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Skill, RoadmapItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SkillWithItems extends Skill {
  items: RoadmapItem[];
}

const addSkillSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  description: z.string().optional(),
});

type AddSkillFormData = z.infer<typeof addSkillSchema>;

interface SkillItem {
  title: string;
  resourceUrl: string;
  order: number;
}

export default function MentorRoadmap() {
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [isEditSkillOpen, setIsEditSkillOpen] = useState(false);
  const [isEditPartOpen, setIsEditPartOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillWithItems | null>(null);
  const [selectedPart, setSelectedPart] = useState<RoadmapItem | null>(null);
  const [skillItems, setSkillItems] = useState<SkillItem[]>([]);
  const [newPartTitle, setNewPartTitle] = useState("");
  const [newPartResourceUrl, setNewPartResourceUrl] = useState("");
  const [editSkillName, setEditSkillName] = useState("");
  const [editSkillDescription, setEditSkillDescription] = useState("");
  const [editPartTitle, setEditPartTitle] = useState("");
  const [editPartResourceUrl, setEditPartResourceUrl] = useState("");
  const [deleteConfirmSkillId, setDeleteConfirmSkillId] = useState<string | null>(null);
  const [deleteConfirmItemId, setDeleteConfirmItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [draggedSkillId, setDraggedSkillId] = useState<string | null>(null);
  const [dragOverSkillId, setDragOverSkillId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: skills, isLoading } = useQuery<SkillWithItems[]>({
    queryKey: ["/api/roadmap/global"],
  });

  const skillForm = useForm<AddSkillFormData>({
    resolver: zodResolver(addSkillSchema),
    defaultValues: { name: "", description: "" },
  });

  const addSkillMutation = useMutation({
    mutationFn: async (data: AddSkillFormData & { items: any[] }) => {
      // Create skill first
      const skillRes = await apiRequest("POST", "/api/roadmap/skills", {
        name: data.name,
        description: data.description,
      });
      
      // Then add all items to the skill
      for (const item of data.items) {
        await apiRequest("POST", "/api/roadmap/items", {
          skillId: skillRes.id,
          title: item.title,
          resourceUrl: item.resourceUrl || null,
        });
      }
      
      return skillRes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
      setIsAddSkillOpen(false);
      skillForm.reset({ name: "", description: "" });
      setSkillItems([]);
      toast({
        title: "Skill added!",
        description: "New skill with all parts has been added to the roadmap",
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

  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: string) =>
      apiRequest("DELETE", `/api/roadmap/skills/${skillId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
      setDeleteConfirmSkillId(null);
      toast({
        title: "Skill deleted",
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

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("DELETE", `/api/roadmap/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
      setDeleteConfirmItemId(null);
      toast({
        title: "Part deleted",
        description: "Part has been removed from the skill",
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

  const addPartMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSkill) throw new Error("No skill selected");
      return apiRequest("POST", "/api/roadmap/items", {
        skillId: selectedSkill.id,
        title: newPartTitle,
        resourceUrl: newPartResourceUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
      setIsAddPartOpen(false);
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

  const editSkillMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSkill) throw new Error("No skill selected");
      return apiRequest("PATCH", `/api/roadmap/skills/${selectedSkill.id}`, {
        name: editSkillName,
        description: editSkillDescription,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
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

  const editPartMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPart) throw new Error("No part selected");
      return apiRequest("PATCH", `/api/roadmap/items/${selectedPart.id}`, {
        title: editPartTitle,
        resourceUrl: editPartResourceUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
      setIsEditPartOpen(false);
      setEditPartTitle("");
      setEditPartResourceUrl("");
      setSelectedPart(null);
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

  const reorderItemMutation = useMutation({
    mutationFn: (data: { itemId: string; newOrder: number }) =>
      apiRequest("PATCH", `/api/roadmap/items/${data.itemId}/reorder`, { order: data.newOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
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
    mutationFn: (data: { skillId: string; newOrder: number }) => {
      console.log(`Calling API to reorder skill ${data.skillId} to order ${data.newOrder}`);
      return apiRequest("PATCH", `/api/roadmap/skills/${data.skillId}/reorder`, { order: data.newOrder });
    },
    onSuccess: () => {
      console.log("Skill reordered successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
      setDraggedSkillId(null);
      setDragOverSkillId(null);
    },
    onError: (error: Error) => {
      console.error("Failed to reorder skill:", error);
      toast({
        variant: "destructive",
        title: "Failed to reorder skill",
        description: error.message,
      });
      setDraggedSkillId(null);
      setDragOverSkillId(null);
    },
  });

  const addItemToForm = () => {
    setSkillItems([...skillItems, { title: "", resourceUrl: "", order: skillItems.length }]);
  };

  const removeItemFromForm = (index: number) => {
    setSkillItems(skillItems.filter((_, i) => i !== index));
  };

  const updateItemInForm = (index: number, field: string, value: string) => {
    const updated = [...skillItems];
    updated[index] = { ...updated[index], [field]: value };
    setSkillItems(updated);
  };

  const onSubmit = (data: AddSkillFormData) => {
    if (skillItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No parts added",
        description: "Please add at least one part to the skill",
      });
      return;
    }
    addSkillMutation.mutate({
      ...data,
      items: skillItems.map((item, idx) => ({
        title: item.title,
        resourceUrl: item.resourceUrl,
        order: idx,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Global Roadmap</h1>
          <p className="text-muted-foreground mt-2">
            Manage the master roadmap that applies to all students
          </p>
        </div>
        <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-skill">
              <Plus className="h-4 w-4 mr-2" />
              Add a Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
              <DialogDescription>
                Create a skill and add parts/items for it
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={skillForm.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4 border-b pb-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Skill Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Excel, SQL, Power BI"
                    data-testid="input-skill-name"
                    {...skillForm.register("name")}
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
                    data-testid="input-skill-description"
                    {...skillForm.register("description")}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Parts</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addItemToForm}
                    data-testid="button-add-part"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Part
                  </Button>
                </div>

                {skillItems.length > 0 ? (
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
                    {skillItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Part title"
                            value={item.title}
                            onChange={(e) => updateItemInForm(idx, "title", e.target.value)}
                            data-testid={`input-part-title-${idx}`}
                          />
                          <Input
                            placeholder="Resource URL (optional)"
                            value={item.resourceUrl}
                            onChange={(e) => updateItemInForm(idx, "resourceUrl", e.target.value)}
                            data-testid={`input-part-resource-${idx}`}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromForm(idx)}
                          className="mt-0"
                          data-testid={`button-remove-part-${idx}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No parts yet. Click "Add Part" to begin.</p>
                )}
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
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : skills && skills.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {skills.map((skill, skillIndex) => (
            <Card
              key={skill.id}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                setDraggedSkillId(skill.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverSkillId(skill.id);
              }}
              onDragLeave={(e) => {
                e.stopPropagation();
                setDragOverSkillId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedSkillId && draggedSkillId !== skill.id) {
                  console.log(`Reordering skill ${draggedSkillId} to position ${skillIndex}`);
                  reorderSkillMutation.mutate({
                    skillId: draggedSkillId,
                    newOrder: skillIndex,
                  });
                }
                setDraggedSkillId(null);
                setDragOverSkillId(null);
              }}
              className={`transition-all cursor-grab active:cursor-grabbing ${
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                        data-testid={`button-add-part-${skill.id}`}
                        onClick={() => {
                          setSelectedSkill(skill);
                          setIsAddPartOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add part
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-edit-skill-${skill.id}`}
                        onClick={() => {
                          setSelectedSkill(skill);
                          setEditSkillName(skill.name);
                          setEditSkillDescription(skill.description || "");
                          setIsEditSkillOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-delete-skill-${skill.id}`}
                        onClick={() => setDeleteConfirmSkillId(skill.id)}
                        disabled={deleteSkillMutation.isPending}
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
                          >
                            <div className="flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing">
                              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                                  setSelectedPart(item);
                                  setEditPartTitle(item.title);
                                  setEditPartResourceUrl(item.resourceUrl || "");
                                  setIsEditPartOpen(true);
                                }}
                                data-testid={`button-edit-item-${item.id}`}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirmItemId(item.id)}
                                disabled={deleteItemMutation.isPending}
                                data-testid={`button-delete-item-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        No parts yet. Add your first part to this skill.
                      </div>
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
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No skills yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start building your roadmap by adding your first skill
            </p>
            <Button onClick={() => setIsAddSkillOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add a Skill
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Part Dialog */}
      <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
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
                  setIsAddPartOpen(false);
                  setNewPartTitle("");
                  setNewPartResourceUrl("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => addPartMutation.mutate()}
                disabled={!newPartTitle.trim() || addPartMutation.isPending}
                data-testid="button-submit-add-part"
              >
                {addPartMutation.isPending ? "Adding..." : "Add Part"}
              </Button>
            </div>
          </div>
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

      {/* Edit Part Dialog */}
      <Dialog open={isEditPartOpen} onOpenChange={setIsEditPartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
            <DialogDescription>
              Update the part details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-part-title">Part Title</Label>
              <Input
                id="edit-part-title"
                value={editPartTitle}
                onChange={(e) => setEditPartTitle(e.target.value)}
                data-testid="input-edit-part-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-part-resource">Resource URL (Optional)</Label>
              <Input
                id="edit-part-resource"
                placeholder="https://example.com"
                value={editPartResourceUrl}
                onChange={(e) => setEditPartResourceUrl(e.target.value)}
                data-testid="input-edit-part-resource"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditPartOpen(false);
                  setEditPartTitle("");
                  setEditPartResourceUrl("");
                  setSelectedPart(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => editPartMutation.mutate()}
                disabled={!editPartTitle.trim() || editPartMutation.isPending}
                data-testid="button-submit-edit-part"
              >
                {editPartMutation.isPending ? "Saving..." : "Save Changes"}
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
    </div>
  );
}
