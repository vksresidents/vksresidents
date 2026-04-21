import { findParent, findStudent } from "@/store/useApp";
import { PERMISSION_LABELS, type PermissionRequest } from "@/types/domain";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { Stethoscope, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (s?: string) => (s ? format(new Date(s), "dd MMM · HH:mm") : "—");

interface Col { key: string; label: string; }
const ALL_COLS: Col[] = [
  { key: "parent", label: "Parent" },
  { key: "reg", label: "Reg. No." },
  { key: "student", label: "Student" },
  { key: "hostel", label: "Hostel · Floor" },
  { key: "room", label: "Room" },
  { key: "type", label: "Permission" },
  { key: "count", label: "#" },
  { key: "destination", label: "Destination" },
  { key: "expLeave", label: "Exp. Leave" },
  { key: "expReturn", label: "Exp. Return" },
  { key: "actLeave", label: "Act. Leave" },
  { key: "actReturn", label: "Act. Return" },
  { key: "medical", label: "Med." },
  { key: "status", label: "Status" },
];

export const RequestTable = ({
  rows,
  onRowClick,
  showActuals = true,
  rejection = false,
  onApprove,
  onReject,
  approveLabel = "Approve",
}: {
  rows: PermissionRequest[];
  onRowClick?: (r: PermissionRequest) => void;
  showActuals?: boolean;
  rejection?: boolean;
  onApprove?: (r: PermissionRequest) => void;
  onReject?: (r: PermissionRequest) => void;
  approveLabel?: string;
}) => {
  const cols = ALL_COLS.filter((c) => (showActuals ? true : c.key !== "actLeave" && c.key !== "actReturn"));
  const showActions = !!(onApprove || onReject);
  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/70 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {cols.map((c) => (
                <th key={c.key} className="text-left font-medium px-4 py-3 whitespace-nowrap">{c.label}</th>
              ))}
              {rejection && <th className="text-left font-medium px-4 py-3">Reason</th>}
              {showActions && <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={cols.length + (rejection ? 1 : 0) + (showActions ? 1 : 0)} className="px-4 py-12 text-center text-muted-foreground">No records found.</td></tr>
            )}
            {rows.map((r) => {
              const s = findStudent(r.studentId);
              const p = findParent(r.parentId);
              return (
                <tr
                  key={r.id}
                  onClick={() => onRowClick?.(r)}
                  className="border-t border-border/60 hover:bg-secondary/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{p?.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s?.regNo}</td>
                  <td className="px-4 py-3 font-medium">{s?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{s?.hostel} · {s?.floor}</td>
                  <td className="px-4 py-3">{s?.room}</td>
                  <td className="px-4 py-3">{PERMISSION_LABELS[r.type]}</td>
                  <td className="px-4 py-3 text-center">{r.permissionCount}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{r.destination}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmt(r.expectedLeave)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmt(r.expectedReturn)}</td>
                  {showActuals && <td className="px-4 py-3 whitespace-nowrap">{fmt(r.actualLeave)}</td>}
                  {showActuals && <td className="px-4 py-3 whitespace-nowrap">{fmt(r.actualReturn)}</td>}
                  <td className="px-4 py-3 text-center">{r.medical ? <Stethoscope className="h-4 w-4 text-destructive inline" /> : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  {rejection && <td className="px-4 py-3 text-destructive max-w-[260px]">{r.rejectionReason}</td>}
                  {showActions && (
                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {onApprove && (
                          <Button size="sm" onClick={() => onApprove(r)} className="bg-gradient-hero text-primary-foreground h-8">
                            <Check className="h-3.5 w-3.5 mr-1" />{approveLabel}
                          </Button>
                        )}
                        {onReject && (
                          <Button size="sm" variant="outline" onClick={() => onReject(r)} className="text-destructive border-destructive/40 hover:bg-destructive/10 h-8">
                            <X className="h-3.5 w-3.5 mr-1" />Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
