import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/store/useApp";
import { ROLE_LABELS, type Role } from "@/types/domain";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import logo from "@/assets/wcc-logo.png";
import campus from "@/assets/campus-hero.jpg";

const ROLES: Role[] = ["parent", "dean", "hod", "warden", "gatepass", "security", "admin"];

const Login = () => {
  const [role, setRole] = useState<Role | "">("");
  const navigate = useNavigate();
  const login = useApp((s) => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    login(role as Role);
    navigate("/");
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
        <form onSubmit={handleSubmit} className="w-full max-w-md surface-card p-8 sm:p-10 shadow-leaf">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src={logo} alt="WCC crest" width={48} height={48} className="h-12 w-12 rounded-full bg-background ring-2 ring-primary/20" />
            <div>
              <div className="font-display text-xl text-primary">Women's Christian College</div>
              <div className="text-[10px] uppercase tracking-widest text-accent">Residents Permission Portal</div>
            </div>
          </div>
          <h2 className="font-display text-3xl text-foreground">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">Sign in to continue to the portal.</p>

          <div className="space-y-2">
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

          <Button type="submit" disabled={!role} className="w-full mt-6 h-12 bg-gradient-hero hover:opacity-95 text-primary-foreground font-medium tracking-wide">
            Continue to Portal
          </Button>

          <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
            Demo build · all roles open with mock data. Once Lovable Cloud and Google sign-in are enabled, only authorised
            college email addresses will be able to access this portal.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
