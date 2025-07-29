import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { CSVLink } from "react-csv";

const ResultsPage = () => {
  const location = useLocation();
  const session_id = location.state?.session_id;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  useEffect(() => {
    if (session_id) {
      fetch(`http://localhost:8000/get_results?session_id=${session_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results?.scored) {
            data.results.scored.sort((a, b) => b.total_score - a.total_score);
          }
          setResults(data.results);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load results:", err);
          setLoading(false);
        });
    }
  }, [session_id]);

  const getScoreColor = (score) => {
    const percentage = Math.round(score * 100);
    if (percentage > 80) return "bg-emerald-200 text-[#1d3557]";
    if (percentage > 70) return "bg-lime-200 text-[#1d3557]";
    if (percentage > 60) return "bg-orange-100 text-orange-700";
    if (percentage > 50) return "bg-yellow-100 text-yellow-700";
    return "bg-[#e63946] text-white";
  };

  const highlightMatches = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;
    const safeKeywords = keywords.map((kw) =>
      kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").toLowerCase()
    );
    const regex = new RegExp(`(${safeKeywords.join("|")})`, "gi");
    return text.split(regex).map((part, index) =>
      safeKeywords.includes(part.toLowerCase()) ? (
        <mark
          key={index}
          className="bg-yellow-200 text-[#1d3557] font-bold px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const selectedResult =
    results?.scored && results.scored[selectedResultIndex];

  return (
    <div className="flex h-screen bg-[#f1faee] font-sans">
      <Sidebar />

      <div className="flex flex-1">
        {/* Left Panel: Candidate List */}
        <div className="w-[30%] border-r border-[#a8dadc] flex flex-col">
          <div className="p-4 border-b border-[#a8dadc]">
            <h1 className="text-2xl font-bold text-[#1d3557]">Candidates</h1>
          </div>

          {/* Scrollable Candidate List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  <p className="text-xs text-[#1d3557] mt-1">
                    {result.matched_summary || ""}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Fixed CSV Button */}
          {results?.scored?.length > 0 && (
            <div className="p-4 border-t border-[#a8dadc]">
              <CSVLink
                data={results.scored.map((r) => ({
                  Name: r.name,
                  Score: Math.round(r.total_score * 100),
                  Summary: r.matched_summary,
                }))}
                filename={`matching_results_${session_id}.csv`}
                className="w-full block text-center px-4 py-2 bg-[#457b9d] text-white rounded shadow hover:bg-[#1d3557]"
              >
                Download CSV
              </CSVLink>
            </div>
          )}
        </div>

        {/* Right Panel: CV Viewer */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-[#1d3557] mb-4">
            CV Preview - {selectedResult?.name || "Unnamed Candidate"}
          </h2>
          {selectedResult?.cv_id && (
            <iframe
              src={`http://localhost:8000/get_pdf/${selectedResult.cv_id}`}
              className="w-full h-[70vh] mt-6 border rounded"
              title="CV PDF Viewer"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
