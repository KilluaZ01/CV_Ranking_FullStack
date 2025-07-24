import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const ResultsPage = () => {
  const location = useLocation();
  const session_id = location.state?.session_id;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      fetch(`http://localhost:8000/get_results?session_id=${session_id}`)
        .then((res) => res.json())
        .then((data) => {
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
    if (percentage >= 80) return "bg-[#a8dadc] text-[#1d3557]";
    if (percentage >= 65) return "bg-[#f1faee] text-[#1d3557]";
    if (percentage >= 50) return "bg-orange-100 text-orange-700";
    return "bg-[#e63946] text-white";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9fb] font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-y-auto p-8">
          <h1 className="text-3xl font-bold text-[#1d3557] mb-6">
            Comparison Results
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600 text-lg">Loading results...</p>
            </div>
          ) : !results || !results.scored || results.scored.length === 0 ? (
            <p className="text-[#e63946] text-lg">
              No results found for this session.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.scored.map((result, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-[#1d3557]">
                      {result.name || "Unnamed Candidate"}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                        result.total_score
                      )}`}
                    >
                      {Math.round(result.total_score * 100)}%
                    </span>
                  </div>
                  <div className="text-[#457b9d] text-sm mt-1">
                    <p className="mb-2">
                      <strong className="text-[#1d3557]">Match ID:</strong>{" "}
                      {result.cv_id}
                    </p>
                    <div className="space-y-1">
                      {result.section_scores &&
                        Object.entries(result.section_scores).map(
                          ([section, score]) => (
                            <div
                              key={section}
                              className="flex justify-between text-sm"
                            >
                              <span className="capitalize text-[#1d3557]">
                                {section}
                              </span>
                              <span className="text-[#457b9d] font-medium">
                                {Math.round(score * 100)}%
                              </span>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
