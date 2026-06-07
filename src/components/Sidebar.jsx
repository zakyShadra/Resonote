import "./Sidebar.css";

function Sidebar({ currentPage, setCurrentPage }) {
  const menus = [
    { id: "dashboard", label: "🏠 Dashboard" },
    { id: "todo", label: "✅ Todo" },
    { id: "calendar", label: "📅 Calendar" },
    { id: "reminder", label: "⏰ Reminder" },
    { id: "notes", label: "📝 Notes" },
    { id: "expense", label: "💰 Expense" },
    { id: "export", label: "📤 Export" },
  ];

  return (
    <div className="sidebar">
      <h2>📒 Resonote</h2>

      {menus.map((menu) => (
        <button
          key={menu.id}
          className={
            currentPage === menu.id
              ? "menu active"
              : "menu"
          }
          onClick={() =>
            setCurrentPage(menu.id)
          }
        >
          {menu.label}
        </button>
      ))}
    </div>
  );
}

export default Sidebar;