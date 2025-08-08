import React, { useState, useImperativeHandle, forwardRef } from "react";

const Job_Description = forwardRef(({ className }, ref) => {
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useImperativeHandle(ref, () => ({
    getJobDescription: () => jobDescription,
    getJobName: () => jobName,
  }));

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-3 border border-[#dceef2] w-full flex flex-col min-h-0 ${className}`}
    >
      <div className="mb-2 flex-shrink-0">
        <label
          htmlFor="jobName"
          className="block text-sm font-semibold text-[#1d3557] mb-1"
        >
          Job Name
        </label>
        <input
          type="text"
          id="jobName"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          className="w-full border border-[#a8dadc] rounded-md px-2 py-1.5 text-sm"
          placeholder="Enter job name"
        />
      </div>

      <div className="flex-grow min-h-0 flex flex-col">
        <label
          htmlFor="jobDescription"
          className="block text-sm font-semibold text-[#1d3557] mb-1"
        >
          Description
        </label>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full border border-[#a8dadc] rounded-md px-2 py-2 text-sm resize-none flex-grow min-h-0"
          placeholder="Paste or type the job description here..."
          rows={10}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
});

export default Job_Description;
