import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/domain";

const map: Record<RequestStatus, { label: string; className: string }> = {
  pending_hod: { label: "Pending · HOD", className: "bg-warning/15 text-warning" },
  pending_dean: { label: "Pending · Dean", className: "bg-warning/15 text-warning" },
  pending_warden: { label: "Pending · Warden", className: "bg-warning/15 text-warning" },
  pending_gatepass: { label: "Pending · Gate Pass", className: "bg-warning/15 text-warning" },
  approved: { label: "Gate Pass Issued", className: "bg-success/15 text-success" },
  exited: { label: "Student Exited", className: "bg-accent/15 text-accent" },
  arrived: { label: "Arrived", className: "bg-success/15 text-success" },
  not_arrived: { label: "Not Arrived", className: "bg-destructive/15 text-destructive" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive" },
};

export const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const v = map[status];
  return <span className={cn("chip", v.className)}>{v.label}</span>;
};
