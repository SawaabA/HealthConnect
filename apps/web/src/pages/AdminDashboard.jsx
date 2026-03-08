import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ShieldCheck, LogOut } from "lucide-react";
import Logo from "../components/Logo";
import { resolveRoleAndUserId } from "../lib/auth";
import { generateAuditDigest, listAuditLogs } from "../lib/api";

export default function AdminDashboard() {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [digest, setDigest] = useState("");
  const [digestError, setDigestError] = useState("");
  const [digestLoading, setDigestLoading] = useState(false);

  const authContext = useMemo(() => resolveRoleAndUserId(user, "admin"), [user]);
  const fallbackPatientId = Number.parseInt(import.meta.env.VITE_DEMO_PATIENT_ID || "1", 10);

  const resolveTokenIfConfigured = useCallback(async () => {
    if (!import.meta.env.VITE_AUTH0_AUDIENCE) return null;
    return getAccessTokenSilently();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const token = await resolveTokenIfConfigured();

        const response = await listAuditLogs({
          userId: authContext.userId,
          token,
          limit: 100,
        });

        if (mounted) {
          setLogs(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Unable to load audit logs");
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [authContext.userId, resolveTokenIfConfigured]);

  async function handleGenerateDigest() {
    if (logs.length === 0) {
      setDigestError("Load audit logs first.");
      return;
    }

    setDigestLoading(true);
    setDigestError("");
    try {
      const token = await resolveTokenIfConfigured();
      const firstWithPatientId = logs.find((entry) => {
        const details = entry?.details;
        if (!details || typeof details !== "object") return false;
        return Number.isFinite(Number.parseInt(details.patient_id, 10));
      });
      const patientId =
        Number.parseInt(firstWithPatientId?.details?.patient_id, 10) || fallbackPatientId;

      const digestResponse = await generateAuditDigest({
        patientId,
        auditEvents: logs.map((entry) => ({
          action: entry.action,
          actor_user_id: entry.actor_user_id,
          created_at: entry.created_at,
          details: entry.details,
        })),
        userId: authContext.userId,
        token,
      });

      setDigest(digestResponse?.content || "");
    } catch (err) {
      setDigestError(err?.message || "Unable to generate audit summary");
    } finally {
      setDigestLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ backgroundColor: "#adebb3" }} className="shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <div>
              <h1 className="text-gray-900 font-bold text-lg">HealthConnect</h1>
              <p className="text-gray-700 text-xs">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Audit Log Viewer</h2>
          </div>
          <button
            onClick={handleGenerateDigest}
            disabled={digestLoading || logs.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {digestLoading ? "Generating..." : "Generate AI Audit Summary"}
          </button>
        </div>

        {digest ? (
          <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs uppercase font-semibold text-indigo-600 tracking-wide mb-2">
              Audit Digest
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{digest}</p>
          </div>
        ) : null}

        {digestError ? (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
            {digestError}
          </div>
        ) : null}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {error ? (
            <div className="p-6 text-sm text-red-700 bg-red-50 border-b border-red-100">
              {error}
            </div>
          ) : null}

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-3 text-left">When</th>
                <th className="px-5 py-3 text-left">Actor</th>
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td className="px-5 py-5 text-gray-500" colSpan={4}>
                    No audit events yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-CA")}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {log.actor_user_id ? `User #${log.actor_user_id}` : "System"}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">{log.action}</td>
                    <td className="px-5 py-4 text-gray-600">
                      <pre className="whitespace-pre-wrap break-words text-xs text-gray-500">
                        {JSON.stringify(log.details ?? {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
