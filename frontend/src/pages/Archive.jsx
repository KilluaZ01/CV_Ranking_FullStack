import React, { useEffect, useState } from "react";
import Job_Description from "../components/Job_Description";

const getColor = (score) => {
  if (score <= 50) return "text-[#e63946]";
  if (score <= 60) return "text-orange-500";
  if (score <= 70) return "text-lime-500";
  if (score <= 80) return "text-green-500";
  return "text-emerald-600";
};

const Archive = () => {
  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/get_comparison_history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex h-screen bg-[#f1faee] overflow-hidden">
      <div className="flex-1 flex flex-col p-6">
        <h1 className="text-3xl font-bold text-[#1d3557] mb-6 flex-shrink-0">
          Comparison History
        </h1>

        <div className="flex flex-1 gap-6 min-h-0">
          {/* Sidebar: Flat list, no grouping */}
          <div className="w-1/3 border border-[#a8dadc] rounded p-4 bg-white shadow-lg overflow-y-auto min-h-0">
            {history.length > 0 ? (
              history.map((entry) => (
                <div
                  key={entry.session_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedEntry(entry)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && setSelectedEntry(entry)
                  }
                  className={`cursor-pointer p-3 rounded-md border mb-3 ${
                    selectedEntry?.session_id === entry.session_id
                      ? "bg-[#a8dadc]"
                      : "hover:bg-[#d0f2ea]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-[#1d3557]">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#1d3557] line-clamp-1">
                    {entry.session_name || "Unnamed Job"}
                  </p>
                </div>
              ))
            ) : (
              <p>Loading...</p>
            )}
          </div>

          {/* Right side */}
          <div className="w-2/3 border border-[#a8dadc] rounded p-6 bg-white shadow-lg flex flex-col min-h-0">
            {selectedEntry ? (
              <>
                <h2 className="text-2xl font-bold text-[#1d3557] mb-4 flex-shrink-0">
                  {selectedEntry.session_name || "Unnamed Job"} -{" "}
                  <span className="text-[#457b9d] text-base italic">
                    {new Date(selectedEntry.created_at).toLocaleString()}
                  </span>
                </h2>

                <div className="flex gap-8 flex-1 min-h-0">
                  {/* Enhanced Job Description Display */}
                  <div
                    className="flex-1 min-h-0 overflow-auto border border-[#a8dadc] rounded p-6 bg-[#f9fafb]"
                    style={{
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen",
                      fontSize: "1rem",
                      lineHeight: "1.6",
                      color: "#2c2c2c",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h3 className="text-xl font-semibold mb-4 text-[#1d3557]">
                      Job Description
                    </h3>
                    {selectedEntry.job_description ? (
                      selectedEntry.job_description.split("\n\n").map((para, idx) => (
                        <p key={idx} className="mb-4 whitespace-pre-wrap">
                          {para}
                        </p>
                      ))
                    ) : (
                      <p className="italic text-gray-500">No job description provided.</p>
                    )}
                  </div>

                  {/* CVs Compared */}
                  <div className="flex-1 border border-[#a8dadc] rounded p-4 overflow-y-auto min-h-0">
                    <h3 className="text-lg font-semibold text-[#1d3557] mb-2">
                      CVs Compared
                    </h3>
                    <div className="space-y-6">
                      {Array.isArray(selectedEntry.results) ? (
                        // Sort results descending by total_score before mapping
                        selectedEntry.results
                          .slice() // copy array to avoid mutation
                          .sort((a, b) => b.total_score - a.total_score)
                          .map((cv, idx) => (
                            <div
                              key={idx}
                              className="border border-[#a8dadc] rounded-lg p-4 bg-[#f1faee] space-y-2"
                            >
                              <div>
                                <h4 className="font-semibold text-[#1d3557]">{cv.name}</h4>
                                <p className={`text-sm ${getColor(cv.total_score * 100)}`}>
                                  Match Score: {Math.round(cv.total_score * 100)}%
                                </p>
                              </div>

                              {cv.pdf_url ? (
                                <div className="w-full h-64 mt-2 border rounded overflow-hidden">
                                  <iframe
                                    title={`CV PDF - ${cv.name}`}
                                    src={cv.pdf_url}
                                    width="100%"
                                    height="100%"
                                    className="rounded"
                                    frameBorder="0"
                                  />
                                </div>
                              ) : (
                                <p className="text-sm italic text-gray-400">
                                  PDF not available.
                                </p>
                              )}
                            </div>
                          ))
                      ) : (
                        selectedEntry.results?.scored
                          ?.slice()
                          .sort((a, b) => b.total_score - a.total_score)
                          .map((cv, idx) => (
                            <div
                              key={idx}
                              className="border border-[#a8dadc] rounded-lg p-4 bg-[#f1faee] space-y-2"
                            >
                              <div>
                                <h4 className="font-semibold text-[#1d3557]">{cv.name}</h4>
                                <p className={`text-sm ${getColor(cv.total_score * 100)}`}>
                                  Match Score: {Math.round(cv.total_score * 100)}%
                                </p>
                              </div>

                              {cv.pdf_url ? (
                                <div className="w-full h-64 mt-2 border rounded overflow-hidden">
                                  <iframe
                                    title={`CV PDF - ${cv.name}`}
                                    src={cv.pdf_url}
                                    width="100%"
                                    height="100%"
                                    className="rounded"
                                    frameBorder="0"
                                  />
                                </div>
                              ) : (
                                <p className="text-sm italic text-gray-400">
                                  PDF not available.
                                </p>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[#457b9d]">
                Select a comparison from the list to see details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;
