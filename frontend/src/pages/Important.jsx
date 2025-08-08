// src/pages/Important.js
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const STORAGE_KEY = "important_files";

function Important() {
  const [files, setFiles] = useState(() => {
    // Load saved files metadata from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Save files metadata to localStorage on change
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file), // Preview URL (expires on refresh)
    }));

    setFiles((prev) => [...uploadedFiles, ...prev]);
    e.target.value = null;
  };

  const handleDelete = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleViewFile = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 overflow-hidden text-cyan-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-extrabold mb-6 select-none">
          Important Files & Notices
        </h1>

        <div className="mb-8">
          <label
            htmlFor="upload-important"
            className="inline-block cursor-pointer bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl shadow-md font-semibold select-none"
          >
            Upload New File
          </label>
          <input
            id="upload-important"
            type="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
        </div>

        {files.length === 0 ? (
          <p className="text-gray-400 italic select-none">
            No important files found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map(({ id, name, type, url }) => (
              <div
                key={id}
                className="bg-white border border-cyan-200 rounded-2xl shadow-sm p-5 flex flex-col hover:shadow-lg hover:border-cyan-300 transition-all duration-300"
              >
                <h2
                  className="text-xl font-semibold text-cyan-800 mb-2 truncate select-none"
                  title={name}
                >
                  {name}
                </h2>
                <p className="text-sm text-cyan-600 mb-4 select-none">
                  Type: {type || "Unknown"}
                </p>
                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => handleViewFile(url)}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm py-2 rounded-2xl shadow-md transition-colors select-none"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-2xl shadow-md transition-colors select-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Important;
