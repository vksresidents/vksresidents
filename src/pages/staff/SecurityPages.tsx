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
  const arrivedRequests = requests.filter((r) => r.actualLeave && r.actualReturn);
  const arrived = arrivedRequests.length;
  const notArrived = requests.filter((r) => r.status === "not_arrived").length;

  return (
    <PortalLayout>
      <section className="container py-10">
        <div className="text-xs uppercase tracking-[0.22em] text-accent">Security Office</div>
        <h1 className="font-display text-4xl mt-2 mb-2">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mb-10">Validate gate passes, mark exits and arrivals. Records auto-flow to monthly and yearly logs.</p>
        <div className="grid sm:grid-cols-4 gap-5">
          <StatCard to="/security/approved" title="Approved gate passes" count={approved} tone="warning" highlight icon={<Stamp className="h-6 w-6" />} description="Awaiting exit from campus." />
          <StatCard to="/security/exited" title="Exited" count={exited} tone="primary" icon={<LogOut className="h-6 w-6" />} description="Awaiting arrival." />
          <StatCard to="/security/arrived" title="Arrived" count={arrived} tone="success" icon={<LogIn className="h-6 w-6" />} description="Who exited & returned." />
          <StatCard to="/security/not-arrived" title="Not arrived" count={notArrived} tone="destructive" icon={<LogOut className="h-6 w-6" />} description="No arrival recorded." />
        </div>
      </section>
    </PortalLayout>
  );
};

const SecuritySection = ({ title, filter, action }: { title: string; filter: (r: PermissionRequest) => boolean; action?: "exit" | "arrive" }) => {
  const { requests, updateRequest } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [sel, setSel] = useState<PermissionRequest | null>(null);

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
    if (search && !`${s?.name} ${s?.regNo} ${p?.name}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (!filterByDate(r)) return false;
    return true;
  }), [requests, filter, search, date]);

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

  const doExit = () => { if (!sel) return; updateRequest(sel.id, { status: "exited", actualLeave: new Date().toISOString() }); toast({ title: "Exit recorded" }); setSel(null); };
  const doArrive = () => { if (!sel) return; updateRequest(sel.id, { status: "arrived", actualReturn: new Date().toISOString() }); toast({ title: "Arrival recorded" }); setSel(null); };

  return (
    <PortalLayout>
      <section className="container py-10">
        <Button variant="ghost" asChild className="-ml-3 mb-4"><Link to="/security"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Link></Button>
        <div className="text-xs uppercase tracking-[0.22em] text-accent">Security Office</div>
        <h1 className="font-display text-4xl mt-2 mb-6">{title}</h1>
        <TableToolbar search={search} onSearch={setSearch} filterDate={date} onFilterDate={setDate} />
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
export const SecurityArrived = () => (
  <SecuritySection title="Leaved and Arrived" filter={(r) => r.actualLeave && r.actualReturn} />
);
export const SecurityNotArrived = () => (
  <SecuritySection title="Not arrived" filter={(r) => r.status === "not_arrived"} />
);
