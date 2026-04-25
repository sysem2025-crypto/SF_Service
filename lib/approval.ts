import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createUser, getUserByEmail } from "@/lib/users";

export type PendingApproval = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

const pendingApprovalsPath = path.join(
  process.cwd(),
  "data",
  "users",
  "pending-approvals.json"
);

function ensurePendingStore() {
  const folder = path.dirname(pendingApprovalsPath);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  if (!fs.existsSync(pendingApprovalsPath)) {
    fs.writeFileSync(pendingApprovalsPath, "[]\n", "utf8");
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getPendingApprovals() {
  ensurePendingStore();
  return JSON.parse(
    fs.readFileSync(pendingApprovalsPath, "utf8")
  ) as PendingApproval[];
}

function writePendingApprovals(items: PendingApproval[]) {
  ensurePendingStore();
  fs.writeFileSync(
    pendingApprovalsPath,
    `${JSON.stringify(items, null, 2)}\n`,
    "utf8"
  );
}

export function createPendingApproval(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const approvals = getPendingApprovals();

  if (getUserByEmail(email)) {
    throw new Error("An active user with this email already exists.");
  }

  if (approvals.some((item) => item.email === email && item.status === "pending")) {
    throw new Error("A pending approval request already exists for this email.");
  }

  const approval: PendingApproval = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
    status: "pending"
  };

  approvals.push(approval);
  writePendingApprovals(approvals);
  return approval;
}

export function approvePendingApproval(id: string) {
  const approvals = getPendingApprovals();
  const approval = approvals.find((item) => item.id === id);

  if (!approval || approval.status !== "pending") {
    throw new Error("Request not found or already processed.");
  }

  const user = createUser({
    name: approval.name,
    email: approval.email,
    password: approval.password,
    role: "user"
  });

  approval.status = "approved";
  writePendingApprovals(approvals);

  return user;
}
