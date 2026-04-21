import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { findStudent, useApp } from "@/store/useApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Mail, Eraser, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PARENTS, STAFF } from "@/data/mock";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type PType = "day_out" | "night_out" | "special";

const TIMES = Array.from({ length: 14 * 4 }).map((_, i) => {
  const m = i * 15 + 6 * 60; // 06:00 to 20:00
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return { value: `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`, label: `${((h + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` };
});

const empty = {
  type: "" as PType | "",
  medical: "no" as "yes" | "no",
  leaveDate: undefined as Date | undefined,
  leaveTime: "",
  arriveDate: undefined as Date | undefined,
  arriveTime: "",
  destination: "",
};

const PermissionForm = () => {
  const { studentId = "" } = useParams();
  const student = findStudent(studentId);
  const navigate = useNavigate();
  const { user, addRequest } = useApp();
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState<{ open: boolean; subject: string; body: string }>({ open: false, subject: "", body: "" });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((s) => ({ ...s, [k]: v }));

  const isValid = useMemo(() => form.type && form.leaveDate && form.leaveTime && form.arriveDate && form.arriveTime && form.destination, [form]);

  const buildIso = (d?: Date, t?: string) => {
    if (!d || !t) return "";
    const [h, m] = t.split(":").map(Number);
    const out = new Date(d);
    out.setHours(h, m, 0, 0);
    return out.toISOString();
  };

  const handleGenerate = () => {
    if (!isValid || !student || !user?.parentId) return;
    const expectedLeave = buildIso(form.leaveDate, form.leaveTime);
    const expectedReturn = buildIso(form.arriveDate, form.arriveTime);

    const parent = PARENTS.find((p) => p.id === user.parentId);
    const recipient = form.type === "special" ? `HOD <${STAFF.hod_cs.email}>` : `Dean of Residents <${STAFF.dean.email}>`;
    const typeLabel = form.type === "day_out" ? "Day Out" : form.type === "night_out" ? "Night Out" : "Special Permission";

    const subject = `${typeLabel} permission request — ${student.name} (${student.regNo})`;
    const body = `Respected Sir/Madam,\n\nI, ${parent?.name}, parent of ${student.name} (${student.regNo}, ${student.hostel} ${student.floor}, Room ${student.room}), hereby request ${typeLabel} permission for my daughter.\n\n• Destination: ${form.destination}\n• Expected leaving: ${format(new Date(expectedLeave), "PPpp")}\n• Expected return: ${format(new Date(expectedReturn), "PPpp")}\n• Medical emergency: ${form.medical === "yes" ? "Yes" : "No"}\n\nKindly grant your approval.\n\nThank you,\n${parent?.name}\n${parent?.phone}\n${parent?.email}`;

    addRequest({
      studentId: student.id,
      parentId: user.parentId,
      type: form.type as PType,
      medical: form.medical === "yes",
      destination: form.destination,
      expectedLeave,
      expectedReturn,
    });

    setPreview({ open: true, subject, body });
    toast({
      title: "Request submitted",
      description: `A copy of the mail has been queued to ${recipient}.`,
    });
  };

  if (!student) return <PortalLayout><div className="container py-20">Student not found.</div></PortalLayout>;

  return (
    <PortalLayout>
      <section className="container py-10 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-3"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">Permission Form</div>
          <h1 className="font-display text-4xl mt-2">For {student.name}</h1>
          <p className="text-sm text-muted-foreground">{student.regNo} · {student.hostel} · {student.floor} · Room {student.room} · Shift {student.shift}</p>
        </div>

        <div className="surface-card p-6 lg:p-8 space-y-8">
          <Field label="Q1. Permission type">
            <Select value={form.type} onValueChange={(v) => update("type", v as PType)}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Choose permission type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day_out">Day Out</SelectItem>
                <SelectItem value="night_out">Night Out</SelectItem>
                <SelectItem value="special">Special Permission</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Q2. Is this a medical emergency?">
            <RadioGroup value={form.medical} onValueChange={(v) => update("medical", v as "yes" | "no")} className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="yes" id="me-yes" /><span>Yes</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="no" id="me-no" /><span>No</span></label>
            </RadioGroup>
          </Field>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Q3. Expected leaving date & time">
              <DateTimePair date={form.leaveDate} time={form.leaveTime} onDate={(d) => update("leaveDate", d)} onTime={(t) => update("leaveTime", t)} />
            </Field>
            <Field label="Q4. Expected arrival date & time">
              <DateTimePair date={form.arriveDate} time={form.arriveTime} onDate={(d) => update("arriveDate", d)} onTime={(t) => update("arriveTime", t)} />
            </Field>
          </div>

          <Field label="Q5. Destination">
            <Input value={form.destination} onChange={(e) => update("destination", e.target.value)} placeholder="e.g. Phoenix Mall, Velachery" className="bg-background" />
          </Field>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={handleGenerate} disabled={!isValid} className="bg-gradient-hero text-primary-foreground hover:opacity-95">
              <Mail className="h-4 w-4 mr-2" /> Generate Mail
            </Button>
            <Button onClick={() => setForm(empty)} variant="outline">
              <Eraser className="h-4 w-4 mr-2" /> Clear All
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={preview.open} onOpenChange={(v) => setPreview((s) => ({ ...s, open: v }))}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">Mail generated</DialogTitle></DialogHeader>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Subject</div>
          <div className="text-sm font-medium mb-4">{preview.subject}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Body</div>
          <pre className="text-sm whitespace-pre-wrap bg-secondary/60 rounded-md p-4 max-h-[40vh] overflow-auto">{preview.body}</pre>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreview({ open: false, subject: "", body: "" })}>Close</Button>
            <Button onClick={() => navigate("/parent/track")} className="bg-gradient-hero text-primary-foreground">Track this request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-base font-medium text-foreground">{label}</Label>
    <div className="mt-2">{children}</div>
  </div>
);

const DateTimePair = ({ date, time, onDate, onTime }: { date?: Date; time: string; onDate: (d?: Date) => void; onTime: (t: string) => void }) => (
  <div className="grid grid-cols-[1fr_140px] gap-2">
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start font-normal bg-background">
          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          {date ? format(date, "PP") : "Pick date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onDate} initialFocus />
      </PopoverContent>
    </Popover>
    <Select value={time} onValueChange={onTime}>
      <SelectTrigger className="bg-background"><SelectValue placeholder="Time" /></SelectTrigger>
      <SelectContent className="max-h-72">
        {TIMES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

export default PermissionForm;
