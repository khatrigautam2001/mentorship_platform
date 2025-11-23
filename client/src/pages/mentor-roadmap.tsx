import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Award, ExternalLink, X } from "lucide-react";
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

type AddSkillFormData = z.infer<typeof addSkillSchema>;

interface SkillItem {
  title: string;
  resourceUrl: string;
  order: number;
}

export default function MentorRoadmap() {
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillItems, setSkillItems] = useState<SkillItem[]>([]);
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
            <Card key={skill.id}>
              <AccordionItem value={skill.id} className="border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
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
                        data-testid={`button-delete-skill-${skill.id}`}
                        onClick={() => deleteSkillMutation.mutate(skill.id)}
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
                            className="flex items-center justify-between gap-4 rounded-md border p-3 hover-elevate"
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
    </div>
  );
}
