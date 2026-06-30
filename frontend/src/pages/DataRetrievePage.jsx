import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import aaiLogo from "../assets/aai-logo.jpg";

const ORG_OPTIONS = [
  "BCAS", "CISF", "IMD",
  "AAI / ATM / Operations", "AAI / ATM / Training Cell", "AAI / ATM / SQMS",
  "AAI / ATM / INDRA Automation", "AAI / ATM / RNFC", "AAI / ATM / Roaster & Leave Management",
  "AAI / CNS / GNSS", "AAI / CNS / ILS / LPDME", "AAI / CNS / ILS / LLZ",
  "AAI / CNS / ILS / GP", "AAI / CNS / VOR", "AAI / CNS / ASMGCS",
  "AAI / CNS / Automation", "AAI / CNS / HPDME", "AAI / CNS / Nav and Status Indicator",
  "AAI / CNS / ADSB", "AAI / CNS / (Hotline/Intercom/DSC/STD)",
  "AAI / CNS / VCCS", "AAI / CNS / VHF / 121.625", "AAI / CNS / VHF / 125.25",
  "AAI / CNS / VHF / 119.75", "AAI / CNS / VHF / 120.225", "AAI / CNS / VHF / 127.575",
  "AAI / CNS / VHF / 121.5", "AAI / CNS / VHF / 124.3", "AAI / CNS / VHF / 125.975",
  "Adani / Electrical", "Adani / Civil", "Adani / AOCC", "Adani / AOCC / Bay Management", "Adani / Apron Control", "Adani / Apron Control / Laser Interference", "Adani / General Admin",
  "AAI / CNS / (Broadband/LAN/Internet)", "AAI / ATM / ACDM", "Adani / IT", "AAI / CNS / ATIS", "AAI / CNS / Desktop", "AAI / CNS / Printers", "AAI / CNS / Radar-MSSR", "AAI / CNS / Radar-Primary",
  "AAI / CNS / Store", "AAI / ATM / Store", "AAI / ATM / General", "AAI / ATM / Administration",
].sort((a, b) => a.localeCompare(b));

const UNIT_OPTIONS = [
  "TWR-A", "SMC-D", "TWR-D", "APP(P)", "APP(S)", "ACC(P)", "ACC(S)", "ACC(A)",
].sort((a, b) => a.localeCompare(b));

const STATUS_OPTIONS = ["Resolved", "Pending"];

const API_URL = "/api/grievances";

// Converts a Date object to a local YYYY-MM-DD string (avoids UTC shift issues)
const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateDDMMYYYY = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
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

const DataRetrievePage = () => {
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("ATM Complaint Management System, Jaipur International Airport", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["S.No", "Date", "Time", "Organization Name", "ATS Unit", "Log Extracts", "Status", "Response", "PDC", "Remarks"]],
      body: filteredRows.map((r, i) => {
        const d = new Date(r.createdAt);
        return [
          i + 1,
          formatDateDDMMYYYY(d),
          d.toLocaleTimeString(),
          r.organizationName,
          r.complainingUnit,
          r.logExtract,
          r.status,
          r.response || "",
          r.pdc ? formatDateDDMMYYYY(new Date(r.pdc)) : "",
          r.remarks,
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 77, 158] },
    });

    doc.save("grievance-filtered-data.pdf");
  };

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
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-8">
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

            <CheckListDropdown
              label="Organization Name"
              options={ORG_OPTIONS}
              selected={orgFilter}
              onToggle={toggleFilter(setOrgFilter)}
            />

            <CheckListDropdown
              label="ATS Unit"
              options={UNIT_OPTIONS}
              selected={unitFilter}
              onToggle={toggleFilter(setUnitFilter)}
            />

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

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#2e4d9e] text-white">
                <tr>
                  {["S.No", "Date", "Time", "Organization Name", "ATS Unit", "Log Extracts", "Status", "Response", "PDC", "Remarks"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-400">
                      No matching data
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, i) => {
                    const d = new Date(row.createdAt);
                    return (
                      <tr key={row._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDateDDMMYYYY(d)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{d.toLocaleTimeString()}</td>
                        <td className="px-4 py-3">{row.organizationName}</td>
                        <td className="px-4 py-3">{row.complainingUnit}</td>
                        <td className="px-4 py-3 max-w-xs truncate">{row.logExtract}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.status === "Resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">{row.response || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.pdc ? formatDateDDMMYYYY(new Date(row.pdc)) : "—"}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">{row.remarks}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end p-4 border-t border-slate-100">
            <button
              onClick={handleDownloadPdf}
              disabled={filteredRows.length === 0}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                filteredRows.length > 0
                  ? "bg-[#2e4d9e] text-white hover:bg-[#3a5cb8]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataRetrievePage;