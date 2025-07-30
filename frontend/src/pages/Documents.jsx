import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const Documents = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace this fetch URL with your actual backend URL
    fetch("http://localhost:5000/comparison_history")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Comparison history data:", data);
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
        } else {
          console.warn("No data received from backend, using fallback data.");
          // Fallback mock data if backend returns empty or invalid data
          setHistory([
            {
              session_id: "abc123",
              jd_name: "Software Engineer",
              comparison_date: "2025-07-28T12:34:56Z",
              total_cvs: 10,
              accepted_cvs: 5,
              rejected_cvs: 3,
            },
            {
              session_id: "def456",
              jd_name: "Data Scientist",
              comparison_date: "2025-07-27T09:00:00Z",
              total_cvs: 8,
              accepted_cvs: 6,
              rejected_cvs: 1,
            },
          ]);
        }
      })
      .catch((err) => {
        console.error("Failed to load comparison history:", err);
        // On error, also load fallback mock data so UI isn't empty
        setHistory([
          {
            session_id: "error123",
            jd_name: "Error loading data",
            comparison_date: null,
            total_cvs: 0,
            accepted_cvs: 0,
            rejected_cvs: 0,
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-[#f1faee] font-sans">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-[#1d3557] mb-6">
          Comparison History
        </h1>

        {loading ? (
          <p className="text-[#457b9d]">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-[#e63946]">No comparison history found.</p>
        ) : (
          <div className="space-y-6">
            {history.map((session) => (
              <div
                key={session.session_id}
                className="bg-white rounded-xl shadow p-6 border border-[#a8dadc]"
              >
                {/* JD Name */}
                <h2 className="text-xl font-semibold text-[#1d3557]">
                  {session.jd_name || "Unnamed JD"}
                </h2>
                {/* Comparison Date */}
                <p className="text-sm text-[#457b9d] mb-4">
                  {session.comparison_date
                    ? new Date(session.comparison_date).toLocaleString()
                    : "Date not available"}
                </p>

                {/* Summary Stats */}
                <div className="flex space-x-8 text-[#1d3557] font-medium">
                  <div>
                    <p className="text-lg">{session.total_cvs ?? 0}</p>
                    <p className="text-sm text-[#457b9d]">Total CVs</p>
                  </div>
                  <div>
                    <p className="text-lg text-emerald-700">
                      {session.accepted_cvs ?? 0}
                    </p>
                    <p className="text-sm text-[#457b9d]">Accepted</p>
                  </div>
                  <div>
                    <p className="text-lg text-red-600">
                      {session.rejected_cvs ?? 0}
                    </p>
                    <p className="text-sm text-[#457b9d]">Rejected</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug raw JSON output (optional) */}
        {!loading && (
          <pre className="mt-6 p-4 bg-gray-100 rounded max-h-96 overflow-auto text-xs">
            {JSON.stringify(history, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default Documents;
