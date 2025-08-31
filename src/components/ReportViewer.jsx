import React, { useMemo, useState } from "react";

export default function ReportViewer({ report }) {
  if (!report) return null;

  // Helpers
  const weights = {
    EI: { Easy: 3, Medium: 4, Hard: 6 },
    EO: { Easy: 4, Medium: 5, Hard: 7 },
    EQ: { Easy: 3, Medium: 4, Hard: 6 },
    ILF: { Easy: 7, Medium: 10, Hard: 15 },
    EIF: { Easy: 5, Medium: 7, Hard: 10 },
  };

  const safeNum = (x) => {
    if (typeof x === "number") return x;
    if (typeof x === "string") {
      const nums = x.match(/-?\d+(\.\d+)?/g);
      if (nums && nums.length) {
        const n = Number(nums[nums.length - 1]);
        return isNaN(n) ? null : n;
      }
    }
    return null;
  };

  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  const calc = useMemo(() => {
    const f = report.functions || {};
    const types = Object.keys(weights);

    const perTypeWeighted = {};
    const perComplexityTotals = { Easy: 0, Medium: 0, Hard: 0 };

    let calculatedUFP = 0;
    types.forEach((t) => {
      const counts = f[t] || {};
      const w = weights[t];
      const easy = Number(counts.Easy || 0);
      const medium = Number(counts.Medium || 0);
      const hard = Number(counts.Hard || 0);

      perComplexityTotals.Easy += easy;
      perComplexityTotals.Medium += medium;
      perComplexityTotals.Hard += hard;

      const weighted =
        easy * w.Easy + medium * w.Medium + hard * w.Hard;
      perTypeWeighted[t] = {
        easy,
        medium,
        hard,
        weighted,
      };
      calculatedUFP += weighted;
    });

    const providedUFP = safeNum(report.UFP);
    const gsc = report.GSC || {};
    const gscValues = Object.values(gsc).map((v) => Number(v || 0));
    const gscSum = sum(gscValues);
    const providedCAFRaw = safeNum(report.CAF);
    const CAF = providedCAFRaw ?? Number((0.65 + gscSum * 0.01).toFixed(2));

    const effectiveUFP = providedUFP ?? calculatedUFP;

    const providedAFP = safeNum(report.AFP);
    const AFP = providedAFP ?? Number((effectiveUFP * CAF).toFixed(2));

    const providedSLOC = safeNum(report.SLOC);
    const slocFactor = 53; // Node.js/React default
    const SLOC = providedSLOC ?? Math.round(AFP * slocFactor);

    const teamMembers = Number(report.teamMembers || 6);

    const providedEffort = safeNum(report.effortPersonMonths);
    const effortPM = providedEffort ?? Number((AFP / 20).toFixed(2));

    const providedTimeline = safeNum(report.timelineMonths);
    const timelineMonths = providedTimeline ?? Number((effortPM / Math.max(teamMembers, 1)).toFixed(2));

    const sizeStr =
      report.projectSize ||
      (SLOC < 4000
        ? `Small (SLOC: ${SLOC})`
        : SLOC <= 10000
        ? `Medium (SLOC: ${SLOC})`
        : SLOC <= 40000
        ? `Large (SLOC: ${SLOC})`
        : `Very Large (SLOC: ${SLOC})`);

    const discrepancy =
      providedUFP != null && calculatedUFP != null && providedUFP !== calculatedUFP
        ? { provided: providedUFP, calculated: calculatedUFP }
        : null;

    return {
      perTypeWeighted,
      perComplexityTotals,
      calculatedUFP,
      providedUFP,
      effectiveUFP,
      gscSum,
      CAF,
      AFP,
      SLOC,
      teamMembers,
      effortPM,
      timelineMonths,
      sizeStr,
      discrepancy,
    };
  }, [report]);

  const [showGSC, setShowGSC] = useState(false);
  const [showFunctionsTable, setShowFunctionsTable] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const steps = Array.isArray(report.reportText) ? report.reportText : [];

  const functionGroups = [
    { key: "EI", label: "External Inputs (EI)" },
    { key: "EO", label: "External Outputs (EO)" },
    { key: "EQ", label: "External Inquiries (EQ)" },
    { key: "ILF", label: "Internal Logical Files (ILF)" },
    { key: "EIF", label: "External Interface Files (EIF)" },
  ];

  const approach = report.approachAnalysis || {};

  return (
    <div className="max-w-6xl mx-auto mt-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">📑 Project WBS Report</h2>
          <span className="text-xs md:text-sm bg-white/20 px-3 py-1 rounded-full">
            VIP View
          </span>
        </div>
        <p className="mt-2 text-white/90 text-sm md:text-base">
          Function Point Analysis with automatic calculations and breakdown.
        </p>
      </div>

      {/* Discrepancy notice */}
      {calc.discrepancy && (
        <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl">
          <div className="font-semibold">Note</div>
          <div className="text-sm">
            Provided UFP ({calc.discrepancy.provided}) differs from calculated UFP ({calc.discrepancy.calculated}) based on weights. Using {calc.effectiveUFP} for derived metrics.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <KpiCard title="UFP (Effective)" value={calc.effectiveUFP} sub={calc.providedUFP != null ? `Provided: ${calc.providedUFP}` : `Calculated: ${calc.calculatedUFP}`} color="bg-blue-50" />
        <KpiCard title="CAF" value={calc.CAF} sub={`VAF = 0.65 + (GSC ${calc.gscSum} × 0.01)`} color="bg-indigo-50" />
        <KpiCard title="AFP" value={calc.AFP} sub="Adjusted Function Points" color="bg-emerald-50" />
        <KpiCard title="SLOC" value={calc.SLOC} sub="Assuming 53 SLOC/FP (Node.js/React)" color="bg-teal-50" />
        <KpiCard title="Team" value={calc.teamMembers} sub="Members" color="bg-cyan-50" />
        <KpiCard title="Effort" value={`${calc.effortPM} PM`} sub="Person-Months" color="bg-fuchsia-50" />
        <KpiCard title="Timeline" value={`${calc.timelineMonths} mo`} sub="Effort / Team" color="bg-rose-50" />
        <KpiCard title="Project Size" value={calc.sizeStr} sub="" color="bg-amber-50" />
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <section className="bg-white mt-6 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800">Estimation Steps</h3>
          <ol className="mt-3 space-y-2 list-decimal list-inside text-gray-700">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Function counts and weights */}
      <section className="bg-white mt-6 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Function Counts & Weights</h3>
          <span className="text-xs text-gray-500">Weights: EI(3/4/6), EO(4/5/7), EQ(3/4/6), ILF(7/10/15), EIF(5/7/10)</span>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Easy</th>
                <th className="py-2 pr-4">Medium</th>
                <th className="py-2 pr-4">Hard</th>
                <th className="py-2 pr-4">Weighted FP</th>
              </tr>
            </thead>
            <tbody>
              {functionGroups.map(({ key, label }) => {
                const row = calc.perTypeWeighted[key] || { easy: 0, medium: 0, hard: 0, weighted: 0 };
                return (
                  <tr key={key} className="border-t">
                    <td className="py-2 pr-4 font-medium text-gray-800">{label}</td>
                    <td className="py-2 pr-4">{row.easy}</td>
                    <td className="py-2 pr-4">{row.medium}</td>
                    <td className="py-2 pr-4">{row.hard}</td>
                    <td className="py-2 pr-4 font-semibold">{row.weighted}</td>
                  </tr>
                );
              })}
              <tr className="border-t bg-gray-50">
                <td className="py-2 pr-4 font-semibold">Totals</td>
                <td className="py-2 pr-4">{calc.perComplexityTotals.Easy}</td>
                <td className="py-2 pr-4">{calc.perComplexityTotals.Medium}</td>
                <td className="py-2 pr-4">{calc.perComplexityTotals.Hard}</td>
                <td className="py-2 pr-4 font-bold">{calc.calculatedUFP}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* GSC */}
      <section className="bg-white mt-6 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">General System Characteristics (GSC)</h3>
          <button
            onClick={() => setShowGSC((s) => !s)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showGSC ? "Hide" : "Show"} details
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Sum: {calc.gscSum} • CAF: {calc.CAF}</p>
        {showGSC && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {Object.entries(report.GSC || {}).map(([k, v]) => (
              <div key={k} className="border rounded-xl p-3">
                <div className="text-xs text-gray-500">{k}</div>
                <div className="font-semibold">{v}</div>
                <div className="mt-2 h-2 bg-gray-100 rounded">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${(Number(v || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Calculations */}
      <section className="bg-white mt-6 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800">Calculations</h3>
        <div className="mt-3 grid gap-2 text-sm text-gray-700">
          <div>
            UFP =
            <span className="ml-1 font-semibold">{calc.effectiveUFP}</span>
            {calc.providedUFP != null && (
              <span className="ml-2 text-xs text-gray-500">(Provided: {calc.providedUFP}, Calc: {calc.calculatedUFP})</span>
            )}
          </div>
          <div>CAF = 0.65 + (GSC Sum {calc.gscSum} × 0.01) = <span className="font-semibold">{calc.CAF}</span></div>
          <div>AFP = UFP × CAF = <span className="font-semibold">{calc.AFP}</span></div>
          <div>SLOC = AFP × 53 = <span className="font-semibold">{calc.SLOC}</span></div>
          <div>Effort (PM) = AFP / 20 = <span className="font-semibold">{calc.effortPM}</span></div>
          <div>Timeline (months) = Effort / Team = <span className="font-semibold">{calc.timelineMonths}</span></div>
        </div>
      </section>

      {/* Functions table (detailed sources/definitions) */}
      {Array.isArray(report.functions_table) && report.functions_table.length > 0 && (
        <section className="bg-white mt-6 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Function Details</h3>
            <button
              onClick={() => setShowFunctionsTable((s) => !s)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showFunctionsTable ? "Collapse" : "Expand"}
            </button>
          </div>
          {showFunctionsTable && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {report.functions_table.map((ft, idx) => (
                <div key={idx} className="border rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{ft.Function}</div>
                    <span className="text-xs text-gray-500">{ft.Definition}</span>
                  </div>
                  {Array.isArray(ft.Source) && ft.Source.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-500">Source</div>
                      <ul className="mt-1 list-disc list-inside text-sm text-gray-700 space-y-1">
                        {ft.Source.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ft.Complexity && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      {["Easy", "Medium", "Hard"].map((lvl) => (
                        <div key={lvl} className="bg-gray-50 rounded-lg p-2">
                          <div className="font-semibold">{lvl}</div>
                          <div className="text-gray-600">{ft.Complexity[lvl]}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Team breakdown */}
      {Array.isArray(report.perPersonBreakdown) && report.perPersonBreakdown.length > 0 && (
        <section className="bg-white mt-6 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800">Team Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {report.perPersonBreakdown.map((p, i) => (
              <div key={i} className="border rounded-2xl p-4">
                <div className="text-sm text-gray-500">Role</div>
                <div className="text-lg font-semibold">{p.role}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-500">Members</div>
                    <div className="font-semibold">{p.members}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-500">Effort (PM)</div>
                    <div className="font-semibold">{p.effortPM}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                    <div className="text-gray-500">Timeline (mo)</div>
                    <div className="font-semibold">{p.timelineMonths}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Approach */}
      {(approach.TopDown || approach.BottomUp || approach.AlgorithmicLibrary || approach.RecommendedApproach) && (
        <section className="bg-white mt-6 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800">Estimation Approaches</h3>
          <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
            {approach.TopDown && (
              <div className="border rounded-xl p-3">
                <div className="font-semibold">Top-down</div>
                <div className="text-gray-700 mt-1">{approach.TopDown}</div>
              </div>
            )}
            {approach.BottomUp && (
              <div className="border rounded-xl p-3">
                <div className="font-semibold">Bottom-up</div>
                <div className="text-gray-700 mt-1">{approach.BottomUp}</div>
              </div>
            )}
            {approach.AlgorithmicLibrary && (
              <div className="border rounded-xl p-3">
                <div className="font-semibold">Algorithmic</div>
                <div className="text-gray-700 mt-1">{approach.AlgorithmicLibrary}</div>
              </div>
            )}
            {approach.RecommendedApproach && (
              <div className="border rounded-xl p-3 md:col-span-2 bg-blue-50 border-blue-200">
                <div className="font-semibold">Recommended</div>
                <div className="text-gray-800 mt-1">{approach.RecommendedApproach}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Raw JSON toggle */}
      <section className="mt-6">
        <button
          onClick={() => setShowRaw((s) => !s)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showRaw ? "Hide raw JSON" : "Show raw JSON"}
        </button>
        {showRaw && (
          <pre className="bg-gray-50 p-4 rounded-lg text-xs text-gray-800 overflow-x-auto mt-2">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}

function KpiCard({ title, value, sub, color }) {
  return (
    <div className={`${color} border rounded-2xl p-4`}>
      <div className="text-xs text-gray-600">{title}</div>
      <div className="text-xl font-bold text-gray-900 mt-1">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
    </div>
  );
}
