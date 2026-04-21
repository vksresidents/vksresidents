import { Navigate } from "react-router-dom";
import { useApp } from "@/store/useApp";
import ParentHome from "./parent/ParentHome";
import { DeanHome } from "./staff/DeanPages";
import { HodHome } from "./staff/HodPages";
import { WardenHome } from "./staff/WardenPages";
import { GatePassHome } from "./staff/GatePassPages";
import { SecurityHome } from "./staff/SecurityPages";
import AdminHome from "./staff/AdminHome";

const Index = () => {
  const user = useApp((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case "parent": return <ParentHome />;
    case "dean": return <DeanHome />;
    case "hod": return <HodHome />;
    case "warden": return <WardenHome />;
    case "gatepass": return <GatePassHome />;
    case "security": return <SecurityHome />;
    case "admin": return <AdminHome />;
  }
};

export default Index;
