import { PortalLayout } from "@/components/portal/PortalLayout";
import { RequestTable } from "@/components/portal/RequestTable";
import { TableToolbar } from "@/components/portal/TableToolbar";
import { useApp } from "@/store/useApp";
import { useState, useMemo } from "react";
import { RequestDetailDialog } from "@/components/portal/RequestDetailDialog";
import type { PermissionRequest } from "@/types/domain";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ParentApproved = () => {
  const { user, requests } = useApp();
  const allRows = requests.filter((r) => r.parentId === user?.parentId && ["approved", "exited", "arrived"].includes(r.status));
  const [sel, setSel] = useState<PermissionRequest | null>(null);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const navigate = useNavigate();

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
    return allRows.filter((r) => {
      const q = search.toLowerCase();
      if (q && !`${r.destination}`.toLowerCase().includes(q)) return false;
      if (!filterByDate(r)) return false;
      return true;
    });
  }, [allRows, search, date]);

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">Parent Portal</div>
          <h1 className="font-display text-4xl mt-2">Approved requests</h1>
        </div>
        <TableToolbar
          search={search}
          onSearch={setSearch}
          filterDate={date}
          onFilterDate={setDate}
        />
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
        <RequestDetailDialog request={sel} open={!!sel} onOpenChange={() => setSel(null)} />
      </section>
    </PortalLayout>
  );
};
export default ParentApproved;
