import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { CSVLink } from "react-csv";

const ResultsPage = () => {
  const location = useLocation();
  const session_id = location.state?.session_id;

  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  const fetchResults = () => {
    if (!session_id) return;

    setLoading(true);
    Promise.all([
      fetch(`http://localhost:8000/get_results?session_id=${session_id}`).then((res) =>
        res.json()
      ),
      fetch(`http://localhost:8000/summary?session_id=${session_id}`).then((res) =>
        res.json()
      ),
    ])
      .then(([resultsData, summaryData]) => {
        if (resultsData.results?.scored) {
          resultsData.results.scored.sort((a, b) => b.total_score - a.total_score);
        }
        setResults(resultsData.results);
        setSummary(summaryData);
        setSelectedResultIndex(0);
      })
      .catch((err) => console.error("Failed to load data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
  }, [session_id]);

  const getScoreColor = (score) => {
    const percentage = Math.round(score * 100);
    if (percentage > 80) return "bg-emerald-200 text-[#1d3557]";
    if (percentage > 70) return "bg-lime-200 text-[#1d3557]";
    if (percentage > 60) return "bg-orange-100 text-orange-700";
    if (percentage > 50) return "bg-yellow-100 text-yellow-700";
    return "bg-[#e63946] text-white";
  };

  const selectedResult = results?.scored?.[selectedResultIndex];

  const handlePrev = () => {
    setSelectedResultIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (results?.scored) {
      setSelectedResultIndex((prev) => Math.min(prev + 1, results.scored.length - 1));
    }
  };

  const handleAccept = async () => {
    if (!selectedResult) return;
    try {
      await fetch("http://localhost:8000/accept_cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, cv_id: selectedResult.cv_id }),
      });
      fetchResults();
    } catch (err) {
      alert("Failed to accept CV.");
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!selectedResult) return;
    if (!window.confirm(`Reject CV: ${selectedResult.name || "Unnamed"}?`)) return;

    try {
      await fetch("http://localhost:8000/reject_cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, cv_id: selectedResult.cv_id }),
      });
      fetchResults();
    } catch (err) {
      alert("Failed to reject CV.");
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#f1faee] font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        {/* Summary Header */}
        <div className="p-4 border-b border-[#a8dadc] bg-white flex flex-col md:flex-row justify-between items-center">
          <div className="text-[#1d3557] font-semibold">
            <p>
              <span className="font-bold">Comparison Date:</span>{" "}
              {summary?.comparison_date
                ? new Date(summary.comparison_date).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div className="flex space-x-6 mt-2 md:mt-0 text-[#457b9d] font-semibold">
            <p>Total CVs: {summary?.total_cvs ?? 0}</p>
            <p className="text-emerald-700">Accepted: {summary?.accepted_cvs ?? 0}</p>
            <p className="text-red-600">Rejected: {summary?.rejected_cvs ?? 0}</p>
            <p>Pending: {summary?.pending_cvs ?? 0}</p>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Candidate List */}
          <div className="w-[30%] border-r border-[#a8dadc] flex flex-col">
            <div className="p-4 border-b border-[#a8dadc] bg-white">
              <h1 className="text-2xl font-bold text-[#1d3557]">Candidates</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {loading ? (
                <p className="text-[#457b9d]">Loading results...</p>
              ) : !results?.scored?.length ? (
                <p className="text-[#e63946]">No results found.</p>
              ) : (
                results.scored.map((result, index) => (
                  <div
                    key={result.cv_id}
                    className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                      index === selectedResultIndex
                        ? "bg-[#a8dadc] border-[#1d3557]"
                        : "bg-white hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedResultIndex(index)}
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold text-[#1d3557]">
                        {result.name || "Unnamed"}
                      </h2>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${getScoreColor(
                          result.total_score
                        )}`}
                      >
                        {Math.round(result.total_score * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-[#1d3557] mt-1">{result.matched_summary || ""}</p>
                    <div className="mt-1 text-xs">
                      {result.accepted
                        ? `Accepted on: ${new Date(result.accepted_date).toLocaleString()}`
                        : result.rejected
                        ? `Rejected on: ${new Date(result.rejected_date).toLocaleString()}`
                        : "Pending decision"}
                    </div>
                  </div>
                ))
              )}
            </div>

            {results?.scored?.length > 0 && (
              <div className="p-4 border-t border-[#a8dadc] bg-white">
                <CSVLink
                  data={results.scored.map((r) => ({
                    Name: r.name,
                    Score: Math.round(r.total_score * 100),
                    Summary: r.matched_summary,
                    Accepted: r.accepted ? "Yes" : "No",
                    AcceptedDate: r.accepted_date || "",
                    Rejected: r.rejected ? "Yes" : "No",
                    RejectedDate: r.rejected_date || "",
                  }))}
                  filename={`matching_results_${session_id}.csv`}
                  className="w-full block text-center px-4 py-2 bg-[#457b9d] text-white rounded shadow hover:bg-[#1d3557]"
                >
                  Download CSV
                </CSVLink>
              </div>
            )}
          </div>

          {/* CV Preview and Controls */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            <h2 className="text-xl font-bold text-[#1d3557] mb-4">
              CV Preview - {selectedResult?.name || "Unnamed Candidate"}
            </h2>

            {selectedResult?.cv_id ? (
              <iframe
                src={`http://localhost:8000/get_pdf/${selectedResult.cv_id}`}
                className="w-full h-[70vh] mt-4 border rounded"
                title="CV PDF Viewer"
              />
            ) : (
              <p className="text-[#e63946]">No CV available.</p>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={selectedResultIndex === 0}
                className={`px-4 py-2 rounded bg-[#457b9d] text-white font-semibold shadow ${
                  selectedResultIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1d3557]"
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={handleAccept}
                  disabled={selectedResult?.accepted}
                  className={`px-4 py-2 rounded shadow text-white ${
                    selectedResult?.accepted ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Accept
                </button>
                <button
                  onClick={handleReject}
                  disabled={selectedResult?.rejected}
                  className={`px-4 py-2 rounded shadow text-white ${
                    selectedResult?.rejected ? "bg-gray-400 cursor-not-allowed" : "bg-[#e63946] hover:bg-red-700"
                  }`}
                >
                  Reject
                </button>
              </div>

              <button
                onClick={handleNext}
                disabled={!results?.scored || selectedResultIndex === results.scored.length - 1}
                className={`px-4 py-2 rounded bg-[#457b9d] text-white font-semibold shadow ${
                  selectedResultIndex === results?.scored?.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1d3557]"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
