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

export type TicketRecord = {
  id: string;
  slug: string;
  display_code: string;
  display_title: string;
  title: string;
  client: string;
  status: string;
  priority: string;
  assignee: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  channel: string;
  product: string;
  sla_deadline?: string;
  serial_number?: string;
  plant?: string;
  contact_name?: string;
  contact_email?: string;
  tags?: string[];
  attachments?: string[];
  created_by_name?: string;
  created_by_email?: string;
  content?: string;
};

export type ClientRecord = {
  client: string;
  country?: string;
  main_contact?: string;
  main_email?: string;
};

export type DocumentRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  doc_type: string;
  version: string;
  updated_at: string;
  product: string;
  scope: string;
  language?: string;
  download_url?: string;
  summary?: string;
  tags?: string[];
  compatibility?: string[];
};

async function getSupabase() {
  return createClient();
}

function formatTicketCode(index: number) {
  return `#${String(index).padStart(3, "0")}`;
}

function withTicketDisplayFields<T extends { id: string; title: string; created_at: string }>(
  ticket: T,
  displayMap: Map<string, string>
) {
  const display_code = displayMap.get(ticket.id) || formatTicketCode(0);

  return {
    ...ticket,
    display_code,
    display_title: `${display_code} ${ticket.title}`,
  };
}

async function getTicketDisplayMap() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select("id, created_at")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching ticket display map:", error);
    return new Map<string, string>();
  }

  return new Map(
    (data || []).map((ticket, index) => [
      ticket.id,
      formatTicketCode(index + 1),
    ])
  );
}

export async function getTickets(): Promise<TicketRecord[]> {
  const supabase = await getSupabase();
  const [displayMap, result] = await Promise.all([
    getTicketDisplayMap(),
    supabase
      .from("tickets")
      .select("*")
      .order("updated_at", { ascending: false }),
  ]);
  const { data, error } = result;

  if (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }

  return (data || []).map((t) => withTicketDisplayFields({
    id: t.id,
    slug: t.id,
    title: t.title,
    client: t.client || "",
    status: t.status,
    priority: t.priority,
    assignee: t.assignee || "",
    created_at: t.created_at,
    updated_at: t.updated_at,
    closed_at: t.closed_at,
    channel: t.channel || "",
    product: t.product || "",
    sla_deadline: t.sla_deadline,
    serial_number: t.serial_number,
    plant: t.plant,
    contact_name: t.contact_name,
    contact_email: t.contact_email,
    tags: t.tags,
    attachments: t.attachments,
    created_by_name: t.created_by_name,
    created_by_email: t.created_by_email,
    content: t.description,
  }, displayMap));
}

export async function getClients(): Promise<ClientRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("client", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return (data || []).map((c) => ({
    client: c.client,
    country: c.country,
    main_contact: c.main_contact,
    main_email: c.main_email,
  }));
}

export async function getTicketBySlug(slug: string) {
  const supabase = await getSupabase();
  const [displayMap, result] = await Promise.all([
    getTicketDisplayMap(),
    supabase
      .from("tickets")
      .select("*")
      .eq("id", slug)
      .single(),
  ]);
  const { data, error } = result;

  if (error || !data) return null;

  return withTicketDisplayFields({
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
  }, displayMap);
}

export async function getTicketsByCreatorEmail(email: string, openOnly = false) {
  const supabase = await getSupabase();
  const displayMap = await getTicketDisplayMap();
  let query = supabase
    .from("tickets")
    .select("*")
    .eq("created_by_email", email.toLowerCase())
    .order("updated_at", { ascending: false });

  if (openOnly) {
    query = query.neq("status", "chiuso");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tickets by creator:", error);
    return [];
  }

  return (data || []).map((t) => withTicketDisplayFields({
    id: t.id,
    slug: t.id,
    title: t.title,
    client: t.client || "",
    status: t.status,
    priority: t.priority,
    assignee: t.assignee || "",
    created_at: t.created_at,
    updated_at: t.updated_at,
    closed_at: t.closed_at,
    channel: t.channel || "",
    product: t.product || "",
    sla_deadline: t.sla_deadline,
    serial_number: t.serial_number,
    plant: t.plant,
    contact_name: t.contact_name,
    contact_email: t.contact_email,
    tags: t.tags,
    attachments: t.attachments,
    created_by_name: t.created_by_name,
    created_by_email: t.created_by_email,
    content: t.description,
  }, displayMap));
}

export async function getProcedureDocuments(): Promise<DocumentRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("procedures")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching procedures:", error);
    return [];
  }

  return (data || []).map((d) => ({
    id: d.id,
    slug: d.id,
    title: d.title,
    category: d.category || "",
    doc_type: d.doc_type || "procedure",
    version: d.version || "1.0",
    updated_at: d.updated_at,
    product: d.product || "",
    scope: d.scope || "",
    language: d.language,
    download_url: d.download_url,
    summary: d.summary,
    tags: d.tags,
    compatibility: d.compatibility,
  }));
}

export async function getFirmwareSoftwareDocuments(): Promise<DocumentRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("firmware")
    .select("*")
    .order("release_date", { ascending: false });

  if (error) {
    console.error("Error fetching firmware:", error);
    return [];
  }

  return (data || []).map((d) => ({
    id: d.id,
    slug: d.id,
    title: d.title,
    category: d.category || "",
    doc_type: "firmware",
    version: d.version || "1.0",
    updated_at: d.created_at,
    product: d.product || "",
    scope: "",
    language: undefined,
    download_url: d.download_url,
    summary: d.description,
    tags: d.tags,
    compatibility: d.compatibility,
  }));
}

export async function getDashboardData() {
  const [tickets, clients] = await Promise.all([getTickets(), getClients()]);
  const openTickets = tickets.filter((ticket) => ticket.status !== "chiuso");
  const recentTickets = tickets.slice(0, 5);
  const slaAtRisk = openTickets.filter(
    (ticket) => ticket.priority === "critica" || ticket.priority === "alta"
  );

  return {
    tickets,
    clients,
    openTickets,
    recentTickets,
    slaAtRisk,
  };
}

export async function createTicket(input: {
  title: string;
  client: string;
  description: string;
  priority: string;
  category?: string;
  product?: string;
  tags?: string[];
}) {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non autenticato");

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      user_id: user.id,
      title: input.title,
      client: input.client,
      description: input.description,
      priority: input.priority,
      category: input.category,
      product: input.product || "",
      tags: input.tags,
      status: "aperto",
      created_by_email: user.email,
      created_by_name: user.user_metadata?.full_name,
      assignee: "",
      channel: "web",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==============================
// TICKET MESSAGES
// ==============================

export async function getTicketMessages(ticketId: string, page = 1, perPage = 50) {
  const supabase = await getSupabase();
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
  const supabase = await getSupabase();
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
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

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
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Non autenticato");

  const { data: msg } = await supabase
    .from("ticket_messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (!msg || msg.sender_id !== user.id) {
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

export async function updateTicket(
  id: string,
  updates: Partial<TicketRecord>
) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
