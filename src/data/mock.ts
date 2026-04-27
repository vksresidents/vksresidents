import type { Parent, PermissionRequest, Student } from "@/types/domain";

const iso = (d: Date) => d.toISOString();
const today = new Date();
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};
const at = (n: number, h: number, m = 0) => {
  const d = addDays(n);
  d.setHours(h, m, 0, 0);
  return iso(d);
};

export const PARENTS: Parent[] = [
  { id: "p1", name: "Mrs. Lakshmi Raman", email: "lakshmi.raman@example.com", phone: "+91 98400 12345", childIds: ["s1"] },
  { id: "p2", name: "Mr. Anand Kumar", email: "anand.kumar@example.com", phone: "+91 98401 22345", childIds: ["s2", "s3"] },
  { id: "p3", name: "Mrs. Priya Joseph", email: "priya.joseph@example.com", phone: "+91 98402 32345", childIds: ["s4"] },
  { id: "p4", name: "Mr. Sundar Iyer", email: "sundar.iyer@example.com", phone: "+91 98403 42345", childIds: ["s5"] },
];

export const STUDENTS: Student[] = [
  { id: "s1", name: "Aarthi Raman", regNo: "24CSC54", hostel: "Main Hostel", floor: "3rd Floor", room: "312", shift: 1, department: "Computer Science", parentId: "p1" },
  { id: "s2", name: "Divya Kumar", regNo: "24ECO12", hostel: "Holyoke Hostel", floor: "Wing 2 · Ground Floor", room: "G-08", shift: 2, department: "Economics", parentId: "p2" },
  { id: "s3", name: "Meera Kumar", regNo: "23BIO07", hostel: "Coon Hostel", floor: "1st Floor", room: "104", shift: 1, department: "Biotechnology", parentId: "p2" },
  { id: "s4", name: "Sarah Joseph", regNo: "24ENG21", hostel: "Riverlands Hostel", floor: "2nd Floor", room: "210", shift: 2, department: "English Literature", parentId: "p3" },
  { id: "s5", name: "Anjali Iyer", regNo: "23PSY03", hostel: "Garden Hostel", floor: "1st Floor", room: "118", shift: 1, department: "Psychology", parentId: "p4" },
  { id: "s6", name: "Kavya Suresh", regNo: "24CSC22", hostel: "PG Hostel", floor: "2nd Floor", room: "207", shift: 1, department: "Computer Science", parentId: "p1" },
  { id: "s7", name: "Riya Mathew", regNo: "23MAT11", hostel: "Main Hostel", floor: "1st Floor", room: "115", shift: 2, department: "Mathematics", parentId: "p3" },
  { id: "s8", name: "Niveditha Rao", regNo: "24ECO45", hostel: "Holyoke Hostel", floor: "Wing 3 · 1st Floor", room: "121", shift: 1, department: "Economics", parentId: "p4" },
];

const mkApprovals = (roles: PermissionRequest["approvals"][number]["role"][], n: number) =>
  roles.map((r, i) => ({ role: r, at: at(n, 9 + i), by: r }));

export const REQUESTS: PermissionRequest[] = [
  {
    id: "r1",
    studentId: "s1",
    parentId: "p1",
    type: "day_out",
    medical: false,
    destination: "Phoenix Mall, Velachery",
    expectedLeave: at(0, 13, 30),
    expectedReturn: at(0, 17, 0),
    status: "pending_dean",
    createdAt: at(0, 9, 0),
    permissionCount: 4,
    approvals: [],
  },
  {
    id: "r2",
    studentId: "s2",
    parentId: "p2",
    type: "night_out",
    medical: false,
    destination: "Family function — Coimbatore",
    expectedLeave: at(1, 7, 30),
    expectedReturn: at(2, 17, 0),
    status: "pending_dean",
    createdAt: at(0, 10, 0),
    permissionCount: 2,
    approvals: [],
  },
  {
    id: "r3",
    studentId: "s3",
    parentId: "p2",
    type: "special",
    medical: true,
    destination: "Apollo Hospital, Greams Road",
    expectedLeave: at(0, 8, 0),
    expectedReturn: at(0, 18, 0),
    status: "pending_hod",
    createdAt: at(0, 7, 30),
    permissionCount: 1,
    approvals: [],
  },
  {
    id: "r4",
    studentId: "s4",
    parentId: "p3",
    type: "day_out",
    medical: false,
    destination: "Express Avenue Mall",
    expectedLeave: at(-1, 9, 0),
    expectedReturn: at(-1, 12, 30),
    actualLeave: at(-1, 9, 12),
    actualReturn: at(-1, 12, 22),
    status: "exited",
    createdAt: at(-2, 11, 0),
    permissionCount: 6,
    approvals: mkApprovals(["dean", "warden"], -2),
  },
  {
    id: "r5",
    studentId: "s5",
    parentId: "p4",
    type: "night_out",
    medical: false,
    destination: "Cousin's wedding — Madurai",
    expectedLeave: at(-3, 13, 30),
    expectedReturn: at(-2, 8, 0),
    actualLeave: at(-3, 13, 50),
    status: "not_arrived",
    createdAt: at(-4, 10, 0),
    permissionCount: 3,
    approvals: mkApprovals(["dean", "warden"], -4),
  },
  {
    id: "r6",
    studentId: "s6",
    parentId: "p1",
    type: "special",
    medical: false,
    destination: "Workshop — IIT Madras",
    expectedLeave: at(2, 7, 30),
    expectedReturn: at(2, 18, 0),
    status: "pending_dean",
    createdAt: at(0, 8, 30),
    permissionCount: 2,
    approvals: mkApprovals(["hod"], 0),
  },
  {
    id: "r7",
    studentId: "s7",
    parentId: "p3",
    type: "day_out",
    medical: false,
    destination: "Personal — Anna Nagar",
    expectedLeave: at(0, 8, 0),
    expectedReturn: at(0, 12, 30),
    status: "rejected",
    rejectionReason: "Quota for the semester already exceeded for this student.",
    rejectedBy: "dean",
    createdAt: at(-1, 9, 0),
    permissionCount: 7,
    approvals: [],
  },
  {
    id: "r8",
    studentId: "s8",
    parentId: "p4",
    type: "day_out",
    medical: false,
    destination: "Forum Vijaya Mall",
    expectedLeave: at(0, 13, 30),
    expectedReturn: at(0, 17, 0),
    status: "pending_warden",
    createdAt: at(0, 9, 30),
    permissionCount: 5,
    approvals: mkApprovals(["dean"], 0),
  },
  {
    id: "r9",
    studentId: "s2",
    parentId: "p2",
    type: "day_out",
    medical: false,
    destination: "Doctor visit — T. Nagar",
    expectedLeave: at(0, 8, 30),
    expectedReturn: at(0, 12, 30),
    status: "pending_gatepass",
    createdAt: at(0, 8, 0),
    permissionCount: 3,
    approvals: mkApprovals(["dean", "warden"], 0),
  },
  {
    id: "r10",
    studentId: "s1",
    parentId: "p1",
    type: "night_out",
    medical: false,
    destination: "Family — Trichy",
    expectedLeave: at(-7, 13, 30),
    expectedReturn: at(-6, 8, 0),
    actualLeave: at(-7, 13, 45),
    actualReturn: at(-6, 7, 50),
    status: "exited",
    createdAt: at(-8, 9, 0),
    permissionCount: 1,
    approvals: mkApprovals(["dean", "warden"], -8),
  },
  {
    id: "r11",
    studentId: "s6",
    parentId: "p1",
    type: "day_out",
    medical: false,
    destination: "Shopping — T. Nagar",
    expectedLeave: at(-5, 10, 0),
    expectedReturn: at(-5, 14, 0),
    actualLeave: at(-5, 10, 5),
    actualReturn: at(-5, 13, 55),
    status: "exited",
    createdAt: at(-6, 9, 0),
    permissionCount: 1,
    approvals: mkApprovals(["dean", "warden"], -6),
  },
];

export const STAFF = {
  dean: { name: "Dr. Esther Daniel", email: "dean.residents@wcc.edu.in" },
  hod_cs: { name: "Dr. R. Vasanthi", email: "hod.cs@wcc.edu.in" },
  warden: { name: "Mrs. Ruth Samuel", email: "warden@wcc.edu.in" },
  gatepass: { name: "Ms. Hannah George", email: "gatepass@wcc.edu.in" },
  security: { name: "Security Desk — Main Gate", email: "security@wcc.edu.in" },
  admin: { name: "Portal Administrator", email: "admin@wcc.edu.in" },
};

export const PERMISSION_LIMITS = { night_out: 3, special: 3 };
