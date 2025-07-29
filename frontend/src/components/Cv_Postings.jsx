import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

const CvPostings = forwardRef((props, ref) => {
  const [cvFiles, setCvFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const fileInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getFiles: () => cvFiles.map((f) => f.file),
  }));

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );

    const fileData = files.map((file) => ({
      file,
      url: URL.createObjectURL(file) + "#toolbar=0",
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

  const goToNext = () => {
    if (currentIndex < cvFiles.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleManualUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const currentFile = cvFiles[currentIndex];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 500 : -500, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -500 : 500, opacity: 0, scale: 0.95 }),
  };

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
          className="flex-1 relative rounded-lg overflow-hidden border mb-4"
          style={{ borderColor: "#a8dadc" }}
        >
          <AnimatePresence initial={false} custom={direction}>
            {currentFile ? (
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute w-full h-full"
              >
                <iframe
                  src={currentFile.url}
                  title={currentFile.name}
                  className="w-full h-full border-none"
                />
              </motion.div>
            ) : (
              <motion.div
                key="no-file"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg"
                style={{
                  borderColor: "#a8dadc",
                  backgroundColor: "#f1faee",
                }}
              >
                <Icon
                  icon="mdi:file-upload-outline"
                  className="text-4xl mb-2 text-[#457b9d]"
                />
                <p className="text-base font-medium mb-1 text-[#1d3557]">
                  No CVs Uploaded
                </p>
                <button
                  onClick={handleManualUploadClick}
                  className="text-sm font-semibold text-[#e63946] hover:underline"
                >
                  Upload PDF CVs
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full transition-all ${
              currentIndex === 0
                ? "bg-[#a8dadc] cursor-not-allowed"
                : "bg-[#457b9d] hover:bg-[#355e7c]"
            } text-white`}
          >
            <Icon icon="mdi:chevron-left" className="text-2xl" />
          </button>

          <span className="text-sm font-medium text-[#1d3557]">
            {currentFile
              ? `CV ${currentIndex + 1} of ${cvFiles.length}`
              : "No CV Selected"}
          </span>

          <button
            onClick={goToNext}
            disabled={currentIndex >= cvFiles.length - 1}
            className={`p-2 rounded-full transition-all ${
              currentIndex >= cvFiles.length - 1
                ? "bg-[#a8dadc] cursor-not-allowed"
                : "bg-[#457b9d] hover:bg-[#355e7c]"
            } text-white`}
          >
            <Icon icon="mdi:chevron-right" className="text-2xl" />
          </button>
        </div>

        {cvFiles.length > 0 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleManualUploadClick}
              className="text-sm text-white bg-[#e63946] hover:bg-[#c72f3f] px-4 py-2 rounded-full font-semibold shadow transition"
            >
              Upload More CVs
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
});

export default CvPostings;
