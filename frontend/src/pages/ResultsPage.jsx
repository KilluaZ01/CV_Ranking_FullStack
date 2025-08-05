import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const ResultsPage = () => {
  const location = useLocation();
  const sessionId = location.state?.session_id;
  const [results, setResults] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

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

  const handleDecision = async (index, decision) => {
    if (!results) return;

    const cv = results.results.scored[index];

    const url =
      decision === "accept"
        ? "http://localhost:8000/accept_cv"
        : "http://localhost:8000/reject_cv";

    const formData = new FormData();
    formData.append("session_id", results.session_id);
    formData.append("cv_id", cv.cv_id || cv.filename);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update CV status");
      }

      const updatedResults = { ...results };
      if (decision === "accept") {
        updatedResults.results.scored[index].accepted = true;
        updatedResults.results.scored[index].rejected = false;
      } else {
        updatedResults.results.scored[index].rejected = true;
        updatedResults.results.scored[index].accepted = false;
      }

      setResults(updatedResults);
    } catch (error) {
      console.error(error);
      alert("Error updating CV status. Please try again.");
    }
  };

  // New handler for "Complete" button
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

      if (!response.ok) {
        throw new Error("Failed to complete session");
      }

      alert("Session marked as complete.");
      // Optionally you can refresh or update the UI here
    } catch (error) {
      console.error(error);
      alert("Error completing session. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f1faee] overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-6 flex flex-col h-full">
        {/* Larger container box for both sections */}
        <div className="flex border border-[#a8dadc] rounded-md overflow-hidden h-full">
          {/* Comparison Result - scrollable */}
          <div className="w-1/2 p-6 overflow-y-auto max-h-full flex flex-col">
            <h2 className="text-2xl font-semibold text-[#1d3557] mb-4">Comparison Result</h2>
            {results ? (
              <>
                <p className="text-[#457b9d] mb-4">Comparison Date: {results.created_at}</p>
                <div className="space-y-3 flex-grow overflow-y-auto">
                  {results.results.scored.map((cv, idx) => (
                    <div
                      key={idx}
                      className="border border-[#a8dadc] rounded-xl shadow p-4 bg-white hover:bg-[#f1faee]"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => fetchPdf(results.session_id, cv.filename)}
                      >
                        <h3 className="font-bold text-lg text-[#1d3557]">{cv.name}</h3>
                        <p className={`text-sm ${getColor(cv.total_score * 100)}`}>
                          Match Score: {Math.round(cv.total_score * 100)}%
                        </p>
                        <p className="text-xs italic text-gray-500 mb-2">
                          Status:{" "}
                          {cv.accepted
                            ? "Accepted"
                            : cv.rejected
                            ? "Rejected"
                            : "Pending Decision"}
                        </p>
                      </div>

                      {(!cv.accepted && !cv.rejected) && (
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleDecision(idx, "accept")}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecision(idx, "reject")}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded self-center"
                >
                  {isCompleting ? "Completing..." : "Complete"}
                </button>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          {/* CV Preview */}
          <div className="w-1/2 p-6 bg-white border-l border-[#a8dadc] rounded-tr-md rounded-br-md flex flex-col">
            <h2 className="text-xl mb-4 font-semibold text-[#1d3557]">CV Preview</h2>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full flex-grow border border-[#a8dadc] rounded-md"
                title="CV Preview"
              />
            ) : (
              <p className="text-gray-500">Select a CV to preview.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
