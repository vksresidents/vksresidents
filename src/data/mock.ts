import { useToast, toast } from "@/hooks/use-toast";
import type { Parent, PermissionRequest, Student } from "@/types/domain";

export { useToast, toast };

export const PARENTS: Parent[] = [
  {
    id: "parent-1",
    name: "Anita Krishnan",
    email: "anita.krishnan@example.com",
    phone: "+91 98401 23456",
    childIds: ["student-1"],
  },
  {
    id: "parent-2",
    name: "Meera Subramanian",
    email: "meera.subramanian@example.com",
    phone: "+91 98405 67890",
    childIds: ["student-2"],
  },
];

export const STUDENTS: Student[] = [
  {
    id: "student-1",
    name: "Priya Krishnan",
    regNo: "WCC24-001",
    hostel: "Rose Hall",
    floor: "2",
    room: "208",
    shift: 1,
    department: "Physics",
    parentId: "parent-1",
    photo: "",
  },
  {
    id: "student-2",
    name: "Nisha Subramanian",
    regNo: "WCC24-002",
    hostel: "Lily Hall",
    floor: "3",
    room: "315",
    shift: 2,
    department: "Mathematics",
    parentId: "parent-2",
    photo: "",
  },
];

export const STAFF = {
  dean: {
    name: "Dr. Lakshmi Rao",
    email: "dean@example.com",
  },
  hod_cs: {
    name: "Dr. Saranya Raman",
    email: "hod.cs@example.com",
  },
  warden: {
    name: "Prof. Meena Iyer",
    email: "warden@example.com",
  },
  gatepass: {
    name: "Mr. Arun Kumar",
    email: "gatepass@example.com",
  },
  security: {
    name: "Mr. Karthik Sharma",
    email: "security@example.com",
  },
  admin: {
    name: "Ms. Priya Nair",
    email: "admin@example.com",
  },
};

export const REQUESTS: PermissionRequest[] = [
  {
    id: "req-1",
    studentId: "student-1",
    parentId: "parent-1",
    type: "day_out",
    medical: false,
    destination: "Phoenix Mall, Velachery",
    expectedLeave: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    expectedReturn: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    status: "pending_dean",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    permissionCount: 1,
    approvals: [],
  },
  {
    id: "req-2",
    studentId: "student-2",
    parentId: "parent-2",
    type: "special",
    medical: true,
    destination: "Apollo Hospital, Chennai",
    expectedLeave: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    expectedReturn: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    status: "pending_hod",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    permissionCount: 1,
    approvals: [],
  },
];