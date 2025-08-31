import { useState } from "react";
import FileUpload from "../components/FileUpload";
import ReportViewer from "../components/ReportViewer";
import LoaderOverlay from "../components/LoaderOverlay";

export default function Home() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false); // global loader

  return (
    <div className="p-6 min-h-screen relative">
      {/* Loader Overlay */}
      {loading && <LoaderOverlay />}

      <FileUpload setReport={setReport} setLoading={setLoading} />
      <ReportViewer report={report} />
    </div>
  );
}
