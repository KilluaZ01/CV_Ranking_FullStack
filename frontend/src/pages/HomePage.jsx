import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Job_Description from "../components/Job_Description";
import CvPostings from "../components/Cv_Postings";
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
    <div className="flex h-screen w-full bg-[#f1faee] font-sans overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 p-4 md:p-6">
        {/* Boxes layout */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 overflow-hidden">
          {/* Job Description Box */}
          <div className="flex flex-col flex-1 overflow-y-auto border-4 border-[#a8dadc] bg-white rounded-2xl shadow-md p-4 md:p-6">
            <Job_Description ref={jobRef} />
          </div>

          {/* CV Postings Box */}
          <div className="flex flex-col flex-1 overflow-y-auto border-4 border-[#a8dadc] bg-white rounded-2xl shadow-md p-4 md:p-6">
            <CvPostings ref={cvRef} />
          </div>
        </div>

        {/* Compare Button */}
        <div className="mt-4 md:mt-6 flex justify-center">
          <button
            onClick={handleCompare}
            className="px-6 py-3 bg-[#e63946] hover:bg-[#d62839] text-white font-semibold rounded-2xl shadow-md transition duration-300"
          >
            Start Comparing
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
