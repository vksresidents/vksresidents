import { useMemo, useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { RequestTable } from "@/components/portal/RequestTable";
import { TableToolbar } from "@/components/portal/TableToolbar";
import { RequestDetailDialog } from "@/components/portal/RequestDetailDialog";
import { findParent, findStudent, useApp } from "@/store/useApp";
import type { PermissionRequest, Role, RequestStatus } from "@/types/domain";
import { ROLE_LABELS } from "@/types/domain";
import { STUDENTS } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  role: Role;
  title: string;
  basePath: string;
  filter: (r: PermissionRequest) => boolean;
  variant: "pending" | "approved" | "rejected" | "not_arrived";
  /** override the rejection action label (e.g. for warden 'mark not arrived') */
}

const HOSTELS = Array.from(new Set(STUDENTS.map((s) => s.hostel)));

export const StaffTablePage = ({ role, title, basePath, filter, variant }: Props) => {
  const { user, requests, approve, reject, updateRequest } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [hostel, setHostel] = useState("all");
  const [date, setDate] = useState<Date | null>(null);
  const [sel, setSel] = useState<PermissionRequest | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [reason, setReason] = useState("");

  const dateToCompare = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  const filterByDate = (r: PermissionRequest) => {
    if (!date) return true;
    const filterDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return dateToCompare(r.expectedLeave) === filterDate || dateToCompare(r.expectedReturn) === filterDate || dateToCompare(r.actualLeave) === filterDate || dateToCompare(r.actualReturn) === filterDate;
  };

  const rows = useMemo(() => {
    return requests
      .filter(filter)
      .filter((r) => {
        const s = findStudent(r.studentId);
        const p = findParent(r.parentId);
        const q = search.toLowerCase();
        if (q && !`${s?.name} ${s?.regNo} ${p?.name}`.toLowerCase().includes(q)) return false;
        if (type !== "all" && r.type !== type) return false;
        if (hostel !== "all" && s?.hostel !== hostel) return false;
        if (!date && !filterByDate(r)) return false;
        return true;
      });
  }, [requests, filter, search, type, hostel, date]);

  const handleConfirmApprove = () => {
    if (!sel) return;
    approve(sel.id, role, user?.name || ROLE_LABELS[role]);
    toast({ title: "Approved", description: `Forwarded to next approver.` });
    setConfirmApprove(false);
    setSel(null);
  };

  const openReject = (r: PermissionRequest) => {
    setSel(r);
    setRejectOpen(true);
  };
  const handleReject = () => {
    setRejectOpen(false);
    setConfirmReject(true);
  };
  const handleConfirmReject = () => {
    if (!sel || !reason.trim()) return;
    reject(sel.id, role, reason.trim());
    toast({ title: "Rejected", description: "Reason recorded; parent will see it." });
    setConfirmReject(false);
    setReason("");
    setSel(null);
  };

  const handleMarkNotArrived = () => {
    if (!sel) return;
    updateRequest(sel.id, { status: "not_arrived" });
    toast({ title: "Marked as not arrived" });
    setSel(null);
  };

  const pendingActions = variant === "pending" && sel && (
    <>
      <Button variant="outline" onClick={() => setRejectOpen(true)} className="text-destructive border-destructive/40 hover:bg-destructive/10">
        <X className="h-4 w-4 mr-1.5" /> Reject
      </Button>
      <Button onClick={() => setConfirmApprove(true)} className="bg-gradient-hero text-primary-foreground">
        <Check className="h-4 w-4 mr-1.5" /> Approve
      </Button>
    </>
  );

  const notArrivedActions = variant === "not_arrived" && sel && role === "warden" && (
    <Button onClick={handleMarkNotArrived} variant="outline" className="text-destructive border-destructive/40">
      <X className="h-4 w-4 mr-1.5" /> Mark as Not Arrived
    </Button>
  );

  // Split rows by date filter
  const leavedRows = useMemo(() => {
    if (!date) return rows;
    return rows.filter((r) => {
      const reqDate = new Date(r.expectedLeave);
      const filterDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const reqDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());
      return reqDay.getTime() === filterDate.getTime();
    });
  }, [rows, date]);

  const arrivedRows = useMemo(() => {
    if (!date) return [];
    return rows.filter((r) => {
      const reqDate = new Date(r.expectedReturn);
      const filterDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const reqDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());
      return reqDay.getTime() === filterDate.getTime();
    });
  }, [rows, date]);

  const actualLeavedRows = useMemo(() => {
    if (!date) return [];
    return rows.filter((r) => {
      if (!r.actualLeave) return false;
      const reqDate = new Date(r.actualLeave);
      const filterDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const reqDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());
      return reqDay.getTime() === filterDate.getTime();
    });
  }, [rows, date]);

  const actualReturnedRows = useMemo(() => {
    if (!date) return [];
    return rows.filter((r) => {
      if (!r.actualReturn) return false;
      const reqDate = new Date(r.actualReturn);
      const filterDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const reqDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());
      return reqDay.getTime() === filterDate.getTime();
    });
  }, [rows, date]);

  const displayRows = date ? leavedRows : rows;

  return (
    <PortalLayout>
      <section className="container py-10">
        <Button variant="ghost" asChild className="-ml-3 mb-4"><Link to={basePath}><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Link></Button>
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">{ROLE_LABELS[role]}</div>
          <h1 className="font-display text-4xl mt-2">{title}</h1>
        </div>
        <TableToolbar
          search={search}
          onSearch={setSearch}
          filterType={type}
          onFilterType={setType}
          filterHostel={hostel}
          onFilterHostel={setHostel}
          filterDate={date}
          onFilterDate={setDate}
          hostels={HOSTELS}
        />
        {date ? (
          <div className="space-y-8">
            {leavedRows.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">
                  Expected Leave
                </h2>
                <RequestTable
                  rows={leavedRows}
                  onRowClick={setSel}
                  rejection={variant === "rejected"}
                />
              </div>
            )}
            {arrivedRows.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">
                  Expected Return
                </h2>
                <RequestTable
                  rows={arrivedRows}
                  onRowClick={setSel}
                  rejection={variant === "rejected"}
                />
              </div>
            )}
            {actualLeavedRows.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">Leaved</h2>
                <RequestTable
                  rows={actualLeavedRows}
                  onRowClick={setSel}
                  rejection={variant === "rejected"}
                />
              </div>
            )}
            {actualReturnedRows.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">Returned</h2>
                <RequestTable
                  rows={actualReturnedRows}
                  onRowClick={setSel}
                  rejection={variant === "rejected"}
                />
              </div>
            )}
            {leavedRows.length === 0 && arrivedRows.length === 0 && actualLeavedRows.length === 0 && actualReturnedRows.length === 0 && (
              <div className="surface-card p-10 text-center text-muted-foreground">No records found for the selected date.</div>
            )}
          </div>
        ) : (
          <RequestTable
            rows={rows}
            onRowClick={setSel}
            rejection={variant === "rejected"}
          />
        )}

        <RequestDetailDialog request={sel} open={!!sel && !rejectOpen && !confirmReject && !confirmApprove} onOpenChange={() => setSel(null)} actions={<>{pendingActions}{notArrivedActions}</>} />

        <Dialog open={confirmApprove} onOpenChange={setConfirmApprove}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to approve?</DialogTitle>
              <DialogDescription>The request will be forwarded to the next approver.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmApprove(false)}>Go back</Button>
              <Button onClick={handleConfirmApprove} className="bg-gradient-hero text-primary-foreground">Yes, approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reason for rejection</DialogTitle>
              <DialogDescription>This reason will be shown to the parent.</DialogDescription>
            </DialogHeader>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter the reason…" rows={4} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
              <Button onClick={handleReject} disabled={!reason.trim()} variant="destructive">Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmReject} onOpenChange={setConfirmReject}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to reject?</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmReject(false)}>Go back</Button>
              <Button variant="destructive" onClick={handleConfirmReject}>Yes, reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </PortalLayout>
  );
};

export const isPendingFor = (status: RequestStatus) => (r: PermissionRequest) => r.status === status;
