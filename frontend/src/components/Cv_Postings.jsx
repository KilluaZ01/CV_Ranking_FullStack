import React, { useState, useImperativeHandle, forwardRef, useEffect } from "react";

const Cv_Postings = forwardRef(({ className }, ref) => {
  const [cvFiles, setCvFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);

  useImperativeHandle(ref, () => ({
    getUploadedFiles: () => cvFiles,
  }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCvFiles(files);
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cvFiles.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < cvFiles.length - 1 ? prev + 1 : 0));
  };

  const handleDelete = (indexToDelete) => {
    setCvFiles((prevFiles) => {
      const newFiles = prevFiles.filter((_, i) => i !== indexToDelete);
      let newIndex = currentIndex;
      if (indexToDelete === currentIndex) {
        newIndex = Math.max(indexToDelete - 1, 0);
      } else if (currentIndex > indexToDelete) {
        newIndex = currentIndex - 1;
      }
      setCurrentIndex(newFiles.length > 0 ? newIndex : 0);
      return newFiles;
    });
  };

  useEffect(() => {
    if (cvFiles.length === 0) {
      setPdfUrl(null);
      return;
    }

    const file = cvFiles[currentIndex];
    const url = URL.createObjectURL(file);
    setPdfUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [cvFiles, currentIndex]);

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-3 border border-[#dceef2] w-full flex flex-col min-h-0 ${className}`}
    >
      {/* Heading shown only if no CVs */}
      {cvFiles.length === 0 && (
        <h1 className="text-xl font-bold text-[#1d3557] text-center mb-2 flex-shrink-0">
          CV Postings
        </h1>
      )}

      {cvFiles.length > 0 && (
        <div className="flex justify-between items-center gap-2 mb-1 px-2 flex-shrink-0">
          <p
            className="text-[#1d3557] truncate max-w-[75%]"
            title={cvFiles[currentIndex]?.name}
          >
            {cvFiles[currentIndex]?.name}
          </p>
          <button
            onClick={() => handleDelete(currentIndex)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            aria-label={`Delete ${cvFiles[currentIndex]?.name}`}
          >
            Delete
          </button>
        </div>
      )}

      <div className="w-full bg-[#f1faee] rounded border border-[#a8dadc] mb-3 flex-grow min-h-0">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={`Preview of ${cvFiles[currentIndex]?.name}`}
            className="w-full h-full rounded"
            frameBorder="0"
          />
        ) : (
          <p className="text-center text-[#457b9d] flex items-center justify-center h-full">
            No CV uploaded
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 mb-0 flex-shrink-0">
        <button
          onClick={handlePrev}
          disabled={cvFiles.length === 0}
          className="px-4 py-1.5 border border-[#a8dadc] rounded-md text-[#457b9d] font-semibold hover:bg-[#dceef2] transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous CV"
        >
          Previous
        </button>

        <label
          htmlFor="upload-cv"
          className="px-4 py-1.5 bg-[#a8dadc] text-[#1d3557] font-semibold rounded-md cursor-pointer hover:bg-[#94c8db] transition"
        >
          Upload CVs
          <input
            id="upload-cv"
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload CV files"
          />
        </label>

        <button
          onClick={handleNext}
          disabled={cvFiles.length === 0}
          className="px-4 py-1.5 border border-[#a8dadc] rounded-md text-[#457b9d] font-semibold hover:bg-[#dceef2] transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next CV"
        >
          Next
        </button>
      </div>
    </div>
  );
});

export default Cv_Postings;
