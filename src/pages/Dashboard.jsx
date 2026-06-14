import { useEffect, useState } from "react";
import { getReminders } from "../utils/reminderEngine";

import {
  CheckSquare,
  Clock3,
  AlertCircle,
  AlarmClock,
  NotepadText,
  Wallet,
  ClipboardList,
  Birdhouse,
  BellRing
} from "lucide-react";

function Dashboard() {
  const [data, setData] = useState({
    tasks: [], notes: [], expenses: [], balance: 0,
  });

  useEffect(() => {
    const load = () => {
      const tasks    = JSON.parse(localStorage.getItem("resonote-tasks"))    || [];
      const notes    = JSON.parse(localStorage.getItem("resonote-notes"))    || [];
      const expenses = JSON.parse(localStorage.getItem("resonote-expenses")) || [];
      const balance  = parseInt(localStorage.getItem("resonote-balance"))    || 0;
      setData({ tasks, notes, expenses, balance });
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const { tasks, notes, expenses, balance } = data;

  const totalTask   = tasks.length;
  const doneTask    = tasks.filter((t) => t.done).length;
  const undoneTask  = totalTask - doneTask;
  const { overdue, upcoming } = getReminders(tasks);

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const currentBalance = balance - totalExpense;

  const formatRp = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Task terbaru (5 terakhir belum selesai)
  const recentTasks = tasks.filter((t) => !t.done).slice(-5).reverse();

  // Overdue paling urgent
  const urgentTasks = overdue.slice(0, 3);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "4px" }}><Birdhouse size={22} /> Dashboard</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{today}</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        <StatCard icon={<CheckSquare size={22} />} label="Total Task"   value={totalTask}  sub={`${doneTask} selesai`}      bg="#f0f9ff" border="#bae6fd" />
        <StatCard icon={<Clock3 size={22} />} label="Belum Selesai" value={undoneTask} sub="task aktif"                 bg="#fff7ed" border="#fed7aa" />
        <StatCard icon={<AlertCircle size={22} />} label="Overdue"       value={overdue.length} sub="perlu perhatian"        bg="#fff1f2" border="#fecdd3" valueColor="#ef4444" />
        <StatCard icon={<AlarmClock size={22} />} label="Deadline Dekat" value={upcoming.length} sub="dalam 24 jam"         bg="#fffbeb" border="#fde68a" valueColor="#d97706" />
        <StatCard icon={<NotepadText size={22} />} label="Total Notes"   value={notes.length} sub="catatan"                  bg="#f5f3ff" border="#ddd6fe" />
        <StatCard icon={<Wallet size={22} />} label="Pengeluaran"   value={formatRp(totalExpense)} sub={`Saldo: ${formatRp(currentBalance)}`} bg="#f0fdf4" border="#bbf7d0" small />
      </div>

      {/* Bottom section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Task pending */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
          <h2 style={sectionTitle}> <ClipboardList size={22} /> Task Aktif</h2>
          {recentTasks.length === 0 ? (
            <p style={emptyText}>Semua task sudah selesai! </p>
          ) : (
            recentTasks.map((t) => (
              <div key={t.id} style={taskRow}>
                <span style={{ fontSize: "1.1rem" }}>{t.icon || "📌"}</span>
                <span style={{ flex: 1, fontSize: "0.9rem", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.title}
                </span>
                {t.deadline && (
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {new Date(t.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Urgent reminders */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
          <h2 style={sectionTitle}> <BellRing size={22}/> Urgent</h2>
          {urgentTasks.length === 0 && overdue.length === 0 ? (
            <p style={emptyText}>Tidak ada yang overdue </p>
          ) : (
            urgentTasks.length === 0 ? (
              <p style={emptyText}>Tidak ada yang overdue</p>
            ) : (
              urgentTasks.map((t) => (
                <div key={t.id} style={taskRow}>
                  <span style={{ fontSize: "1.1rem" }}>{t.icon || "⚠️"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.9rem", color: "#1e293b", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#ef4444" }}>
                      {new Date(t.deadline).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#fee2e2", color: "#ef4444", padding: "3px 8px", borderRadius: "20px" }}>
                    Overdue
                  </span>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

const sectionTitle = {
  fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.6px", color: "#64748b", marginBottom: "14px",
};

const emptyText = {
  color: "#94a3b8", fontSize: "0.88rem",
};

const taskRow = {
  display: "flex", alignItems: "center", gap: "10px",
  padding: "8px 0", borderBottom: "1px solid #f1f5f9",
};

function StatCard({ icon, label, value, sub, bg, border, valueColor, small }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: small ? "1rem" : "1.6rem", fontWeight: 700, color: valueColor || "#1e293b", lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
        {sub}
      </div>
    </div>
  );
}

export default Dashboard;
