import React, { useState, useImperativeHandle, forwardRef, useEffect } from "react";

const Cv_Postings = forwardRef((props, ref) => {
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
    setCvFiles((files) => {
      const newFiles = files.filter((_, i) => i !== indexToDelete);
      if (indexToDelete === currentIndex && newFiles.length > 0) {
        setCurrentIndex(indexToDelete === 0 ? 0 : indexToDelete - 1);
      } else if (newFiles.length === 0) {
        setCurrentIndex(0);
      }
      return newFiles;
    });
  };

  // Create and revoke object URL for the current PDF file
  useEffect(() => {
    if (cvFiles.length === 0) {
      setPdfUrl(null);
      return;
    }
    const currentFile = cvFiles[currentIndex];
    const url = URL.createObjectURL(currentFile);
    setPdfUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setPdfUrl(null);
    };
  }, [cvFiles, currentIndex]);

  const baseButtonClasses = `
    px-5 py-2 rounded-md font-semibold transition
    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#83FFE6]
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  return (
    <div className="flex flex-col w-full h-full p-4 bg-[#f1faee]">
      <div className="text-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1d3557]">CV Postings</h1>
      </div>

      <div className="flex flex-col flex-1 rounded-lg shadow-lg bg-[#d0f2ea] p-4 md:p-6 overflow-hidden">
        {/* Taller preview box with PDF iframe */}
        <div className="flex-1 border border-[#83FFE6] rounded-lg bg-white max-h-[350px] min-h-[350px] flex flex-col items-center justify-center overflow-hidden mb-4">
          {cvFiles.length > 0 ? (
            <>
              <p className="text-[#1d3557] text-center px-4 truncate max-w-full mb-2">
                {cvFiles[currentIndex].name}
              </p>
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                className="w-full flex-grow rounded"
                style={{ minHeight: 0 }}
              />
            </>
          ) : (
            <p className="text-[#457b9d]">No CV uploaded</p>
          )}
        </div>

        {/* Controls row: Previous - Upload - Next */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrev}
            disabled={cvFiles.length === 0}
            className={`${baseButtonClasses} border border-[#83FFE6] text-[#457b9d] hover:text-[#1d3557] hover:bg-[#b4f7e7]`}
            aria-label="Previous CV"
          >
            Previous
          </button>

          <label
            htmlFor="upload-cv"
            className={`
              cursor-pointer
              ${baseButtonClasses}
              bg-[#83FFE6] text-[#2C2C2C]
              hover:bg-[#6ce0cb]
              select-none
              shadow-md
              hover:shadow-lg
            `}
          >
            Upload CVs
            <input
              id="upload-cv"
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={handleNext}
            disabled={cvFiles.length === 0}
            className={`${baseButtonClasses} border border-[#83FFE6] text-[#457b9d] hover:text-[#1d3557] hover:bg-[#b4f7e7]`}
            aria-label="Next CV"
          >
            Next
          </button>
        </div>

        {/* Uploaded files list with delete */}
        {cvFiles.length > 0 && (
          <div className="mt-4 max-h-32 overflow-auto bg-white rounded p-2 border border-[#83FFE6]">
            {cvFiles.map((file, idx) => (
              <div
                key={file.name + idx}
                className="flex justify-between items-center py-1 px-2 hover:bg-[#d0f2ea] rounded"
              >
                <span className="truncate max-w-[80%] text-[#1d3557]">{file.name}</span>
                <button
                  onClick={() => handleDelete(idx)}
                  className={`
                    text-[#457b9d] hover:text-[#1d3557] font-bold
                    px-3 py-1 rounded
                    transition
                    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#83FFE6]
                  `}
                  aria-label={`Delete ${file.name}`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default Cv_Postings;
