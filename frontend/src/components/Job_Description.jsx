import React, { useImperativeHandle, forwardRef, useRef, useState } from "react";
import { Icon } from "@iconify/react";

const Job_Description = forwardRef((props, ref) => {
  const textareaRef = useRef();
  const [jobName, setJobName] = useState("");

  useImperativeHandle(ref, () => ({
    getValue: () => textareaRef.current?.value || "",
    getJobName: () => jobName,
  }));

  return (
    <div className="flex flex-col w-full h-full p-4 bg-[#f1faee]">
      <div className="text-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1d3557]">Description</h1>
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
            placeholder="Enter job description here..."
          />
        </div>

        {/* Buttons currently do nothing; you can add handlers */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            className="px-6 py-2 bg-[#e63946] text-white rounded-full font-semibold shadow hover:bg-[#d62839] transition"
            onClick={() => alert("Add JD button clicked")}
          >
            JD Add Button
          </button>

          <div className="flex space-x-3">
            <button
              className="p-2 rounded-full bg-[#a2d3c8] hover:bg-[#8fc3b6] transition"
              onClick={() => {
                textareaRef.current.value = "";
                setJobName("");
              }}
              title="Undo / Clear"
            >
              <Icon icon="mdi:undo" className="text-xl text-[#457b9d]" />
            </button>
            <button
              className="p-2 rounded-full bg-[#a2d3c8] hover:bg-[#8fc3b6] transition"
              onClick={() => {
                textareaRef.current.value = "";
                setJobName("");
              }}
              title="Delete / Clear"
            >
              <Icon icon="mdi:delete-outline" className="text-xl text-[#e63946]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Job_Description;
