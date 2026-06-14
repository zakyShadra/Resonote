import { useState, useEffect, useMemo, useRef } from "react";
import "../style/Notes.css";

import {
  NotepadText,
  StickyNoteX,
  Pin,
} from "lucide-react";

/* ── CONSTANTS ── */
const NOTE_COLORS = [
  { label: "Default", value: "#ffffff" },
  { label: "Kuning",  value: "#fef9c3" },
  { label: "Pink",    value: "#fce7f3" },
  { label: "Biru",    value: "#e0f2fe" },
  { label: "Hijau",   value: "#dcfce7" },
  { label: "Orange",  value: "#fff7ed" },
  { label: "Ungu",    value: "#f3e8ff" },
];

const CATEGORIES = ["Semua", "Personal", "Kerja", "Ide", "Penting", "Lainnya"];

const EMPTY_FORM = {
  title: "",
  content: "",
  color: "#ffffff",
  category: "Personal",
  tags: "",
  isPinned: false,
};

/* ── HELPERS ── */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });



/* ──────────────────────────────────────────
   NOTES PAGE
────────────────────────────────────────── */
function Notes() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("resonote-notes");
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [viewMode, setViewMode]     = useState("grid"); // "grid" | "list"
  const [showModal, setShowModal]   = useState(false);
  const [editingNote, setEditingNote] = useState(null); // null = new, else note obj
  const [form, setForm]             = useState(EMPTY_FORM);
  const [tagInput, setTagInput]     = useState("");

  const [convertMsg, setConvertMsg] = useState(""); // flash message
  const colorRef = useRef(null);

  /* persist */
  useEffect(() => {
    localStorage.setItem("resonote-notes", JSON.stringify(notes));
  }, [notes]);



  /* ── computed ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notes
      .filter((n) => {
        const matchCat  = activeCategory === "Semua" || n.category === activeCategory;
        const matchSearch =
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags || []).some((t) => t.toLowerCase().includes(q));
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
  }, [notes, search, activeCategory]);

  const pinned   = filtered.filter((n) => n.isPinned);
  const unpinned = filtered.filter((n) => !n.isPinned);

  /* ── handlers ── */
  const openNew = () => {
    setEditingNote(null);
    setForm(EMPTY_FORM);
    setTagInput("");
    setShowModal(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setForm({
      title:     note.title,
      content:   note.content,
      color:     note.color,
      category:  note.category,
      tags:      "",
      isPinned:  note.isPinned,
    });
    setTagInput((note.tags || []).join(", "));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
  };

  const parseTags = (str) =>
    str.split(",").map((t) => t.trim()).filter(Boolean);

  const handleSave = () => {
    if (!form.title.trim() && !form.content.trim()) return;

    const now = new Date().toISOString();
    const tags = parseTags(tagInput);

    if (editingNote) {
      setNotes(notes.map((n) =>
        n.id === editingNote.id
          ? { ...n, ...form, tags, updatedAt: now }
          : n
      ));
    } else {
      const newNote = {
        id: Date.now(),
        ...form,
        tags,
        createdAt: now,
        updatedAt: now,
      };
      setNotes([newNote, ...notes]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (!confirm("Hapus catatan ini?")) return;
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handlePin = (id) => {
    setNotes(notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    ));
  };

  /* ── USP: Convert Note → Task ── */
  const handleConvertToTask = (note) => {
    const saved = localStorage.getItem("resonote-tasks");
    const tasks = saved ? JSON.parse(saved) : [];

    const newTask = {
      id: Date.now(),
      title: note.title || note.content.slice(0, 60),
      icon: "📝",
      done: false,
      deadline: null,
      subtasks: [],
      fromNote: true,
    };

    localStorage.setItem("resonote-tasks", JSON.stringify([newTask, ...tasks]));
    setConvertMsg(`✅ "${newTask.title}" ditambahkan ke Todo!`);
    setTimeout(() => setConvertMsg(""), 3000);
  };

  /* ── NOTE CARD ── */
  const NoteCard = ({ note }) => (
    <div
      className={`note-card ${viewMode === "list" ? "note-card-list" : ""}`}
      style={{ background: note.color }}
    >
      <div className="note-card-top">
        <h3 className="note-title">{note.title || <em>Tanpa judul</em>}</h3>
        <button
          className={`pin-btn ${note.isPinned ? "pinned" : ""}`}
          onClick={() => handlePin(note.id)}
          title={note.isPinned ? "Lepas pin" : "Pin catatan"}
        >
          📌
        </button>
      </div>

      {note.content && (
        <p className="note-preview">
          {note.content.length > 120
            ? note.content.slice(0, 120) + "…"
            : note.content}
        </p>
      )}

      {note.tags?.length > 0 && (
        <div className="note-tags">
          {note.tags.map((t) => (
            <span key={t} className="note-tag">#{t}</span>
          ))}
        </div>
      )}

      <div className="note-footer">
        <span className="note-meta">
          <span className="note-cat-badge">{note.category}</span>
          <span className="note-date">{formatDate(note.updatedAt)}</span>
        </span>

        <div className="note-actions">
          <button
            className="note-btn btn-convert"
            onClick={() => handleConvertToTask(note)}
            title="Jadikan Task"
          >
            ✅ Jadikan Task
          </button>
          <button
            className="note-btn btn-edit"
            onClick={() => openEdit(note)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="note-btn btn-delete-note"
            onClick={() => handleDelete(note.id)}
            title="Hapus"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );

  /* ── RENDER ── */
  return (
    <div className="notes-container">

      {/* ─ HEADER ─ */}
      <div className="notes-header">
        <h1><NotepadText  size={22}/> Notes</h1>
        <div className="notes-header-actions">
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >⊞</button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List view"
          >☰</button>
          <button className="btn-new-note" onClick={openNew}>
            + Catatan Baru
          </button>
        </div>
      </div>

      {/* ─ FLASH MESSAGE (Convert to Task) ─ */}
      {convertMsg && (
        <div className="convert-flash">{convertMsg}</div>
      )}

      {/* ─ SEARCH ─ */}
      <div className="notes-search-row">
        <input
          className="notes-search"
          type="text"
          placeholder="🔍 Cari catatan, tag, isi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ─ CATEGORY FILTER ─ */}
      <div className="notes-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─ EMPTY STATE ─ */}
      {filtered.length === 0 && (
        <div className="notes-empty">
          <p><StickyNoteX size={22}/> Tidak ada catatan.</p>
          {notes.length === 0 && (
            <button className="btn-new-note" onClick={openNew}>
              + Buat catatan pertama
            </button>
          )}
        </div>
      )}

      {/* ─ PINNED ─ */}
      {pinned.length > 0 && (
        <section className="notes-section">
          <h2 className="section-label"><Pin size={22}/> Disematkan</h2>
          <div className={viewMode === "grid" ? "notes-grid" : "notes-list"}>
            {pinned.map((n) => <NoteCard key={n.id} note={n} />)}
          </div>
        </section>
      )}

      {/* ─ OTHER NOTES ─ */}
      {unpinned.length > 0 && (
        <section className="notes-section">
          {pinned.length > 0 && <h2 className="section-label">📄 Lainnya</h2>}
          <div className={viewMode === "grid" ? "notes-grid" : "notes-list"}>
            {unpinned.map((n) => <NoteCard key={n.id} note={n} />)}
          </div>
        </section>
      )}

      {/* ─ MODAL ─ */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div
            className="note-modal"
            style={{ background: form.color }}
          >
            <div className="modal-header">
              <h2>{editingNote ? "Edit Catatan" : "Catatan Baru"}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {/* Title */}
            <input
              className="modal-title-input"
              type="text"
              placeholder="Judul catatan..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            {/* Content */}
            <textarea
              className="modal-content-input"
              placeholder="Tulis catatan di sini..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
            />

            <div className="modal-row">
              {/* Category */}
              <div className="modal-field">
                <label>Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="modal-field">
                <label>Tags <small>(pisahkan koma)</small></label>
                <input
                  type="text"
                  placeholder="Contoh: react, project, ide"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
              </div>
            </div>

            {/* Color Picker */}
            <div className="modal-color-row" ref={colorRef}>
              <label>Warna</label>
              <div className="color-swatches">
                {NOTE_COLORS.map(({ label, value }) => (
                  <button
                    key={value}
                    className={`color-swatch ${form.color === value ? "selected" : ""}`}
                    style={{ background: value, border: "2px solid " + (form.color === value ? "#3b82f6" : "#cbd5e1") }}
                    title={label}
                    onClick={() => setForm({ ...form, color: value })}
                  />
                ))}
              </div>
            </div>

            {/* Pin Toggle */}
            <label className="pin-toggle">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              />
              <span>📌 Sematkan catatan ini</span>
            </label>

            {/* Actions */}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>Batal</button>
              <button className="btn-save" onClick={handleSave}>
                {editingNote ? "Simpan Perubahan" : "Buat Catatan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
