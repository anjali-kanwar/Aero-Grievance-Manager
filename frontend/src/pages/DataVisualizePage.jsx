import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import aaiLogo from "../assets/aai-logo.jpg";

const ORG_OPTIONS = [
  "BCAS", "CISF", "IMD",
  "AAI / ATM / Operations", "AAI / ATM / Training Cell", "AAI / ATM / SQMS",
  "AAI / ATM / Automation", "AAI / ATM / RNFC", "AAI / ATM / Roaster & Leave Management",
  "AAI / CNS / GNSS", "AAI / CNS / ILS / LPDME", "AAI / CNS /ILS / LLZ",
  "AAI / CNS / ILS / GP", "AAI / CNS / VOR", "AAI / CNS / ASMGCS",
  "AAI / CNS / Automation", "AAI / CNS / DME", "AAI / CNS / Nav and Status Indicator",
  "AAI / CNS / ADSB", "AAI / CNS / Radar", "AAI / CNS / (Hotline/Intercom/DSC/STD)",
  "AAI / CNS / VCCS", "AAI / CNS / VHF / 121.625", "AAI / CNS / VHF / 125.25",
  "AAI / CNS / VHF / 119.75", "AAI / CNS / VHF / 120.225", "AAI / CNS / VHS / 127.5775",
  "AAI / CNS / VHF / 121.5", "AAI / CNS / VHF / 124.3", "AAI / CNS / VHF /125.975",
  "Adani / Electrical", "Adani / Civil", "Adani / Operations", "Adani / General Admin",
].sort((a, b) => a.localeCompare(b));

const UNIT_OPTIONS = [
  "TWRA", "SMC-D", "TMRD", "APP(P)", "APP(S)", "ACC(P)", "ACC(S)", "ACC(A)",
].sort((a, b) => a.localeCompare(b));

const STATUS_OPTIONS = ["Pass", "Fail"];
const API_URL = "/api/grievances";
const COLORS = { Pass: "#22c55e", Fail: "#ef4444", Total: "#2e4d9e" };

const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const CheckListDropdown = ({ label, options, selected, onToggle }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-[#2e4d9e]"
      >
        {selected.length === 0 ? "All" : `${selected.length} selected`}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg p-2">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="accent-[#2e4d9e]"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, accent }) => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
    <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
    <p className={`text-3xl font-semibold ${accent || "text-slate-800"}`}>{value}</p>
  </div>
);

const DataVisualizePage = () => {
  const navigate = useNavigate();
  const [allRows, setAllRows] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [orgFilter, setOrgFilter] = useState([]);
  const [unitFilter, setUnitFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setAllRows(data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  const toggleFilter = (setFn) => (value) =>
    setFn((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const createdLocalStr = toLocalDateString(new Date(row.createdAt));
      if (fromDate && createdLocalStr < fromDate) return false;
      if (toDate && createdLocalStr > toDate) return false;
      if (orgFilter.length > 0 && !orgFilter.includes(row.organizationName)) return false;
      if (unitFilter.length > 0 && !unitFilter.includes(row.complainingUnit)) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      return true;
    });
  }, [allRows, fromDate, toDate, orgFilter, unitFilter, statusFilter]);

  const totalEntries = filteredRows.length;

  const pieData = useMemo(() => {
    const counts = { Pass: 0, Fail: 0 };
    filteredRows.forEach((row) => {
      counts[row.status] = (counts[row.status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [filteredRows]);

  const orgStackedData = useMemo(() => {
    const map = {};
    filteredRows.forEach((row) => {
      if (!map[row.organizationName]) map[row.organizationName] = { name: row.organizationName, Pass: 0, Fail: 0 };
      map[row.organizationName][row.status] += 1;
    });
    return Object.values(map).sort((a, b) => (b.Pass + b.Fail) - (a.Pass + a.Fail));
  }, [filteredRows]);

  const unitStackedData = useMemo(() => {
    const map = {};
    filteredRows.forEach((row) => {
      if (!map[row.complainingUnit]) map[row.complainingUnit] = { name: row.complainingUnit, Pass: 0, Fail: 0 };
      map[row.complainingUnit][row.status] += 1;
    });
    return Object.values(map).sort((a, b) => (b.Pass + b.Fail) - (a.Pass + a.Fail));
  }, [filteredRows]);

  const trendData = useMemo(() => {
    const map = {};
    filteredRows.forEach((row) => {
      const dateStr = toLocalDateString(new Date(row.createdAt));
      if (!map[dateStr]) map[dateStr] = { date: dateStr, Pass: 0, Fail: 0, Total: 0 };
      map[dateStr][row.status] += 1;
      map[dateStr].Total += 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-2 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={aaiLogo} alt="AAI" className="h-24 w-auto" />
          <span className="text-3xl font-semibold text-[#2e4d9e] tracking-wide">
            Airports Authority of India
          </span>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 rounded-lg border border-[#2e4d9e] text-[#2e4d9e] font-medium hover:bg-[#2e4d9e] hover:text-white transition"
        >
          Back to Home
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Filter Data</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4d9e]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4d9e]"
              />
            </div>
            <CheckListDropdown label="Organization Name" options={ORG_OPTIONS} selected={orgFilter} onToggle={toggleFilter(setOrgFilter)} />
            <CheckListDropdown label="Complaining Unit" options={UNIT_OPTIONS} selected={unitFilter} onToggle={toggleFilter(setUnitFilter)} />
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4d9e]"
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center text-slate-400">
            No data matches the selected filters
          </div>
        ) : (
          <>
            {/* Total entries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard label="Total Entries" value={totalEntries} />
              <StatCard label="Passed" value={filteredRows.filter((r) => r.status === "Pass").length} accent="text-green-600" />
              <StatCard label="Failed" value={filteredRows.filter((r) => r.status === "Fail").length} accent="text-red-600" />
            </div>

            {/* Line graph: Total + Pass + Fail over time */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-6">
              <h3 className="text-base font-semibold text-slate-800 mb-1">Complaints Over Time</h3>
              <p className="text-xs text-slate-400 mb-4">Total volume alongside Pass/Fail trend</p>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Total" stroke={COLORS.Total} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Pass" stroke={COLORS.Pass} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Fail" stroke={COLORS.Fail} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Complaining Unit bar + Pie chart, side by side */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-800 mb-1">Complaining Unit Split — Pass/Fail</h3>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={unitStackedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Pass" stackId="a" fill={COLORS.Pass} />
                    <Bar dataKey="Fail" stackId="a" fill={COLORS.Fail} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-800 mb-1">Pass / Fail Breakdown</h3>
                <ResponsiveContainer width="100%" height={360}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, value, percent }) => `${name}: ${value} (${Math.round(percent * 100)}%)`}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Organization split bar, own row */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-800 mb-1">Organization Split — Pass/Fail</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={orgStackedData} margin={{ top: 10, right: 10, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" angle={-40} textAnchor="end" interval={0} height={100} tick={{ fontSize: 10, fill: "#475569" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Pass" stackId="a" fill={COLORS.Pass} />
                  <Bar dataKey="Fail" stackId="a" fill={COLORS.Fail} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataVisualizePage;