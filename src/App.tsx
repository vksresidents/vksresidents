import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";
import { useApp } from "@/store/useApp";
import { useAuth } from "@/hooks/useAuth";

import ParentTrack from "./pages/parent/ParentTrack";
import ParentApproved from "./pages/parent/ParentApproved";
import ParentRejected from "./pages/parent/ParentRejected";
import PermissionForm from "./pages/parent/PermissionForm";
import ParentGmailSignup from "./pages/parent/ParentGmailSignup";
import ParentOtpVerification from "./pages/parent/ParentOtpVerification";
import ParentOnboarding from "./pages/parent/ParentOnboarding";
import ParentPasswordChange from "./pages/parent/ParentPasswordChange";

import { DeanPending, DeanApproved, DeanRejected } from "./pages/staff/DeanPages";
import { HodPending, HodApproved, HodRejected } from "./pages/staff/HodPages";
import { WardenPending, WardenApproved, WardenRejected, WardenNotArrived } from "./pages/staff/WardenPages";
import { GatePassPending, GatePassApproved } from "./pages/staff/GatePassPages";
import { SecurityApproved, SecurityExited, SecurityArrived, SecurityNotArrived } from "./pages/staff/SecurityPages";
import AdminHome from "./pages/staff/AdminHome";
import AdminParents from "./pages/staff/AdminParents";
import AdminStudents from "./pages/staff/AdminStudents";
import AdminRequests from "./pages/staff/AdminRequests";
import AdminStaff from "./pages/staff/AdminStaff";
import AdminHostelStudents from "./pages/staff/AdminHostelStudents";
import { AdminAllowlist } from "./pages/staff/AdminAllowlist";
import AdminManageGmail from "./pages/staff/AdminManageGmail";
import AddStudent from "./pages/staff/AddStudent";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: JSX.Element }) => {
  const user = useApp((s) => s.user);
  return user ? children : <Navigate to="/login" replace />;
};

// Component that syncs Supabase auth with app store
const AppContent = () => {
  useAuth(); // This hooks into Supabase and syncs with app store on mount and changes
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/" element={<Protected><Index /></Protected>} />

      {/* Parent Gmail Flow */}
      <Route path="/parent/gmail-signup" element={<ParentGmailSignup />} />
      <Route path="/parent/gmail-otp" element={<ParentOtpVerification />} />
      <Route path="/parent/onboarding" element={<ParentOnboarding />} />
      <Route path="/parent/change-password" element={<ParentPasswordChange />} />

      {/* Parent */}
      <Route path="/parent/permission/:studentId" element={<Protected><PermissionForm /></Protected>} />
      <Route path="/parent/track" element={<Protected><ParentTrack /></Protected>} />
      <Route path="/parent/approved" element={<Protected><ParentApproved /></Protected>} />
      <Route path="/parent/rejected" element={<Protected><ParentRejected /></Protected>} />

      {/* Dean */}
      <Route path="/dean" element={<Protected><Index /></Protected>} />
      <Route path="/dean/pending" element={<Protected><DeanPending /></Protected>} />
      <Route path="/dean/approved" element={<Protected><DeanApproved /></Protected>} />
      <Route path="/dean/rejected" element={<Protected><DeanRejected /></Protected>} />

      {/* HOD */}
      <Route path="/hod" element={<Protected><Index /></Protected>} />
      <Route path="/hod/pending" element={<Protected><HodPending /></Protected>} />
      <Route path="/hod/approved" element={<Protected><HodApproved /></Protected>} />
      <Route path="/hod/rejected" element={<Protected><HodRejected /></Protected>} />

      {/* Warden */}
      <Route path="/warden" element={<Protected><Index /></Protected>} />
      <Route path="/warden/pending" element={<Protected><WardenPending /></Protected>} />
      <Route path="/warden/approved" element={<Protected><WardenApproved /></Protected>} />
      <Route path="/warden/rejected" element={<Protected><WardenRejected /></Protected>} />
      <Route path="/warden/not-arrived" element={<Protected><WardenNotArrived /></Protected>} />

      {/* Gate Pass */}
      <Route path="/gatepass" element={<Protected><Index /></Protected>} />
      <Route path="/gatepass/pending" element={<Protected><GatePassPending /></Protected>} />
      <Route path="/gatepass/approved" element={<Protected><GatePassApproved /></Protected>} />

      {/* Security */}
      <Route path="/security" element={<Protected><Index /></Protected>} />
      <Route path="/security/approved" element={<Protected><SecurityApproved /></Protected>} />
      <Route path="/security/exited" element={<Protected><SecurityExited /></Protected>} />
      <Route path="/security/arrived" element={<Protected><SecurityArrived /></Protected>} />
      <Route path="/security/not-arrived" element={<Protected><SecurityNotArrived /></Protected>} />

      {/* Admin */}
      <Route path="/admin" element={<Protected><AdminHome /></Protected>} />
      <Route path="/admin/parents" element={<Protected><AdminParents /></Protected>} />
      <Route path="/admin/students" element={<Protected><AdminStudents /></Protected>} />
      <Route path="/admin/requests" element={<Protected><AdminRequests /></Protected>} />
      <Route path="/admin/staff" element={<Protected><AdminStaff /></Protected>} />
      <Route path="/admin/hostel/:hostel" element={<Protected><AdminHostelStudents /></Protected>} />
      <Route path="/admin/manage-gmail" element={<Protected><AdminManageGmail /></Protected>} />
      <Route path="/admin/allowlist" element={<Protected><AdminAllowlist /></Protected>} />
      <Route path="/admin/add-student" element={<Protected><AddStudent /></Protected>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
