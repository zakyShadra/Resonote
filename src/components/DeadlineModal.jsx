import { useState, useEffect } from "react";

function DeadlineModal({
  isOpen,
  deadline,
  onSave,
  onClose,
}) {
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      if (deadline) {
        const [date, time] = deadline.split("T");
        setDeadlineDate(date || "");
        setDeadlineTime(time ? time.slice(0, 5) : "");
      } else {
        setDeadlineDate("");
        setDeadlineTime("");
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [deadline, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!deadlineDate) return;
    const finalDeadline = deadlineTime
      ? `${deadlineDate}T${deadlineTime}`
      : `${deadlineDate}T00:00`;
    onSave(finalDeadline);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="deadline-modal">
        <h2>📅 Atur Deadline</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
              TANGGAL
            </label>
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
              JAM <span style={{ fontWeight: 400, color: "#94a3b8" }}>(opsional)</span>
            </label>
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f1f5f9", cursor: "pointer" }}>
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!deadlineDate}
            style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: deadlineDate ? "#3b82f6" : "#cbd5e1", color: "white", fontWeight: 600, cursor: deadlineDate ? "pointer" : "not-allowed" }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeadlineModal;
