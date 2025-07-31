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
    const files = cvRef.current.getUploadedFiles();

    if (!jdText || files.length === 0 || !comparisonDate) {
      alert("Please enter JD, upload CVs and pick comparison date");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jdText);
    formData.append("comparison_date", comparisonDate);
    files.forEach((file) => formData.append("pdfs", file)); // match backend key "pdfs"

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
  };

  return (
    <div className="flex min-h-screen bg-[#f1faee]">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-[#1d3557]">CV Comparison Tool</h1>

        <input
          type="date"
          value={comparisonDate}
          onChange={(e) => setComparisonDate(e.target.value)}
          className="p-2 border border-[#a8dadc] rounded-md shadow-sm"
        />

        <Job_Description ref={jobRef} />

        <Cv_Postings ref={cvRef} />

        <button
          onClick={handleCompare}
          className="px-4 py-2 bg-[#e63946] text-white rounded-lg hover:bg-[#d62839]"
        >
          Compare
        </button>
      </div>
    </div>
  );
};

export default HomePage;
