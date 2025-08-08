import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Job_Description from "../components/Job_Description";
import Cv_Postings from "../components/Cv_Postings";
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const jobRef = useRef();
  const cvRef = useRef();
  const navigate = useNavigate();
  const [comparisonDate, setComparisonDate] = useState("");

  const handleCompare = async () => {
    const jdText = jobRef.current.getJobDescription();
    const jobName = jobRef.current.getJobName();
    const files = cvRef.current.getUploadedFiles();

    if (!jdText || !jobName || files.length === 0 || !comparisonDate) {
      alert("Please enter Job Name, JD, upload CVs, and select a comparison date.");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jdText);
    formData.append("session_name", jobName);
    files.forEach((file) => formData.append("pdfs", file));

    try {
      const response = await fetch("http://localhost:8000/compare", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        navigate("/results", { state: { session_id: data.session_id } });
      } else {
        alert("Comparison failed.");
      }
    } catch (error) {
      console.error("Error during compare:", error);
      alert("Comparison failed due to network error.");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 text-cyan-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Header + Date */}
        <div className="flex justify-between items-center mb-4 border-b pb-2 border-cyan-200 select-none">
          <h1 className="text-3xl font-extrabold leading-tight">CV Comparison Tool</h1>
          <div>
            <label htmlFor="comparisonDate" className="text-sm font-semibold block mb-1">
              Comparison Date
            </label>
            <input
              id="comparisonDate"
              type="date"
              value={comparisonDate}
              onChange={(e) => setComparisonDate(e.target.value)}
              className="px-3 py-2 border border-cyan-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        {/* Content panels */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Job Description container */}
          <div className="w-1/2 h-full bg-white rounded-2xl shadow-lg p-4 border border-cyan-200 flex flex-col min-h-0">
            <h2 className="text-lg font-semibold mb-2 border-b pb-2 border-cyan-300 select-none">
              📝 Job Description
            </h2>
            <Job_Description ref={jobRef} className="flex-grow min-h-0" />
          </div>

          {/* CV Postings */}
          <div className="w-1/2 h-full bg-white rounded-2xl shadow-lg p-4 border border-cyan-200 flex flex-col min-h-0">
            <h2 className="text-lg font-semibold mb-2 border-b pb-2 border-cyan-300 select-none">
              📄 Uploaded CVs
            </h2>
            <Cv_Postings ref={cvRef} className="flex-grow min-h-0" />
          </div>
        </div>

        {/* Compare Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCompare}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition duration-300 select-none"
          >
            🔍 Compare Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
