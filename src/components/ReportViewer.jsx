import React from "react";

export default function ReportViewer({ data }) {
  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
        📑 Project WBS Report
      </h2>

      <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
