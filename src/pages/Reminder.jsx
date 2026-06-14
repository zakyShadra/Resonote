import { useEffect, useState } from "react";
import { getReminders } from "../utils/reminderEngine";
import { getDeadlineStatus } from "../utils/deadlineUtils";

import {
  BellRing,
} from "lucide-react";

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} hari yang lalu`;
  if (hours > 0) return `${hours} jam yang lalu`;
  if (mins > 0) return `${mins} menit yang lalu`;
  return "Baru saja";
};

const timeUntil = (iso) => {
  const diff = new Date(iso).getTime() - Date.now();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} hari lagi`;
  if (hours > 0) return `${hours} jam lagi`;
  if (mins > 0) return `${mins} menit lagi`;
  return "Sebentar lagi";
};

function Reminder() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const load = () => {
      const data = JSON.parse(localStorage.getItem("resonote-tasks")) || [];
      setTasks(data);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const { overdue, upcoming } = getReminders(tasks);
  const safe = tasks.filter(t => !t.done && getDeadlineStatus(t.deadline).status === "safe");
  const done = tasks.filter((t) => t.done && t.deadline);

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px", fontSize: "1.6rem" }}><BellRing size={22}/> Reminder</h1>

      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "🔴 Overdue", count: overdue.length, bg: "#fff1f2", border: "#fecdd3", text: "#ef4444" },
          { label: "🟡 Upcoming", count: upcoming.length, bg: "#fffbeb", border: "#fde68a", text: "#d97706" },
          { label: "✅ Selesai", count: done.length, bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
        ].map(({ label, count, bg, border, text }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: text }}>{count}</div>
          </div>
        ))}
      </div>

      {/* OVERDUE */}
      <Section title="🔴 Overdue" empty="Tidak ada task yang overdue " color="#ef4444">
        {overdue.map((t) => (
          <ReminderCard
            key={t.id}
            task={t}
            badge={{ label: timeAgo(t.deadline), color: "#ef4444", bg: "#fee2e2" }}
          />
        ))}
      </Section>

      {/* UPCOMING */}
      <Section title="🟡 Deadline Dekat (24 jam)" empty="Tidak ada task mendesak" color="#d97706">
        {upcoming.map((t) => (
          <ReminderCard
            key={t.id}
            task={t}
            badge={{ label: timeUntil(t.deadline), color: "#d97706", bg: "#fef9c3" }}
          />
        ))}
      </Section>

      {/* SAFE */}
      {safe.length > 0 && (
        <Section title="✅ Aman (>24 jam)" color="#22c55e">
          {safe.map((t) => (
            <ReminderCard
              key={t.id}
              task={t}
              badge={{ label: timeUntil(t.deadline), color: "#22c55e", bg: "#dcfce7" }}
            />
          ))}
        </Section>
      )}

      {/* DONE */}
      {done.length > 0 && (
        <Section title="✅ Selesai" color="#16a34a">
          {done.slice(0, 5).map((t) => (
            <ReminderCard
              key={t.id}
              task={t}
              badge={{ label: "Selesai", color: "#16a34a", bg: "#dcfce7" }}
              dimmed
            />
          ))}
        </Section>
      )}

      {tasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <p style={{ fontSize: "1rem" }}>📭 Belum ada task dengan deadline.</p>
          <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>Tambah task dan set deadline di halaman Todo!</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, empty }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <div style={{ marginBottom: "28px" }}>
      <h2 style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#64748b", marginBottom: "12px" }}>
        {title}
      </h2>
      {items.length === 0 && empty ? (
        <p style={{ color: "#94a3b8", fontSize: "0.88rem", padding: "12px 0" }}>{empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{children}</div>
      )}
    </div>
  );
}

function ReminderCard({ task, badge, dimmed }) {
  const formatDeadline = (iso) =>
    new Date(iso).toLocaleString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px",
      background: "white", border: "1px solid #e2e8f0",
      borderRadius: "12px", padding: "14px 16px",
      opacity: dimmed ? 0.6 : 1,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <span style={{ fontSize: "1.4rem" }}>{task.icon || "📌"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: "0.95rem", color: "#1e293b",
          textDecoration: task.done ? "line-through" : "none",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {task.title}
        </div>
        <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "3px" }}>
          ⏰ {formatDeadline(task.deadline)}
        </div>
      </div>
      <span style={{
        padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem",
        fontWeight: 700, background: badge.bg, color: badge.color,
        whiteSpace: "nowrap",
      }}>
        {badge.label}
      </span>
    </div>
  );
}

export default Reminder;
