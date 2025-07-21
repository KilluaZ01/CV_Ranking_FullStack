import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import Sidebar from "../components/Sidebar"; // adjust path as needed

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
    if (score >= 0.8) return "bg-green-100 text-green-700";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9fb] font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-y-auto p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Comparison Results
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-600 text-lg">Loading results...</p>
            </div>
          ) : !results || !results.scored || results.scored.length === 0 ? (
            <p className="text-gray-500">No results found for this session.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.scored.map((result, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {result.name || "Unnamed Candidate"}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                        result.total_score
                      )}`}
                    >
                      {Math.round(result.total_score * 100)}%
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm">
                    <p>
                      <strong>Match ID:</strong> {result.cv_id}
                    </p>
                    <div className="mt-2 space-y-1">
                      {result.section_scores &&
                        Object.entries(result.section_scores).map(
                          ([section, score]) => (
                            <div
                              key={section}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-700 capitalize">
                                {section}
                              </span>
                              <span>{Math.round(score * 100)}%</span>
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
