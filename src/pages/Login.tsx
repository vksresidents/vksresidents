import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/wcc-logo.png";
import campus from "@/assets/campus-hero.jpg";

const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: signInError } = await signInWithGoogle();
      if (signInError) {
        setError(`Google Sign-In failed: ${signInError}`);
      } else {
        // Success - user will be redirected automatically by Firebase
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Google Sign-In error: ${errorMessage}`);
    } finally {
      setGoogleLoading(false);
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
        <div className="w-full max-w-md surface-card p-8 sm:p-10 shadow-leaf">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src={logo} alt="WCC crest" width={48} height={48} className="h-12 w-12 rounded-full bg-background ring-2 ring-primary/20" />
            <div>
              <div className="font-display text-xl text-primary">Women's Christian College</div>
              <div className="text-[10px] uppercase tracking-widest text-accent">Residents Permission Portal</div>
            </div>
          </div>
          <h2 className="font-display text-3xl text-foreground">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">Sign in with your authorized WCC email.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full bg-gradient-hero hover:opacity-90 text-primary-foreground font-medium py-2.5"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Your email will be verified against authorized accounts. Only registered WCC staff and parents can access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
