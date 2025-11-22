import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, PartyPopper } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface MockInterviewRequestWithDetails {
  id: string;
  menteeId: string;
  menteeName: string;
  menteePhoto: string | null;
  skillId: string;
  skillName: string;
  status: string;
  requestedAt: string;
}

export default function MentorRequests() {
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery<MockInterviewRequestWithDetails[]>({
    queryKey: ["/api/mentor/mock-requests"],
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest("POST", `/api/mentor/mock-requests/${requestId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentor/mock-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentor/stats"] });
      toast({
        title: "Request approved!",
        description: "Student has been awarded the skill badge",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to approve request",
        description: error.message,
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiRequest("POST", `/api/mentor/mock-requests/${requestId}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentor/mock-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mentor/stats"] });
      toast({
        title: "Request rejected",
        description: "Student can re-request when ready",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to reject request",
        description: error.message,
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Mock Requests</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve skill completion requests
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.menteePhoto || undefined} />
                      <AvatarFallback>
                        {request.menteeName?.charAt(0)?.toUpperCase() || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-request-student-${request.id}`}>
                        {request.menteeName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requesting completion for <span className="font-medium text-foreground">{request.skillName}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      data-testid={`button-reject-${request.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      data-testid={`button-approve-${request.id}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Conduct the mock interview offline and approve to award the <span className="font-medium">{request.skillName}</span> badge.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PartyPopper className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              No pending mock interview requests at the moment. Your students are working on their skills.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
