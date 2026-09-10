import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "SF Service <onboarding@resend.dev>",
      to: "gianluca.piga@sysem.it",
      subject: "Nuovo utente registrato su SF Service",
      html: `
        <h2>Nuovo utente registrato</h2>
        <p><strong>Email:</strong> ${email}</p>
        ${name ? `<p><strong>Nome:</strong> ${name}</p>` : ""}
        <p>Data: ${new Date().toLocaleString("it-IT")}</p>
      `,
    });

    if (error) {
      console.error("[Notify] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("[Notify] Error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
