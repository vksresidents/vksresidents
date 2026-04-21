import { PortalLayout } from "@/components/portal/PortalLayout";
import { useApp } from "@/store/useApp";
import { PARENTS, STUDENTS } from "@/data/mock";
import { Users, GraduationCap, FileText, ShieldCheck, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PERMISSION_LABELS } from "@/types/domain";

const card = "surface-card p-6";

const AdminHome = () => {
  const { user, requests } = useApp();
  const { toast } = useToast();

  const counts = {
    parents: PARENTS.length,
    students: STUDENTS.length,
    requests: requests.length,
    pending: requests.filter((r) => r.status.startsWith("pending")).length,
    approved: requests.filter((r) => ["approved", "exited", "arrived"].includes(r.status)).length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    notArrived: requests.filter((r) => r.status === "not_arrived").length,
  };

  const byHostel = STUDENTS.reduce<Record<string, number>>((acc, s) => { acc[s.hostel] = (acc[s.hostel] || 0) + 1; return acc; }, {});
  const byType = requests.reduce<Record<string, number>>((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});

  const exportCSV = () => {
    const header = ["id", "student", "regNo", "parent", "type", "status", "destination", "expectedLeave", "expectedReturn"].join(",");
    const lines = requests.map((r) => {
      const s = STUDENTS.find((x) => x.id === r.studentId);
      const p = PARENTS.find((x) => x.id === r.parentId);
      return [r.id, s?.name, s?.regNo, p?.name, r.type, r.status, `"${r.destination}"`, r.expectedLeave, r.expectedReturn].join(",");
    });
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wcc-requests.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Requests CSV downloaded." });
  };

  return (
    <PortalLayout>
      <section className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-accent">Administrator</div>
            <h1 className="font-display text-4xl mt-2">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Overview of the residents permission portal.</p>
          </div>
          <Button onClick={exportCSV} className="bg-gradient-hero text-primary-foreground"><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <Stat label="Parents" value={counts.parents} icon={<Users className="h-6 w-6" />} />
          <Stat label="Students" value={counts.students} icon={<GraduationCap className="h-6 w-6" />} />
          <Stat label="Total requests" value={counts.requests} icon={<FileText className="h-6 w-6" />} />
          <Stat label="Active staff" value={6} icon={<ShieldCheck className="h-6 w-6" />} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-10">
          <div className={card}>
            <div className="flex items-center gap-2 mb-4"><BarChart3 className="h-5 w-5 text-accent" /><h3 className="font-display text-2xl">Requests by status</h3></div>
            <ul className="space-y-2 text-sm">
              <Row label="Pending" value={counts.pending} tone="text-warning" />
              <Row label="Approved · Active" value={counts.approved} tone="text-success" />
              <Row label="Rejected" value={counts.rejected} tone="text-destructive" />
              <Row label="Not arrived" value={counts.notArrived} tone="text-destructive" />
            </ul>
          </div>
          <div className={card}>
            <h3 className="font-display text-2xl mb-4">By permission type</h3>
            <ul className="space-y-2 text-sm">
              {Object.entries(byType).map(([k, v]) => <Row key={k} label={PERMISSION_LABELS[k as keyof typeof PERMISSION_LABELS] || k} value={v} />)}
            </ul>
          </div>
        </div>

        <div className={card}>
          <h3 className="font-display text-2xl mb-4">Students by hostel</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(byHostel).map(([h, n]) => (
              <div key={h} className="rounded-lg border border-border bg-secondary/40 p-4 flex items-center justify-between">
                <span className="text-sm">{h}</span>
                <span className="font-display text-2xl text-primary">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PortalLayout>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className={card}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-4xl mt-2">{value}</div>
      </div>
      <div className="p-3 rounded-xl bg-accent/10 text-accent">{icon}</div>
    </div>
  </div>
);
const Row = ({ label, value, tone }: { label: string; value: number; tone?: string }) => (
  <li className="flex items-center justify-between border-b border-border/50 last:border-0 pb-2">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-display text-xl ${tone || "text-foreground"}`}>{value}</span>
  </li>
);

export default AdminHome;
