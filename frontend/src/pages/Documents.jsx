import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  const readFileContent = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve("Could not read file content.");
      reader.readAsText(file);
    });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const docsWithContent = await Promise.all(
      files.map(async (file) => {
        const content =
          file.type.startsWith("text/") || file.name.endsWith(".json")
            ? await readFileContent(file)
            : null;

        return {
          name: file.name,
          type: file.type || "N/A",
          content: content,
          previewUrl: URL.createObjectURL(file),
        };
      })
    );
    const updatedDocs = [...documents, ...docsWithContent];
    setDocuments(updatedDocs);
    localStorage.setItem("uploadedDocuments", JSON.stringify(updatedDocs));
  };

  const handleDelete = (index) => {
    const updated = [...documents];
    updated.splice(index, 1);
    setDocuments(updated);
    localStorage.setItem("uploadedDocuments", JSON.stringify(updated));
    if (previewDoc?.index === index) {
      setPreviewDoc(null);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("uploadedDocuments");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDocuments(parsed);
      } catch (err) {
        console.error("Invalid localStorage content", err);
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 text-cyan-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto relative">
        <h2 className="text-4xl font-extrabold mb-8 select-none">📄 Documents</h2>

        <div className="mb-8">
          <label className="block mb-3 text-cyan-900 font-semibold select-none">
            Upload Documents
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="block w-full text-sm text-cyan-900
              file:mr-4 file:py-2 file:px-5 file:rounded-2xl file:border-0
              file:text-sm file:font-semibold file:bg-cyan-300 file:text-cyan-900
              hover:file:bg-cyan-400 cursor-pointer transition-colors"
          />
        </div>

        {documents.length === 0 ? (
          <p className="text-center text-cyan-500 italic mt-24 select-none">
            No documents uploaded.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {documents.map((doc, index) => (
              <div
                key={index}
                onClick={() => setPreviewDoc({ ...doc, index })}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between
                  hover:shadow-2xl transition-shadow cursor-pointer select-none"
              >
                <div>
                  <h3
                    title={doc.name}
                    className="text-xl font-semibold text-cyan-900 mb-4 truncate"
                  >
                    {doc.name}
                  </h3>
                  <div className="text-sm text-cyan-700 mb-6 whitespace-pre-wrap h-28 overflow-hidden leading-relaxed">
                    {doc.content
                      ? doc.content.slice(0, 150) +
                        (doc.content.length > 150 ? "..." : "")
                      : "Preview not available"}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="text-red-600 hover:text-red-800 font-semibold"
                    title="Delete document"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {previewDoc && (
          <div
            className="fixed inset-0 z-40 flex items-start justify-center bg-transparent"
            onClick={() => setPreviewDoc(null)}
          >
            <div
              className="relative bg-white p-8 mt-16 rounded-3xl shadow-2xl w-[90%] max-w-5xl max-h-[90vh] overflow-auto border border-cyan-300"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 text-cyan-700 hover:text-cyan-900 font-bold text-3xl"
                onClick={() => setPreviewDoc(null)}
                aria-label="Close preview"
              >
                &times;
              </button>

              <h3 className="text-3xl font-bold text-cyan-900 mb-6 truncate select-none">
                {previewDoc.name}
              </h3>

              {previewDoc.type.startsWith("text/") && previewDoc.content ? (
                <pre className="whitespace-pre-wrap text-cyan-900 bg-cyan-50 p-6 rounded-xl shadow-inner select-text">
                  {previewDoc.content}
                </pre>
              ) : previewDoc.type === "application/pdf" &&
                previewDoc.previewUrl ? (
                <iframe
                  src={previewDoc.previewUrl}
                  className="w-full h-[70vh] border rounded-xl shadow-lg"
                  title={`PDF preview of ${previewDoc.name}`}
                />
              ) : previewDoc.type.startsWith("image/") &&
                previewDoc.previewUrl ? (
                <img
                  src={previewDoc.previewUrl}
                  alt={previewDoc.name}
                  className="max-w-full max-h-[70vh] mx-auto rounded-xl shadow-lg"
                />
              ) : (
                <p className="text-center text-cyan-500 italic mt-12 select-none">
                  Preview not available for this file type.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Documents;
