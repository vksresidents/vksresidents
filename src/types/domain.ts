// Domain types for the WCC Residents Permission Portal
export type Role =
  | "parent"
  | "dean"
  | "hod"
  | "warden"
  | "gatepass"
  | "security"
  | "admin";

export const ROLE_LABELS: Record<Role, string> = {
  parent: "Parent",
  dean: "Dean of Residents",
  hod: "Head of Department",
  warden: "Warden",
  gatepass: "Gate Pass Issuing Faculty",
  security: "Security Office",
  admin: "Administrator",
};

export type PermissionType = "day_out" | "night_out" | "special";

export const PERMISSION_LABELS: Record<PermissionType, string> = {
  day_out: "Day Out",
  night_out: "Night Out",
  special: "Special Permission",
};

export type Shift = 1 | 2;

export type RequestStatus =
  | "pending_hod"
  | "pending_dean"
  | "pending_warden"
  | "pending_gatepass"
  | "approved"
  | "exited"
  | "arrived"
  | "not_arrived"
  | "rejected";

export interface Student {
  id: string;
  name: string;
  regNo: string;
  hostel: string;
  floor: string;
  room: string;
  shift: Shift;
  department: string;
  parentId: string;
  photo?: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  childIds: string[];
}

export interface PermissionRequest {
  id: string;
  studentId: string;
  parentId: string;
  type: PermissionType;
  medical: boolean;
  destination: string;
  expectedLeave: string; // ISO
  expectedReturn: string;
  actualLeave?: string;
  actualReturn?: string;
  status: RequestStatus;
  rejectionReason?: string;
  rejectedBy?: Role;
  createdAt: string;
  permissionCount: number; // count for that student & type this semester
  approvals: { role: Role; at: string; by: string }[];
}
