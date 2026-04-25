import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createTicketFromSubmission } from "@/lib/ticket-submission";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=login-required", request.url), 303);
  }

  const formData = await request.formData();

  const cliente = String(formData.get("cliente") || "").trim();
  const prodotto = String(formData.get("prodotto") || "").trim();
  const titolo = String(formData.get("titolo") || "").trim();
  const priorita = String(formData.get("priorita") || "P3").trim();
  const contattoCliente = String(formData.get("contattoCliente") || "").trim();
  const emailCliente = String(formData.get("emailCliente") || "").trim();
  const descrizione = String(formData.get("descrizione") || "").trim();

  if (
    !cliente ||
    !prodotto ||
    !titolo ||
    !contattoCliente ||
    !emailCliente ||
    !descrizione
  ) {
    return NextResponse.redirect(new URL("/ticket/nuovo", request.url), 303);
  }

  const ticket = createTicketFromSubmission({
    cliente,
    prodotto,
    titolo,
    priorita,
    contattoCliente,
    emailCliente,
    descrizione,
    createdByName: user.name,
    createdByEmail: user.email
  });

  return NextResponse.redirect(
    new URL(`/ticket/nuovo?created=${ticket.id}`, request.url),
    303
  );
}
