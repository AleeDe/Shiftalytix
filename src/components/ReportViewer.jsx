import FunctionTable from "./FunctionTable";
import { motion } from "framer-motion";

export default function ReportViewer({ report }) {
  if (!report) return (
    <div className="p-6">
      <h1 className="text-center text-4xl font-bold text-gray-900 mb-6">Report Viewer</h1>
      <p>No Report for now ....... upload WBS or text so i can make report</p> </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-blue-600">WBS Analysis Report</h2>

      {/* Step-by-step explanation */}
      <div className="bg-white p-4 rounded shadow-md">
        <h3 className="font-semibold mb-2">Step-by-Step Explanation</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {(Array.isArray(report.reportText) ? report.reportText : []).map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      </div>

      {/* Functions Table */}
      <FunctionTable functions={report.functions} />

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p><strong>UFP:</strong> {report.UFP}</p>
          <p><strong>AFP:</strong> {report.AFP}</p>
          <p><strong>SLOC:</strong> {report.SLOC}</p>
          <p><strong>Project Size:</strong> {report.projectSize}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Team Members:</strong> {report.teamMembers}</p>
          <p><strong>Total Effort:</strong> {report.effortPersonMonths} PM</p>
          <p><strong>Timeline:</strong> {report.timelineMonths} months</p>
        </div>
      </div>
    </motion.div>
  );
}
