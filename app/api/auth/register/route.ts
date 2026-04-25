import { NextResponse } from "next/server";
import { createPendingApproval } from "@/lib/approval";
import { sendApprovalRequestEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!name || !email || password.length < 8) {
    return NextResponse.redirect(
      new URL("/register?error=Dati%20non%20validi.", request.url),
      303
    );
  }

  try {
    const approval = createPendingApproval({ name, email, password });
    await sendApprovalRequestEmail(approval);
    return NextResponse.redirect(new URL("/register?requested=1", request.url), 303);
  } catch (error) {
    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Errore";
    return NextResponse.redirect(
      new URL(`/register?error=${message}`, request.url),
      303
    );
  }
}
