"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/components/supabase-provider";
import type { MessageRecord } from "@/lib/supabase-data";

export default function TicketChat({ ticketId }: { ticketId: string }) {
  const session = useSession();
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showInternal, setShowInternal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: "1", per_page: "100" });
      const res = await fetch(`/api/ticket/${ticketId}/messages?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("[TicketChat] Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Polling per aggiornamenti in tempo reale
  useEffect(() => {
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canManage = session?.user?.email === messages[0]?.sender_email || session?.user?.role === "admin";

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await fetch(`/api/ticket/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, content_type: "text" }),
      });
      setNewMessage("");
      await loadMessages();
    } catch (err) {
      console.error("[TicketChat] Send error:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(messageId: string) {
    try {
      await fetch(`/api/ticket/${ticketId}/messages/${messageId}`, { method: "DELETE" });
      await loadMessages();
    } catch (err) {
      console.error("[TicketChat] Delete error:", err);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const visibleMessages = showInternal
    ? messages
    : messages.filter((m) => !m.internal);

  const unreadCount = messages.filter((m) => m.internal && !m.read_by_admin).length;

  return (
    <div className="ticket-chat">
      <div className="ticket-chat__header">
        <h3>Storico messaggi</h3>
        <div className="ticket-chat__header-actions">
          {session?.user?.role === "admin" && (
            <button
              className={`btn-download-secondary${showInternal ? " active" : ""}`}
              onClick={() => setShowInternal(!showInternal)}
              style={{ fontSize: "0.7rem", padding: "4px 8px" }}
            >
              {showInternal ? "Nascondi note interne" : `Mostra note interne${unreadCount ? ` (${unreadCount})` : ""}`}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="ticket-chat__empty">Caricamento messaggi...</div>
      ) : visibleMessages.length === 0 ? (
        <div className="ticket-chat__empty">Nessun messaggio ancora.</div>
      ) : (
        <div className="ticket-chat__messages">
          {visibleMessages.map((msg) => (
            <div
              key={msg.id}
              className={`ticket-chat__message${msg.internal ? " ticket-chat__message--internal" : ""}`}
            >
              <div className="ticket-chat__message-header">
                <span className="ticket-chat__sender">{msg.sender_name}</span>
                <span className="ticket-chat__role">{msg.sender_role}</span>
                <span className="ticket-chat__date">{formatDate(msg.created_at)}</span>
                {msg.internal && <span className="ticket-chat__internal-badge">interno</span>}
              </div>
              <div className="ticket-chat__content">{msg.content}</div>
              {canManage && (
                <button className="ticket-chat__delete" onClick={() => handleDelete(msg.id)} title="Elimina">
                  &times;
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form className="ticket-chat__input" onSubmit={handleSend}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Scrivi un messaggio..."
          rows={3}
          disabled={sending}
        />
        <div className="ticket-chat__input-actions">
          <span className="ticket-chat__hint">
            {session?.user?.role === "admin" && "Le note interne sono visibili solo agli admin"}
          </span>
          <button type="submit" className="btn-download" disabled={sending || !newMessage.trim()}>
            {sending ? "Invio..." : "Invia"}
          </button>
        </div>
      </form>

      <style>{`
        .ticket-chat {
          border: 1px solid var(--line);
          border-radius: 8px;
          background: rgba(252, 250, 244, 0.9);
          overflow: hidden;
          margin-top: 20px;
        }
        .ticket-chat__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--line);
          background: rgba(250, 246, 235, 0.7);
        }
        .ticket-chat__header h3 { margin: 0; font-size: 1rem; color: var(--aqua); }
        .ticket-chat__header-actions .btn-download-secondary {
          border-color: var(--line); font-size: 0.7rem; padding: 4px 8px;
        }
        .ticket-chat__header-actions .btn-download-secondary.active {
          background: var(--accent-soft); border-color: var(--aqua); color: var(--aqua);
        }
        .ticket-chat__messages {
          max-height: 400px; overflow-y: auto; padding: 12px 16px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .ticket-chat__empty { padding: 20px; text-align: center; color: var(--muted); font-size: 0.85rem; }
        .ticket-chat__message {
          padding: 10px 12px; border-radius: 6px; background: var(--white);
          border: 1px solid var(--line); position: relative;
        }
        .ticket-chat__message--internal {
          background: rgba(47, 74, 69, 0.06); border-color: rgba(47, 74, 69, 0.2);
        }
        .ticket-chat__message-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 0.72rem;
        }
        .ticket-chat__sender { font-weight: 800; color: var(--ink); }
        .ticket-chat__role { color: var(--aqua); text-transform: uppercase; font-weight: 700; }
        .ticket-chat__date { color: var(--muted); margin-left: auto; }
        .ticket-chat__internal-badge {
          background: var(--aqua); color: var(--white); padding: 1px 6px;
          border-radius: 3px; font-size: 0.62rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .ticket-chat__content { font-size: 0.85rem; line-height: 1.5; color: var(--text); white-space: pre-wrap; }
        .ticket-chat__delete {
          position: absolute; top: 6px; right: 8px; background: none; border: none;
          color: var(--muted); cursor: pointer; font-size: 1rem; padding: 2px 4px; opacity: 0;
        }
        .ticket-chat__message:hover .ticket-chat__delete { opacity: 1; }
        .ticket-chat__delete:hover { color: var(--danger-text); }
        .ticket-chat__input {
          display: flex; flex-direction: column; gap: 8px; padding: 12px 16px;
          border-top: 1px solid var(--line); background: rgba(252, 250, 244, 0.95);
        }
        .ticket-chat__input textarea {
          width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px;
          background: var(--white); color: var(--text); font-family: inherit;
          font-size: 0.85rem; resize: vertical; line-height: 1.4;
        }
        .ticket-chat__input textarea:focus { outline: 3px solid var(--accent-soft); border-color: var(--aqua); }
        .ticket-chat__input-actions { display: flex; justify-content: space-between; align-items: center; }
        .ticket-chat__hint { font-size: 0.7rem; color: var(--muted); }
        .ticket-chat__input .btn-download { padding: 6px 14px; font-size: 0.74rem; }
      `}</style>
    </div>
  );
}
