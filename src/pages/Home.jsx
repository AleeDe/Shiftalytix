import { useState } from "react";
import FileUpload from "../components/FileUpload";
import ReportViewer from "../components/ReportViewer";

export default function Home() {
  const [report, setReport] = useState(null);

  return (
    <div className=" p-6  min-h-screen">
      <FileUpload setReport={setReport} />
      <ReportViewer report={report} />
    </div>
  );
}
