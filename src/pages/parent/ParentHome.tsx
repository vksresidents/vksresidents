import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useApp } from "@/store/useApp";
import { STUDENTS } from "@/data/mock";
import { ListChecks, CheckCircle2, XCircle, GraduationCap, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/portal/StatCard";

const ParentHome = () => {
  const { user, requests } = useApp();
  const children = STUDENTS.filter((s) => user?.parentId && s.parentId === user.parentId);

  const myReqs = requests.filter((r) => r.parentId === user?.parentId);
  const tracking = myReqs.filter((r) => r.status.startsWith("pending") || r.status === "approved" || r.status === "exited").length;
  const approved = myReqs.filter((r) => ["approved", "exited", "arrived"].includes(r.status)).length;
  const rejected = myReqs.filter((r) => r.status === "rejected").length;

  return (
    <PortalLayout>
      <section className="container py-10">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">Parent Portal</div>
          <h1 className="font-display text-4xl mt-2">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Submit a permission request, track its status across approvers, and view your daughter's history — all in one place.
          </p>
        </div>

        <h2 className="font-display text-2xl mb-4">Your children</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {children.map((c) => (
            <Link
              key={c.id}
              to={`/parent/permission/${c.id}`}
              className="surface-card p-5 group flex items-center gap-4 hover:shadow-elevated transition-all"
            >
              <div className="h-14 w-14 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center font-display text-xl">
                {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.regNo} · {c.department}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.hostel} · Room {c.room}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>

        <h2 className="font-display text-2xl mb-4">Requests overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          <StatCard to="/parent/track" title="Track requests" count={tracking} icon={<ListChecks className="h-6 w-6" />} tone="warning" highlight />
          <StatCard to="/parent/approved" title="Approved requests" count={approved} icon={<CheckCircle2 className="h-6 w-6" />} tone="success" />
          <StatCard to="/parent/rejected" title="Rejected requests" count={rejected} icon={<XCircle className="h-6 w-6" />} tone="destructive" />
        </div>

        <div className="surface-card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="h-5 w-5 text-accent" />
            <h2 className="font-display text-2xl">General rules for parents</h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground list-disc pl-5 marker:text-accent">
            <li>Day Out is permitted only with parental consent.</li>
            <li>Night Out is allowed only on official college holidays — maximum 3 per semester.</li>
            <li>Special Permission requires HOD → Dean → Warden → Gate Pass approval.</li>
            <li>Shift 1: 8:00 AM – 2:30 PM · Shift 2: 12:30 PM – 5:30 PM (timings differ for exit/return).</li>
            <li>Sundays are free; no permission required.</li>
            <li>Medical emergencies, when over the limit, are exempt from quota.</li>
          </ul>
        </div>
      </section>
    </PortalLayout>
  );
};

export default ParentHome;
