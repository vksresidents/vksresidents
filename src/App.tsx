import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useApp } from "@/store/useApp";

import ParentTrack from "./pages/parent/ParentTrack";
import ParentApproved from "./pages/parent/ParentApproved";
import ParentRejected from "./pages/parent/ParentRejected";
import PermissionForm from "./pages/parent/PermissionForm";

import { DeanPending, DeanApproved, DeanRejected } from "./pages/staff/DeanPages";
import { HodPending, HodApproved, HodRejected } from "./pages/staff/HodPages";
import { WardenPending, WardenApproved, WardenRejected, WardenNotArrived } from "./pages/staff/WardenPages";
import { GatePassPending, GatePassApproved } from "./pages/staff/GatePassPages";
import { SecurityApproved, SecurityExited, SecurityNotArrived } from "./pages/staff/SecurityPages";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: JSX.Element }) => {
  const user = useApp((s) => s.user);
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Index /></Protected>} />

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
          <Route path="/security/not-arrived" element={<Protected><SecurityNotArrived /></Protected>} />

          {/* Admin */}
          <Route path="/admin" element={<Protected><Index /></Protected>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
