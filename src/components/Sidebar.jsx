import "../style/Sidebar.css";

import {
  Birdhouse,
  CheckSquare,
  Calendar,
  BellRing,
  NotebookPen,
  Wallet,
  Target,
  Settings,
  NotepadText
} from "lucide-react";

function Sidebar({ isOpen, currentPage, setCurrentPage, closeMenu }) {
  const menus = [
    { id: "dashboard", label: "Dashboard", icon: Birdhouse },
    { id: "todo", label: "Todo", icon: CheckSquare },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "reminder", label: "Reminder", icon: BellRing },
    { id: "notes", label: "Notes", icon: NotepadText },
    { id: "expense", label: "Expense", icon: Wallet },
    { id: "budget", label: "Budget", icon: Target },
  ];

  return (
    <div className={isOpen ? "sidebar open" : "sidebar"}>
      <div className="sidebar-header">
        <h2><NotebookPen size={22}/>ReSoNote</h2>
        <button className="close-btn" onClick={closeMenu}>
          ✕
        </button>
      </div>

      {menus.map((menu) => {
        const Icon = menu.icon;

        return (
          <button
            key={menu.id}
            className={currentPage === menu.id ? "menu active" : "menu"}
            onClick={() => {
              setCurrentPage(menu.id);
              closeMenu();
            }}
          >
            <Icon size={18} />
            <span>{menu.label}</span>
          </button>
        );
      })}

      <div className="sidebar-divider menu-settings" />

      <button
        className={currentPage === "settings" ? "menu active" : "menu"}
        onClick={() => {
          setCurrentPage("settings");
          closeMenu();
        }}
      >
        <Settings size={18} />
        <span>Pengaturan</span>
      </button>
    </div>
  );
}

export default Sidebar;