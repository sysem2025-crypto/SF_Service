import { createClient } from "@/lib/supabase-server";

export type TicketRecord = {
  id: string;
  slug: string;
  title: string;
  client: string;
  status: string;
  priority: string;
  assignee: string;
  created_at: string;
  updated_at: string;
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

export async function getTickets(): Promise<TicketRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }

  return (data || []).map((t) => ({
    id: t.id,
    slug: t.id,
    title: t.title,
    client: t.client || "",
    status: t.status,
    priority: t.priority,
    assignee: t.assignee || "",
    created_at: t.created_at,
    updated_at: t.updated_at,
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
  }));
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
  const { data, error } = await supabase
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

export async function getTicketsByCreatorEmail(email: string, openOnly = false) {
  const supabase = await getSupabase();
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

  return (data || []).map((t) => ({
    id: t.id,
    slug: t.id,
    title: t.title,
    client: t.client || "",
    status: t.status,
    priority: t.priority,
    assignee: t.assignee || "",
    created_at: t.created_at,
    updated_at: t.updated_at,
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
  }));
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