import { useApp } from "@/store/useApp";
import { ROLE_LABELS } from "@/types/domain";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/wcc-logo.png";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PortalHeader = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const loc = useLocation();
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-hero text-primary-foreground shadow-elevated">
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Women's Christian College crest" width={56} height={56} className="h-14 w-14 rounded-full bg-background/95 p-1 ring-2 ring-gold/60" />
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-2xl">Women's Christian College</div>
            <div className="text-xs uppercase tracking-[0.18em] text-gold">Residents Permission Portal</div>
          </div>
        </Link>
        <nav className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-[11px] uppercase tracking-wider text-gold/90">{ROLE_LABELS[user.role]}</span>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
            <LogOut className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </nav>
      </div>
      {loc.pathname !== "/" && <SubBar />}
    </header>
  );
};

const SubBar = () => (
  <div className="border-t border-white/10 bg-black/10 backdrop-blur">
    <div className="container h-10 flex items-center text-xs text-primary-foreground/80">
      <Link to="/" className="hover:text-gold">Home</Link>
    </div>
  </div>
);

export const PortalFooter = () => (
  <footer className="mt-16 border-t border-border bg-secondary/60">
    <div className="container py-8 grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
      <div>
        <div className="font-display text-xl text-foreground">Women's Christian College</div>
        <div className="text-xs">College Road, Chennai – 600 006</div>
      </div>
      <div>
        <div className="font-medium text-foreground mb-1">Quick Help</div>
        <ul className="space-y-0.5">
          <li>Hostel Office: +91 44 2827 1819</li>
          <li>Dean of Residents: dean.residents@wcc.edu.in</li>
        </ul>
      </div>
      <div className="md:text-right">
        © {new Date().getFullYear()} Women's Christian College, Chennai. All rights reserved.
      </div>
    </div>
  </footer>
);
