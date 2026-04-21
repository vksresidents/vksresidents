import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  to: string;
  title: string;
  count?: number | string;
  description?: string;
  icon: ReactNode;
  tone?: "primary" | "success" | "warning" | "destructive" | "accent";
  highlight?: boolean;
}

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  primary: "from-primary/10 to-primary/0 text-primary",
  success: "from-success/15 to-success/0 text-success",
  warning: "from-warning/20 to-warning/0 text-warning",
  destructive: "from-destructive/15 to-destructive/0 text-destructive",
  accent: "from-accent/15 to-accent/0 text-accent",
};

export const StatCard = ({ to, title, count, description, icon, tone = "primary", highlight }: Props) => (
  <Link to={to} className="group block">
    <div
      className={cn(
        "stat-card relative overflow-hidden",
        highlight && "ring-leaf border-primary/30"
      )}
    >
      <div className={cn("absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-80", toneMap[tone])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
          {count !== undefined && (
            <div className="font-display text-5xl mt-2 text-foreground">{count}</div>
          )}
          {description && <div className="text-sm text-muted-foreground mt-2 max-w-xs">{description}</div>}
        </div>
        <div className={cn("rounded-xl p-3 bg-background/70 backdrop-blur ring-1 ring-border", toneMap[tone])}>
          {icon}
        </div>
      </div>
      <div className="relative mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
        Open <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  </Link>
);
