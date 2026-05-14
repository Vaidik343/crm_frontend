import { useState } from "react";
import api from "../../api/axiosInstance";
import { ENDPOINTS } from "../../api/endpoints";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

const EXPORT_TYPES = [
  { value: "calls",     label: "📞 Call Logs" },
  { value: "tasks",     label: "✅ Tasks" },
  { value: "work-logs", label: "📝 Work Logs" },
];

const Export = () => {
  const [loading, setLoading] = useState(null);
  const [alert, setAlert]     = useState({ type: "", message: "" });

  const handleExport = async (type) => {
    try {
      setLoading(type);
      const response = await api.get(ENDPOINTS.EXPORT.ALL, {
        params: { type },
        responseType: "blob", // important — tells axios to treat response as file
      });
      console.log("🚀 ~ handleExport ~ response:", response)

      // create a download link and click it
      const url      = window.URL.createObjectURL(new Blob([response.data]));
      const link     = document.createElement("a");
      link.href      = url;
      link.setAttribute("download", `${type}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setAlert({ type: "success", message: `${type}.xlsx downloaded successfully` });
    } catch (err) {
      setAlert({ type: "danger", message: err?.response?.data?.message || "Export failed" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Export Data</h4>
        <p className="text-muted small mb-0">
          Download data as Excel files. All records included.
        </p>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      <div className="row g-3">
        {EXPORT_TYPES.map((type) => (
          <div key={type.value} className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-5 gap-3">
                <span style={{ fontSize: 40 }}>
                  {type.label.split(" ")[0]}
                </span>
                <h6 className="fw-semibold mb-0">
                  {type.label.split(" ").slice(1).join(" ")}
                </h6>
                <Button
                  variant="outline-primary"
                  loading={loading === type.value}
                  onClick={() => handleExport(type.value)}
                >
                  Download Excel
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Export;