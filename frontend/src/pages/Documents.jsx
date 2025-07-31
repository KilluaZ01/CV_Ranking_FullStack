import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const Documents = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/documents")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setHistory(data || []);
      })
      .catch((err) => {
        console.error("Failed to load comparison history:", err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-[#f1faee] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <h1 className="text-3xl font-bold text-[#1d3557] mb-6">
          Comparison History
        </h1>

        {loading ? (
          <p className="text-[#457b9d]">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-[#e63946]">No comparison history found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {history.map((session) => (
              <div
                key={session.session_id}
                className="bg-white border border-[#a8dadc] rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <h2 className="text-xl font-semibold text-[#1d3557] mb-1">
                  {session.jd_name || "Unnamed JD"}
                </h2>
                <p className="text-sm text-[#457b9d] mb-4">
                  {session.comparison_date
                    ? new Date(session.comparison_date).toLocaleString()
                    : "Date not available"}
                </p>

                <div className="flex justify-between text-sm font-medium text-[#1d3557]">
                  <div className="text-center">
                    <p className="text-lg">{session.total_cvs ?? 0}</p>
                    <p className="text-[#457b9d]">Total CVs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-emerald-700">
                      {session.accepted_cvs ?? 0}
                    </p>
                    <p className="text-[#457b9d]">Accepted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-red-600">
                      {session.rejected_cvs ?? 0}
                    </p>
                    <p className="text-[#457b9d]">Rejected</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional: JSON Viewer for Debugging */}
        {!loading && history.length > 0 && (
          <pre className="mt-8 p-4 bg-[#f1faee] border rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(history, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default Documents;
