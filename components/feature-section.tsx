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

const cardTones = [
  {
    card: "bg-blue-900 text-white",
    icon: "bg-white/10 text-white",
    title: "text-white",
    desc: "text-white/70",
    accent: "bg-white/10",
  },
  {
    card: "bg-blue-700 text-white",
    icon: "bg-white/15 text-white",
    title: "text-white",
    desc: "text-white/80",
    accent: "bg-white/15",
  },
  {
    card: "bg-blue-300 text-blue-950",
    icon: "bg-white/70 text-blue-800",
    title: "text-blue-950",
    desc: "text-blue-900",
    accent: "bg-white/60",
  },
];

function FeatureSection() {
  return (
    <section className="flex flex-col items-center py-16 px-4 relative overflow-hidden bg-linear-to-b from-black to-transparent">
      <div className="text-center mb-10 relative">
        <h2 className="text-3xl font-bold text-white">Why Plenum</h2>
        <p className="text-white/70 mt-2">
          Built specifically for student organizations with everything you need
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full relative">
        {features.map(({ icon: Icon, title, description }, index) => {
          const tone = cardTones[index % cardTones.length];
          return (
            <div
              key={title}
              className={`relative h-full rounded-xl shadow-lg p-7 overflow-hidden border border-white/20 ${tone.card}`}
            >
              <div
                className={`absolute -left-8 -bottom-8 h-20 w-32 rotate-12 rounded-md ${tone.accent}`}
              />
              <div
                className={`size-12 ${tone.icon} flex items-center justify-center rounded-md relative`}
              >
                <Icon className="size-6" />
              </div>
              <p className={`mt-4 text-lg font-semibold ${tone.title}`}>
                {title}
              </p>
              <p className={`text-sm mt-2 ${tone.desc}`}>{description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeatureSection;
