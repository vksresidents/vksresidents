import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/store/useApp";
import { ROLE_LABELS, type Role } from "@/types/domain";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/wcc-logo.png";
import campus from "@/assets/campus-hero.jpg";

const ROLES: Role[] = ["parent", "dean", "hod", "warden", "gatepass", "security", "admin"];

const Login = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useApp((s) => s.login);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) return;
    if (!supabase) {
      alert('Supabase not configured. Please set up your Supabase project and update .env');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          shouldCreateUser: true
        }
      });
      
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('OTP has been sent to your email. Check your inbox and spam folder.');
        setIsOtpSent(true);
      }
    } catch (err) {
      alert(`Error sending OTP: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!role) {
      alert('Please select your role first.');
      return;
    }
    if (!supabase) {
      alert('Supabase not configured. Please set up your Supabase project and update .env');
      return;
    }
    localStorage.setItem('selectedRole', role);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173' // Adjust to your app's URL
      }
    });
    if (error) {
      alert(error.message);
      localStorage.removeItem('selectedRole');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    if (!supabase) {
      alert('Supabase not configured. Please set up your Supabase project and update .env');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      const user = data.user;
      const sessionUser = {
        role: role as Role,
        name: user?.user_metadata?.name || user?.email || '',
        email: user?.email || '',
        parentId: role === 'parent' ? 'someId' : undefined, // Adjust as needed
      };
      login(sessionUser);
      navigate("/");
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
          <img src={logo} alt="WCC crest" width={64} height={64} className="h-16 w-16 rounded-full bg-background/95 p-1 ring-2 ring-gold/70" />
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
        <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="w-full max-w-md surface-card p-8 sm:p-10 shadow-leaf">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src={logo} alt="WCC crest" width={48} height={48} className="h-12 w-12 rounded-full bg-background ring-2 ring-primary/20" />
            <div>
              <div className="font-display text-xl text-primary">Women's Christian College</div>
              <div className="text-[10px] uppercase tracking-widest text-accent">Residents Permission Portal</div>
            </div>
          </div>
          <h2 className="font-display text-3xl text-foreground">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">Sign in to continue to the portal.</p>

          {!isOtpSent ? (
            <>
              <div className="space-y-2 mb-4">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Gmail ID"
                  className="h-12 bg-background border-primary/30 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2 mb-6">
                <Label htmlFor="role" className="text-sm font-medium">
                  Select Your Role <span className="text-destructive">*</span>
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger id="role" className="h-12 bg-background border-primary/30 focus:ring-primary">
                    <SelectValue placeholder="— Choose role —" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <Button 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  disabled={!role} 
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
              </div>

              <Button type="submit" disabled={!email || !role || loading} className="w-full mt-6 h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-medium tracking-wide">
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">OTP sent to {email}. Enter the code below.</p>

              <div className="space-y-2 mb-6">
                <Label htmlFor="otp" className="text-sm font-medium">
                  OTP <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="h-12 bg-background border-primary/30 focus:ring-primary"
                  required
                />
              </div>

              <Button type="submit" disabled={!otp || loading} className="w-full mt-6 h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-medium tracking-wide">
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOtpSent(false)}
                className="w-full mt-2 h-10"
              >
                Back
              </Button>
            </>
          )}

          <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
            Use your college Gmail ID for authentication. OTP will be sent to your email.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
