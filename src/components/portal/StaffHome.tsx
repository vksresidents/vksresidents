import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { StatCard } from "@/components/portal/StatCard";
import { useApp } from "@/store/useApp";
import { ROLE_LABELS, type Role } from "@/types/domain";
import { Bell, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  role: Role;
  pendingStatus: string;
  basePath: string;
  approvalWindow?: { start: string; end: string };
  showRejected?: boolean;
  showNotArrived?: boolean;
}

const isWindowOpen = (start: string, end: string) => {
  const now = new Date();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= sh * 60 + sm && cur <= eh * 60 + em;
};

export const StaffHome = ({ role, pendingStatus, basePath, approvalWindow, showRejected = true, showNotArrived = false }: Props) => {
  const { user, requests } = useApp();
  const navigate = useNavigate();
  const [now] = useState(new Date());

  const pending = requests.filter((r) => r.status === pendingStatus).length;
  const approved = requests.filter((r) => ["approved", "exited", "arrived"].includes(r.status)).length;
  const rejected = requests.filter((r) => r.status === "rejected").length;
  const notArrived = requests.filter((r) => r.status === "not_arrived").length;
  const windowOpen = approvalWindow ? isWindowOpen(approvalWindow.start, approvalWindow.end) : true;

  return (
    <PortalLayout>
      <section className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-accent">{ROLE_LABELS[role]}</div>
            <h1 className="font-display text-4xl mt-2">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Today · {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          {approvalWindow && (
            <div className="surface-card px-5 py-4 min-w-[260px]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Clock className="h-4 w-4" /> Approval Window</div>
              <div className="font-display text-2xl mt-1">{approvalWindow.start} – {approvalWindow.end}</div>
              <Badge className={windowOpen ? "bg-success text-success-foreground mt-1" : "bg-destructive text-destructive-foreground mt-1"}>
                {windowOpen ? "Open" : "Closed"}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            to={`${basePath}/pending`}
            title="Pending requests"
            count={pending}
            tone="warning"
            highlight
            icon={<Bell className="h-6 w-6" />}
            description="New requests awaiting your action."
          />
          <StatCard
            to={`${basePath}/approved`}
            title="Approved (Gate Pass)"
            count={approved}
            tone="success"
            icon={<CheckCircle2 className="h-6 w-6" />}
          />
          {showRejected && (
            <StatCard
              to={`${basePath}/rejected`}
              title="Rejected requests"
              count={rejected}
              tone="destructive"
              icon={<XCircle className="h-6 w-6" />}
            />
          )}
          {showNotArrived && (
            <StatCard
              to={`${basePath}/not-arrived`}
              title="Not arrived"
              count={notArrived}
              tone="destructive"
              icon={<AlertTriangle className="h-6 w-6" />}
            />
          )}
        </div>
      </section>
    </PortalLayout>
  );
};
