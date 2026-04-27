import { PortalLayout } from "@/components/portal/PortalLayout";
import { findStudent, useApp } from "@/store/useApp";
import { PERMISSION_LABELS } from "@/types/domain";
import { Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ParentTrack = () => {
  const { user, requests, removeRequest } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const myReqs = requests
    .filter((r) => r.parentId === user?.parentId && r.status !== "rejected" && r.status !== "arrived")
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

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
                <div className="mt-5">
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Destination</dt><dd className="text-right truncate">{r.destination}</dd>
                    <dt className="text-muted-foreground">Leaves</dt><dd className="text-right">{format(new Date(r.expectedLeave), "dd MMM · HH:mm")}</dd>
                    <dt className="text-muted-foreground">Returns</dt><dd className="text-right">{format(new Date(r.expectedReturn), "dd MMM · HH:mm")}</dd>
                    <dt className="text-muted-foreground">Medical</dt><dd className="text-right">{r.medical ? "Yes" : "No"}</dd>
                  </dl>
                  {isPending && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => { removeRequest(r.id); toast({ title: "Request deleted" }); }}
                        className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                        aria-label="Delete request"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </PortalLayout>
  );
};
export default ParentTrack;
