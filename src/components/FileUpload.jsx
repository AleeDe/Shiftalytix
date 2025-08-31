import { useState } from "react";
import { analyzeFile, analyzeText } from "../api/wbsApi";

export default function FileUpload({ setReport }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const submitFile = async () => {
    if (!file) return alert("Select a file!");
    setLoading(true);
    const data = await analyzeFile(file);
    setReport(data);
    setLoading(false);
  };

  const submitText = async () => {
    if (!text) return alert("Enter text!");
    setLoading(true);
    const data = await analyzeText(text);
    setReport(data);
    setLoading(false);
  };

  return (
    <div className="space-y-4 mb-6 w-full bg-gray-100 p-6 rounded-2xl">
      <h1 className="text-center text-4xl font-bold text-gray-900 mb-6">Report Maker</h1>

      <textarea
        rows={5}
        placeholder="Paste your WBS text ssadas here..."
        className="w-full border rounded p-2 outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        id="Hello"
      />
      <button
        onClick={submitText}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Analyze Text
      </button>

      <div className="flex items-center space-x-2">
        <input type="file" onChange={handleFileChange} />
        <style jsx>{`
  .file-input {
    color: transparent; /* hide default file name */
  }
  .file-input::file-selector-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .file-input::after {
    content: "No file chosen"; /* fake placeholder */
    color: #888;
    margin-left: 10px;
  }
`}</style>
        <button
          onClick={submitFile}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Analyze File
        </button>
      </div>

      {loading && <p className="text-gray-500">Processing...</p>}
    </div>
  );
}
