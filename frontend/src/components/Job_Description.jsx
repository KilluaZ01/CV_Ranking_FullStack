import React, { useImperativeHandle, forwardRef, useRef } from "react";
import { Icon } from "@iconify/react";

const Job_Description = forwardRef((props, ref) => {
  const textareaRef = useRef();

  useImperativeHandle(ref, () => ({
    getValue: () => textareaRef.current?.value || "",
  }));

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Comparison Bot</h1>
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        <h2 className="text-gray-400 text-center mb-4">Document name</h2>
        <div className="h-[300px] bg-gray-50 rounded p-4 relative">
          <textarea
            ref={textareaRef}
            className="w-full h-full resize-none outline-none bg-transparent text-sm text-gray-700"
            placeholder="Enter job description here..."
          />
        </div>
        <div className="flex justify-between items-center mt-6">
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
            Download
          </button>
          <div className="space-x-2">
            <button className="p-2 rounded hover:bg-gray-100">
              <Icon icon="mdi:undo" className="text-xl" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100">
              <Icon icon="mdi:delete-outline" className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Job_Description;
