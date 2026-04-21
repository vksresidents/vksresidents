import { StaffHome } from "@/components/portal/StaffHome";
import { StaffTablePage, isPendingFor } from "@/components/portal/StaffTablePage";
import type { PermissionRequest } from "@/types/domain";

export const WardenHome = () => (
  <StaffHome role="warden" pendingStatus="pending_warden" basePath="/warden" approvalWindow={{ start: "08:00", end: "18:00" }} showNotArrived />
);
export const WardenPending = () => (
  <StaffTablePage role="warden" title="Pending requests" basePath="/warden" filter={isPendingFor("pending_warden")} variant="pending" />
);
export const WardenApproved = () => (
  <StaffTablePage role="warden" title="Approved requests" basePath="/warden"
    filter={(r: PermissionRequest) => ["approved", "exited", "arrived"].includes(r.status)} variant="approved" />
);
export const WardenRejected = () => (
  <StaffTablePage role="warden" title="Rejected requests" basePath="/warden"
    filter={(r: PermissionRequest) => r.status === "rejected"} variant="rejected" />
);
export const WardenNotArrived = () => (
  <StaffTablePage role="warden" title="Not arrived" basePath="/warden"
    filter={(r: PermissionRequest) => r.status === "not_arrived"} variant="not_arrived" />
);
