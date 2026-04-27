import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/store/useApp";
import logo from "@/assets/wcc-logo.png";
import campus from "@/assets/campus-hero.jpg";
import { Eye, EyeOff } from "lucide-react";

const ParentGmailSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const gmailAccounts = useApp((s) => s.gmailAccounts);
  const getParentProfile = useApp((s) => s.getParentProfile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Check if email exists in created gmails
    const gmailAccount = gmailAccounts.find((g) => g.email.toLowerCase() === email.toLowerCase());
    
    if (!gmailAccount) {
      toast({
        title: "Error",
        description: "Gmail account not found. Make sure the email is in format: {StudentRegNo}parent@gmail.com (e.g., 24CSC32parent@gmail.com)",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate password matches the default password for this regNo
    if (password !== gmailAccount.password) {
      toast({
        title: "Error",
        description: "Incorrect password. Use the default password provided by admin.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if this is first-time signup (no existing profile) or returning user
    const existingProfile = getParentProfile(email);
    const isSignup = !existingProfile;

    // Call backend to send OTP
    try {
      const response = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("parentEmail", email);
        navigate("/parent/gmail-otp", { state: { email, isSignup } });
        toast({
          title: "OTP Sent",
          description: "Check your Gmail inbox for the verification code",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Backend server not running. Please ensure the server is started with 'npm run dev' in the server folder.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between text-primary-foreground p-12 overflow-hidden">
        <img
          src={campus}
          alt="WCC campus tree-lined avenue"
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="relative z-10 flex items-center gap-4">
          <img src={logo} alt="WCC crest" width={64} height={64} className="h-16 w-16 bg-background/95 p-1 ring-2 ring-gold/70" />
          <div>
            <div className="font-display text-3xl">Women's Christian College</div>
            <div className="text-xs uppercase tracking-[0.22em] text-gold">Chennai · Estd. 1915</div>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Residents Permission Portal</div>
          <h1 className="font-display text-5xl xl:text-6xl leading-[1.05]">A safer, simpler way to seek permission.</h1>
          <p className="mt-5 text-base text-primary-foreground/80 leading-relaxed">
            From a parent's request to the security gate — every approval, every signature, in one place.
            Built for parents, deans, heads of department, wardens, gate-pass faculty, security and the administrator.
          </p>
        </div>
        <div className="relative z-10 text-xs text-primary-foreground/70 tracking-wide">
          © {new Date().getFullYear()} Women's Christian College, Chennai. All rights reserved.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <form onSubmit={handleSubmit} className="w-full max-w-md surface-card p-8 sm:p-10 shadow-leaf">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src={logo} alt="WCC crest" width={48} height={48} className="h-12 w-12 bg-background ring-2 ring-primary/20" />
            <div>
              <div className="font-display text-xl text-primary">Women's Christian College</div>
              <div className="text-[10px] uppercase tracking-widest text-accent">Residents Permission Portal</div>
            </div>
          </div>

          <h2 className="font-display text-3xl text-foreground">
            Sign In with Gmail
          </h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            Sign in with your parent Gmail account created by the administrator
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Parent Gmail Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., 24CSC32parent@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-12 bg-background border-primary/30 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Created by admin: {"{StudentRegNo}parent@gmail.com"} (e.g., 24CSC32parent@gmail.com)
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Default Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter default password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background border-primary/30 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Format: wcc@@20{"{YY}"} where YY is from registration number (e.g., 24CSC32 → wcc@@2024)
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-medium tracking-wide"
          >
            {isLoading ? "Verifying..." : "Continue"}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="ml-2 text-primary hover:underline font-medium"
              >
                Go to Login
              </button>
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
            An OTP will be sent to your Gmail address for verification. On first login, you'll be asked to fill in your details to set up your account.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ParentGmailSignup;
