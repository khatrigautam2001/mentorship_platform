import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Lock, Play, Award as AwardIcon, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Skill, RoadmapItem, Progress as ProgressType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface SkillWithItems extends Skill {
  items: RoadmapItem[];
}

interface LearningData {
  skills: SkillWithItems[];
  progress: ProgressType[];
  overallProgress: number;
  nextUnlocked: string | null;
  mockInterviewStatuses: Record<string, string>;
}

export default function MenteeLearning() {
  const { toast } = useToast();

  const { data: learningData, isLoading } = useQuery<LearningData>({
    queryKey: ["/api/mentee/learning"],
  });

  const markCompleteMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("POST", `/api/mentee/complete-item/${itemId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
      toast({
        title: "Progress updated!",
        description: "Item marked as complete",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update progress",
        description: error.message,
      });
    },
  });

  const requestMockInterviewMutation = useMutation({
    mutationFn: (skillId: string) =>
      apiRequest("POST", `/api/mentee/request-mock-interview/${skillId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentee/learning"] });
      toast({
        title: "Request submitted!",
        description: "Your mentor will review your mock interview request",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit request",
        description: error.message,
      });
    },
  });

  const isItemCompleted = (itemId: string) => {
    return learningData?.progress.some(p => p.itemId === itemId && p.completed) || false;
  };

  const isItemUnlocked = (itemId: string) => {
    return learningData?.nextUnlocked === itemId || isItemCompleted(itemId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Learning Journey</h1>
        <p className="text-muted-foreground mt-2">
          Complete items sequentially to unlock your skills
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : learningData ? (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Overall Progress</h3>
                  <span className="text-2xl font-bold" data-testid="text-overall-progress">
                    {learningData.overallProgress}%
                  </span>
                </div>
                <Progress value={learningData.overallProgress} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Keep going! Complete each item to unlock the next one.
                </p>
              </div>
            </CardContent>
          </Card>

          <Accordion type="multiple" defaultValue={learningData.skills.map(s => s.id)} className="space-y-4">
            {learningData.skills.map((skill, skillIndex) => {
              const completedItems = skill.items.filter(item => isItemCompleted(item.id)).length;
              const totalItems = skill.items.length;
              const skillProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

              return (
                <Card key={skill.id}>
                  <AccordionItem value={skill.id} className="border-0">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{skillIndex + 1}</Badge>
                            <AccordionTrigger className="hover:no-underline py-0">
                              <CardTitle className="text-lg" data-testid={`text-skill-${skill.id}`}>
                                {skill.name}
                              </CardTitle>
                            </AccordionTrigger>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={skillProgress} className="h-2 flex-1" />
                            <span className="text-sm font-medium text-muted-foreground">
                              {completedItems}/{totalItems}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <AccordionContent>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {skill.items.map((item, itemIndex) => {
                            const completed = isItemCompleted(item.id);
                            const unlocked = isItemUnlocked(item.id);
                            const mockStatus = item.isMockInterview ? learningData.mockInterviewStatuses[skill.id] : null;

                            return (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between gap-4 rounded-md border p-4 ${
                                  !unlocked ? "opacity-50" : ""
                                } ${unlocked && !completed ? "border-primary/50 bg-primary/5" : ""}`}
                                data-testid={`item-${item.id}`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2">
                                    {completed ? (
                                      <Check className="h-5 w-5 text-green-600" />
                                    ) : unlocked ? (
                                      <span className="text-sm font-medium">{itemIndex + 1}</span>
                                    ) : (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${!unlocked ? "text-muted-foreground" : ""}`}>
                                      {item.title}
                                    </p>
                                    {item.isMockInterview && (
                                      <Badge variant="secondary" className="text-xs mt-1">
                                        <AwardIcon className="h-3 w-3 mr-1" />
                                        Mock Interview Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {unlocked && !completed && (
                                  <div>
                                    {item.isMockInterview ? (
                                      mockStatus === "pending" ? (
                                        <Badge variant="secondary">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Pending Review
                                        </Badge>
                                      ) : (
                                        <Button
                                          size="sm"
                                          onClick={() => requestMockInterviewMutation.mutate(skill.id)}
                                          disabled={requestMockInterviewMutation.isPending}
                                          data-testid={`button-request-mock-${item.id}`}
                                        >
                                          Request Approval
                                        </Button>
                                      )
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => markCompleteMutation.mutate(item.id)}
                                        disabled={markCompleteMutation.isPending}
                                        data-testid={`button-complete-${item.id}`}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Mark Complete
                                      </Button>
                                    )}
                                  </div>
                                )}

                                {completed && (
                                  <Badge variant="secondary" className="text-green-700 dark:text-green-400">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              );
            })}
          </Accordion>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No learning path yet</h3>
            <p className="text-sm text-muted-foreground">
              Your mentor will assign a roadmap soon
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
