import { NextResponse } from "next/server";
import { approvePendingApproval } from "@/lib/approval";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL("/login?error=admin-required", request.url), 303);
  }

  const formData = await request.formData();
  const approvalId = String(formData.get("approvalId") || "");

  if (!approvalId) {
    return NextResponse.redirect(new URL("/admin/approvals", request.url), 303);
  }

  approvePendingApproval(approvalId);

  return NextResponse.redirect(new URL("/admin/approvals", request.url), 303);
}
