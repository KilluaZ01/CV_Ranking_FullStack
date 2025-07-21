import React from "react";
import Job_Description from "../components/Job_Description";
import Sidebar from "../components/Sidebar";
import CvPostings from "../components/Cv_Postings";

const Documents = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9fb] font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className=" text-white p-4 text-center mt-6 rounded">
            <button className="px-6 py-2 bg-pink-500 hover:bg-pink-600 rounded text-sm font-semibold">
              Start Comparing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
