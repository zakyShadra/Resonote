import "../style/Topbar.css";

import {
    Calendars,
} from "lucide-react";

function Topbar({ toggleMenu }) {
    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="topbar">
        <button
            className="hamburger"
            onClick={toggleMenu}
        >
            ☰
        </button>

        <div className="current-date">
            <Calendars size={18} />
            {today}
        </div>
        </div>
    );
    }

export default Topbar;