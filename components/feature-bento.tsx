import type { ComponentType, SVGProps } from "react";
import {
  Users,
  BarChart2,
  Shield,
  FileText,
  Smartphone,
  CheckSquare,
} from "lucide-react";

const FEATURES = [
  {
    id: "registry",
    title: "Candidate Registry",
    desc: "Centralized registry for candidates with profiles, photos, and positions.",
    icon: Users,
    size: "large",
  },
  {
    id: "realtime",
    title: "Real‑Time Turnout",
    desc: "Live vote counts, participation metrics and realtime updates.",
    icon: BarChart2,
    size: "medium",
  },
  {
    id: "approval",
    title: "Approval Workflows",
    desc: "Multi-step approvals for applications and candidate vetting.",
    icon: CheckSquare,
    size: "small",
  },
  {
    id: "rbac",
    title: "RBAC & Permissions",
    desc: "Flexible roles for officers, admins and auditors with fine-grained access.",
    icon: Shield,
    size: "medium",
  },
  {
    id: "audit",
    title: "Audit Logs",
    desc: "Tamper-evident event history for compliance and investigations.",
    icon: FileText,
    size: "small",
  },
  {
    id: "mobile",
    title: "Mobile Friendly",
    desc: "Responsive voting, notifications, and scheduling across any device.",
    icon: Smartphone,
    size: "medium",
  },
];

type FeatureItem = (typeof FEATURES)[number];
type FeatureIcon = ComponentType<SVGProps<SVGSVGElement>>;

function Tile({ feature }: { feature: FeatureItem }) {
  const { icon: IconRaw, title, desc, id } = feature;
  const Icon = IconRaw as FeatureIcon;

  if (id === "registry") {
    return (
      <div className="relative h-full rounded-2xl overflow-hidden shadow-xl bg-linear-to-br from-blue-500 via-blue-600 to-blue-700">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15" />
        <div className="absolute -right-6 top-10 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative p-10 md:p-14 text-white h-full flex flex-col justify-between">
          <div className="w-16 h-16 bg-white/15 rounded-md flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight">
              {title}
            </h3>
            <p className="mt-4 max-w-lg text-base md:text-lg opacity-95">
              {desc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tone =
    id === "approval"
      ? {
          card: "bg-blue-900 text-white",
          icon: "bg-white/10 text-white",
          title: "text-white",
          desc: "text-white/70",
          bubble: "bg-white/10",
        }
      : id === "mobile"
        ? {
            card: "bg-blue-200 text-slate-900",
            icon: "bg-white/60 text-blue-700",
            title: "text-blue-900",
            desc: "text-blue-800",
            bubble: "bg-white/40",
          }
        : id === "rbac"
          ? {
              card: "bg-blue-100 text-slate-900",
              icon: "bg-white/70 text-blue-700",
              title: "text-blue-900",
              desc: "text-blue-800",
              bubble: "bg-white/60",
            }
          : id === "audit"
            ? {
                card: "bg-blue-50 text-slate-900",
                icon: "bg-white text-blue-700",
                title: "text-blue-900",
                desc: "text-blue-800",
                bubble: "bg-blue-100/70",
              }
            : id === "realtime"
              ? {
                  card: "bg-blue-300 text-slate-900",
                  icon: "bg-white/60 text-blue-800",
                  title: "text-blue-950",
                  desc: "text-blue-900",
                  bubble: "bg-white/50",
                }
              : {
                  card: "bg-blue-400 text-white",
                  icon: "bg-white/15 text-white",
                  title: "text-white",
                  desc: "text-white/80",
                  bubble: "bg-white/15",
                };

  const common =
    "relative h-full rounded-xl shadow-lg p-6 overflow-hidden border border-white/30";
  return (
    <div className={`${common} ${tone.card}`}>
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full ${tone.bubble}`}
      />
      <div
        className={`absolute -right-4 top-10 h-20 w-20 rounded-full ${tone.bubble}`}
      />
      <div className="relative h-full flex flex-col justify-between">
        <div
          className={`w-14 h-14 flex items-center justify-center rounded-md ${tone.icon}`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${tone.title}`}>{title}</h3>
          <p className={`text-base mt-3 ${tone.desc}`}>{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function FeatureBento() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          Plenum Highlights
        </h2>
        <p className="text-muted-foreground mt-2">
          Core features that power modern campus elections
        </p>
      </div>
      <div className="max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-6 md:grid-rows-3 gap-6 md:gap-6">
          {/* 0: large left-top (col 1-2, row 1-2) */}
          <div className="col-start-1 row-start-1 col-span-2 row-span-2 md:col-start-1 md:row-start-1 md:col-span-2 md:row-span-2">
            <Tile feature={FEATURES[0]} />
          </div>

          {/* 1: bottom-left (col 1-2, row 3) */}
          <div className="col-start-1 row-start-3 col-span-2 md:col-start-1 md:row-start-3 md:col-span-2 md:row-span-1">
            <Tile feature={FEATURES[1]} />
          </div>

          {/* 2: top-right small (col 3, row 1) */}
          <div className="col-start-2 row-start-4 md:col-start-3 md:row-start-1 md:col-span-1 md:row-span-1">
            <Tile feature={FEATURES[2]} />
          </div>

          {/* 3: right middle small (col 3, row 2) */}
          <div className="col-start-2 row-start-5 md:col-start-3 md:row-start-2 md:col-span-1 md:row-span-1">
            <Tile feature={FEATURES[3]} />
          </div>

          {/* 4: bottom-right wide (col 3-4, row 3) */}
          <div className="col-start-1 row-start-6 col-span-2 md:col-start-3 md:row-start-3 md:col-span-2 md:row-span-1">
            <Tile feature={FEATURES[4]} />
          </div>

          {/* 5: far right tall (col 4, row 1-2) */}
          <div className="col-start-1 row-start-4 row-span-2 md:col-start-4 md:row-start-1 md:col-span-1 md:row-span-2">
            <Tile feature={FEATURES[5]} />
          </div>
        </div>
      </div>
    </section>
  );
}
