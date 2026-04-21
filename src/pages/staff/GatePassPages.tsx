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
        <p className="text-muted-foreground mb-10">Issue gate passes for fully-approved requests. No rejection workflow on this desk.</p>
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
  const [sel, setSel] = useState<PermissionRequest | null>(null);
  const [confirmIssue, setConfirmIssue] = useState(false);

  const rows = useMemo(() => requests.filter(filter).filter((r) => {
    const s = findStudent(r.studentId);
    const p = findParent(r.parentId);
    const q = search.toLowerCase();
    if (q && !`${s?.name} ${s?.regNo} ${p?.name}`.toLowerCase().includes(q)) return false;
    if (type !== "all" && r.type !== type) return false;
    if (hostel !== "all" && s?.hostel !== hostel) return false;
    return true;
  }), [requests, filter, search, type, hostel]);

  return (
    <PortalLayout>
      <section className="container py-10">
        <Button variant="ghost" asChild className="-ml-3 mb-4"><Link to="/gatepass"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Link></Button>
        <div className="text-xs uppercase tracking-[0.22em] text-accent">Gate Pass Issuing Faculty</div>
        <h1 className="font-display text-4xl mt-2 mb-6">{title}</h1>
        <TableToolbar search={search} onSearch={setSearch} filterType={type} onFilterType={setType} filterHostel={hostel} onFilterHostel={setHostel} hostels={HOSTELS} />
        <RequestTable rows={rows} onRowClick={setSel} />
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
