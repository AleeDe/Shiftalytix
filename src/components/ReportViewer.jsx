import React, { useMemo, useState } from "react";

export default function ReportViewer({ report }) {
  if (!report) return null;

  const [wrap, setWrap] = useState(false);
  const [indent, setIndent] = useState(2);

  // Convert input to string safely:
  const rawInput = useMemo(() => {
    // If the API already returns a string, show it as-is
    if (typeof report === "string") return report;

    try {
      // Pretty-print any object
      return JSON.stringify(report, null, indent);
    } catch {
      // Fallback: best-effort toString
      return String(report);
    }
  }, [report, indent]);

  // Try to parse only for pretty-printing; if invalid JSON (e.g., trailing commas),
  // we keep the original string.
  const prettyText = useMemo(() => {
    if (typeof report === "string") {
      try {
        const parsed = JSON.parse(report);
        return JSON.stringify(parsed, null, indent);
      } catch {
        // Keep as-is if not valid JSON
        return rawInput;
      }
    }
    return rawInput;
  }, [report, rawInput, indent]);

  // Lightweight syntax highlighting
  const highlighted = useMemo(() => {
    const esc = (s) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const json = esc(prettyText);
    return json.replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-gray-800";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "text-purple-700" : "text-green-700";
        } else if (/true|false/.test(match)) {
          cls = "text-indigo-700";
        } else if (/null/.test(match)) {
          cls = "text-pink-700";
        } else {
          cls = "text-blue-700"; // number
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }, [prettyText]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prettyText);
      // Optional: toast could be added here
    } catch {
      // ignore
    }
  };

  const onDownload = () => {
    const blob = new Blob([prettyText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 p-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-5 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">Raw JSON (Pretty)</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              className="text-xs md:text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded"
              title="Copy to clipboard"
            >
              Copy
            </button>
            <button
              onClick={onDownload}
              className="text-xs md:text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded"
              title="Download JSON"
            >
              Download
            </button>
          </div>
        </div>
        <p className="mt-2 text-white/90 text-xs md:text-sm">
          Displaying the API response as JSON only (no calculations).
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm text-gray-700 flex items-center gap-2">
          Indent:
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
          </select>
        </label>
        <label className="text-sm text-gray-700 flex items-center gap-2">
          <input
            type="checkbox"
            checked={wrap}
            onChange={(e) => setWrap(e.target.checked)}
          />
          Wrap lines
        </label>
      </div>

      <div className="mt-3 border rounded-2xl overflow-hidden">
        <div
          className={`p-4 text-xs md:text-sm font-mono bg-gray-50 text-gray-900 ${
            wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
          } overflow-auto`}
          // We only inject our own escaped + colored JSON
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}
