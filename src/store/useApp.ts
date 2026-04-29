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

type GmailAccount = {
  id: string;
  regNo: string;
  email: string;
  password: string;
  createdAt: string;
};

type ParentProfile = {
  email: string;
  name: string;
  phone: string;
  relation: string;
  studentRegNo: string;
  studentName: string;
  studentHostel: string;
  createdAt: string;
};

type Student = {
  id: string;
  name: string;
  regNo: string;
  hostel: string;
  floor: string;
  room: string;
  shift: 1 | 2;
  department: string;
  parentId: string;
  parentPhone?: string;
};

type StaffMember = {
  role: Role;
  name: string;
  email: string;
  phone: string;
  department?: string;
};

interface AppState {
  user: SessionUser | null;
  requests: PermissionRequest[];
  gmailAccounts: GmailAccount[];
  parentProfiles: Record<string, ParentProfile>;
  students: Student[];
  staff: Record<string, StaffMember>;
  login: (user: SessionUser) => void;
  logout: () => void;
  loginWithGmail: (email: string, parentData: ParentProfile) => void;
  addRequest: (r: Omit<PermissionRequest, "id" | "createdAt" | "status" | "approvals" | "permissionCount">) => void;
  updateRequest: (id: string, patch: Partial<PermissionRequest>) => void;
  approve: (id: string, role: Role, by: string) => void;
  reject: (id: string, role: Role, reason: string) => void;
  removeRequest: (id: string) => void;
  addGmailAccount: (account: GmailAccount) => void;
  removeGmailAccount: (id: string) => void;
  getGmailAccounts: () => GmailAccount[];
  addParentProfile: (email: string, profile: ParentProfile) => void;
  getParentProfile: (email: string) => ParentProfile | undefined;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  removeStudent: (id: string) => void;
  addParent: (parent: Omit<ParentProfile, "createdAt">) => void;
  addStaff: (id: string, staff: StaffMember) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;
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
    (set, get) => ({
      user: null,
      requests: REQUESTS,
      gmailAccounts: [],
      parentProfiles: {},
      students: STUDENTS,
      staff: STAFF,
      login: (user) => {
        set({ user });
      },
      logout: () => set({ user: null }),
      loginWithGmail: (email, parentData) => {
        set({
          user: {
            role: "parent",
            name: parentData.name,
            email: email,
            parentId: `parent_${Date.now()}`,
          },
        });
      },
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
      addGmailAccount: (account) =>
        set((s) => ({ gmailAccounts: [account, ...s.gmailAccounts] })),
      removeGmailAccount: (id) =>
        set((s) => ({ gmailAccounts: s.gmailAccounts.filter((a) => a.id !== id) })),
      getGmailAccounts: () => get().gmailAccounts,
      addParentProfile: (email, profile) =>
        set((s) => ({ parentProfiles: { ...s.parentProfiles, [email]: profile } })),
      getParentProfile: (email) => get().parentProfiles[email],
      addStudent: (student) =>
        set((s) => ({ students: [student, ...s.students] })),
      updateStudent: (id, patch) =>
        set((s) => ({ students: s.students.map((st) => (st.id === id ? { ...st, ...patch } : st)) })),
      removeStudent: (id) =>
        set((s) => ({ students: s.students.filter((st) => st.id !== id) })),
      addParent: (parent) =>
        set((s) => ({
          parentProfiles: {
            ...s.parentProfiles,
            [parent.email]: { ...parent, createdAt: new Date().toISOString() },
          },
        })),
      addStaff: (id, staffMember) =>
        set((s) => ({ staff: { ...s.staff, [id]: staffMember } })),
      updateStaff: (id, patch) =>
        set((s) => ({
          staff: {
            ...s.staff,
            [id]: { ...s.staff[id], ...patch },
          },
        })),
      removeStaff: (id) =>
        set((s) => {
          const newStaff = { ...s.staff };
          delete newStaff[id];
          return { staff: newStaff };
        }),
    }),
    { name: "wcc-portal", partialize: (s) => ({ user: s.user, requests: s.requests, gmailAccounts: s.gmailAccounts, parentProfiles: s.parentProfiles, students: s.students, staff: s.staff }) }
  )
);

export const findStudent = (id: string) => STUDENTS.find((s) => s.id === id);
export const findParent = (id: string) => PARENTS.find((p) => p.id === id);
