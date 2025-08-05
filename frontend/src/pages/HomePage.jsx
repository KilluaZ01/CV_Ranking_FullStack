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
    const jobName = jobRef.current.getJobName(); // <-- get job name here
    const files = cvRef.current.getUploadedFiles();

    if (!jdText || !jobName || files.length === 0 || !comparisonDate) {
      alert("Please enter Job Name, JD, upload CVs, and select a comparison date.");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jdText);
    formData.append("session_name", jobName);  // <-- send job name as session_name
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
    <div className="flex h-screen bg-[#f1faee] text-[#2C2C2C]">
      <Sidebar />

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Header + Date */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">CV Comparison Tool</h1>
          <div>
            <label htmlFor="comparisonDate" className="text-sm block mb-1">
              Comparison Date
            </label>
            <input
              id="comparisonDate"
              type="date"
              value={comparisonDate}
              onChange={(e) => setComparisonDate(e.target.value)}
              className="px-3 py-1 border border-[#83FFE6] rounded-md"
            />
          </div>
        </div>

        {/* Content panels */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Job Description container */}
          <div className="w-1/2 h-full overflow-auto px-2">
            <Job_Description ref={jobRef} />
          </div>

          {/* CV Postings */}
          <div className="w-1/2 flex flex-col h-full">
            <Cv_Postings ref={cvRef} />
          </div>
        </div>

        {/* Compare Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCompare}
            className="bg-[#FF5F5F] hover:bg-[#e04d4d] text-white font-semibold px-8 py-3 rounded-xl shadow transition"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
