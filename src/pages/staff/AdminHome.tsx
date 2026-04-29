import { PortalLayout } from "@/components/portal/PortalLayout";
import { useApp } from "@/store/useApp";
import { PARENTS } from "@/data/mock";
import { Users, GraduationCap, FileText, ShieldCheck, Download, BarChart3, Plus, Pencil, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PERMISSION_LABELS, type PermissionType, type Role } from "@/types/domain";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const card = "surface-card p-6";

const PROGRAMMES = [
  "B.A. History",
  "B.A. English",
  "B.Sc. Mathematics",
  "B.Sc. Physics",
  "B.Sc. Chemistry",
  "B.Sc. Plant Biology & Plant Biotechnology",
  "B.Sc. Advanced Zoology & Biotechnology",
  "B.Sc. Home Science – Nutrition, Food Service Management & Dietetics (General Stream)",
  "B.Sc. Home Science – Nutrition, Food Service Management & Dietetics (Vocational Stream)",
  "B.Sc. Computer Science",
  "B.Sc. Psychology",
  "M.Sc. Applied Psychology",
  "M.Sc. Home Science – Foods and Nutrition",
  "M.Sc. Home Science – Food Service Management & Dietetics",
  "M.Phil. Psychology",
  "M.Phil. Home Science – Foods and Nutrition",
  "M.Phil. Home Science – Food Service Management & Dietetics",
  "Ph.D. Psychology",
  "Ph.D. Home Science",
  "B.A. Corporate Economics",
  "B.Sc. Visual Communication",
  "B.Sc. Information Technology",
  "B.Sc. Computer Science with Data Science",
  "B.Sc. Computer Science with Artificial Intelligence",
  "B.Sc. Psychology",
  "B.Com. General (Section A)",
  "B.Com. General (Section B)",
  "B.Com. Accounting & Finance (Section A)",
  "B.Com. Accounting & Finance (Section B)",
  "B.Com. Computer Applications",
  "B.Com. Honours",
  "B.Com. Corporate Secretaryship",
  "B.Com. Bank Management",
  "Bachelor of Business Administration",
  "Bachelor of Computer Applications (Section A)",
  "Bachelor of Computer Applications (Section B)",
  "M.A. Communication",
  "M.A. Human Resource Management",
  "M.A. English",
  "M.A. International Studies",
  "M.Sc. Mathematics",
  "M.Sc. Physics",
  "M.Sc. Chemistry",
  "M.Sc. Biotechnology",
  "M.Sc. Information Technology",
  "M.Sc. Computer Science & Technology (Five Year Integrated Program)",
  "M.Sc. Data Science",
  "M.Sc. Computer Science",
  "M.Com. General",
  "Master of Social Work",
  "M.Sc. Applied Psychology (Counselling Psychology)",
  "M.Phil. Biotechnology",
  "M.Phil. Computer Science",
  "M.Phil. Chemistry",
  "Ph.D. Biotechnology",
  "Ph.D. Computer Science",
];

const HOSTELS = [
  { name: "Main Hostel", floors: ["1", "2", "3"] },
  { name: "Coon Hostel", floors: ["1", "2"] },
  { name: "PG Hostel", floors: ["1", "2"] },
  { name: "Riverlands Hostel", floors: ["1", "2"] },
  { name: "Garden Hostel", floors: ["1", "2"] },
  { name: "Holyoke Hostel - Wing 1", floors: ["G"] },
  { name: "Holyoke Hostel - Wing 2", floors: ["G"] },
  { name: "Holyoke Hostel - Wing 3", floors: ["1"] },
  { name: "Holyoke Hostel - Wing 4", floors: ["1"] },
];

interface StaffMember {
  role: Role;
  name: string;
  email: string;
  phone: string;
  department?: string;
}

const AdminHome = () => {
  const { user, requests, students, addStudent, updateStudent, addParent, staff, addStaff, updateStaff } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<typeof students[number] | null>(null);
  const [editingStaff, setEditingStaff] = useState<{ id: string; staff: StaffMember } | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterHostel, setFilterHostel] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[number] | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const draftKey = "adminStudentFormDraft";

  const loadDraft = () => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          name: "",
          regNo: "",
          hostel: "",
          floor: "",
          room: "",
          shift: "1" as string,
          department: PROGRAMMES[0],
          program: "UG" as "UG" | "PG",
          yearOfJoin: new Date().getFullYear(),
          studentPhone: "",
          parentPhone: "",
          parentEmail: "",
          parentName: "",
        };
      }
    }
    return {
      name: "",
      regNo: "",
      hostel: "",
      floor: "",
      room: "",
      shift: "1" as string,
      department: PROGRAMMES[0],
      program: "UG" as "UG" | "PG",
      yearOfJoin: new Date().getFullYear(),
      studentPhone: "",
      parentPhone: "",
      parentEmail: "",
      parentName: "",
    };
  };

  const saveDraft = (data: any) => {
    localStorage.setItem(draftKey, JSON.stringify(data));
  };

  const [formData, setFormDataState] = useState(loadDraft);

  const setFormData = (data: any) => {
    setFormDataState(data);
    // Debounce save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveDraft(data), 1000);
  };

  const staffDraftKey = "adminStaffFormDraft";

  const loadStaffDraft = () => {
    const saved = localStorage.getItem(staffDraftKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { role: "hod" as Role, name: "", email: "", phone: "", department: "CS" };
      }
    }
    return { role: "hod" as Role, name: "", email: "", phone: "", department: "CS" };
  };

  const saveStaffDraft = (data: any) => {
    localStorage.setItem(staffDraftKey, JSON.stringify(data));
  };

  const [staffForm, setStaffFormState] = useState(loadStaffDraft);

  const setStaffForm = (data: any) => {
    setStaffFormState(data);
    // Debounce save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveStaffDraft(data), 1000);
  };

  const generateStudentEmail = (regNo: string) => `${regNo.toLowerCase()}@wcc.edu.in`;
  const generateParentEmail = (regNo: string) => `parent${regNo.toLowerCase()}@wcc.edu.in`;
  const generatePassword = (year: number) => `wcc@@${year}`;

  const handleProgramChange = (prog: "UG" | "PG") => {
    setFormData({ ...formData, program: prog });
  };

  const handleDepartmentChange = (dept: string) => {
    setFormData({ ...formData, department: dept });
  };

  const handleYearChange = (year: number) => {
    setFormData({ ...formData, yearOfJoin: year });
  };

  const byHostel = students.reduce<Record<string, number>>((acc, s) => { acc[s.hostel] = (acc[s.hostel] || 0) + 1; return acc; }, {});

  const studentRequestCounts = useMemo(() => {
    return requests.reduce<Record<string, Record<PermissionType, number>>>((acc, r) => {
      if (!acc[r.studentId]) acc[r.studentId] = { day_out: 0, night_out: 0, special: 0 };
      acc[r.studentId][r.type] += 1;
      return acc;
    }, {} as Record<string, Record<PermissionType, number>>);
  }, [requests]);

  const filteredRequests = requests.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    const s = students.find((x) => x.id === r.studentId);
    if (filterHostel !== "all" && s?.hostel !== filterHostel) return false;
    return true;
  });

  const filteredCounts = {
    total: filteredRequests.length,
    pending: filteredRequests.filter((r) => r.status.startsWith("pending")).length,
    approved: filteredRequests.filter((r) => ["approved", "exited", "arrived"].includes(r.status)).length,
    rejected: filteredRequests.filter((r) => r.status === "rejected").length,
    notArrived: filteredRequests.filter((r) => r.status === "not_arrived").length,
  };

  // Shift-based statistics
  const shift1Students = students.filter((s) => s.shift === 1).length;
  const shift2Students = students.filter((s) => s.shift === 2).length;
  const shift1Requests = filteredRequests.filter((r) => {
    const s = students.find((x) => x.id === r.studentId);
    return s?.shift === 1;
  }).length;
  const shift2Requests = filteredRequests.filter((r) => {
    const s = students.find((x) => x.id === r.studentId);
    return s?.shift === 2;
  }).length;

  const filteredByType = filteredRequests.reduce<Record<string, number>>((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});

  const HOSTELS_LIST = Array.from(new Set(students.map((s) => s.hostel)));

  const visibleStudents = filterHostel === "all" ? students : students.filter((s) => s.hostel === filterHostel);

  const exportCSV = () => {
    const header = ["id", "student", "regNo", "parent", "type", "status", "destination", "expectedLeave", "expectedReturn"].join(",");
    const lines = requests.map((r) => {
      const s = students.find((x) => x.id === r.studentId);
      const p = PARENTS.find((x) => x.id === r.parentId);
      return [r.id, s?.name, s?.regNo, p?.name, r.type, r.status, `"${r.destination}"`, r.expectedLeave, r.expectedReturn].join(",");
    });
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wcc-requests.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Requests CSV downloaded." });
  };

  const openAddDialog = () => {
    setEditingStudent(null);
    setFormData(loadDraft());
    setIsDialogOpen(true);
  };

  const openAddStaffDialog = () => {
    setEditingStaff(null);
    setStaffForm(loadStaffDraft());
    setIsStaffDialogOpen(true);
  };

  const openEditStaffDialog = (id: string, staffMember: StaffMember) => {
    setEditingStaff({ id, staff: staffMember });
    setStaffForm({
      role: staffMember.role,
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      department: staffMember.department || "CS"
    });
    setIsStaffDialogOpen(true);
  };

  const handleSaveStaff = () => {
    // Basic validation
    if (!staffForm.name.trim()) {
      toast({ title: "Validation Error", description: "Please enter a name.", variant: "destructive" });
      return;
    }
    if (!staffForm.email.trim()) {
      toast({ title: "Validation Error", description: "Please enter an email.", variant: "destructive" });
      return;
    }
    if (!staffForm.phone.trim()) {
      toast({ title: "Validation Error", description: "Please enter a phone number.", variant: "destructive" });
      return;
    }

    // Validation: Check for duplicate email
    const existingStaff = Object.values(staff).find(s => s.email === staffForm.email);
    if (!editingStaff && existingStaff) {
      toast({ title: "Duplicate Email", description: "A staff member with this email already exists.", variant: "destructive" });
      return;
    }

    // Validation: Check for duplicate name (optional, but can be added)
    const existingName = Object.values(staff).find(s => s.name.toLowerCase() === staffForm.name.toLowerCase());
    if (!editingStaff && existingName) {
      toast({ title: "Duplicate Name", description: "A staff member with this name already exists.", variant: "destructive" });
      return;
    }

    const staffData = {
      role: staffForm.role,
      name: staffForm.name,
      email: staffForm.email,
      phone: staffForm.phone,
      department: staffForm.role === "hod" ? staffForm.department : undefined,
    };

    if (editingStaff) {
      updateStaff(editingStaff.id, staffData);
      toast({ title: "Staff updated", description: `${staffForm.name}'s details have been updated.` });
    } else {
      const id = `${staffForm.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      addStaff(id, staffData);
      toast({ title: "Staff added", description: `${staffForm.name} has been added.` });
    }
    setIsStaffDialogOpen(false);

    // Clear staff draft after save
    localStorage.removeItem(staffDraftKey);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  };

  const openEditDialog = (student: typeof students[number]) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      regNo: student.regNo,
      hostel: student.hostel,
      floor: student.floor,
      room: student.room,
      shift: String(student.shift),
      department: student.department,
      program: "UG",
      yearOfJoin: new Date().getFullYear(),
      studentPhone: student.parentPhone || "",
      parentPhone: student.parentPhone || "",
      parentEmail: generateParentEmail(student.regNo),
      parentName: "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const studentData = {
      name: formData.name,
      regNo: formData.regNo,
      hostel: formData.hostel,
      floor: formData.floor,
      room: formData.room,
      shift: parseInt(formData.shift) as 1 | 2,
      department: formData.department,
      parentId: formData.regNo, // Use regNo as parent ID
      parentPhone: formData.parentPhone,
    };
    
    // Generate credentials for display
    const studentEmail = generateStudentEmail(formData.regNo);
    const parentEmail = formData.parentEmail || generateParentEmail(formData.regNo);
    const password = generatePassword(formData.yearOfJoin);
    
    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
      toast({ title: "Student updated", description: `${formData.name}'s details have been updated.` });
    } else {
      // Create parent first
      addParent({
        name: formData.parentName || `${formData.name}'s Parent`,
        email: parentEmail,
        phone: formData.parentPhone,
        childIds: [],
      });
      
      // Add student with parent ID linking
      addStudent({ ...studentData, parentId: formData.regNo });
      
      toast({ 
        title: "✅ Student & Parent Created!", 
        description: (
          <div className="mt-2 text-sm space-y-1">
            <p className="font-semibold">👤 Student</p>
            <p>Name: {formData.name}</p>
            <p>Reg No: {formData.regNo}</p>
            <p>Email: {studentEmail}</p>
            <hr className="my-2"/>
            <p className="font-semibold">👨‍👩‍👧 Parent</p>
            <p>Name: {formData.parentName || `${formData.name}'s Parent`}</p>
            <p>Email: {parentEmail}</p>
            <p>Phone: {formData.parentPhone}</p>
            <hr className="my-2"/>
            <p className="font-semibold">🔐 Login Password</p>
            <p className="text-lg font-mono bg-yellow-100 px-2 py-1 rounded">{password}</p>
            <p className="text-xs text-red-500 mt-2">⚠️ Save this password now! It won't be shown again.</p>
          </div>
        )
      });
    }
    setIsDialogOpen(false);

    // Clear draft after save
    localStorage.removeItem(draftKey);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  };

  const [modal, setModal] = useState<null | "parents" | "students" | "requests" | "staff">(null);

  const staffRoles: Role[] = ["hod", "dean", "warden", "gatepass", "security", "admin"];
  const staffDepartments = ["CS", "IT", "Math", "Phy", "Chem", "Bio", "Eng", "Hist", "Eco", "Comm"];

  return (
    <PortalLayout>
      <section className="container py-8 px-4 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 rounded-2xl p-8 mb-8 border border-primary/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Administrator Dashboard
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome back, {user?.name}
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage students, staff, and permission requests for VKS Residents
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={openAddDialog} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
              <Button onClick={openAddStaffDialog} variant="outline" className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                <Users className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
              <Button onClick={exportCSV} variant="outline" className="border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-card">
              <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Permission type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="day_out">Day Out</SelectItem>
              <SelectItem value="night_out">Night Out</SelectItem>
              <SelectItem value="special">Special Permission</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterHostel} onValueChange={setFilterHostel}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Hostel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All hostels</SelectItem>
              {HOSTELS_LIST.map((h) => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filterType !== "all" || filterHostel !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterType("all"); setFilterHostel("all"); }}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group cursor-pointer" onClick={() => setModal("parents")}>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">
                  {PARENTS.length}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Total Parents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Parent accounts registered</p>
            </div>
          </div>

          <div className="group cursor-pointer" onClick={() => setModal("students")}>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200">
                  {students.length}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Total Students</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Students enrolled</p>
            </div>
          </div>

          <div className="group cursor-pointer" onClick={() => setModal("requests")}>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200">
                  {filteredCounts.total}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Total Requests</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Permission requests</p>
            </div>
          </div>

          <div className="group cursor-pointer" onClick={() => setModal("staff")}>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl p-6 border border-orange-200/50 dark:border-orange-800/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200">
                  {Object.keys(staff).length}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Active Staff</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Staff members</p>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-100">Request Status Overview</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{filteredCounts.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Approved</span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{filteredCounts.approved}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Rejected</span>
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{filteredCounts.rejected}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-100">Permission Types</h3>
            </div>
            <div className="space-y-3">
              {Object.keys(PERMISSION_LABELS).map((type) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{PERMISSION_LABELS[type as keyof typeof PERMISSION_LABELS]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(filteredByType[type] || 0) / Math.max(...Object.values(filteredByType), 1) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400 min-w-[2rem] text-right">
                      {filteredByType[type] || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Shift Statistics */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-10 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-100">Shift Distribution</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Shift 1</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{shift1Students}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Students</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{shift1Students}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Requests</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{shift1Requests}</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium">8:00 AM - 7:00 PM</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">Shift 2</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{shift2Students}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Students</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{shift2Students}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Requests</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{shift2Requests}</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 dark:text-green-400 font-medium">12:30 PM - 7:00 PM</div>
            </div>
          </div>
        </div>

        {/* Enhanced Hostel Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-10 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-100">Students by Hostel</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(filterHostel !== "all" ? Object.entries(byHostel).filter(([h]) => h === filterHostel) : Object.entries(byHostel)).map(([hostel, count]) => (
              <button
                key={hostel}
                type="button"
                onClick={() => {
                  setFilterHostel(hostel);
                  setSelectedStudent(null);
                }}
                className="text-left bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 rounded-lg p-4 border border-teal-200/50 dark:border-teal-800/50 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{hostel}</span>
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{count}</span>
                </div>
                <div className="w-full bg-teal-200 dark:bg-teal-800 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(count / students.length) * 100}%` }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Student Details Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-gray-100">Student Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Reg No</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Hostel</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Room</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Shift</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Day Out</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Night Out</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Special</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((s) => (
                  <tr
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
                >
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedStudent(s);
                        }}
                        className="w-full text-left hover:text-primary"
                      >
                        {s.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-mono">{s.regNo}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{s.hostel}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{s.floor}-{s.room}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{s.department}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.shift === 1
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        Shift {s.shift}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{studentRequestCounts[s.id]?.day_out ?? 0}</td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{studentRequestCounts[s.id]?.night_out ?? 0}</td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{studentRequestCounts[s.id]?.special ?? 0}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditDialog(s);
                        }}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student detail dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-display">Student details</DialogTitle>
                    <DialogDescription>Permission history and request counts for the selected student.</DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reg. No.</p>
                    <p className="font-medium">{selectedStudent.regNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hostel</p>
                    <p className="font-medium">{selectedStudent.hostel} · {selectedStudent.floor} · Room {selectedStudent.room}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{selectedStudent.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-50 dark:bg-slate-900 p-4">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Day Out</p>
                    <p className="text-2xl font-semibold">{studentRequestCounts[selectedStudent.id]?.day_out ?? 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Night Out</p>
                    <p className="text-2xl font-semibold">{studentRequestCounts[selectedStudent.id]?.night_out ?? 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Special</p>
                    <p className="text-2xl font-semibold">{studentRequestCounts[selectedStudent.id]?.special ?? 0}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Permission</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Destination</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Leave</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.filter((r) => r.studentId === selectedStudent.id).map((r) => (
                        <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{PERMISSION_LABELS[r.type]}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300 capitalize">{r.status.replace(/_/g, " ")}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{r.destination}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(r.expectedLeave).toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(r.expectedReturn).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Enhanced Add/Edit Student Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-display">
                    {editingStudent ? "Edit Student Details" : "Add New Student"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStudent ? "Update student information and credentials" : "Create a new student account with parent details"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              {/* Program & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Program</Label>
                  <Select value={formData.program} onValueChange={(v) => handleProgramChange(v as "UG" | "PG")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UG">UG (3 Years)</SelectItem>
                      <SelectItem value="PG">PG (2 Years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Year of Join</Label>
                  <Select value={String(formData.yearOfJoin)} onValueChange={(v) => handleYearChange(parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027, 2028].map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Department & Auto RegNo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Department</Label>
                  <Select value={formData.department} onValueChange={handleDepartmentChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROGRAMMES.map((programme) => (
                        <SelectItem key={programme} value={programme}>{programme}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Reg No</Label>
                  <Input
                    value={formData.regNo}
                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                    className="bg-muted"
                    placeholder="Enter or update reg no"
                  />
                </div>
              </div>

              {/* Student Name & Phone */}
              <div className="grid gap-2">
                <Label>Student Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Enter full name" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Student Phone</Label>
                <Input 
                  value={formData.studentPhone} 
                  onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })} 
                  placeholder="9876543210" 
                />
              </div>

              {/* Hostel Details */}
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label>Hostel</Label>
                  <Select value={formData.hostel} onValueChange={(v) => setFormData({ ...formData, hostel: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Hostel">Main Hostel</SelectItem>
                      <SelectItem value="Coon">Coon</SelectItem>
                      <SelectItem value="Mt Holyoke">Mt Holyoke</SelectItem>
                      <SelectItem value="Garden">Garden</SelectItem>
                      <SelectItem value="River Lands">River Lands</SelectItem>
                      <SelectItem value="PG Hostel">PG Hostel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Floor</Label>
                  <Select value={formData.floor} onValueChange={(v) => setFormData({ ...formData, floor: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((f) => (
                        <SelectItem key={f} value={String(f)}>Floor {f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Room No</Label>
                  <Input 
                    value={formData.room} 
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })} 
                    placeholder="208" 
                  />
                </div>
              </div>

              {/* Shift */}
              <div className="grid gap-2">
                <Label>Shift</Label>
                <Select value={formData.shift} onValueChange={(v) => setFormData({ ...formData, shift: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Shift 1 (Morning)</SelectItem>
                    <SelectItem value="2">Shift 2 (Evening)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Parent Details */}
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium text-sm mb-3">Parent Details (Auto-generated emails)</h4>
                <div className="grid gap-2">
                  <Label>Parent Name</Label>
                  <Input 
                    value={formData.parentName} 
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} 
                    placeholder="Parent's full name" 
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label>Parent Phone</Label>
                  <Input 
                    value={formData.parentPhone} 
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} 
                    placeholder="9876543210" 
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label>Parent Email (Auto-generated)</Label>
                  <Input 
                    value={formData.parentEmail} 
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} 
                    placeholder="parent24csc001@wcc.edu.in" 
                  />
                </div>
              </div>

              {/* Pass out year preview */}
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p><strong>Pass out Year:</strong> {formData.program === "UG" ? formData.yearOfJoin + 3 : formData.yearOfJoin + 2}</p>
                <p className="text-muted-foreground text-xs mt-1">Auto-calculated based on {formData.program} program</p>
              </div>

              <Button onClick={handleSave} className="mt-2 bg-gradient-hero text-primary-foreground">
                {editingStudent ? "Update Student" : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Add/Edit Staff Dialog */}
        <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-display">
                    {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStaff ? "Update staff member information" : "Create a new staff account for the portal"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="staff-role">Staff Role</Label>
                <Select value={staffForm.role} onValueChange={(v) => setStaffForm({ ...staffForm, role: v as Role })}>
                  <SelectTrigger id="staff-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {staffRoles.map((roleOption) => (
                      <SelectItem key={roleOption} value={roleOption}>{roleOption.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-name">Full Name</Label>
                <Input id="staff-name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input id="staff-email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} placeholder="name@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-phone">Phone</Label>
                <Input id="staff-phone" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} placeholder="+91 98401 23456" />
              </div>
              {staffForm.role === "hod" && (
                <div className="grid gap-2">
                  <Label htmlFor="staff-department">Department</Label>
                  <Select value={staffForm.department} onValueChange={(v) => setStaffForm({ ...staffForm, department: v })}>
                    <SelectTrigger id="staff-department"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {staffDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleSaveStaff} className="mt-2 bg-gradient-hero text-primary-foreground">
                {editingStaff ? "Update Staff Member" : "Add Staff Member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Details Modal */}
        <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {modal === "parents" && <Users className="h-5 w-5 text-primary" />}
                  {modal === "students" && <GraduationCap className="h-5 w-5 text-primary" />}
                  {modal === "requests" && <FileText className="h-5 w-5 text-primary" />}
                  {modal === "staff" && <ShieldCheck className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <DialogTitle className="text-xl font-display">
                    {modal === "parents" && "All Parents"}
                    {modal === "students" && "All Students"}
                    {modal === "requests" && "All Requests"}
                    {modal === "staff" && "Active Staff Members"}
                  </DialogTitle>
                  <DialogDescription>
                    {modal === "parents" && "Complete list of registered parent accounts"}
                    {modal === "students" && "Complete list of enrolled students"}
                    {modal === "requests" && "All permission requests in the system"}
                    {modal === "staff" && "All active staff members and their roles"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {modal === "parents" && (
                <div className="space-y-3">
                  {PARENTS.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {p.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {p.phone}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">Children: {p.childIds.join(", ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {modal === "students" && (
                <div className="space-y-3">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{s.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            {s.regNo}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            {s.hostel}, Room {s.room}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">Department: {s.department} | Parent: {s.parentId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {modal === "requests" && (
                <div className="space-y-3">
                  {requests.map((r) => {
                    const s = students.find((x) => x.id === r.studentId);
                    return (
                      <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{s?.name || r.studentId} - {r.type}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              r.status.includes('pending') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              r.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {r.status}
                            </span>
                            <span>Destination: {r.destination}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {modal === "staff" && (
                <div className="space-y-3">
                  {Object.entries(staff).map(([key, staffMember]) => {
                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{staffMember.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              staffMember.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              staffMember.role === 'dean' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                              staffMember.role === 'hod' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {staffMember.role.toUpperCase()}
                            </span>
                            {staffMember.department && <span>Department: {staffMember.department}</span>}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">{staffMember.email}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditStaffDialog(key, staffMember)}
                          className="hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </PortalLayout>
  );
};

const Stat = ({ label, value, icon, onClick }: { label: string; value: number; icon: React.ReactNode; onClick?: () => void }) => (
  <div className={card + (onClick ? " cursor-pointer hover:shadow-lg transition" : "")}
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    role={onClick ? "button" : undefined}
    aria-label={onClick ? label : undefined}
  >
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
