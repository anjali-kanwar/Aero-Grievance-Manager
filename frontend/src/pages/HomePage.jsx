import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import aaiLogo from "../assets/aai-logo.jpg";

const ORG_OPTIONS = [
  "BCAS", "CISF", "IMD",
  "AAI / ATM / Operations", "AAI / ATM / Training Cell", "AAI / ATM / SQMS",
  "AAI / ATM / Automation", "AAI / ATM / RNFC", "AAI / ATM / Roaster & Leave Management",
  "AAI / CNS / GNSS", "AAI / CNS / ILS / LPDME", "AAI / CNS / ILS / LLZ",
  "AAI / CNS / ILS / GP", "AAI / CNS / VOR", "AAI / CNS / ASMGCS",
  "AAI / CNS / Automation", "AAI / CNS / DME", "AAI / CNS / Nav and Status Indicator",
  "AAI / CNS / ADSB", "AAI / CNS / Radar", "AAI / CNS / (Hotline/Intercom/DSC/STD)",
  "AAI / CNS / VCCS", "AAI / CNS / VHF / 121.625", "AAI / CNS / VHF / 125.25",
  "AAI / CNS / VHF / 119.75", "AAI / CNS / VHF / 120.225", "AAI / CNS / VHF / 127.575",
  "AAI / CNS / VHF / 121.5", "AAI / CNS / VHF / 124.3", "AAI / CNS / VHF / 125.975",
  "Adani / Electrical", "Adani / Civil", "Adani / AOCC", "Adani / AOCC / Bay Management", "Adani / Apron Control", "Adani / Apron Control / Laser Interface", "Adani / General Admin",
].sort((a, b) => a.localeCompare(b));

const UNIT_OPTIONS = [
  "TWRA", "SMC-D", "TMRD", "APP(P)", "APP(S)", "ACC(P)", "ACC(S)", "ACC(A)",
].sort((a, b) => a.localeCompare(b));

const EMPTY_FORM = {
  organizationName: "",
  complainingUnit: "",
  logExtract: "",
  status: "",
  remarks: "",
};

const API_URL = "/api/grievances";

const formatDateDDMMYYYY = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const isFormComplete = Object.values(form).every((v) => v.trim() !== "");

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    sessionStorage.removeItem("cameFromHome");
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));


  const handleSubmit = async () => {
    if (!isFormComplete) return;
    setLoading(true);
    try {
      if (editingId) {
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setRows((prev) => prev.map((r) => (r._id === editingId ? updated : r)));
        toast.success("Entry updated");
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setRows((prev) => [created, ...prev]);
        toast.success("Entry added");
      }
      resetForm();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setForm({
      organizationName: row.organizationName,
      complainingUnit: row.complainingUnit,
      logExtract: row.logExtract,
      status: row.status,
      remarks: row.remarks,
    });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r._id !== id));
      toast.success("Entry deleted");
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Aero Grievance Manager - Data Log", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["S.No", "Date", "Time", "Organization Name", "Complaining Unit", "Log Extracts", "Status", "Remarks"]],
      body: rows.map((r, i) => {
        const d = new Date(r.createdAt);
        return [
          i + 1,
          formatDateDDMMYYYY(d),
          d.toLocaleTimeString(),
          r.organizationName,
          r.complainingUnit,
          r.logExtract,
          r.status,
          r.remarks,
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 77, 158] },
    });

    doc.save("grievance-data.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={aaiLogo} alt="AAI" className="h-24 w-auto" />
          <span className="text-2xl font-semibold text-[#2e4d9e] tracking-wide">
            Airports Authority of India
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              sessionStorage.setItem("cameFromHome", "true");
              navigate("/retrieve");
            }}
            className="px-4 py-2 rounded-lg border border-[#2e4d9e] text-[#2e4d9e] font-medium hover:bg-[#2e4d9e] hover:text-white transition"
          >
            Data Retrieve
          </button>
          <button
            onClick={() => {
              sessionStorage.setItem("cameFromHome", "true");
              navigate("/visualize");
            }}
            className="px-4 py-2 rounded-lg border border-[#2e4d9e] text-[#2e4d9e] font-medium hover:bg-[#2e4d9e] hover:text-white transition"
          >
            Data Visualize
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? "Edit Entry" : "Add New Entry"}
          </h2>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Organization Name
              </label>
              <select
                value={form.organizationName}
                onChange={handleChange("organizationName")}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4d9e]"
              >
                <option value="">Select</option>
                {ORG_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Complaining Unit
              </label>
              <select
                value={form.complainingUnit}
                onChange={handleChange("complainingUnit")}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4d9e]"
              >
                <option value="">Select</option>
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Log Extract
              </label>
              <textarea
                value={form.logExtract}
                onChange={handleChange("logExtract")}
                rows={1}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4d9e] resize-none"
                placeholder="Describe log extract"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={handleChange("status")}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4d9e]"
              >
                <option value="">Select</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Remarks
              </label>
              <textarea
                value={form.remarks}
                onChange={handleChange("remarks")}
                rows={1}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e4d9e] resize-none"
                placeholder="Add remarks"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            {editingId && (
              <button
                onClick={resetForm}
                className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isFormComplete || loading}
              className={`px-5 py-2 rounded-lg font-medium transition ${isFormComplete && !loading
                  ? "bg-[#2e4d9e] text-white hover:bg-[#3a5cb8]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
              {editingId ? "Update Data" : "Add Data"}
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#2e4d9e] text-white">
                <tr>
                  {["S.No", "Date", "Time", "Organization Name", "Complaining Unit", "Log Extracts", "Status", "Remarks", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      No data added yet
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => {
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
                            className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Pass"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                              }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">{row.remarks}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(row)}
                            className="text-[#2e4d9e] hover:underline mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
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
              disabled={rows.length === 0}
              className={`px-5 py-2 rounded-lg font-medium transition ${rows.length > 0
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

export default HomePage;