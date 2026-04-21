import { StaffHome } from "@/components/portal/StaffHome";
import { StaffTablePage, isPendingFor } from "@/components/portal/StaffTablePage";
import type { PermissionRequest } from "@/types/domain";

export const HodHome = () => (
  <StaffHome role="hod" pendingStatus="pending_hod" basePath="/hod" approvalWindow={{ start: "08:00", end: "17:30" }} />
);
export const HodPending = () => (
  <StaffTablePage role="hod" title="Pending requests" basePath="/hod" filter={isPendingFor("pending_hod")} variant="pending" />
);
export const HodApproved = () => (
  <StaffTablePage role="hod" title="Approved requests" basePath="/hod"
    filter={(r: PermissionRequest) => ["approved", "exited", "arrived"].includes(r.status) || (r.approvals.some((a) => a.role === "hod") && r.status !== "rejected")} variant="approved" />
);
export const HodRejected = () => (
  <StaffTablePage role="hod" title="Rejected requests" basePath="/hod"
    filter={(r: PermissionRequest) => r.status === "rejected"} variant="rejected" />
);
