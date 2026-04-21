import { StaffHome } from "@/components/portal/StaffHome";
import { StaffTablePage, isPendingFor } from "@/components/portal/StaffTablePage";
import type { PermissionRequest } from "@/types/domain";

export const DeanHome = () => (
  <StaffHome role="dean" pendingStatus="pending_dean" basePath="/dean" approvalWindow={{ start: "08:00", end: "14:30" }} />
);
export const DeanPending = () => (
  <StaffTablePage role="dean" title="Pending requests" basePath="/dean" filter={isPendingFor("pending_dean")} variant="pending" />
);
export const DeanApproved = () => (
  <StaffTablePage role="dean" title="Approved (Gate Pass Issued)" basePath="/dean"
    filter={(r: PermissionRequest) => ["approved", "exited", "arrived"].includes(r.status)} variant="approved" />
);
export const DeanRejected = () => (
  <StaffTablePage role="dean" title="Rejected requests" basePath="/dean"
    filter={(r: PermissionRequest) => r.status === "rejected"} variant="rejected" />
);
