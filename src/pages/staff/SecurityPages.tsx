import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { StatCard } from "@/components/portal/StatCard";
import { RequestTable } from "@/components/portal/RequestTable";
import { TableToolbar } from "@/components/portal/TableToolbar";
import { findParent, findStudent, useApp } from "@/store/useApp";
import { LogOut, LogIn, Stamp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PermissionRequest } from "@/types/domain";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RequestDetailDialog } from "@/components/portal/RequestDetailDialog";

export const SecurityHome = () => {
  const { user, requests } = useApp();
  const approved = requests.filter((r) => r.status === "approved").length;
  const exited = requests.filter((r) => r.status === "exited").length;
  const arrived = requests.filter((r) => r.status === "arrived").length;
  return (
    <PortalLayout>
      <section className="container py-10">
        <div className="text-xs uppercase tracking-[0.22em] text-accent">Security Office</div>
        <h1 className="font-display text-4xl mt-2 mb-2">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mb-10">Validate gate passes, mark exits and arrivals. Records auto-flow to monthly and yearly logs.</p>
        <div className="grid sm:grid-cols-3 gap-5">
          <StatCard to="/security/approved" title="Approved gate passes" count={approved} tone="warning" highlight icon={<Stamp className="h-6 w-6" />} description="Awaiting exit from campus." />
          <StatCard to="/security/exited" title="Exited & arrived" count={exited + arrived} tone="success" icon={<LogIn className="h-6 w-6" />} />
          <StatCard to="/security/not-arrived" title="Not arrived" count={requests.filter((r) => r.status === "not_arrived").length} tone="destructive" icon={<LogOut className="h-6 w-6" />} />
        </div>
      </section>
    </PortalLayout>
  );
};

const SecuritySection = ({ title, filter, action }: { title: string; filter: (r: PermissionRequest) => boolean; action?: "exit" | "arrive" }) => {
  const { requests, updateRequest } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<PermissionRequest | null>(null);

  const rows = useMemo(() => requests.filter(filter).filter((r) => {
    const s = findStudent(r.studentId);
    const p = findParent(r.parentId);
    return !search || `${s?.name} ${s?.regNo} ${p?.name}`.toLowerCase().includes(search.toLowerCase());
  }), [requests, filter, search]);

  const doExit = () => { if (!sel) return; updateRequest(sel.id, { status: "exited", actualLeave: new Date().toISOString() }); toast({ title: "Exit recorded" }); setSel(null); };
  const doArrive = () => { if (!sel) return; updateRequest(sel.id, { status: "arrived", actualReturn: new Date().toISOString() }); toast({ title: "Arrival recorded" }); setSel(null); };

  return (
    <PortalLayout>
      <section className="container py-10">
        <Button variant="ghost" asChild className="-ml-3 mb-4"><Link to="/security"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Link></Button>
        <div className="text-xs uppercase tracking-[0.22em] text-accent">Security Office</div>
        <h1 className="font-display text-4xl mt-2 mb-6">{title}</h1>
        <TableToolbar search={search} onSearch={setSearch} />
        <RequestTable rows={rows} onRowClick={setSel} />
        <RequestDetailDialog
          request={sel}
          open={!!sel}
          onOpenChange={() => setSel(null)}
          actions={
            action === "exit" ? (
              <Button onClick={doExit} className="bg-gradient-hero text-primary-foreground"><LogOut className="h-4 w-4 mr-1.5" />Mark Exited</Button>
            ) : action === "arrive" ? (
              <Button onClick={doArrive} className="bg-gradient-hero text-primary-foreground"><LogIn className="h-4 w-4 mr-1.5" />Mark Arrived</Button>
            ) : null
          }
        />
      </section>
    </PortalLayout>
  );
};

export const SecurityApproved = () => (
  <SecuritySection title="Approved · awaiting exit" filter={(r) => r.status === "approved"} action="exit" />
);
export const SecurityExited = () => (
  <SecuritySection title="Exited · awaiting arrival" filter={(r) => r.status === "exited"} action="arrive" />
);
export const SecurityNotArrived = () => (
  <SecuritySection title="Not arrived" filter={(r) => r.status === "not_arrived"} />
);
