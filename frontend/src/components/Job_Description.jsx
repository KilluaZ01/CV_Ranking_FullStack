import React, { useImperativeHandle, forwardRef, useRef, useState } from "react";

const Job_Description = forwardRef((props, ref) => {
  const textareaRef = useRef();
  const [jobName, setJobName] = useState("");

  useImperativeHandle(ref, () => ({
    getJobDescription: () => textareaRef.current?.value || "",
    getJobName: () => jobName,
  }));

  return (
    <div className="flex flex-col w-full h-full p-4 bg-[#f1faee]">
      <div className="text-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1d3557]">Job Description</h1>
      </div>

      <div className="flex flex-col flex-1 rounded-lg shadow-lg bg-[#d0f2ea] p-4 md:p-6 overflow-hidden">
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="Enter job name here..."
          className="text-center text-lg md:text-xl font-semibold mb-4 text-[#457b9d] bg-[#f1faee] rounded px-3 py-1 outline-none"
        />
        <div className="flex-1 overflow-hidden rounded mb-4">
          <textarea
            ref={textareaRef}
            className="w-full h-full min-h-[150px] md:min-h-[300px] resize-none outline-none bg-[#f1faee] text-sm md:text-base text-[#1d3557] p-3 rounded"
            placeholder="Enter the full job description here..."
          />
        </div>
      </div>
    </div>
  );
});

export default Job_Description;
