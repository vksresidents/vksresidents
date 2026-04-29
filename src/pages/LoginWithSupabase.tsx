import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronLeft } from "lucide-react";
import logo from "@/assets/wcc-logo.png";
import campus from "@/assets/campus-hero.jpg";
import { ROLE_LABELS, type Role } from "@/types/domain";
import { isParentEmail, canParentChangePassword } from "@/lib/parentAccount";

const ROLES: Role[] = ["parent", "dean", "hod", "warden", "gatepass", "security", "admin"];

export const LoginWithSupabase = () => {
  const [step, setStep] = useState<"role" | "auth">("role");
  const [selectedRole, setSelectedRole] = useState<Role | "">();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [parentNeedsPasswordChange, setParentNeedsPasswordChange] = useState(false);
  
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();

  // Check if selected role is parent
  const isParent = selectedRole === "parent";

  // Handle Google Sign-in for parents
  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      setMessage({ type: "error", text: "Please select your role first" });
      return;
    }
    if (!supabase) {
      setMessage({ type: "error", text: "Supabase not configured. Please set up your Supabase project and update .env" });
      return;
    }

    setLoading(true);
    localStorage.setItem('selectedRole', selectedRole);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
      }
      // Note: On success, user is redirected to Google, so no setLoading(false) needed here
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
      setLoading(false);
    }
  };

  const handleSelectRole = () => {
    if (!selectedRole) return;
    setStep("auth");
    setMessage(null);
  };

  const handleBackToRole = () => {
    setStep("role");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsSignUp(false);
    setMessage(null);
  };

  const validateForm = () => {
    if (!email || !password) {
      setMessage({ type: "error", text: "Email and password are required" });
      return false;
    }
    if (isSignUp && password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return false;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      // Check if email is in allowlist
      const { data: allowedUser, error: allowError } = await supabase
        .from('allowed_users')
        .select('id, is_active')
        .eq('email', email)
        .single();

      if (allowError || !allowedUser) {
        setMessage({ type: "error", text: "You are not authorized to access this portal. Contact the administrator." });
        setLoading(false);
        return;
      }

      if (!allowedUser.is_active) {
        setMessage({ type: "error", text: "Your account has been deactivated. Contact the administrator." });
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const { data, error } = await signUp(email, password);
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Account created! Signing you in..." });
          setTimeout(() => {
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setIsSignUp(false);
            navigate("/");
          }, 1500);
        }
      } else {
        const { data, error } = await signIn(email, password);
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Login successful! Redirecting..." });
          setTimeout(() => navigate("/"), 1500);
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
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
        <Card className="w-full max-w-md p-8 sm:p-10 shadow-leaf">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src={logo} alt="WCC crest" width={48} height={48} className="h-12 w-12 bg-background ring-2 ring-primary/20" />
            <div>
              <div className="font-display text-xl text-primary">WCC Portal</div>
              <div className="text-[10px] uppercase tracking-widest text-accent">Residents Permission</div>
            </div>
          </div>

          {/* STEP 1: Select Role */}
          {step === "role" && (
            <>
              <h2 className="font-display text-3xl text-foreground">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-8">Sign in to continue to the portal.</p>

              {message && (
                <Alert className={`mb-6 ${message.type === "error" ? "border-destructive bg-destructive/10" : "border-green-500 bg-green-500/10"}`}>
                  <AlertDescription className={message.type === "error" ? "text-destructive" : "text-green-700"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="role" className="text-sm font-medium">
                    Select Your Role <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedRole || ""} onValueChange={(v) => setSelectedRole(v as Role)}>
                    <SelectTrigger id="role" className="h-12 bg-background border-primary/30 focus:ring-primary mt-2">
                      <SelectValue placeholder="— Choose role —" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSelectRole}
                  disabled={!selectedRole}
                  className="w-full h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-medium tracking-wide mt-6"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* STEP 2: Email/Password Auth - For Non-Parents Only */}
          {step === "auth" && !isParent && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToRole}
                  className="p-0 h-auto"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="font-display text-xl text-foreground">
                    {isSignUp ? "Create Account" : "Sign In"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    As {selectedRole ? ROLE_LABELS[selectedRole] : "User"}
                  </p>
                </div>
              </div>

              {message && (
                <Alert className={`mb-6 ${message.type === "error" ? "border-destructive bg-destructive/10" : "border-green-500 bg-green-500/10"}`}>
                  <AlertDescription className={message.type === "error" ? "text-destructive" : "text-green-700"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="mt-2 h-11 bg-background border-primary/30 focus:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="mt-2 h-11 bg-background border-primary/30 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="mt-2 h-11 bg-background border-primary/30 focus:ring-primary"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-medium tracking-wide"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setMessage(null);
                      setEmail("");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    disabled={loading}
                    className="text-primary hover:underline font-medium"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </span>
              </div>
            </>
          )}

          {/* STEP 2: Parent Login - Google Sign-in Only */}
          {step === "auth" && isParent && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToRole}
                  className="p-0 h-auto"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="font-display text-xl text-foreground">
                    Parent Sign In
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Sign in with your college Gmail ID
                  </p>
                </div>
              </div>

              {message && (
                <Alert className={`mb-6 ${message.type === "error" ? "border-destructive bg-destructive/10" : "border-green-500 bg-green-500/10"}`}>
                  <AlertDescription className={message.type === "error" ? "text-destructive" : "text-green-700"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Parent Account:</strong> Your account was created when your child was registered at the college. 
                    The parent email format is: <code className="bg-background px-1 rounded">[regno]parent@wcc.edu.in</code>
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Default password: <code className="bg-background px-1 rounded">wccparent@@2026</code>
                  <br />
                  (You will be prompted to change it on first login)
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
