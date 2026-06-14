import { useState } from "react";
import "../style/colorPaletteModal.css";

const COLOR_PALETTE = [
  { id: "red", label: "Merah", hex: "#ef4444" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "yellow", label: "Kuning", hex: "#eab308" },
  { id: "green", label: "Hijau", hex: "#22c55e" },
  { id: "blue", label: "Biru", hex: "#3b82f6" },
  { id: "purple", label: "Ungu", hex: "#a855f7" },
  { id: "pink", label: "Pink", hex: "#ec4899" },
  { id: "cyan", label: "Cyan", hex: "#06b6d4" },
  { id: "lime", label: "Lime", hex: "#84cc16" },
  { id: "rose", label: "Rose", hex: "#f43f5e" },
  { id: "indigo", label: "Indigo", hex: "#6366f1" },
  { id: "fuchsia", label: "Fuchsia", hex: "#d946ef" },
];

function ColorPaletteModal({ isOpen, onClose, onSelect, title = "Pilih Warna" }) {
  if (!isOpen) return null;

  return (
    <div className="color-modal-overlay" onClick={onClose}>
      <div className="color-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="color-modal-header">
          <h2>{title}</h2>
          <button className="color-modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="color-palette-grid">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.id}
              className="color-palette-item"
              style={{ backgroundColor: color.hex }}
              onClick={() => {
                onSelect(color.hex);
                onClose();
              }}
              title={color.label}
            >
              <span className="color-label">{color.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ColorPaletteModal;