import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/wcc-logo.png";
import campus from "@/assets/campus-hero.jpg";
import { ArrowLeft } from "lucide-react";

const ParentOtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const email = location.state?.email || "";
  const isSignup = location.state?.isSignup || false;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Call backend to verify OTP
    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // OTP verified
        sessionStorage.setItem("parentEmail", email);
        sessionStorage.setItem("otpVerified", "true");

        if (isSignup) {
          // First-time signup - go to onboarding
          navigate("/parent/onboarding", { state: { email } });
        } else {
          // Returning user - go to parent portal
          navigate("/parent/track");
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid OTP",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Backend server not running. Please ensure the server is started.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setTimer(120);
        toast({
          title: "OTP Resent",
          description: "New OTP sent to your Gmail address",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resend OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Redirecting to login...</p>
          {setTimeout(() => navigate("/parent/gmail-signup"), 2000)}
        </div>
      </div>
    );
  }

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

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/parent/gmail-signup")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h2 className="font-display text-3xl text-foreground">Verify OTP</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            Enter the 6-digit OTP sent to
          </p>
          <p className="text-sm font-mono text-foreground mb-8">
            {email}
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="otp" className="text-sm font-medium">
                OTP Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="mt-2 h-12 text-center text-2xl tracking-widest bg-background border-primary/30 focus:ring-primary font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Check your Gmail inbox and spam folder
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !otp}
            className="w-full mt-6 h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-medium tracking-wide"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="mt-6 text-center">
            {timer > 0 ? (
              <p className="text-sm text-muted-foreground">
                OTP expires in: <span className="font-semibold text-foreground">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</span>
              </p>
            ) : (
              <Button
                type="button"
                variant="link"
                onClick={handleResendOtp}
                className="text-primary"
              >
                Resend OTP
              </Button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed text-center">
            Didn't receive OTP? Check your spam folder or wait a moment and try resending.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ParentOtpVerification;
