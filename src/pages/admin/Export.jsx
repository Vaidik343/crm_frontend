
import { useState } from "react";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";

import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

import {
  MdFileDownload,
  MdPhone,
  MdAssignment,
  MdHistory,
  MdSecurity,
  MdDateRange,
  MdRestartAlt,
} from "react-icons/md";

const Export = ({ from: parentFrom = "", to: parentTo = "" }) => {
  const [loading, setLoading] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  // filters
  const [date, setDate] = useState("");
  const [from, setFrom] = useState(parentFrom);
  const [to, setTo] = useState(parentTo);

  const resetFilters = () => {
    setDate("");
    setFrom("");
    setTo("");
  };

  const handleExport = async (type) => {
    try {
      setLoading(type);

      const params = new URLSearchParams();

      params.append("type", type);

      // single date has priority
      if (date) {
        params.append("date", date);
      } else {
        if (from) params.append("from", from);
        if (to) params.append("to", to);
      }

      const response = await api.get(
        `${ENDPOINTS.EXPORT.ALL}?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      // filename from backend
      const contentDisposition =
        response.headers["content-disposition"];

      let filename = `${type}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);

        if (match?.[1]) {
          filename = match[1];
        }
      }

      // create file
      const blob = new Blob([response.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", filename);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setAlert({
        type: "success",
        message: `${type.toUpperCase()} exported successfully`,
      });
    } catch (err) {
      setAlert({
        type: "danger",
        message:
          err?.response?.data?.message ||
          "Export failed",
      });
    } finally {
      setLoading(null);
    }
  };

  const exportTypes = [
    {
      id: "calls",
      label: "Call Logs",
      icon: <MdPhone size={24} />,
      description: "Export all communication records",
    },
    {
      id: "tasks",
      label: "Task Logs",
      icon: <MdAssignment size={24} />,
      description: "Export assigned task records",
    },
    {
      id: "work-logs",
      label: "Work Logs",
      icon: <MdHistory size={24} />,
      description: "Export employee work submissions",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-black text-slate-800">
          Export Center
        </h3>

        <p className="text-slate-500 font-semibold mt-2">
          Download reports and operational datasets.
        </p>
      </div>

      {/* Alert */}
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() =>
          setAlert({
            type: "",
            message: "",
          })
        }
      />

      {/* Filters */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6">
        <div className="flex items-center gap-3 mb-6">
          <MdDateRange
            size={24}
            className="text-[#132ea7]"
          />

          <h4 className="text-lg font-black text-slate-800">
            Export Filters
          </h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Single Date */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              Single Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#132ea7]"
            />
          </div>

          {/* From */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              From
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={!!date}
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#132ea7] disabled:bg-slate-100"
            />
          </div>

          {/* To */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
              To
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={!!date}
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#132ea7] disabled:bg-slate-100"
            />
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <Button
              variant="secondary"
              className="w-full h-12 font-black uppercase tracking-widest text-xs"
              onClick={resetFilters}
            >
              <MdRestartAlt size={18} />
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-400 font-semibold">
          • Single date export overrides range filters.
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportTypes.map((item) => (
          <div
            key={item.id}
            className="group bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-[#132ea7] flex items-center justify-center group-hover:bg-[#132ea7] group-hover:text-white transition-all">
                {item.icon}
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-800">
                  {item.label}
                </h4>

                <p className="text-sm text-slate-400 font-semibold mt-2">
                  {item.description}
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full h-12 font-black uppercase tracking-widest text-xs"
                onClick={() => handleExport(item.id)}
                loading={loading === item.id}
              >
                <MdFileDownload size={18} />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#132ea7] flex items-center justify-center shrink-0">
          <MdSecurity size={22} />
        </div>

        <div>
          <h5 className="font-black text-slate-800 uppercase tracking-widest text-sm">
            Security Notice
          </h5>

          <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
            Exported reports may contain sensitive operational data.
            Ensure files are shared only with authorized personnel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Export;
