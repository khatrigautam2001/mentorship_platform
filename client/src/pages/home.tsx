import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Database, TrendingUp, Zap, CheckCircle2, Award, BarChart3, Lightbulb } from "lucide-react";
import dashboardImg from "@assets/generated_images/data_analytics_dashboard_interface.png";
import mentorImg from "@assets/generated_images/mentor_teaching_data_analytics.png";
import analystImg from "@assets/generated_images/data_analyst_at_work.png";
import teamImg from "@assets/generated_images/data_analytics_team_collaboration.png";

export default function Home() {
  const problems = [
    {
      icon: Database,
      title: "SQL & Data Queries Overwhelm",
      description: "Complex SQL syntax, query optimization, and database design concepts feel impossible to master.",
    },
    {
      icon: BarChart3,
      title: "Dashboard Building Confusion",
      description: "Creating meaningful visualizations and dashboards that actually tell a story is harder than it seems.",
    },
    {
      icon: TrendingUp,
      title: "No Real-World Projects",
      description: "Learning theory without practical data analysis projects leaves you unprepared for actual jobs.",
    },
    {
      icon: Zap,
      title: "Interview Anxiety",
      description: "Data analytics interviews test both technical skills and business thinking. Being interview-ready is stressful.",
    },
    {
      icon: Award,
      title: "Career Path Uncertainty",
      description: "Unsure which analytics tools to learn, which direction to take, or how to showcase your skills.",
    },
    {
      icon: Lightbulb,
      title: "Lack of Industry Mentors",
      description: "Learning from tutorials alone means missing insider knowledge and industry best practices.",
    },
  ];

  const solutions = [
    {
      title: "Data Analytics Roadmap",
      description: "Master SQL, Python, Tableau, Excel, and business intelligence in the right order with expert guidance.",
    },
    {
      title: "Real Projects & Datasets",
      description: "Work with actual business datasets and build real-world data solutions that go into your portfolio.",
    },
    {
      title: "Live Mock Interviews",
      description: "Practice analytics interview questions with experienced data professionals and get honest feedback.",
    },
    {
      title: "One-on-One Data Mentors",
      description: "Get paired with working data analysts who guide your learning and share industry secrets.",
    },
    {
      title: "Progress Dashboard",
      description: "Track your journey with visual milestones and skill badges as you master each analytics tool.",
    },
    {
      title: "Portfolio Building Support",
      description: "Get help packaging your projects and learning into a portfolio that impresses hiring managers.",
    },
  ];

  const benefits = [
    { emoji: "📊", text: "Master SQL, Python & Tableau - Learn the tools companies actually use" },
    { emoji: "💼", text: "Job-Ready in 3-6 Months - Structured path to landing your first analytics role" },
    { emoji: "🤝", text: "Expert Mentorship - Get guidance from working data analysts" },
    { emoji: "🎯", text: "Interview Confidence - Practice real analytics questions with feedback" },
    { emoji: "📈", text: "Portfolio Ready - Build projects that showcase your skills to employers" },
    { emoji: "🚀", text: "Career Accelerated - Earn more with high-demand analytics skills" },
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Break Into <span className="text-primary">Data Analytics</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Master SQL, Python, and Tableau with expert mentors. Land your first analytics role in 3-6 months with real projects and interview prep.
              </p>
              <Button size="lg" className="gap-2" data-testid="button-start-journey">
                Start Your Data Analytics Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg w-full h-full min-h-[300px] sm:min-h-[400px]">
              <img src={dashboardImg} alt="Data Analytics Dashboard" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            <div>
              <h3 className="text-3xl font-bold mb-4">The Data Analytics Learning Gap</h3>
              <p className="text-lg text-muted-foreground">
                Most aspiring analysts hit these frustrating roadblocks. Tutorials don't cover real-world scenarios. You're not alone in feeling stuck.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg w-full h-full min-h-[300px] sm:min-h-[400px]">
              <img src={mentorImg} alt="Mentor Teaching Data Analytics" className="w-full h-full object-cover" />
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            <div className="rounded-lg overflow-hidden shadow-lg w-full h-full min-h-[300px] sm:min-h-[400px]">
              <img src={analystImg} alt="Data Analyst at Work" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-4">Your Path to Success</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Structured mentorship covering every skill employers want. From SQL fundamentals to advanced dashboards and real-world projects.
              </p>
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
            <div>
              <h3 className="text-3xl font-bold mb-4">What You'll Achieve</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Real, measurable results in your data analytics journey.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg w-full h-full min-h-[300px] sm:min-h-[400px]">
              <img src={teamImg} alt="Data Analytics Team Collaboration" className="w-full h-full object-cover" />
            </div>
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
          <h3 className="text-4xl font-bold mb-4">Ready to Launch Your Analytics Career?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join students landing analytics roles at top companies. Get expert mentorship, real projects, and interview prep all in one place.
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
          <p>Master data analytics with expert mentorship. Start your journey to a high-demand, well-paying career.</p>
        </div>
      </footer>
    </div>
  );
}
