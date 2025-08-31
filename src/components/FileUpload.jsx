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
    <div className="space-y-4 mb-6">
      <textarea
        rows={5}
        placeholder="Paste your WBS text here..."
        className="w-full border rounded p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={submitText}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Analyze Text
      </button>

      <div className="flex items-center space-x-2">
        <input type="file" onChange={handleFileChange} />
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
