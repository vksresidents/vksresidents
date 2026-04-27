import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/store/useApp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/wcc-logo.png";
import { ArrowLeft } from "lucide-react";

const ParentOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { loginWithGmail, addParentProfile } = useApp();
  const email = location.state?.email || "";
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [parentData, setParentData] = useState({
    name: "",
    phone: "",
    relation: "Mother",
  });

  const [studentData, setStudentData] = useState({
    regNo: "",
    name: "",
    hostel: "",
  });

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentData.name || !parentData.phone) {
      toast({
        title: "Error",
        description: "Please fill all parent details",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData.regNo || !studentData.name || !studentData.hostel) {
      toast({
        title: "Error",
        description: "Please fill all student details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate saving data
    setTimeout(() => {
      // Create parent profile
      const profile = {
        email,
        name: parentData.name,
        phone: parentData.phone,
        relation: parentData.relation,
        studentRegNo: studentData.regNo,
        studentName: studentData.name,
        studentHostel: studentData.hostel,
        createdAt: new Date().toISOString(),
      };

      // Save profile to store
      addParentProfile(email, profile);

      // Login as parent
      loginWithGmail(email, profile);

      toast({
        title: "Welcome!",
        description: `Welcome ${parentData.name}. Your account has been set up successfully.`,
      });

      navigate("/");
      setIsLoading(false);
    }, 1000);
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Redirecting...</p>
          {setTimeout(() => navigate("/parent/gmail-signup"), 2000)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStep(step === 2 ? 1 : 0)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-4xl">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Step {step} of 2 - We need some information to get you started
            </p>
          </div>
        </div>

        {/* Step 1: Parent Details */}
        {step === 1 && (
          <div className="surface-card p-8 rounded-lg shadow-leaf max-w-lg">
            <div className="mb-8">
              <h2 className="font-display text-2xl mb-2">Parent Information</h2>
              <p className="text-muted-foreground text-sm">
                Please provide your details
              </p>
            </div>

            <form onSubmit={handleParentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Gmail Address (Read-only)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="mt-2 h-10 bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={parentData.name}
                  onChange={(e) =>
                    setParentData({ ...parentData, name: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="10-digit phone number"
                  value={parentData.phone}
                  onChange={(e) =>
                    setParentData({
                      ...parentData,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="relation" className="text-sm font-medium">
                  Relation to Student <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={parentData.relation}
                  onValueChange={(value) =>
                    setParentData({ ...parentData, relation: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full mt-6 bg-gradient-hero text-primary-foreground h-11"
              >
                Continue to Next Step
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Student Details */}
        {step === 2 && (
          <div className="surface-card p-8 rounded-lg shadow-leaf max-w-lg">
            <div className="mb-8">
              <h2 className="font-display text-2xl mb-2">Student Information</h2>
              <p className="text-muted-foreground text-sm">
                Please provide your ward's details
              </p>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="regNo" className="text-sm font-medium">
                  Registration Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="regNo"
                  placeholder="e.g., 24csc32"
                  value={studentData.regNo}
                  onChange={(e) =>
                    setStudentData({ ...studentData, regNo: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="studentName" className="text-sm font-medium">
                  Student Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="studentName"
                  placeholder="Enter student's full name"
                  value={studentData.name}
                  onChange={(e) =>
                    setStudentData({ ...studentData, name: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="hostel" className="text-sm font-medium">
                  Hostel <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={studentData.hostel}
                  onValueChange={(value) =>
                    setStudentData({ ...studentData, hostel: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bethel">Bethel</SelectItem>
                    <SelectItem value="Raj Bhawan">Raj Bhawan</SelectItem>
                    <SelectItem value="Mary Hall">Mary Hall</SelectItem>
                    <SelectItem value="Kabini">Kabini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-info/10 border border-info/20 rounded-lg p-4 mt-6">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Parent:</span> {parentData.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Once you submit, you'll be taken to the parent portal.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-hero text-primary-foreground h-11"
              >
                {isLoading ? "Setting up account..." : "Complete Setup & Enter Portal"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentOnboarding;
