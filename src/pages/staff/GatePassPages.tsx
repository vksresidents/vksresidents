import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { StatCard } from "@/components/portal/StatCard";
import { RequestTable } from "@/components/portal/RequestTable";
import { TableToolbar } from "@/components/portal/TableToolbar";
import { RequestDetailDialog } from "@/components/portal/RequestDetailDialog";
import { findParent, findStudent, useApp } from "@/store/useApp";
import { Bell, CheckCircle2, Stamp, ArrowLeft } from "lucide-react";
import type { PermissionRequest } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { STUDENTS } from "@/data/mock";

const HOSTELS = Array.from(new Set(STUDENTS.map((s) => s.hostel)));

export const GatePassHome = () => {
  const { user, requests } = useApp();
  const pending = requests.filter((r) => r.status === "pending_gatepass").length;
  const approved = requests.filter((r) => ["approved", "exited", "arrived"].includes(r.status)).length;
  return (
    <PortalLayout>
      <section className="container py-10">
        <div className="text-xs uppercase tracking-[0.22em] text-accent">Gate Pass Issuing Faculty</div>
        <h1 className="font-display text-4xl mt-2 mb-2">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mb-10">Issue gate passes for fully-approved requests.</p>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
          <StatCard to="/gatepass/pending" title="Pending requests" count={pending} tone="warning" highlight icon={<Bell className="h-6 w-6" />} description="Ready for gate pass issuance." />
          <StatCard to="/gatepass/approved" title="Gate pass issued" count={approved} tone="success" icon={<CheckCircle2 className="h-6 w-6" />} />
        </div>
      </section>
    </PortalLayout>
  );
};

const GatePassTable = ({ title, filter, canIssue }: { title: string; filter: (r: PermissionRequest) => boolean; canIssue: boolean }) => {
  const { requests, approve, user } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [hostel, setHostel] = useState("all");
  const [date, setDate] = useState<Date | null>(null);
  const [sel, setSel] = useState<PermissionRequest | null>(null);
  const [confirmIssue, setConfirmIssue] = useState(false);

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

  const rows = useMemo(() => requests.filter(filter).filter((r) => {
    const s = findStudent(r.studentId);
    const p = findParent(r.parentId);
    const q = search.toLowerCase();
    if (q && !`${s?.name} ${s?.regNo} ${p?.name}`.toLowerCase().includes(q)) return false;
    if (type !== "all" && r.type !== type) return false;
    if (hostel !== "all" && s?.hostel !== hostel) return false;
    if (!filterByDate(r)) return false;
    return true;
  }), [requests, filter, search, type, hostel, date]);

  const expectedLeaveRows = useMemo(() => {
    if (!date) return rows;
    return rows.filter((r) => {
      const reqDate = new Date(r.expectedLeave);
      const filterDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const reqDay = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate());
      return reqDay.getTime() === filterDate.getTime();
    });
  }, [rows, date]);

  const expectedReturnRows = useMemo(() => {
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

  return (
    <PortalLayout>
      <section className="container py-10">
        <Button variant="ghost" asChild className="-ml-3 mb-4"><Link to="/gatepass"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Link></Button>
        <div className="text-xs uppercase tracking-[0.22em] text-accent">Gate Pass Issuing Faculty</div>
        <h1 className="font-display text-4xl mt-2 mb-6">{title}</h1>
        <TableToolbar search={search} onSearch={setSearch} filterType={type} onFilterType={setType} filterHostel={hostel} onFilterHostel={setHostel} filterDate={date} onFilterDate={setDate} hostels={HOSTELS} />
        {date ? (
          <div className="space-y-8">
            {expectedLeaveRows.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">Expected Leave</h2>
                <RequestTable rows={expectedLeaveRows} onRowClick={setSel} />
              </div>
            )}
            {expectedReturnRows.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">Expected Return</h2>
                <RequestTable rows={expectedReturnRows} onRowClick={setSel} />
              </div>
            )}
            {actualLeavedRows.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">Leaved</h2>
                <RequestTable rows={actualLeavedRows} onRowClick={setSel} />
              </div>
            )}
            {actualReturnedRows.length > 0 && (
              <div>
                <h2 className="font-display text-2xl mb-4">Returned</h2>
                <RequestTable rows={actualReturnedRows} onRowClick={setSel} />
              </div>
            )}
            {expectedLeaveRows.length === 0 && expectedReturnRows.length === 0 && actualLeavedRows.length === 0 && actualReturnedRows.length === 0 && (
              <div className="surface-card p-10 text-center text-muted-foreground">No records found for the selected date.</div>
            )}
          </div>
        ) : (
          <RequestTable rows={rows} onRowClick={setSel} />
        )}
        <RequestDetailDialog
          request={sel}
          open={!!sel && !confirmIssue}
          onOpenChange={() => setSel(null)}
          actions={canIssue && sel && (
            <Button onClick={() => setConfirmIssue(true)} className="bg-gradient-hero text-primary-foreground">
              <Stamp className="h-4 w-4 mr-1.5" /> Issue Gate Pass
            </Button>
          )}
        />
        <Dialog open={confirmIssue} onOpenChange={setConfirmIssue}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to issue this gate pass?</DialogTitle>
              <DialogDescription>The student will be cleared to exit.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmIssue(false)}>Go back</Button>
              <Button onClick={() => { if (!sel) return; approve(sel.id, "gatepass", user?.name || "Gate Pass"); toast({ title: "Gate Pass Issued" }); setConfirmIssue(false); setSel(null); }} className="bg-gradient-hero text-primary-foreground">Yes, issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </PortalLayout>
  );
};

export const GatePassPending = () => (
  <GatePassTable title="Pending requests" filter={(r) => r.status === "pending_gatepass"} canIssue />
);
export const GatePassApproved = () => (
  <GatePassTable title="Gate pass issued" filter={(r) => ["approved", "exited", "arrived"].includes(r.status)} canIssue={false} />
);
