import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react"; 
import { analyzeFile } from "../api/wbsApi";

export default function FileUpload({ setReport, setLoading }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(
        selectedFile.type
      )
    ) {
      setFile(selectedFile);
    } else {
      alert("Only PDF or DOC/DOCX files are allowed.");
      e.target.value = "";
    }
  };

  const submitFile = async () => {
    if (!file) return alert("Please select a valid file!");
    setLoading(true); // show loader
    try {
      const data = await analyzeFile(file);
      setReport(data);
    } catch (err) {
      alert("Error analyzing file. Please try again.");
    } finally {
      setLoading(false); // hide loader
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-white shadow-xl rounded-2xl p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Title */}
      <motion.h1
        className="text-center text-4xl font-extrabold text-gray-900 mb-6"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        📊 Project WBS Report Maker
      </motion.h1>

      {/* Disclaimer */}
      <p className="text-sm text-gray-600 mb-4 text-center">
        ⚡ <strong>Note:</strong> The better and more detailed your <span className="text-blue-600 font-semibold">Project WBS</span>, 
        the more accurate the results will be. However, the output is <span className="text-red-500">not guaranteed to be 100% accurate</span> — please verify results yourself. ✅
      </p>

      {/* File Upload Section */}
      <div className="flex flex-col items-center space-y-6">
        <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 transition">
          <Upload className="w-12 h-12 text-blue-600 mb-2" />
          <span className="text-gray-700 font-medium">
            {file ? file.name : "Click to upload PDF or DOC/DOCX"}
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={submitFile}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-xl transition"
        >
          <FileText className="w-5 h-5" /> Analyze File
        </motion.button>
      </div>
    </motion.div>
  );
}
