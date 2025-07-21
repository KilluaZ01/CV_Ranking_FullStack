// pages/HomePage.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Job_Description from "../components/Job_Description";
import Cv_Postings from "../components/Cv_Postings";
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
    <div className="flex flex-col min-h-screen bg-[#f9f9fb] font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <Job_Description ref={jobRef} />
            <Cv_Postings ref={cvRef} />
          </div>
          <div className=" text-white p-4 text-center mt-6 rounded">
            <button
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 rounded text-sm font-semibold"
              onClick={handleCompare}
            >
              Start Comparing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
