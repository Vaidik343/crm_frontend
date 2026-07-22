// src/features/interns/pages/public/InternStatus.jsx

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useIntern } from "../../../../context/InternContext";
import toast from "react-hot-toast";
import { MdCheckCircle, MdCancel, MdHourglassTop, MdRefresh } from "react-icons/md";

const POLL_INTERVAL_MS = 10000; // poll every 10 seconds

const InternStatus = () => {
  // const { token: intern_id } = useParams(); // route is /intern/status/:token
  const { intern_id } = useParams();
  const navigate             = useNavigate();
  const { checkStatus }      = useIntern();

  const [status, setStatus]               = useState(null); // 'pending' | 'approved' | 'rejected'
  const [message, setMessage]             = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [tokenExpired, setTokenExpired]   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [lastChecked, setLastChecked]     = useState(null);

  const intervalRef = useRef(null);

  const poll = async () => {
    try {
      const data = await checkStatus(intern_id);

      setStatus(data.status);
      setMessage(data.message);
      setLastChecked(new Date());

      if (data.status === "rejected") {
        setRejectionReason(data.rejection_reason || "");
        stopPolling();
        return;
      }

      if (data.status === "approved") {
        stopPolling();

        if (data.token_expired) {
          setTokenExpired(true);
          return;
        }

        // redirect to setup-password with the one-time token
        toast.success("Your application has been approved!");
        navigate(`/intern/setup-password/${data.setup_token}`, { replace: true });
        return;
      }

      // still pending — keep polling

    } catch (error) {
      const msg = error?.response?.data?.message || "Unable to check status. Retrying...";
      // don't toast on every poll failure — just update message silently
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!intern_id) {
      navigate("/intern/register", { replace: true });
      return;
    }

    // immediate first poll
    poll();

    // then poll on interval while pending
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [intern_id]);

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const formatTime = (date) =>
    date
      ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#132ea7] px-8 py-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#132ea7] font-black text-xs">CRM</span>
          </div>
          <span className="font-black text-white text-lg uppercase tracking-tight">
            Application Status
          </span>
        </div>

        {/* Body */}
        <div className="px-8 py-10 flex flex-col items-center gap-6 text-center">

          {/* Loading state — first fetch */}
          {loading && (
            <>
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
                <MdHourglassTop size={32} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Checking your application status...
              </p>
            </>
          )}

          {/* Pending */}
          {!loading && status === "pending" && (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                <MdHourglassTop size={40} className="text-amber-500 animate-bounce" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                  Under Review
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-2 max-w-xs">
                  Your application has been submitted and is currently being reviewed by our team.
                  This page checks automatically every 10 seconds.
                </p>
              </div>

              {/* Auto-refresh indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold bg-slate-50 px-4 py-2 rounded-full">
                <MdRefresh size={14} className="animate-spin" />
                <span>
                  {lastChecked
                    ? `Last checked at ${formatTime(lastChecked)}`
                    : "Checking..."}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                You can safely close this tab and come back later using the same link.
              </p>
            </>
          )}

          {/* Rejected */}
          {!loading && status === "rejected" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <MdCancel size={40} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                  Application Rejected
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-2">
                  Unfortunately, your application was not approved.
                </p>
              </div>

              {rejectionReason && (
                <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">
                    Reason
                  </p>
                  <p className="text-sm font-semibold text-red-700">
                    {rejectionReason}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400">
                For further queries, please contact the HR team.
              </p>
            </>
          )}

          {/* Approved but token expired */}
          {!loading && status === "approved" && tokenExpired && (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                <MdCheckCircle size={40} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                  Approved — Setup Link Expired
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-2 max-w-xs">
                  Your application was approved but your password setup link has expired.
                  Please contact the admin to regenerate your setup link.
                </p>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-slate-300 font-semibold">
            Application ID: <span className="text-slate-400">{intern_id}</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default InternStatus;