import { useState } from "react";
import ColorPaletteModal from "../components/colorPaletteModal";
import "../style/settings.css";

const THEMES = [
  { id: "default", label: "Default", bg: "linear-gradient(135deg,#3b82f6,#8b5cf6)", desc: "Biru & Ungu" },
  { id: "dark", label: "Dark", bg: "linear-gradient(135deg,#1e293b,#6366f1)", desc: "Gelap Elegan" },
  { id: "sunset", label: "Sunset", bg: "linear-gradient(135deg,#f97316,#ec4899)", desc: "Hangat & Cerah" },
  { id: "ocean", label: "Ocean", bg: "linear-gradient(135deg,#0ea5e9,#6366f1)", desc: "Sejuk & Tenang" },
  { id: "forest", label: "Forest", bg: "linear-gradient(135deg,#22c55e,#0ea5e9)", desc: "Segar & Alami" },
  { id: "summer", label: "🍂 Summer", bg: "linear-gradient(135deg,#FFF5E6,#FFE8CC)", desc: "Daun Jatuh" },
  { id: "snow", label: "❄️ Snow", bg: "linear-gradient(135deg,#E8F4F8,#D4EBF5)", desc: "Salju Dingin" },
  { id: "love", label: "Love", bg: "linear-gradient(135deg,#fce7f3,#fb7185)", desc: "Pink & Hati" },
];

const FONTS = [
  { id: "inter", label: "Inter", sample: "AaBbCc" },
  { id: "poppins", label: "Poppins", sample: "AaBbCc" },
  { id: "roboto", label: "Roboto", sample: "AaBbCc" },
  { id: "mono", label: "JetBrains Mono", sample: "AaBbCc" },
];

const SIZES = [
  { id: "small", label: "Kecil", px: "13px" },
  { id: "medium", label: "Sedang", px: "15px" },
  { id: "large", label: "Besar", px: "17px" },
];

const HEADER_SIZES = [
  { id: "hidden", label: "Sembunyi" },
  { id: "small", label: "Kecil" },
  { id: "medium", label: "Normal" },
];

const ANIMATION_SPEEDS = [
  { id: "slow", label: "Lambat", value: "2s" },
  { id: "normal", label: "Normal", value: "1s" },
  { id: "fast", label: "Cepat", value: "0.5s" },
];

function Settings({ settings, setSettings }) {
  const [saved, setSaved] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerType, setColorPickerType] = useState(null);

  const update = (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    localStorage.setItem("resonote-settings", JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleColorPick = (color) => {
    if (colorPickerType === "text") {
      update("textColor", color);
    } else if (colorPickerType === "calendar") {
      update("calendarHighlightColor", color);
    }
    setColorPickerOpen(false);
    setColorPickerType(null);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Pengaturan</h1>
        {saved && <span className="saved-badge">✅ Tersimpan!</span>}
      </div>

      {/* ── THEMES ── */}
      <section className="settings-section">
        <h2>🎨 Tema Aplikasi</h2>
        <p className="settings-desc">Pilih tampilan yang paling nyaman untukmu</p>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-card ${settings.theme === t.id ? "active" : ""}`}
              onClick={() => update("theme", t.id)}
            >
              <div className="theme-preview" style={{ background: t.bg }}>
                <div className="theme-preview-dots">
                  <span /><span /><span />
                </div>
              </div>
              <div className="theme-info">
                <span className="theme-name">{t.label}</span>
                <span className="theme-desc">{t.desc}</span>
              </div>
              {settings.theme === t.id && <span className="theme-check">✓</span>}
            </button>
          ))}
        </div>
      </section>

      {/* ── FONTS ── */}
      <section className="settings-section">
        <h2>🔤 Font</h2>
        <p className="settings-desc">Pilih gaya teks yang kamu suka</p>
        <div className="font-grid">
          {FONTS.map((f) => (
            <button
              key={f.id}
              className={`font-card ${settings.font === f.id ? "active" : ""}`}
              style={{ fontFamily: f.id === "mono" ? "'JetBrains Mono', monospace" : `'${f.label}', sans-serif` }}
              onClick={() => update("font", f.id)}
            >
              <span className="font-sample">{f.sample}</span>
              <span className="font-name">{f.label}</span>
              {settings.font === f.id && <span className="font-check">✓</span>}
            </button>
          ))}
        </div>
      </section>

      {/* ── FONT SIZE ── */}
      <section className="settings-section">
        <h2>📐 Ukuran Teks</h2>
        <p className="settings-desc">Sesuaikan ukuran teks sesuai kenyamanan</p>
        <div className="size-grid">
          {SIZES.map((s) => (
            <button
              key={s.id}
              className={`size-card ${settings.fontSize === s.id ? "active" : ""}`}
              onClick={() => update("fontSize", s.id)}
            >
              <span className="size-preview" style={{ fontSize: s.px }}>Aa</span>
              <span className="size-label">{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── TEXT COLOR ── */}
      <section className="settings-section">
        <h2>🖊️ Warna Teks</h2>
        <p className="settings-desc">Ubah warna teks aplikasi</p>
        <div className="color-preview-row">
          <div 
            className="color-preview-sample"
            style={{ color: settings.textColor || "#0f172a" }}
          >
            Ini adalah contoh teks dengan warna pilihan kamu
          </div>
          <button
            className="btn-color-picker"
            onClick={() => {
              setColorPickerType("text");
              setColorPickerOpen(true);
            }}
          >
            Pilih Warna
          </button>
        </div>
      </section>

      {/* ── CALENDAR SETTINGS ── */}
      <section className="settings-section">
        <h2>📅 Pengaturan Kalender</h2>
        <p className="settings-desc">Sesuaikan tampilan kalender sesuai preferensimu</p>

        {/* Header visibility */}
        <div className="setting-item">
          <label>Tampilkan Header "Bulan Tahun"</label>
          <div className="button-group">
            {HEADER_SIZES.map((h) => (
              <button
                key={h.id}
                className={`button-group-btn ${(settings.headerSize || "medium") === h.id ? "active" : ""}`}
                onClick={() => update("headerSize", h.id)}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar highlight color */}
        <div className="setting-item">
          <label>Warna Highlight Tanggal</label>
          <div className="color-preview-row">
            <div
              className="color-preview-square"
              style={{ backgroundColor: settings.calendarHighlightColor || "#3b82f6" }}
            />
            <button
              className="btn-color-picker"
              onClick={() => {
                setColorPickerType("calendar");
                setColorPickerOpen(true);
              }}
            >
              Ubah Warna
            </button>
          </div>
        </div>
      </section>

      {/* ── ANIMATION ── */}
      <section className="settings-section">
        <h2>⚡ Kecepatan Animasi</h2>
        <p className="settings-desc">Sesuaikan kecepatan animasi UI</p>
        <div className="animation-grid">
          {ANIMATION_SPEEDS.map((a) => (
            <button
              key={a.id}
              className={`anim-card ${(settings.animationSpeed || "normal") === a.id ? "active" : ""}`}
              onClick={() => update("animationSpeed", a.id)}
            >
              <span className="anim-label">{a.label}</span>
              <span className="anim-value">{a.value}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── RESET ── */}
      <section className="settings-section">
        <h2>🔄 Reset</h2>
        <p className="settings-desc">Kembalikan ke pengaturan awal</p>
        <button
          className="btn-reset"
          onClick={() => {
            const def = { theme: "default", font: "inter", fontSize: "medium", headerSize: "medium", animationSpeed: "normal" };
            setSettings(def);
            localStorage.setItem("resonote-settings", JSON.stringify(def));
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          }}
        >
          Reset ke Default
        </button>
      </section>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={colorPickerOpen}
        onClose={() => {
          setColorPickerOpen(false);
          setColorPickerType(null);
        }}
        onSelect={handleColorPick}
        title={colorPickerType === "text" ? "Warna Teks" : "Warna Highlight Tanggal"}
      />
    </div>
  );
}

export default Settings;