// src/pages/ResultsPage.js
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router-dom";

const getColor = (score) => {
  if (score <= 50) return "text-red-600";
  if (score <= 60) return "text-orange-500";
  if (score <= 70) return "text-yellow-600";
  if (score <= 80) return "text-green-600";
  return "text-teal-700";
};

const ResultsPage = ({ onDataUpdate }) => {
  const location = useLocation();
  const sessionIdFromNav = location.state?.session_id || null;

  const [currentSessionId, setCurrentSessionId] = useState(sessionIdFromNav);
  const [results, setResults] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const [showArchive, setShowArchive] = useState(false);
  const [archive, setArchive] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [archiveError, setArchiveError] = useState(null);

  useEffect(() => {
    if (currentSessionId) loadResults(currentSessionId);
  }, [currentSessionId]);

  const loadResults = async (sessionId) => {
    if (!sessionId) return;
    setResults(null);
    setPdfUrl(null);
    try {
      const res = await fetch(`http://localhost:8000/get_results?session_id=${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();
      setResults(data);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error("Error loading results:", error);
      alert("Failed to load results. Please try again.");
    }
  };

  const loadArchive = async () => {
    setLoadingArchive(true);
    setArchiveError(null);
    try {
      const res = await fetch("http://localhost:8000/get_comparison_history");
      if (!res.ok) throw new Error("Failed to fetch archive");
      const data = await res.json();
      setArchive(data);
    } catch (error) {
      setArchiveError(error.message);
    } finally {
      setLoadingArchive(false);
    }
  };

  const fetchPdf = (sessionId, filename) => {
    setPdfUrl(`http://localhost:8000/get_pdf/${sessionId}/${filename}`);
  };

  const handleComplete = async () => {
    if (!results) return;
    setIsCompleting(true);

    try {
      const formData = new FormData();
      formData.append("session_id", results.session_id);

      const response = await fetch("http://localhost:8000/complete_session", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to complete session");

      alert("Session marked as complete.");

      if (onDataUpdate) onDataUpdate();
    } catch (error) {
      console.error(error);
      alert("Error completing session. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const toggleShowArchive = () => {
    if (!showArchive && archive.length === 0) loadArchive();
    setShowArchive((v) => !v);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-4 flex flex-col h-full space-y-3">
        {/* Archive Toggle */}
        <div className="w-full sm:w-1/2 relative">
          <button
            onClick={toggleShowArchive}
            className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300 select-none text-sm"
          >
            {showArchive ? "Hide Previous Results" : "Previous Results"}
          </button>

          {showArchive && (
            <div className="absolute top-full left-0 w-full max-h-52 overflow-auto border border-cyan-300 rounded-lg p-3 bg-white shadow-lg z-30 mt-2">
              {loadingArchive && <p className="text-gray-500 italic text-xs">Loading archives...</p>}
              {archiveError && (
                <p className="text-red-600 font-semibold text-sm">
                  Error loading archive: {archiveError}
                </p>
              )}
              {!loadingArchive && !archiveError && archive.length === 0 && (
                <p className="text-gray-500 italic text-xs">No archive sessions found.</p>
              )}
              {!loadingArchive &&
                !archiveError &&
                archive.map((session) => (
                  <button
                    key={session.session_id}
                    onClick={() => {
                      loadResults(session.session_id);
                      setShowArchive(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-md hover:bg-cyan-100 transition duration-200 select-none text-sm"
                  >
                    <div className="font-semibold text-cyan-800 truncate">{session.session_name || "(Unnamed Session)"}</div>
                    <div className="text-xs text-gray-400">{new Date(session.created_at).toLocaleString()}</div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Main Results & Preview */}
        <div className="flex flex-1 border border-cyan-300 rounded-2xl overflow-hidden shadow-lg bg-white">
          {/* Results List */}
          <div className="w-1/2 p-4 flex flex-col h-full overflow-y-auto space-y-3">
            <h2 className="text-2xl font-extrabold text-cyan-900 border-b border-cyan-300 pb-2 select-none">
              Comparison Result
            </h2>

            {results ? (
              results.results.scored.length > 0 ? (
                results.results.scored.map((cv, idx) => (
                  <div
                    key={idx}
                    className="border border-cyan-300 rounded-lg shadow-sm p-3 bg-cyan-50 hover:bg-cyan-100 transition cursor-pointer select-none text-sm"
                    onClick={() => fetchPdf(results.session_id, cv.filename)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      fetchPdf(results.session_id, cv.filename)
                    }
                  >
                    <h3 className="font-semibold text-lg text-cyan-900 mb-1 truncate">{cv.name}</h3>
                    <p className={`text-base font-semibold ${getColor(cv.total_score * 100)} mb-0`}>
                      Match Score: {Math.round(cv.total_score * 100)}%
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic select-none text-sm">No CVs found in results.</p>
              )
            ) : (
              <p className="text-gray-500 text-center mt-16 text-base font-medium select-none">Loading...</p>
            )}
          </div>

          {/* CV Preview */}
          <div className="w-1/2 p-4 flex flex-col bg-white shadow-inner border-l border-cyan-300 overflow-hidden rounded-r-2xl">
            <h2 className="text-xl mb-4 font-semibold text-cyan-900 border-b border-cyan-300 pb-2 select-none">
              CV Preview
            </h2>
            <div className="flex-grow overflow-auto rounded-md">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border border-cyan-300 rounded-md shadow-md"
                  title="CV Preview"
                />
              ) : (
                <p className="text-gray-400 text-center mt-16 italic select-none text-sm">
                  Select a CV to preview.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <div className="border-t border-cyan-300 pt-4 flex justify-center">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className={`px-8 py-3 rounded-xl shadow-lg text-white font-semibold transition duration-300 select-none text-sm ${
              isCompleting ? "bg-cyan-300 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {isCompleting ? "Completing..." : "Complete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
