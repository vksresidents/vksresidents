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
    <header className="sticky top-0 z-40">
      <div className="bg-primary text-center py-1">
        <p className="text-gold font-display text-sm tracking-[0.3em]">LIGHTED TO LIGHTEN</p>
      </div>
      <div className="bg-background border-b border-border/50">
        <div className="container flex items-center justify-center py-4 gap-6">
          <div className="flex flex-col items-center">
            <img src={logo} alt="Women's Christian College crest" width={100} height={100} className="h-24 w-24 flex-shrink-0" />
            <div className="text-xs text-muted-foreground mt-2">Since 1915</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl text-primary leading-tight">Women's Christian College</div>
            <div className="text-xs text-muted-foreground mt-1">An Autonomous Institution affiliated to the University of Madras</div>
            <div className="text-xs text-muted-foreground">Re-accredited by NAAC in 2019 with Grade A+</div>
            <div className="text-xs text-muted-foreground">College with Potential for Excellence</div>
          </div>
        </div>
      </div>
      <div className="bg-primary pt-3 pb-0 border-b border-primary">
        <div className="container flex items-start justify-between">
          <Link to="/">
            <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-6 py-2 rounded-lg mb-3">
              Home
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gold hover:text-gold/80 hover:bg-primary mt-1">
            <LogOut className="h-4 w-4 mr-1.5" />
            <span className="text-gold">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};


export const PortalFooter = () => (
  <footer className="mt-16 border-t border-border bg-secondary/60">
    <div className="container py-8 grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
      <div>
        <div className="font-display text-xl text-foreground">Women's Christian College</div>
        <div className="text-xs">College Road, Chennai – 600 006</div>
      </div>
      <div className="md:text-right">
        © {new Date().getFullYear()} Women's Christian College, Chennai. All rights reserved.
      </div>
    </div>
  </footer>
);
