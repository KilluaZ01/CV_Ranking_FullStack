import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const getColor = (score) => {
  if (score <= 50) return "text-red-600";
  if (score <= 60) return "text-orange-500";
  if (score <= 70) return "text-lime-500";
  if (score <= 80) return "text-green-500";
  return "text-emerald-600";
};

const Archive = ({ refreshSignal }) => {
  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/get_comparison_history")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load comparison history");
      });
  }, [refreshSignal]);

  const loadSessionDetails = (sessionId) => {
    setLoadingDetails(true);
    setError(null);
    fetch(`http://localhost:8000/get_results?session_id=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load session details");
        return res.json();
      })
      .then((data) => {
        setSelectedEntry(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error loading session details");
      })
      .finally(() => setLoadingDetails(false));
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-cyan-50 to-indigo-50 overflow-hidden text-cyan-900">
      <Sidebar />
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <h1 className="text-4xl font-extrabold mb-8 tracking-wide drop-shadow-sm select-none text-cyan-900">
          {selectedEntry ? "Comparison Details" : "Comparison History"}
        </h1>

        {!selectedEntry && (
          <div className="flex-1 overflow-y-auto bg-white rounded-3xl border border-cyan-300 p-8 shadow-2xl scrollbar-thin scrollbar-thumb-cyan-300/80 scrollbar-track-cyan-50">
            {error && (
              <p className="text-red-600 font-semibold mb-6 select-none">{error}</p>
            )}
            {history.length > 0 ? (
              history.map((entry) => (
                <div
                  key={entry.session_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => loadSessionDetails(entry.session_id)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    loadSessionDetails(entry.session_id)
                  }
                  className="cursor-pointer p-6 rounded-3xl border border-transparent mb-5 hover:bg-cyan-200 hover:border-cyan-300 transition duration-300 ease-in-out shadow-sm hover:shadow-md select-none"
                >
                  <div className="flex justify-between items-center space-x-6">
                    <p className="text-base font-semibold text-cyan-900 line-clamp-1 flex-1">
                      {entry.session_name || "Unnamed Job"}
                    </p>
                    <span className="text-sm font-semibold text-cyan-700 text-center flex-shrink-0 w-36 select-text">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    <p className="text-sm text-cyan-600 whitespace-nowrap flex-shrink-0 font-medium select-text">
                      {Array.isArray(entry.results)
                        ? `${entry.results.length} CV${entry.results.length !== 1 ? "s" : ""} Compared`
                        : entry.results?.scored
                        ? `${entry.results.scored.length} CV${entry.results.scored.length !== 1 ? "s" : ""} Compared`
                        : "No CVs Compared"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-cyan-500 text-center mt-12 text-lg animate-pulse select-none">
                Loading...
              </p>
            )}
          </div>
        )}

        {selectedEntry && (
          <div className="flex flex-col gap-6 flex-1 overflow-hidden">
            <button
              onClick={() => setSelectedEntry(null)}
              className="mb-2 px-5 py-2.5 bg-cyan-300 text-cyan-900 rounded-xl hover:bg-cyan-400 transition select-none text-sm"
            >
              ← Back to History
            </button>

            {loadingDetails ? (
              <p className="text-center text-cyan-700 mt-20 font-semibold select-none">
                Loading details...
              </p>
            ) : (
              <div className="border border-cyan-300 rounded-2xl p-4 bg-gradient-to-br from-white to-cyan-100 shadow-lg overflow-auto flex flex-col flex-1 min-h-0">
                <h2 className="text-3xl font-extrabold mb-6 tracking-wide select-none text-cyan-900">
                  {selectedEntry.session_name || "Unnamed Job"}{" "}
                  <span className="text-cyan-700 text-lg italic font-medium select-text">
                    - {new Date(selectedEntry.created_at).toLocaleString()}
                  </span>
                </h2>
                <div className="flex gap-8 flex-1 min-h-0 overflow-hidden">
                  <div className="flex-1 min-h-0 overflow-auto border border-cyan-300 rounded-2xl p-6 bg-white shadow-inner text-cyan-900 text-base leading-relaxed select-text">
                    <h3 className="text-2xl font-semibold mb-4 border-b border-cyan-300 pb-2 select-none">
                      Job Description
                    </h3>
                    {selectedEntry.job_description ? (
                      selectedEntry.job_description.split("\n\n").map((para, idx) => (
                        <p key={idx} className="mb-4 whitespace-pre-wrap leading-relaxed">
                          {para}
                        </p>
                      ))
                    ) : (
                      <p className="italic text-cyan-400 select-none">
                        No job description provided.
                      </p>
                    )}
                  </div>

                  <div className="flex-1 border border-cyan-300 rounded-2xl p-6 bg-white shadow-inner overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-300/80 scrollbar-track-cyan-50">
                    <h3 className="text-2xl font-semibold mb-4 border-b border-cyan-300 pb-3 select-none text-cyan-900">
                      CVs Compared
                    </h3>
                    <div className="space-y-8">
                      {(selectedEntry.results?.scored || [])
                        .slice()
                        .sort((a, b) => b.total_score - a.total_score)
                        .map((cv, idx) => (
                          <div
                            key={idx}
                            className="border border-cyan-300 rounded-3xl p-4 bg-cyan-50 space-y-4 shadow-sm hover:shadow-md transition select-none"
                          >
                            <div>
                              <h4 className="font-semibold text-cyan-900 text-lg select-text">{cv.name}</h4>
                              <p className={`text-sm ${getColor(cv.total_score * 100)}`}>
                                Match Score: {Math.round(cv.total_score * 100)}%
                              </p>
                              {/* 
                              <p className="text-xs italic mt-1 select-text">
                                Status:{" "}
                                {cv.accepted ? (
                                  <span className="text-green-600 font-semibold">Accepted</span>
                                ) : cv.rejected ? (
                                  <span className="text-red-600 font-semibold">Rejected</span>
                                ) : (
                                  <span className="text-yellow-600 font-semibold">Pending Decision</span>
                                )}
                              </p> 
                              */}
                            </div>
                            {cv.pdf_url ? (
                              <div className="w-full h-56 mt-3 border rounded-2xl overflow-hidden shadow-inner">
                                <iframe
                                  title={`CV PDF - ${cv.name}`}
                                  src={cv.pdf_url}
                                  width="100%"
                                  height="100%"
                                  className="rounded-2xl"
                                  frameBorder="0"
                                />
                              </div>
                            ) : (
                              <p className="text-sm italic text-cyan-400 select-none">
                                PDF not available.
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
