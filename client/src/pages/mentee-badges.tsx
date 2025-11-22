import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Skill, Badge as BadgeType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface BadgeWithSkill extends BadgeType {
  skillName: string;
}

interface BadgesData {
  earnedBadges: BadgeWithSkill[];
  allSkills: Skill[];
}

export default function MenteeBadges() {
  const { data: badgesData, isLoading } = useQuery<BadgesData>({
    queryKey: ["/api/mentee/badges"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Badges</h1>
        <p className="text-muted-foreground mt-2">
          Badges earned through skill mastery and mock interviews
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : badgesData ? (
        <>
          {badgesData.earnedBadges.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Earned Badges ({badgesData.earnedBadges.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {badgesData.earnedBadges.map((badge) => (
                  <Card key={badge.id} className="text-center">
                    <CardContent className="p-6">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mx-auto mb-4 shadow-lg">
                        <Award className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg" data-testid={`text-badge-${badge.id}`}>
                        {badge.skillName} Master
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned {format(new Date(badge.awardedAt), "MMM d, yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {badgesData.allSkills.length > badgesData.earnedBadges.length && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-muted-foreground" />
                Locked Badges ({badgesData.allSkills.length - badgesData.earnedBadges.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {badgesData.allSkills
                  .filter(
                    (skill) =>
                      !badgesData.earnedBadges.some(
                        (badge) => badge.skillId === skill.id
                      )
                  )
                  .map((skill) => (
                    <Card key={skill.id} className="text-center opacity-60">
                      <CardContent className="p-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mx-auto mb-4 border-2 border-dashed border-muted-foreground/30">
                          <Award className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg text-muted-foreground">
                          {skill.name} Master
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Complete skill to unlock
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {badgesData.earnedBadges.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No badges yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Complete your learning items and pass mock interviews to earn badges
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
