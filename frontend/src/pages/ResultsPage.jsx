import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ResultsPage = () => {
  const location = useLocation();
  const sessionId = location.state?.session_id;
  const [results, setResults] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`http://localhost:8000/get_results?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => console.error(err));
  }, [sessionId]);

  const fetchPdf = (sessionId, filename) => {
    setPdfUrl(`http://localhost:8000/get_pdf/${sessionId}/${filename}`);
  };

  const getColor = (score) => {
    if (score <= 50) return "text-[#e63946]";
    if (score <= 60) return "text-orange-500";
    if (score <= 70) return "text-lime-500";
    if (score <= 80) return "text-green-500";
    return "text-emerald-600";
  };

  return (
    <div className="flex min-h-screen bg-[#f1faee]">
      <div className="w-2/3 p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-[#1d3557]">Comparison Result</h2>
        {results ? (
          <>
            <p className="text-[#457b9d]">Comparison Date: {results.created_at}</p>
            <div className="space-y-3">
              {results.results.scored.map((cv, idx) => (
                <div
                  key={idx}
                  className="border border-[#a8dadc] rounded-xl shadow p-4 bg-white hover:bg-[#f1faee] cursor-pointer"
                  onClick={() => fetchPdf(results.session_id, cv.filename)}
                >
                  <h3 className="font-bold text-lg text-[#1d3557]">{cv.name}</h3>
                  <p className={`text-sm ${getColor(cv.total_score * 100)}`}>
                    Match Score: {Math.round(cv.total_score * 100)}%
                  </p>
                  <p className="text-xs italic text-gray-500">
                    Status:{" "}
                    {cv.accepted
                      ? "Accepted"
                      : cv.rejected
                      ? "Rejected"
                      : "Pending Decision"}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="w-1/3 p-6 border-l border-[#a8dadc]">
        <h2 className="text-xl mb-4 font-semibold text-[#1d3557]">CV Preview</h2>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[80vh] border border-[#a8dadc] rounded-md"
            title="CV Preview"
          />
        ) : (
          <p className="text-gray-500">Select a CV to preview.</p>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
