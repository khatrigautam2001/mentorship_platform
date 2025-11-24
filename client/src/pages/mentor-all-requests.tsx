import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Archive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";

interface MockInterviewRequestWithDetails {
  id: string;
  menteeId: string;
  menteeName: string;
  menteePhoto: string | null;
  skillId: string;
  skillName: string;
  status: string;
  requestedAt: string;
  resolvedAt: string | null;
}

export default function MentorAllRequests() {
  const { data: requests, isLoading } = useQuery<MockInterviewRequestWithDetails[]>({
    queryKey: ["/api/mentor/mock-requests/all"],
  });

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <Badge className="bg-green-600 text-white"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
    } else if (status === "rejected") {
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Mock Interview Requests</h1>
        <p className="text-muted-foreground mt-2">
          View history of all processed mock interview requests
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
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
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`text-request-student-${request.id}`}>
                        {request.menteeName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requested completion for <span className="font-medium text-foreground">{request.skillName}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Request Date</p>
                    <p className="font-medium">{format(new Date(request.requestedAt), "PPp")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                    </p>
                  </div>
                  {request.resolvedAt && (
                    <div>
                      <p className="text-muted-foreground">
                        {request.status === "approved" ? "Approval Date" : "Rejection Date"}
                      </p>
                      <p className="font-medium">{format(new Date(request.resolvedAt), "PPp")}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(request.resolvedAt), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Archive className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No processed requests</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              All mock interview requests will appear here once they have been approved or rejected.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
