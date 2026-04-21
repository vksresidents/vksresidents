import { PortalLayout } from "@/components/portal/PortalLayout";
import { findStudent, useApp } from "@/store/useApp";
import { PERMISSION_LABELS } from "@/types/domain";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const ParentTrack = () => {
  const { user, requests, removeRequest } = useApp();
  const { toast } = useToast();
  const myReqs = requests
    .filter((r) => r.parentId === user?.parentId && r.status !== "rejected" && r.status !== "arrived")
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <PortalLayout>
      <section className="container py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">Parent Portal</div>
          <h1 className="font-display text-4xl mt-2">Track requests</h1>
          <p className="text-muted-foreground">Pending, in-progress and active requests for your children.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {myReqs.length === 0 && <div className="surface-card p-10 text-center text-muted-foreground md:col-span-2">No active requests.</div>}
          {myReqs.map((r) => {
            const s = findStudent(r.studentId);
            const isPending = r.status.startsWith("pending");
            return (
              <article key={r.id} className="surface-card p-6 relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{PERMISSION_LABELS[r.type]}</div>
                    <h3 className="font-display text-2xl mt-1">{s?.name}</h3>
                    <div className="text-xs text-muted-foreground">{s?.regNo} · {s?.hostel}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Destination</dt><dd className="text-right truncate">{r.destination}</dd>
                  <dt className="text-muted-foreground">Leaves</dt><dd className="text-right">{format(new Date(r.expectedLeave), "dd MMM · HH:mm")}</dd>
                  <dt className="text-muted-foreground">Returns</dt><dd className="text-right">{format(new Date(r.expectedReturn), "dd MMM · HH:mm")}</dd>
                  <dt className="text-muted-foreground">Medical</dt><dd className="text-right">{r.medical ? "Yes" : "No"}</dd>
                </dl>
                {isPending && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { removeRequest(r.id); toast({ title: "Request deleted" }); }}
                    className="absolute bottom-3 right-3 text-muted-foreground hover:text-destructive"
                    aria-label="Delete request"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </PortalLayout>
  );
};
export default ParentTrack;
