import { useState, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import CurrencyInput from "../components/currentInput";
import "../style/Expense.css";

import {
  Wallet,
  Calendars,
  BanknoteArrowUp,
  BanknoteArrowDown,
  Banknote,
  ScrollText,
  ChartColumn,
  FileDown,
} from "lucide-react";

const CATEGORIES = {
  Makanan:   { color: "#FF6B6B", icon: "🍜" },
  Transport: { color: "#4ECDC4", icon: "🚗" },
  Hiburan:   { color: "#45B7D1", icon: "🎮" },
  Utilities: { color: "#FFA07A", icon: "💡" },
  Shopping:  { color: "#98D8C8", icon: "🛍️" },
  Kesehatan: { color: "#DDA0DD", icon: "🏥" },
  Lainnya:   { color: "#F7DC6F", icon: "📌" },
};

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const parseRupiahInput = (value) => {
  const numbers = String(value ?? "").replace(/\D/g, "");
  return parseInt(numbers) || 0;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getMonthKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthLabel = (key) => {
  const [year, month] = key.split("-");
  return new Date(year, parseInt(month) - 1, 1).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
};

const EMPTY_FORM = {
  amount: "",
  category: "Makanan",
  date: new Date().toISOString().split("T")[0],
  description: "",
};

function Expense() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("resonote-expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [initialBalance, setInitialBalance] = useState(() => {
    const saved = localStorage.getItem("resonote-balance");
    return saved ? parseInt(saved) : 0;
  });

  const [form, setForm]               = useState(EMPTY_FORM);
  const [showForm, setShowForm]       = useState(false);
  const [showBalEdit, setShowBalEdit] = useState(false);
  const [balInput, setBalInput]       = useState("");
  const [chartType, setChartType]     = useState("pie");
  const [filterCat, setFilterCat]     = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  useEffect(() => {
    localStorage.setItem("resonote-expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("resonote-balance", String(initialBalance));
  }, [initialBalance]);

  /* ── computed ── */
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const currentBalance = initialBalance - totalExpenses;

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        const okCat   = filterCat   === "all" || e.category === filterCat;
        const okMonth = filterMonth === "all" || getMonthKey(e.date) === filterMonth;
        return okCat && okMonth;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, filterCat, filterMonth]);

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  const pieData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: CATEGORIES[name]?.color || "#999",
    }));
  }, [filteredExpenses]);

  const monthlyData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const k = getMonthKey(e.date);
      map[k] = (map[k] || 0) + e.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, total]) => ({ month: getMonthLabel(k), total }));
  }, [expenses]);

  const availableMonths = useMemo(() => {
    return [...new Set(expenses.map((e) => getMonthKey(e.date)))]
      .sort()
      .reverse();
  }, [expenses]);

  /* ── handlers ── */
  const handleAdd = () => {
    const amount = parseRupiahInput(form.amount);
    if (!amount || amount <= 0 || !form.date) return;
    setExpenses([
      {
        id: Date.now(),
        amount,
        category: form.category,
        date: form.date,
        description: form.description.trim() || "-",
      },
      ...expenses,
    ]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!confirm("Hapus pengeluaran ini?")) return;
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const handleSaveBalance = () => {
    const val = parseRupiahInput(String(balInput));
    if (isNaN(val) || val < 0) return;
    setInitialBalance(val);
    setBalInput("");
    setShowBalEdit(false);
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    /* Sheet 1 – Detail */
    const rows = [
      ["Tanggal", "Kategori", "Keterangan", "Jumlah (Rp)"],
      ...expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((e) => [formatDate(e.date), e.category, e.description, e.amount]),
      [],
      ["", "", "TOTAL", totalExpenses],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Pengeluaran");

    /* Sheet 2 – Ringkasan */
    const summary = [
      ["Kategori", "Total (Rp)", "Persentase"],
      ...pieData.map((d) => [
        d.name,
        d.value,
        `${((d.value / totalExpenses) * 100).toFixed(1)}%`,
      ]),
      [],
      ["Saldo Awal", initialBalance, ""],
      ["Total Pengeluaran", totalExpenses, ""],
      ["Saldo Saat Ini", currentBalance, ""],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Ringkasan");

    XLSX.writeFile(
      wb,
      `resonote-expense-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  /* ── render ── */
  return (
    <div className="expense-container">
      <h1><Wallet size={22} /> Expense Tracker</h1>

      {/* ─── SALDO CARDS ─── */}
      <div className="balance-cards">
        <div className="bal-card bal-initial">
          <span className="bal-label"><BanknoteArrowUp size={22}/> Saldo Awal</span>
          <span className="bal-amount">{formatRupiah(initialBalance)}</span>
          <button className="bal-edit-btn" onClick={() => setShowBalEdit(!showBalEdit)}>
            ✏️ Ubah
          </button>
        </div>

        <div className="bal-card bal-out">
          <span className="bal-label"><BanknoteArrowDown size={22}/> Total Keluar</span>
          <span className="bal-amount">{formatRupiah(totalExpenses)}</span>
        </div>

        <div className={`bal-card ${currentBalance >= 0 ? "bal-safe" : "bal-danger"}`}>
          <span className="bal-label"><Banknote size={22}/> Saldo Sekarang</span>
          <span className="bal-amount">{formatRupiah(currentBalance)}</span>
          {currentBalance < 0 && (
            <span className="bal-warning">⚠️ Saldo minus!</span>
          )}
        </div>
      </div>

      {/* Edit saldo */}
      {showBalEdit && (
        <div className="bal-edit-row">
          <CurrencyInput
            placeholder="Contoh: 1000000"
            value={balInput}
            onChange={setBalInput}
            onKeyDown={(e) => e.key === "Enter" && handleSaveBalance()}
          />
          <button className="btn-save" onClick={handleSaveBalance}>Simpan</button>
          <button className="btn-cancel" onClick={() => setShowBalEdit(false)}>Batal</button>
        </div>
      )}

      {/* ─── TOGGLE FORM ─── */}
      <button
        className="btn-add-expense"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "✖ Tutup Form" : "+ Tambah Pengeluaran"}
      </button>

      {showForm && (
        <div className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label>Jumlah (Rp)</label>
              <CurrencyInput
                placeholder="Contoh: 15000"
                value={form.amount}
                onChange={(amount) => setForm({ ...form, amount })}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {Object.entries(CATEGORIES).map(([name, { icon }]) => (
                  <option key={name} value={name}>{icon} {name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tanggal</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Keterangan</label>
              <input
                type="text"
                placeholder="Contoh: Makan siang di warteg"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <button className="btn-submit" onClick={handleAdd}>+ Tambah</button>
        </div>
      )}

      {/* ─── MONTHLY HISTORY ─── */}
      {monthlyData.length > 0 && (
        <div className="monthly-history">
          <h2><Calendars size={22}/> Riwayat Bulanan</h2>
          <div className="history-list">
            {[...monthlyData].reverse().map((m, i, arr) => {
              const prev = arr[i + 1];
              const change = prev ? (((m.total - prev.total) / prev.total) * 100).toFixed(0) : null;
              const maxTotal = Math.max(...monthlyData.map((x) => x.total));
              const widthPct = ((m.total / maxTotal) * 100).toFixed(1);
              const isHighest = m.total === maxTotal;
              return (
                <div key={m.month} className="history-row">
                  <span className="history-month">{m.month}</span>
                  <div className="history-bar-wrap">
                    <div
                      className="history-bar-fill"
                      style={{
                        width: `${widthPct}%`,
                        background: isHighest
                          ? "linear-gradient(90deg,#ef4444,#f97316)"
                          : "linear-gradient(90deg,var(--accent),var(--accent2))",
                      }}
                    />
                  </div>
                  <span className="history-amount">{formatRupiah(m.total)}</span>
                  {change !== null && (
                    <span className={`history-change ${parseInt(change) > 0 ? "change-up" : "change-down"}`}>
                      {parseInt(change) > 0 ? "▲" : "▼"} {Math.abs(change)}%
                    </span>
                  )}
                  {isHighest && <span className="history-badge-worst">Terboros</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── CHART SECTION ─── */}
      {expenses.length > 0 && (
        <div className="chart-section">
          <div className="chart-header">
            <h2><ChartColumn size={22}/> Analitik</h2>
            <div className="chart-toggle">
              {[
                { key: "pie",  label: "🥧 Pie" },
                { key: "bar",  label: "📊 Bar" },
                { key: "line", label: "📈 Garis" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={chartType === key ? "active" : ""}
                  onClick={() => setChartType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-wrapper">
            {chartType === "pie" && (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatRupiah(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}

            {chartType === "bar" && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatRupiah(v)} />
                  <Bar dataKey="total" fill="#4ECDC4" radius={[6, 6, 0, 0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "line" && (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatRupiah(v)} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                    dot={{ r: 5, fill: "#FF6B6B" }}
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="category-legend">
            {pieData.map((item) => (
              <div key={item.name} className="legend-item">
                <span className="legend-dot" style={{ background: item.color }} />
                <span className="legend-name">{item.name}</span>
                <span className="legend-pct">
                  {((item.value / filteredTotal) * 100).toFixed(0)}%
                </span>
                <span className="legend-amount">{formatRupiah(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── FILTER + EXPORT ─── */}
      <div className="expense-controls">
        <div className="filters">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="all">Semua Kategori</option>
            {Object.keys(CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="all">Semua Bulan</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>{getMonthLabel(m)}</option>
            ))}
          </select>
        </div>

        {expenses.length > 0 && (
          <button className="btn-export" onClick={handleExport}>
            <FileDown size={22}/> Export Excel
          </button>
        )}
      </div>

      {/* ─── TABLE ─── */}
      <div className="expense-table-wrapper">
        {filteredExpenses.length === 0 ? (
          <div className="expense-empty">
            <p><ScrollText size={22}/> Belum ada pengeluaran. Tambah sekarang!</p>
          </div>
        ) : (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th>Jumlah</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="date-cell">{formatDate(exp.date)}</td>
                  <td>
                    <span
                      className="cat-badge"
                      style={{
                        background: (CATEGORIES[exp.category]?.color || "#999") + "22",
                        color: CATEGORIES[exp.category]?.color || "#999",
                        borderColor: (CATEGORIES[exp.category]?.color || "#999") + "66",
                      }}
                    >
                      {CATEGORIES[exp.category]?.icon} {exp.category}
                    </span>
                  </td>
                  <td className="desc-cell">{exp.description}</td>
                  <td className="amount-cell">{formatRupiah(exp.amount)}</td>
                  <td>
                    <button
                      className="btn-del"
                      onClick={() => handleDelete(exp.id)}
                      title="Hapus"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>Total ({filteredExpenses.length} transaksi)</strong></td>
                <td className="amount-cell"><strong>{formatRupiah(filteredTotal)}</strong></td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

export default Expense;
