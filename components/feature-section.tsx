import { Zap, Bell, Globe } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Easy To Use",
    description:
      "Intuitive interface that makes managing elections simple for administrators and voting effortless for students.",
  },
  {
    icon: Bell,
    title: "Real-Time Updates",
    description:
      "Live notifications and instant updates on election progress, vote counts, and participation rates.",
  },
  {
    icon: Globe,
    title: "Multi-Session Support",
    description:
      "Manage multiple elections simultaneously with session-specific candidates, voters, and configurations.",
  },
];

function FeatureSection() {
  return (
    <section className="flex flex-col items-center py-16 px-4 relative overflow-hidden bg-gradient-to-b from-black to-transparent">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white">Why Plenum</h2>
        <p className="text-white/70 mt-2">
          Built specifically for student organizations with everything you need
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-center text-center bg-card border border-border rounded-xl p-6 space-y-3"
          >
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="size-6 text-primary" />
            </div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureSection;
