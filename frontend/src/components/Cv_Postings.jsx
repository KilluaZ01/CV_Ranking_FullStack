import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

const CvPostings = forwardRef((props, ref) => {
  const [cvFiles, setCvFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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
    if (cvFiles.length === 0 && fileData.length > 0) setCurrentIndex(0);
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

  const currentFile = cvFiles[currentIndex];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -500 : 500,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="p-8 bg-gradient-to-br bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">Choose Document</h1>
          <Icon
            icon="mdi:dots-vertical"
            className="text-gray-600 text-2xl hover:text-gray-800 cursor-pointer transition-colors"
          />
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6 text-center">
          <h2 className="text-base font-semibold text-gray-700 mb-4 truncate">
            {currentFile ? currentFile.name : "No CV Selected"}
          </h2>
          <div className="relative h-60 w-full border border-gray-200 rounded-lg overflow-hidden">
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
                    className="w-full h-full border-none object-contain"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="no-file"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-600 rounded-lg"
                >
                  <Icon
                    icon="mdi:file-upload-outline"
                    className="text-4xl mb-2"
                  />
                  <p className="mb-1 text-base font-medium">No CVs Uploaded</p>
                  <label className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    Upload PDF CVs
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            className={`p-2 rounded-full transition-all ${
              currentIndex === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-100"
            }`}
            onClick={goToPrev}
            disabled={currentIndex === 0}
          >
            <Icon icon="mdi:chevron-left" className="text-2xl" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {currentFile
              ? `CV ${currentIndex + 1} of ${cvFiles.length}`
              : "No CV Selected"}
          </span>
          <button
            className={`p-2 rounded-full transition-all ${
              currentIndex >= cvFiles.length - 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-100"
            }`}
            onClick={goToNext}
            disabled={currentIndex >= cvFiles.length - 1}
          >
            <Icon icon="mdi:chevron-right" className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default CvPostings;
