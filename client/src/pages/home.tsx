import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, Zap, CheckCircle2, Award, Target, Lightbulb } from "lucide-react";

export default function Home() {
  const problems = [
    {
      icon: BookOpen,
      title: "Lack of Quality Resources",
      description: "Finding authentic, curated learning materials that actually work is overwhelming and time-consuming.",
    },
    {
      icon: Target,
      title: "No Clear Learning Path",
      description: "Without structure, it's easy to learn scattered concepts and miss critical fundamentals.",
    },
    {
      icon: Users,
      title: "No Expert Guidance",
      description: "Learning alone without feedback from experienced professionals limits growth and leaves gaps.",
    },
    {
      icon: Zap,
      title: "Unprepared for Interviews",
      description: "Mock interviews and real-world practice are essential but difficult to access and arrange.",
    },
    {
      icon: Award,
      title: "Difficulty Tracking Progress",
      description: "Without clear milestones and tracking, you lose motivation and don't see your actual growth.",
    },
    {
      icon: Lightbulb,
      title: "Lack of Personalization",
      description: "One-size-fits-all courses don't adapt to your pace, learning style, or career goals.",
    },
  ];

  const solutions = [
    {
      title: "Personalized Learning Roadmaps",
      description: "Custom-designed learning paths tailored to your pace and goals, built by experienced mentors.",
    },
    {
      title: "Structured Skill Building",
      description: "Sequential learning with clear milestones, resource recommendations, and progress tracking.",
    },
    {
      title: "Mock Interview Practice",
      description: "Real interview preparation with feedback from industry professionals to build confidence.",
    },
    {
      title: "One-on-One Mentorship",
      description: "Direct access to experienced mentors for guidance, feedback, and personalized support.",
    },
    {
      title: "Progress Tracking & Analytics",
      description: "Visual dashboard showing your learning journey, completion rates, and skill badges.",
    },
    {
      title: "Accountability & Motivation",
      description: "Regular check-ins and milestone celebrations to keep you motivated and on track.",
    },
  ];

  const benefits = [
    { emoji: "⚡", text: "Accelerated Learning - Learn 3x faster with structured guidance" },
    { emoji: "🎯", text: "Job-Ready Skills - Master skills employers actually need" },
    { emoji: "📈", text: "Proven Results - Track measurable progress with data" },
    { emoji: "🤝", text: "Expert Support - Get help when you need it" },
    { emoji: "🏆", text: "Confidence Boost - Ace interviews with real practice" },
    { emoji: "📊", text: "Clear Visibility - Know exactly what you've learned and what's next" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Mentorship</h1>
              <p className="text-xs text-muted-foreground">Progress Tracker</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild data-testid="button-login">
              <a href="/login">Login</a>
            </Button>
            <Button asChild data-testid="button-register">
              <a href="/register">Register</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto">
            Master Your Skills with <span className="text-primary">Personalized Mentorship</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Don't learn alone. Get expert guidance, structured roadmaps, and real interview practice. Transform from learner to professional.
          </p>
          <Button size="lg" className="gap-2" data-testid="button-start-journey">
            Start Your Data Analytics Journey
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">The Challenges You're Facing</h3>
            <p className="text-lg text-muted-foreground">
              These obstacles are holding back your growth. You're not alone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Card key={index} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <Icon className="h-5 w-5 text-destructive" />
                      </div>
                      <CardTitle className="text-lg">{problem.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{problem.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">The Complete Solution</h3>
            <p className="text-lg text-muted-foreground">
              Our mentorship platform provides everything you need to succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <div key={index} className="flex gap-4 p-6 bg-background rounded-lg border hover-elevate">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1">{solution.title}</h4>
                  <p className="text-sm text-muted-foreground">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">What You'll Gain</h3>
            <p className="text-lg text-muted-foreground">
              Real benefits from a structured, personalized learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 bg-background rounded-lg border hover-elevate flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{benefit.emoji}</div>
                <p className="font-medium pt-1">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10 border-t">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-4">Ready to Transform Your Career?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join students who are already mastering their skills with expert guidance and proven results.
          </p>
          <Button size="lg" className="gap-2" data-testid="button-cta-start">
            Start Your Data Analytics Journey
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Transform your future through personalized mentorship and guided learning.</p>
        </div>
      </footer>
    </div>
  );
}
