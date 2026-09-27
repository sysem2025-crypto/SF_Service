import { createClient } from "@/lib/supabase-server";

export type MessageRecord = {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  sender_role: string;
  content: string;
  content_type: string;
  attachments: string[];
  internal: boolean;
  read_by_sender: boolean;
  read_by_admin: boolean;
  created_at: string;
  updated_at: string;
};

export async function getTicketMessages(ticketId: string, page = 1, perPage = 50) {
  const supabase = await createClient();
  const start = (Number(page) - 1) * Number(perPage);

  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })
    .range(start, start + Number(perPage) - 1);

  if (error) {
    console.error("[getTicketMessages] Error:", error);
    return [];
  }

  return (data || []) as MessageRecord[];
}

export async function getTicketMessagesCount(ticketId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("ticket_messages")
    .select("*", { count: "exact", head: true })
    .eq("ticket_id", ticketId);

  return count || 0;
}

export async function addTicketMessage(ticketId: string, input: {
  content: string;
  content_type?: string;
  internal?: boolean;
  attachments?: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non autenticato");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      sender_name: profile?.full_name || user.user_metadata?.full_name || user.email || "",
      sender_email: user.email || "",
      sender_role: profile?.role || "user",
      content: input.content.trim(),
      content_type: input.content_type || "text",
      internal: input.internal || false,
      attachments: input.attachments || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTicketMessage(messageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non autenticato");

  const { data: msg } = await supabase
    .from("ticket_messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (!msg || (msg.sender_id !== user.id)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") throw new Error("Non autorizzato");
  }

  const { error } = await supabase.from("ticket_messages").delete().eq("id", messageId);
  if (error) throw error;
  return true;
}
