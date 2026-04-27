import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createParentAccount, generateParentEmail } from "@/lib/parentAccount";
import { Users, GraduationCap, Mail, Phone, Building, MapPin, Clock } from "lucide-react";

const DEPARTMENTS = [
  "Computer Science",
  "Biotechnology",
  "Economics",
  "English Literature",
  "Mathematics",
  "Psychology",
  "Physics",
  "Chemistry",
  "History",
  "Commerce"
];

const HOSTELS = [
  "Main Hostel",
  "Holyoke Hostel",
  "Coon Hostel",
  "Riverlands Hostel",
  "Garden Hostel",
  "PG Hostel"
];

const SHIFTS = [
  { value: "1", label: "Shift 1 (Morning)" },
  { value: "2", label: "Shift 2 (Evening)" }
];

const AddStudent = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    regNo: "",
    studentEmail: "",
    department: "",
    hostel: "",
    floor: "",
    room: "",
    shift: "1" as string,
    parentName: "",
    parentPhone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate parent email from student email
      const parentEmail = generateParentEmail(formData.studentEmail);

      // Create parent account
      const result = await createParentAccount(
        formData.studentEmail,
        formData.parentName,
        formData.parentPhone
      );

      if (result.success) {
        toast({
          title: "Student Added Successfully",
          description: (
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>Student:</strong> {formData.studentName}</p>
              <p><strong>Reg No:</strong> {formData.regNo}</p>
              <p><strong>Parent Email:</strong> {parentEmail}</p>
              <p><strong>Default Password:</strong> wccparent@@2026</p>
            </div>
          ),
        });

        // Reset form
        setFormData({
          studentName: "",
          regNo: "",
          studentEmail: "",
          department: "",
          hostel: "",
          floor: "",
          room: "",
          shift: "1",
          parentName: "",
          parentPhone: ""
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create parent account",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate student email preview
  const studentEmailPreview = formData.regNo 
    ? `${formData.regNo.toLowerCase()}@wcc.edu.in`
    : "";

  return (
    <PortalLayout>
      <div className="container py-10 max-w-4xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.22em] text-accent">Administrator</div>
          <h1 className="font-display text-4xl mt-2">Add New Student</h1>
          <p className="text-muted-foreground mt-2">
            Register a new student. A parent account will be automatically created with the email format: studentregnoparent@wcc.edu.in
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Student Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Details
                </CardTitle>
                <CardDescription>
                  Enter the student's personal and academic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      placeholder="Enter student full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regNo">Registration Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="regNo"
                      name="regNo"
                      value={formData.regNo}
                      onChange={handleChange}
                      placeholder="e.g., 24CSC54"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Student Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="studentEmail"
                      name="studentEmail"
                      type="email"
                      value={formData.studentEmail}
                      onChange={handleChange}
                      placeholder={studentEmailPreview || "student@wcc.edu.in"}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Parent email will be: {studentEmailPreview ? generateParentEmail(studentEmailPreview) : "preview after entering reg no"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(v) => handleSelectChange("department", v)}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hostel">Hostel <span className="text-destructive">*</span></Label>
                    <Select 
                      value={formData.hostel} 
                      onValueChange={(v) => handleSelectChange("hostel", v)}
                    >
                      <SelectTrigger id="hostel">
                        <SelectValue placeholder="Select hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOSTELS.map(hostel => (
                          <SelectItem key={hostel} value={hostel}>{hostel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shift">Shift <span className="text-destructive">*</span></Label>
                    <Select 
                      value={formData.shift} 
                      onValueChange={(v) => handleSelectChange("shift", v)}
                    >
                      <SelectTrigger id="shift">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFTS.map(shift => (
                          <SelectItem key={shift.value} value={shift.value}>{shift.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      placeholder="e.g., 3rd Floor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number</Label>
                    <Input
                      id="room"
                      name="room"
                      value={formData.room}
                      onChange={handleChange}
                      placeholder="e.g., 312"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent Details
                </CardTitle>
                <CardDescription>
                  Parent account will be created with email: [regno]parent@wcc.edu.in and default password: wccparent@@2026
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="Enter parent full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Parent Phone <span className="text-destructive">*</span></Label>
                    <Input
                      id="parentPhone"
                      name="parentPhone"
                      type="tel"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setFormData({
                  studentName: "",
                  regNo: "",
                  studentEmail: "",
                  department: "",
                  hostel: "",
                  floor: "",
                  room: "",
                  shift: "1",
                  parentName: "",
                  parentPhone: ""
                })}
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-hero text-primary-foreground"
              >
                {loading ? "Creating Account..." : "Add Student & Create Parent Account"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
};

export default AddStudent;