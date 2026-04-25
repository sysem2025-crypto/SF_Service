import nodemailer from "nodemailer";
import type { PendingApproval } from "@/lib/approval";

const approvalRecipient = "sysem2025@gmail.com";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

export async function sendApprovalRequestEmail(approval: PendingApproval) {
  const transport = getTransport();

  if (!transport) {
    return {
      sent: false,
      reason: "smtp-not-configured"
    } as const;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || approvalRecipient,
    to: approvalRecipient,
    subject: `New service portal registration request: ${approval.name}`,
    text: [
      "New registration request received.",
      "",
      `Name: ${approval.name}`,
      `Email: ${approval.email}`,
      `Request ID: ${approval.id}`,
      `Date: ${approval.createdAt}`,
      "",
      "Open the admin area to approve this user."
    ].join("\n")
  });

  return {
    sent: true
  } as const;
}
