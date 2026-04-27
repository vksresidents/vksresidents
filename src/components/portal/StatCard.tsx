import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PeopleGroup {
  label: string;
  names: string[];
}

interface Props {
  to: string;
  title: string;
  count?: number | string;
  description?: string;
  icon: ReactNode;
  tone?: "primary" | "success" | "warning" | "destructive" | "accent";
  highlight?: boolean;
  people?: PeopleGroup[];
}

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  primary: "from-primary/10 to-primary/0 text-primary",
  success: "from-success/15 to-success/0 text-success",
  warning: "from-warning/20 to-warning/0 text-warning",
  destructive: "from-destructive/15 to-destructive/0 text-destructive",
  accent: "from-accent/15 to-accent/0 text-accent",
};

export const StatCard = ({ to, title, count, description, icon, tone = "primary", highlight, people }: Props) => (
  <Link to={to} className="group block">
    <div
      className={cn(
        "stat-card relative overflow-hidden",
        highlight && "ring-leaf border-primary/30"
      )}
    >
      <div className={cn("absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-80", toneMap[tone])} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
          {count !== undefined && (
            <div className="font-display text-5xl mt-2 text-foreground">{count}</div>
          )}
          {description && <div className="text-sm text-muted-foreground mt-2 max-w-xs">{description}</div>}
          {people && people.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/50">
              {people.map((group, idx) => (
                <div key={idx} className="space-y-2 mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-foreground/70">{group.label}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <tbody>
                        {group.names.map((name, i) => (
                          <tr key={i} className="border-b border-border/30 last:border-b-0">
                            <td className="py-2 px-1 text-foreground/80">
                              <span className="text-success mr-2">✓</span>
                              <span>{name}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3 bg-background/70 backdrop-blur ring-1 ring-border flex-shrink-0", toneMap[tone])}>
          {icon}
        </div>
      </div>
      <div className="relative mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
        Open <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  </Link>
);
