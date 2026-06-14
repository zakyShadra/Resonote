import { useState, useEffect, useMemo } from "react";
import { monthNames } from "../utils/dateUtils";
import ColorPaletteModal from "../components/colorPaletteModal";
import "../style/calendar.css";

import {
    CalendarDays,
    Calendars,
    Palette,
} from "lucide-react";  

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const GLOBAL_COUNTRIES = [
  { code: "US", label: "Global - Amerika" },
  { code: "GB", label: "Global - Inggris" },
  { code: "SG", label: "Global - Singapura" },
  { code: "JP", label: "Global - Jepang" },
  { code: "SA", label: "Global - Saudi" },
];

const formatDateKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const fixedGlobalHolidays = (year) => [
  { date: `${year}-01-01`, localName: "Tahun Baru", name: "New Year's Day", source: "Global" },
  { date: `${year}-05-01`, localName: "Hari Buruh", name: "International Workers' Day", source: "Global" },
  { date: `${year}-12-25`, localName: "Natal", name: "Christmas Day", source: "Global" },
];

function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState("month");
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [holidayStatus, setHolidayStatus] = useState("");
  const [globalCountry, setGlobalCountry] = useState("US");
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [customDates, setCustomDates] = useState(() => {
    const saved = localStorage.getItem("resonote-calendar-custom-dates");
    return saved ? JSON.parse(saved) : {};
  });

  // Get calendar highlight color from settings
  const [highlightColor, setHighlightColor] = useState(() => {
    const saved = localStorage.getItem("resonote-settings");
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.calendarHighlightColor || "#3b82f6";
    }
    return "#3b82f6";
  });

  useEffect(() => {
    const loadCalendarData = () => {
      setTasks(JSON.parse(localStorage.getItem("resonote-tasks") || "[]"));
      setNotes(JSON.parse(localStorage.getItem("resonote-notes") || "[]"));
    };

    loadCalendarData();
    window.addEventListener("storage", loadCalendarData);
    window.addEventListener("focus", loadCalendarData);
    return () => {
      window.removeEventListener("storage", loadCalendarData);
      window.removeEventListener("focus", loadCalendarData);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("resonote-calendar-custom-dates", JSON.stringify(customDates));
  }, [customDates]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCountryHolidays = async (countryCode, source) => {
      const res = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error(`Holiday API ${countryCode} failed`);
      const data = await res.json();
      return data.map((holiday) => ({ ...holiday, source }));
    };

    const loadHolidays = async () => {
      setHolidayStatus("Memuat hari libur...");
      const results = await Promise.allSettled([
        fetchCountryHolidays("ID", "Indonesia"),
        fetchCountryHolidays(globalCountry, "Global"),
      ]);

      const loaded = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value);
      const merged = [...loaded, ...fixedGlobalHolidays(year)];
      const unique = Array.from(
        new Map(merged.map((holiday) => [`${holiday.date}-${holiday.name}-${holiday.source}`, holiday])).values()
      );

      setHolidays(unique);
      setHolidayStatus(results.some((result) => result.status === "rejected")
        ? "Sebagian data libur memakai fallback."
        : "");
    };

    loadHolidays().catch((err) => {
      if (err.name === "AbortError") return;
      setHolidays(fixedGlobalHolidays(year));
      setHolidayStatus("Data libur online gagal dimuat, fallback aktif.");
    });

    return () => controller.abort();
  }, [year, globalCountry]);

  const holidaysByDate = useMemo(() => {
    const map = {};
    holidays.forEach((holiday) => {
      map[holiday.date] = [...(map[holiday.date] || []), holiday];
    });
    return map;
  }, [holidays]);

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDay = (m, y) => new Date(y, m, 1).getDay();

  const getDaysForMonth = () => {
    const days = [];
    const first = firstDay(month, year);
    const daysCount = daysInMonth(month, year);

    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= daysCount; d++) days.push(d);

    return days;
  };

  const getTasksForDate = (d) => {
    if (!d) return [];
    return tasks.filter((t) => {
      if (!t.deadline) return false;
      const td = new Date(t.deadline);
      return td.getDate() === d && td.getMonth() === month && td.getFullYear() === year;
    });
  };

  const getNotesForDate = (d) => {
    if (!d) return [];
    return notes.filter((n) => {
      if (!n.createdAt) return false;
      const nd = new Date(n.createdAt);
      return nd.getDate() === d && nd.getMonth() === month && nd.getFullYear() === year;
    });
  };

  const handleColorPick = (color) => {
    const settings = JSON.parse(localStorage.getItem("resonote-settings") || "{}");
    settings.calendarHighlightColor = color;
    localStorage.setItem("resonote-settings", JSON.stringify(settings));
    setHighlightColor(color);
  };

  const handleDateColor = (day) => {
    const dateKey = formatDateKey(year, month, day);
    setSelectedDateKey(dateKey);
    setColorPickerOpen(true);
  };

  const getDaysArray = getDaysForMonth();

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const prevYear = () => setYear(year - 1);
  const nextYear = () => setYear(year + 1);

  const monthsData = useMemo(() => {
    return monthNames.map((monthName, m) => {
      const first = firstDay(m, year);
      const count = daysInMonth(m, year);
      const days = [];
      for (let i = 0; i < first; i++) days.push(null);
      for (let d = 1; d <= count; d++) days.push(d);
      return { name: monthName, days, month: m };
    });
  }, [year]);

  return (
    <div className="calendar-page">
      <div className="calendar-header-wrapper">
        <div className="calendar-date-display">
          <h2><CalendarDays size={22} /> {monthNames[month]}</h2>
          <span className="calendar-year">{year}</span>
        </div>

        <div className="calendar-controls">
          <select
            value={globalCountry}
            onChange={(e) => setGlobalCountry(e.target.value)}
            className="calendar-select"
          >
            {GLOBAL_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>

          <button
            className={`view-toggle ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
          >
            <CalendarDays size={22} /> Bulan
          </button>
          <button
            className={`view-toggle ${viewMode === "year" ? "active" : ""}`}
            onClick={() => setViewMode("year")}
          >
            <Calendars size={22} /> Tahun
          </button>
        </div>
      </div>

      {viewMode === "month" && (
        <div className="calendar-month-view">
          <div className="calendar-nav">
            <button onClick={prevMonth} className="nav-btn">◀</button>
            <h3>{monthNames[month]} {year}</h3>
            <button onClick={nextMonth} className="nav-btn">▶</button>
          </div>

          <div className="calendar-grid">
            {DAYS.map((d) => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            {getDaysArray.map((day, i) => {
              const dateKey = day ? formatDateKey(year, month, day) : null;
              const customColor = customDates[dateKey];
              return (
                <div
                  key={i}
                  className={`calendar-cell ${!day ? "empty" : ""}`}
                  style={customColor ? { backgroundColor: customColor, borderColor: customColor } : {}}
                >
                  {day && (
                    <>
                      <div className="day-number">{day}</div>
                      <div className="cell-content">
                        <div className="tasks-dots">
                          {getTasksForDate(day).slice(0, 2).map((t) => (
                            <span key={t.id} className="task-dot" title={t.title}>✓</span>
                          ))}
                        </div>
                        <div className="notes-dots">
                          {getNotesForDate(day).slice(0, 2).map((n) => (
                            <span key={n.id} className="note-dot" title={n.title}>📝</span>
                          ))}
                        </div>
                      </div>
                      <button
                        className="cell-color-btn"
                        onClick={() => handleDateColor(day)}
                        title="Ubah warna tanggal"
                      >
                        <Palette size={16} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "year" && (
        <div className="calendar-year-view">
          <div className="calendar-nav">
            <button onClick={prevYear} className="nav-btn">◀◀</button>
            <h3>{year}</h3>
            <button onClick={nextYear} className="nav-btn">▶▶</button>
          </div>

          <div className="months-grid">
            {monthsData.map(({ name, days, month: m }) => (
              <div
                key={m}
                className="month-card"
                onClick={() => {
                  setMonth(m);
                  setViewMode("month");
                }}
              >
                <h4>{name}</h4>
                <div className="mini-calendar">
                  {DAYS.map((d) => (
                    <span key={d} className="mini-day-header">{d[0]}</span>
                  ))}
                  {days.map((d, i) => (
                    <span key={i} className={`mini-day ${!d ? "empty" : ""}`}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ColorPaletteModal
        isOpen={colorPickerOpen}
        onClose={() => {
          setColorPickerOpen(false);
          setSelectedDateKey(null);
        }}
        onSelect={(color) => {
          if (selectedDateKey) {
            setCustomDates({ ...customDates, [selectedDateKey]: color });
          }
        }}
        title="Warna Tanggal"
      />

      {holidayStatus && (
        <div className="holiday-status">
          ℹ️ {holidayStatus}
        </div>
      )}
    </div>
  );
}

export default Calendar;