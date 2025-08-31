import { useState } from "react";
import FileUpload from "../components/FileUpload";
import ReportViewer from "../components/ReportViewer";

export default function Home() {
  const [report, setReport] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <FileUpload setReport={setReport} />
      <ReportViewer report={report} />
    </div>
  );
}
