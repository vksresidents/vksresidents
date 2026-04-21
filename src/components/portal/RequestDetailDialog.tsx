import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { findParent, findStudent } from "@/store/useApp";
import { PERMISSION_LABELS, type PermissionRequest } from "@/types/domain";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { ReactNode } from "react";

const fmt = (s?: string) => (s ? format(new Date(s), "PP · p") : "—");

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="grid grid-cols-[10rem_1fr] gap-3 py-2 border-b border-border/50 last:border-0">
    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-sm text-foreground">{value}</div>
  </div>
);

export const RequestDetailDialog = ({
  request,
  open,
  onOpenChange,
  actions,
}: {
  request: PermissionRequest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  actions?: ReactNode;
}) => {
  if (!request) return null;
  const student = findStudent(request.studentId);
  const parent = findParent(request.parentId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-3">
            Request #{request.id}
            <StatusBadge status={request.status} />
          </DialogTitle>
          <DialogDescription>Full details of this permission request.</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-x-8">
          <div>
            <Row label="Student" value={student?.name} />
            <Row label="Reg. No." value={student?.regNo} />
            <Row label="Department" value={student?.department} />
            <Row label="Hostel" value={`${student?.hostel} · ${student?.floor}`} />
            <Row label="Room" value={student?.room} />
            <Row label="Shift" value={`Shift ${student?.shift}`} />
          </div>
          <div>
            <Row label="Parent" value={parent?.name} />
            <Row label="Contact" value={parent?.phone} />
            <Row label="Email" value={parent?.email} />
            <Row label="Permission" value={PERMISSION_LABELS[request.type]} />
            <Row label="Medical" value={request.medical ? "Yes" : "No"} />
            <Row label="Count" value={`#${request.permissionCount} this semester`} />
          </div>
        </div>
        <div className="mt-2">
          <Row label="Destination" value={request.destination} />
          <Row label="Expected Leave" value={fmt(request.expectedLeave)} />
          <Row label="Expected Return" value={fmt(request.expectedReturn)} />
          <Row label="Actual Leave" value={fmt(request.actualLeave)} />
          <Row label="Actual Return" value={fmt(request.actualReturn)} />
          {request.rejectionReason && (
            <Row label="Rejection" value={<span className="text-destructive">{request.rejectionReason} <span className="text-muted-foreground">— by {request.rejectedBy}</span></span>} />
          )}
        </div>
        {actions && <div className="mt-4 flex flex-wrap gap-2 justify-end">{actions}</div>}
      </DialogContent>
    </Dialog>
  );
};
