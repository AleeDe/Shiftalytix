export default function FunctionTable({ functions }) {
  if (!functions || typeof functions !== "object") return null;

  return (
    <div className="bg-white p-4 rounded shadow-md overflow-x-auto space-y-6">
      <h3 className="font-semibold mb-4">Function Details</h3>
      {Object.entries(functions).map(([type, items]) => (
        <div key={type}>
          <h4 className="text-lg font-bold text-blue-600 mb-2">{type}</h4>
          <table className="min-w-full divide-y divide-gray-200 mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Complexity</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(items) ? items : []).map((f, idx) => (
                <tr key={idx}>
                  <td className="border p-2 font-semibold">{f.name || f.Name}</td>
                  <td className="border p-2">{f.description || f.Description}</td>
                  <td className="border p-2">{f.complexity || f.Complexity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
