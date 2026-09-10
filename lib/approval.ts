import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface Approval {
  id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const DATA_FILE = join(process.cwd(), "data", "approvals.json");

function loadApprovals(): Approval[] {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveApprovals(approvals: Approval[]) {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) {
    require("fs").mkdirSync(dir, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(approvals, null, 2));
}

export function getPendingApprovals(): Approval[] {
  return loadApprovals();
}

export function approvePendingApproval(id: string) {
  const approvals = loadApprovals();
  const idx = approvals.findIndex((a) => a.id === id);
  if (idx !== -1) {
    approvals[idx].status = "approved";
    saveApprovals(approvals);
  }
}
