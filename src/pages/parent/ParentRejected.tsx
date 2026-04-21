import { PortalLayout } from "@/components/portal/PortalLayout";
import { RequestTable } from "@/components/portal/RequestTable";
import { useApp } from "@/store/useApp";
import { useState } from "react";
import { RequestDetailDialog } from "@/components/portal/RequestDetailDialog";
import type { PermissionRequest } from "@/types/domain";

const ParentRejected = () => {
  const { user, requests } = useApp();
  const rows = requests.filter((r) => r.parentId === user?.parentId && r.status === "rejected");
  const [sel, setSel] = useState<PermissionRequest | null>(null);
  return (
    <PortalLayout>
      <section className="container py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">Parent Portal</div>
          <h1 className="font-display text-4xl mt-2">Rejected requests</h1>
        </div>
        <RequestTable rows={rows} onRowClick={setSel} rejection />
        <RequestDetailDialog request={sel} open={!!sel} onOpenChange={() => setSel(null)} />
      </section>
    </PortalLayout>
  );
};
export default ParentRejected;
    