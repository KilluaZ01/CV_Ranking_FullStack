import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Job_Description from "../components/Job_Description";
import CvPostings from "../components/Cv_Postings";
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const jobRef = useRef();
  const cvRef = useRef();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    const jobDescription = jobRef.current?.getValue();
    const jobName = jobRef.current?.getJobName();
    const files = cvRef.current?.getFiles();

    if (!jobDescription) {
      alert("Please enter the job description.");
      return;
    }
    if (!files || files.length === 0) {
      alert("Please upload at least one CV.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      formData.append("job_name", jobName || "Untitled Job");
      // Pass comparison date ISO string for today
      formData.append("comparison_date", new Date().toISOString());
      files.forEach((file) => {
        formData.append("pdfs", file);
      });

      const response = await fetch("http://localhost:8000/compare", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        alert("Comparison failed: " + error);
        setLoading(false);
        return;
      }

      const data = await response.json();
      navigate("/results", { state: { session_id: data.session_id } });
    } catch (error) {
      alert("Error during comparison: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f1faee] font-sans">
      <Sidebar />
      <main className="flex flex-1 flex-col p-6 overflow-auto">
        <div className="flex flex-col md:flex-row flex-1 gap-6">
          <div className="md:w-1/2 h-full rounded-lg shadow-lg overflow-hidden">
            <Job_Description ref={jobRef} />
          </div>
          <div className="md:w-1/2 h-full rounded-lg shadow-lg overflow-hidden">
            <CvPostings ref={cvRef} />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            disabled={loading}
            onClick={handleCompare}
            className="px-8 py-3 rounded-full bg-[#e63946] text-white font-bold shadow hover:bg-[#d62839] transition disabled:opacity-60"
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
