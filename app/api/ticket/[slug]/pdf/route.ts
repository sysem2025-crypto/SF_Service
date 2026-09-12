import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getTicketBySlug } from "@/lib/supabase-data";
import { createClient } from "@/lib/supabase-server";

type PdfLine = {
  text: string;
  size?: number;
  bold?: boolean;
  gap?: number;
};

type TicketPdfRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value: string | undefined) {
  if (!value) return "n/d";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(date);
}

function escapePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\r\n]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text: string, maxChars: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function buildPdf(lines: PdfLine[]) {
  const objects: string[] = [];
  const content: string[] = ["BT", "/F1 11 Tf", "50 790 Td"];
  let currentSize = 11;
  let y = 790;

  for (const line of lines) {
    const size = line.size || 11;
    const gap = line.gap ?? size + 7;

    if (size !== currentSize) {
      content.push(`/F1 ${size} Tf`);
      currentSize = size;
    }

    if (y < 60) {
      content.push("ET");
      break;
    }

    content.push(`(${escapePdfText(line.text)}) Tj`);
    content.push(`0 -${gap} Td`);
    y -= gap;
  }

  content.push("ET");

  const stream = content.join("\n");
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objects.push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>"
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
}

async function getTicketForPdf(slug: string, canUseUserSession: boolean) {
  if (canUseUserSession) {
    const ticket = await getTicketBySlug(slug);
    if (ticket) return ticket;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data, error } = await adminClient
    .from("tickets")
    .select("*")
    .eq("id", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.id,
    title: data.title,
    client: data.client || "",
    status: data.status,
    priority: data.priority,
    assignee: data.assignee || "",
    created_at: data.created_at,
    updated_at: data.updated_at,
    closed_at: data.closed_at,
    channel: data.channel || "",
    product: data.product || "",
    sla_deadline: data.sla_deadline,
    serial_number: data.serial_number,
    plant: data.plant,
    contact_name: data.contact_name,
    contact_email: data.contact_email,
    tags: data.tags,
    attachments: data.attachments,
    created_by_name: data.created_by_name,
    created_by_email: data.created_by_email,
    content: data.description,
  };
}

export async function GET(request: Request, { params }: TicketPdfRouteProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { slug } = await params;
  const ticket = await getTicketForPdf(slug, Boolean(user));

  if (!ticket) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `/ticket/${slug}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json({ error: "Ticket non trovato" }, { status: 404 });
  }

  const rows = [
    ["ID", ticket.id],
    ["Stato", ticket.status],
    ["Priorita", ticket.priority],
    ["Cliente", ticket.client],
    ["Prodotto", ticket.product],
    ["Impianto", ticket.plant || "n/a"],
    ["Seriale", ticket.serial_number || "n/a"],
    ["Referente", ticket.contact_name || ticket.created_by_name || "n/a"],
    ["Email", ticket.contact_email || ticket.created_by_email || "n/a"],
    ["Assegnato a", ticket.assignee || "n/a"],
    ["Aperto", formatDate(ticket.created_at)],
    ["Aggiornato", formatDate(ticket.updated_at)],
    ["Chiuso", ticket.closed_at ? formatDate(ticket.closed_at) : "Non chiuso"],
    ["SLA", formatDate(ticket.sla_deadline)],
  ];

  const lines: PdfLine[] = [
    { text: "SF Service - Ticket", size: 18, gap: 24 },
    { text: ticket.title, size: 15, gap: 22 },
    ...rows.map(([label, value]) => ({
      text: `${label}: ${value}`,
      size: 10,
      gap: 15,
    })),
    { text: "Contenuto", size: 14, gap: 20 },
    ...wrapText(ticket.content || "Nessuna descrizione inserita.", 88).map((text) => ({
      text,
      size: 10,
      gap: 14,
    })),
  ];

  const pdf = buildPdf(lines);
  const filename = `ticket-${ticket.id}.pdf`;

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
