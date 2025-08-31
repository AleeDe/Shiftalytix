import { Loader2 } from "lucide-react";

export default function LoaderOverlay() {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-gray-700 font-semibold">Generating Report...</p>
      </div>
    </div>
  );
}
