import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { canParentChangePassword, markParentPasswordChanged } from "@/lib/parentAccount";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/wcc-logo.png";
import campus from "@/assets/campus-hero.jpg";
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";

const ParentPasswordChange = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const email = searchParams.get("email") || "";
  const fromLogin = searchParams.get("from") === "login";
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canChange, setCanChange] = useState(true);
  const [reason, setReason] = useState<string | undefined>();
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    if (email) {
      checkPasswordChangeStatus();
    }
  }, [email]);

  const checkPasswordChangeStatus = async () => {
    const result = await canParentChangePassword(email);
    setCanChange(result.canChange);
    setReason(result.reason);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Update the user's password
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      
      if (getUserError || !user) {
        toast({
          title: "Error",
          description: "Unable to verify user. Please log in again.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        toast({
          title: "Error",
          description: updateError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Mark password as changed in user metadata
      await markParentPasswordChanged(email);
      
      setPasswordChanged(true);
      
      toast({
        title: "Password Changed Successfully",
        description: "Your password has been updated. You will not be able to change it again without contacting the admin.",
      });

      // Redirect to parent home after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);

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

  // If password already changed and can't change again
  if (!canChange && !passwordChanged) {
    return (
      <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
        <div className="relative hidden lg:flex flex-col justify-between text-primary-foreground p-12 overflow-hidden">
          <img
            src={campus}
            alt="WCC campus"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          <div className="relative z-10 flex items-center gap-4">
            <img src={logo} alt="WCC crest" width={64} height={64} className="h-16 w-16 rounded-full bg-background/95 p-1 ring-2 ring-gold/70" />
            <div>
              <div className="font-display text-3xl">Women's Christian College</div>
              <div className="text-xs uppercase tracking-[0.22em] text-gold">Chennai · Estd. 1915</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                Cannot Change Password
              </CardTitle>
              <CardDescription>
                You have already changed your password once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {reason || "Please contact the administrator to reset your password."}
              </p>
              <Button 
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If password successfully changed
  if (passwordChanged) {
    return (
      <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
        <div className="relative hidden lg:flex flex-col justify-between text-primary-foreground p-12 overflow-hidden">
          <img
            src={campus}
            alt="WCC campus"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          <div className="relative z-10 flex items-center gap-4">
            <img src={logo} alt="WCC crest" width={64} height={64} className="h-16 w-16 rounded-full bg-background/95 p-1 ring-2 ring-gold/70" />
            <div>
              <div className="font-display text-3xl">Women's Christian College</div>
              <div className="text-xs uppercase tracking-[0.22em] text-gold">Chennai · Estd. 1915</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Password Changed
              </CardTitle>
              <CardDescription>
                Your password has been successfully updated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You will not be able to change your password again. If you need to reset it, please contact the administrator.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to home page...
              </p>
            </CardContent>
          </Card>
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
          <img src={logo} alt="WCC crest" width={64} height={64} className="h-16 w-16 rounded-full bg-background/95 p-1 ring-2 ring-gold/70" />
          <div>
            <div className="font-display text-3xl">Women's Christian College</div>
            <div className="text-xs uppercase tracking-[0.22em] text-gold">Chennai · Estd. 1915</div>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Change Password</div>
          <h1 className="font-display text-5xl xl:text-6xl leading-[1.05]">Secure Your Account</h1>
          <p className="mt-5 text-base text-primary-foreground/80 leading-relaxed">
            You must change your default password to continue. After this change, you will need to contact the admin to reset your password.
          </p>
        </div>
        <div className="relative z-10 text-xs text-primary-foreground/70 tracking-wide">
          © {new Date().getFullYear()} Women's Christian College, Chennai. All rights reserved.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <Card className="w-full max-w-md surface-card p-8 sm:p-10 shadow-leaf">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src={logo} alt="WCC crest" width={48} height={48} className="h-12 w-12 rounded-full bg-background ring-2 ring-primary/20" />
            <div>
              <div className="font-display text-xl text-primary">Women's Christian College</div>
              <div className="text-[10px] uppercase tracking-widest text-accent">Residents Permission Portal</div>
            </div>
          </div>
          
          {fromLogin && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>First Login:</strong> You must change your default password to continue.
              </p>
            </div>
          )}

          <h2 className="font-display text-3xl text-foreground flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Change Password
          </h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            Enter your new password. You won't be able to change it again without contacting admin.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  New Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-12 bg-background border-primary/30 focus:ring-primary pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-12 bg-background border-primary/30 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> After changing your password, you won't be able to change it again yourself. 
                If you need to reset it, please contact the administrator.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-medium tracking-wide"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>

          <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
            Default password was sent to your email when your child was registered.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ParentPasswordChange;