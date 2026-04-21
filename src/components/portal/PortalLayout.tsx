import { ReactNode } from "react";
import { PortalFooter, PortalHeader } from "./PortalChrome";

export const PortalLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <PortalHeader />
    <main className="flex-1 animate-fade-in">{children}</main>
    <PortalFooter />
  </div>
);