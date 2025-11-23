import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Award, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Skill, RoadmapItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface SkillWithItems extends Skill {
  items: RoadmapItem[];
}

const addSkillSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  description: z.string().optional(),
});

const addItemSchema = z.object({
  skillId: z.string(),
  title: z.string().min(2, "Item title must be at least 2 characters"),
  resourceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type AddSkillFormData = z.infer<typeof addSkillSchema>;
type AddItemFormData = z.infer<typeof addItemSchema>;

export default function MentorRoadmap() {
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: skills, isLoading } = useQuery<SkillWithItems[]>({
    queryKey: ["/api/roadmap/global"],
  });

  const skillForm = useForm<AddSkillFormData>({
    resolver: zodResolver(addSkillSchema),
    defaultValues: { name: "", description: "" },
  });

  const itemForm = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: { title: "", resourceUrl: "" },
  });

  const addSkillMutation = useMutation({
    mutationFn: (data: AddSkillFormData) =>
      apiRequest("POST", "/api/roadmap/skills", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
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

  const addItemMutation = useMutation({
    mutationFn: (data: AddItemFormData) =>
      apiRequest("POST", "/api/roadmap/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
      setIsAddItemOpen(false);
      itemForm.reset();
      toast({
        title: "Item added!",
        description: "New item has been added to the skill",
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

  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: string) =>
      apiRequest("DELETE", `/api/roadmap/skills/${skillId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
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
      apiRequest("DELETE", `/api/roadmap/items/${itemId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap/global"] });
      toast({
        title: "Item deleted",
        description: "Item has been removed from the skill",
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

  const openAddItem = (skillId: string) => {
    setSelectedSkillId(skillId);
    itemForm.setValue("skillId", skillId);
    setIsAddItemOpen(true);
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
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
              <DialogDescription>
                Create a new skill category for your roadmap
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={skillForm.handleSubmit((data) => addSkillMutation.mutate(data))} className="space-y-4">
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
                        onClick={() => openAddItem(skill.id)}
                        data-testid={`button-add-item-${skill.id}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSkillMutation.mutate(skill.id)}
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
                            className="flex items-center justify-between gap-4 rounded-md border p-3 hover-elevate"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteItemMutation.mutate(item.id)}
                              disabled={deleteItemMutation.isPending}
                              data-testid={`button-delete-item-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        No items yet. Add your first item to this skill.
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
              Add Skill
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a learning item to this skill
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={itemForm.handleSubmit((data) => addItemMutation.mutate(data))} className="space-y-4">
            <input type="hidden" {...itemForm.register("skillId")} />
            
            <div className="space-y-2">
              <Label htmlFor="title">Item Title</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Formulas"
                data-testid="input-item-title"
                {...itemForm.register("title")}
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
                data-testid="input-item-resource-url"
                {...itemForm.register("resourceUrl")}
              />
              {itemForm.formState.errors.resourceUrl && (
                <p className="text-sm text-destructive">{itemForm.formState.errors.resourceUrl.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={addItemMutation.isPending}
              data-testid="button-submit-item"
            >
              {addItemMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
