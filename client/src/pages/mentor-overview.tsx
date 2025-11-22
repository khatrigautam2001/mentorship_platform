import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalMentees: number;
  totalRevenue: number;
  pendingDues: number;
  pendingRequests: number;
  avgCompletion: number;
}

export default function MentorOverview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/mentor/stats"],
  });

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalMentees || 0,
      icon: Users,
      description: "Active mentees",
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      description: "Collected so far",
    },
    {
      title: "Pending Dues",
      value: `₹${stats?.pendingDues?.toLocaleString() || 0}`,
      icon: Clock,
      description: "Outstanding balance",
    },
    {
      title: "Avg. Completion",
      value: `${stats?.avgCompletion || 0}%`,
      icon: TrendingUp,
      description: "Student progress",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your mentorship program performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && stats.pendingRequests > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You have <span className="font-bold text-amber-600">{stats.pendingRequests}</span> pending mock interview request{stats.pendingRequests !== 1 ? 's' : ''} waiting for your review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
