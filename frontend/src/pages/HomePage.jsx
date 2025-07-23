import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Job_Description from "../components/Job_Description";
import CvPostings from "../components/Cv_Postings";  // updated import
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const jobRef = useRef();
  const cvRef = useRef();
  const navigate = useNavigate();

  const handleCompare = async () => {
    const jobDescription = jobRef.current?.getValue();
    const pdfFiles = cvRef.current?.getFiles();

    if (!jobDescription || !pdfFiles?.length) {
      alert("Please provide both job description and CVs.");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    pdfFiles.forEach((file) => formData.append("pdfs", file));

    try {
      const response = await fetch("http://localhost:8000/compare", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      navigate("/results", { state: { session_id: data.session_id } });
    } catch (err) {
      console.error("Compare request failed", err);
      alert("Comparison failed. Check your server.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f1faee] font-sans">
      <Sidebar />

      <div className="flex flex-col flex-1 p-6 max-h-screen">
        {/* Two separate boxes side by side */}
        <div
          className="flex flex-1 min-h-0 gap-6"
          style={{ height: "calc(100vh - 96px)" }} // Adjust height as needed
        >
          {/* Job Description box */}
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto rounded-lg border-4 border-[#a8dadc] bg-white shadow-lg p-6">
            <Job_Description ref={jobRef} />
          </div>

          {/* CV Postings box */}
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto rounded-lg border-4 border-[#a8dadc] bg-white shadow-lg p-6">
            <CvPostings ref={cvRef} />
          </div>
        </div>

        {/* Compare Button below the boxes */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCompare}
            className="px-8 py-3 bg-[#e63946] hover:bg-[#d62839] text-white font-semibold rounded-2xl shadow-md transition-all duration-300"
          >
            Start Comparing
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
