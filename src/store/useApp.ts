import { create } from "zustand";
import { persist } from "zustand/middleware";
import { REQUESTS, STAFF, STUDENTS, PARENTS } from "@/data/mock";
import type { PermissionRequest, Role } from "@/types/domain";

type SessionUser = {
  role: Role;
  name: string;
  email: string;
  parentId?: string;
};

interface AppState {
  user: SessionUser | null;
  requests: PermissionRequest[];
  login: (role: Role) => void;
  logout: () => void;
  addRequest: (r: Omit<PermissionRequest, "id" | "createdAt" | "status" | "approvals" | "permissionCount">) => void;
  updateRequest: (id: string, patch: Partial<PermissionRequest>) => void;
  approve: (id: string, role: Role, by: string) => void;
  reject: (id: string, role: Role, reason: string) => void;
  removeRequest: (id: string) => void;
}

const nextStatusOnApprove = (current: PermissionRequest["status"], type: PermissionRequest["type"]): PermissionRequest["status"] => {
  // Special permission flow: HOD -> Dean -> Warden -> GatePass -> approved
  // Day/Night out flow: Dean -> Warden -> GatePass -> approved
  switch (current) {
    case "pending_hod": return "pending_dean";
    case "pending_dean": return "pending_warden";
    case "pending_warden": return "pending_gatepass";
    case "pending_gatepass": return "approved";
    default: return current;
  }
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      requests: REQUESTS,
      login: (role) => {
        const userMap: Record<Role, SessionUser> = {
          parent: { role, name: PARENTS[0].name, email: PARENTS[0].email, parentId: PARENTS[0].id },
          dean: { role, ...STAFF.dean },
          hod: { role, ...STAFF.hod_cs },
          warden: { role, ...STAFF.warden },
          gatepass: { role, ...STAFF.gatepass },
          security: { role, ...STAFF.security },
          admin: { role, ...STAFF.admin },
        };
        set({ user: userMap[role] });
      },
      logout: () => set({ user: null }),
      addRequest: (r) =>
        set((s) => {
          const initial: PermissionRequest["status"] = r.type === "special" ? "pending_hod" : "pending_dean";
          const studentReqCount = s.requests.filter(
            (x) => x.studentId === r.studentId && x.type === r.type
          ).length;
          const newReq: PermissionRequest = {
            ...r,
            id: `r${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: initial,
            approvals: [],
            permissionCount: studentReqCount + 1,
          };
          return { requests: [newReq, ...s.requests] };
        }),
      updateRequest: (id, patch) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      approve: (id, role, by) =>
        set((s) => ({
          requests: s.requests.map((r) => {
            if (r.id !== id) return r;
            return {
              ...r,
              status: nextStatusOnApprove(r.status, r.type),
              approvals: [...r.approvals, { role, by, at: new Date().toISOString() }],
            };
          }),
        })),
      reject: (id, role, reason) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? { ...r, status: "rejected", rejectedBy: role, rejectionReason: reason } : r
          ),
        })),
      removeRequest: (id) => set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),
    }),
    { name: "wcc-portal", partialize: (s) => ({ user: s.user, requests: s.requests }) }
  )
);

export const findStudent = (id: string) => STUDENTS.find((s) => s.id === id);
export const findParent = (id: string) => PARENTS.find((p) => p.id === id);
