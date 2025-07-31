import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

const Cv_Postings = forwardRef((props, ref) => {
  const [cvFiles, setCvFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getUploadedFiles: () => cvFiles.map((f) => f.file),
  }));

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );

    const fileData = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setCvFiles((prev) => [...prev, ...fileData]);

    if (cvFiles.length === 0 && fileData.length > 0) {
      setCurrentIndex(0);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (index) => {
    setCvFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].url);

      if (index === currentIndex) {
        if (index === newFiles.length) {
          setCurrentIndex(index - 1 >= 0 ? index - 1 : 0);
        } else {
          setCurrentIndex(index);
        }
      } else if (index < currentIndex) {
        setCurrentIndex((prevIndex) => prevIndex - 1);
      }
      return newFiles;
    });
  };

  useEffect(() => {
    return () => {
      cvFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, [cvFiles]);

  const currentFile = cvFiles[currentIndex];

  return (
    <div className="flex flex-col w-full h-full p-4 bg-[#f1faee]">
      <div className="relative mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1d3557]">
          Choose Document
        </h1>
      </div>

      <div className="flex flex-col w-full h-full rounded-lg shadow-lg bg-[#d0f2ea] p-4 md:p-6">
        <div className="flex items-center justify-center mb-4 space-x-2">
          <h2 className="text-center text-base md:text-lg font-semibold text-[#1d3557] truncate max-w-[75%]">
            {currentFile ? currentFile.name : "No CV Selected"}
          </h2>
          {currentFile && (
            <button
              onClick={() => handleDelete(currentIndex)}
              className="text-[#e63946] hover:text-[#b5303a] transition"
              aria-label="Delete current CV"
              title="Delete this CV"
            >
              <Icon icon="mdi:trash-can-outline" className="text-xl" />
            </button>
          )}
        </div>

        <div
          className="flex-1 relative rounded-lg overflow-hidden border border-[#a8dadc] bg-white"
          style={{ minHeight: "350px" }}
        >
          {currentFile ? (
            <iframe
              src={currentFile.url}
              title="Current CV"
              className="w-full h-full"
              frameBorder="0"
            />
          ) : (
            <p className="text-center text-gray-500 mt-10">No CV preview available</p>
          )}
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
            }
            disabled={currentIndex === 0}
            className={`px-3 py-1 rounded ${
              currentIndex === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#e63946] text-white hover:bg-[#d62839]"
            }`}
          >
            Prev
          </button>
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev < cvFiles.length - 1 ? prev + 1 : prev
              )
            }
            disabled={currentIndex === cvFiles.length - 1 || cvFiles.length === 0}
            className={`px-3 py-1 rounded ${
              currentIndex === cvFiles.length - 1 || cvFiles.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#e63946] text-white hover:bg-[#d62839]"
            }`}
          >
            Next
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer px-6 py-2 bg-[#e63946] hover:bg-[#d62839] text-white rounded-lg"
          >
            Upload PDFs
          </label>
        </div>
      </div>
    </div>
  );
});

export default Cv_Postings;
