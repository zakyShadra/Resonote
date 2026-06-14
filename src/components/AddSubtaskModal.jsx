import { useState } from "react";
import "../style/AddSubtaskModal.css";

function AddSubtaskModal({ isOpen, onClose, onAdd }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-subtask-overlay" onClick={onClose}>
      <div 
        className="add-subtask-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2> +Tambah Subtask</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-content">
          <textarea
            className="subtask-input"
            placeholder="Ketik subtask baru..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
        </div>

        <div className="add-subtask-actions">
          <button 
            className="add-subtask-cancel" 
            onClick={onClose}
          >
            Batal
          </button>
          <button 
            className="add-subtask-confirm" 
            onClick={handleAdd}
            disabled={!text.trim()}
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddSubtaskModal;
