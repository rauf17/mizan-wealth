"use client";

import React, { useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

interface Heirs {
  husband: boolean;
  wife: boolean;
  sons: number;
  daughters: number;
  father: boolean;
  mother: boolean;
}

interface Distribution {
  name: string;
  shareStr: string;
  percentage: number;
  amount: number;
}

function calculateInheritance(estate: number, h: Heirs): Distribution[] {
  const hasChildren = h.sons > 0 || h.daughters > 0;
  
  let h24 = 0, w24 = 0, m24 = 0, f24 = 0, d24 = 0;
  
  if (h.husband) h24 = hasChildren ? 6 : 12;
  if (h.wife) w24 = hasChildren ? 3 : 6;
  if (h.mother) m24 = hasChildren ? 4 : 8;
  if (h.father && hasChildren) f24 = 4;
  if (h.daughters > 0 && h.sons === 0) {
    d24 = h.daughters >= 2 ? 16 : 12;
  }
  
  const total24 = h24 + w24 + m24 + f24 + d24;
  const dist: {name: string, n: number, d: number}[] = [];
  
  if (total24 > 24) {
    // Awl
    const denom = total24;
    if (h24) dist.push({name: "Husband", n: h24, d: denom});
    if (w24) dist.push({name: "Wife", n: w24, d: denom});
    if (m24) dist.push({name: "Mother", n: m24, d: denom});
    if (f24) dist.push({name: "Father", n: f24, d: denom});
    if (d24) dist.push({name: h.daughters > 1 ? `${h.daughters} Daughters` : "Daughter", n: d24, d: denom});
  } else {
    // No Awl
    const denom = 24;
    let rem24 = 24 - total24;
    
    let fTotal = f24;
    let sTotalN = 0, sTotalD = 1;
    let dTotalN = d24, dTotalD = denom;
    let unallocated24 = 0;
    
    if (rem24 > 0) {
      if (h.sons > 0) {
        const parts = h.sons * 2 + h.daughters;
        sTotalN = rem24 * (h.sons * 2);
        sTotalD = 24 * parts;
        
        dTotalN = rem24 * h.daughters;
        dTotalD = 24 * parts;
        rem24 = 0;
      } else if (h.father) {
        fTotal += rem24;
        rem24 = 0;
      } else {
        unallocated24 = rem24;
      }
    }
    
    if (h24) dist.push({name: "Husband", n: h24, d: denom});
    if (w24) dist.push({name: "Wife", n: w24, d: denom});
    if (m24) dist.push({name: "Mother", n: m24, d: denom});
    if (h.father && fTotal > 0) dist.push({name: "Father", n: fTotal, d: denom});
    
    if (sTotalN > 0) dist.push({name: h.sons > 1 ? `${h.sons} Sons` : "Son", n: sTotalN, d: sTotalD});
    if (dTotalN > 0) dist.push({name: h.daughters > 1 ? `${h.daughters} Daughters` : "Daughter", n: dTotalN, d: dTotalD});
    if (unallocated24 > 0) dist.push({name: "Unallocated", n: unallocated24, d: denom});
  }
  
  const simplify = (num: number, den: number) => {
    const gcd = (a: number, b: number): number => Math.abs(b) < 1e-9 ? a : gcd(b, a % b);
    const common = Math.abs(gcd(Math.round(num), Math.round(den)));
    if (common === 0) return { n: num, d: den };
    return { n: Math.round(num / common), d: Math.round(den / common) };
  };
  
  return dist.filter(x => x.n > 0).map(x => {
    const sim = simplify(x.n, x.d);
    const pct = (sim.n / sim.d) * 100;
    const amt = estate * (sim.n / sim.d);
    return {
      name: x.name,
      shareStr: `${sim.n}/${sim.d}`,
      percentage: pct,
      amount: amt
    };
  });
}

const colors = ['#0F4C4C', '#C9A227', '#475569', '#94A3B8', '#64748B', '#1E293B', '#38B2AC', '#2C7A7B'];

function SVGDonut({ data }: { data: { name: string; percentage: number; color: string }[] }) {
  let cumulativePercent = 0;
  
  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  const activeSlices = data.filter(d => d.percentage > 0);
  if (activeSlices.length === 1) {
    return (
      <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
        <circle r="1" fill={activeSlices[0].color} />
        <circle r="0.65" fill="white" />
      </svg>
    );
  }

  return (
    <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
      {data.map((slice, i) => {
        if (slice.percentage === 0) return null;
        
        const startX = getCoordinatesForPercent(cumulativePercent)[0];
        const startY = getCoordinatesForPercent(cumulativePercent)[1];
        
        cumulativePercent += slice.percentage / 100;
        if (cumulativePercent > 0.999 && cumulativePercent < 1.001) cumulativePercent = 1;

        const endX = getCoordinatesForPercent(cumulativePercent)[0];
        const endY = getCoordinatesForPercent(cumulativePercent)[1];
        
        const largeArcFlag = slice.percentage > 50 ? 1 : 0;
        
        const pathData = [
          `M ${startX} ${startY}`,
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `L 0 0`,
        ].join(' ');
        
        return <path key={i} d={pathData} fill={slice.color} />;
      })}
      <circle r="0.65" fill="white" />
    </svg>
  );
}

export default function InheritancePage() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [estateValue, setEstateValue] = useState("100000");
  const [heirs, setHeirs] = useState<Heirs>({
    husband: false,
    wife: false,
    sons: 0,
    daughters: 0,
    father: false,
    mother: false,
  });
  const [results, setResults] = useState<Distribution[]>([]);

  const handleCalculate = () => {
    const val = parseFloat(estateValue);
    if (isNaN(val) || val <= 0) {
      setResults([]);
      return;
    }
    const res = calculateInheritance(val, heirs);
    setResults(res);
  };

  const totalDistributed = results.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="font-h1">Inheritance Modeler</h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Estimate estate distribution according to Islamic jurisprudence.
          </p>
        </div>

        {showDisclaimer && (
          <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-4 text-sm relative animate-fade-in pr-10">
            <span className="font-semibold text-slate-800">Disclaimer:</span> This tool covers common inheritance scenarios using majority (Hanafi/Shafi) positions. Complex multi-generational cases should be reviewed with a qualified scholar.
            <button 
              onClick={() => setShowDisclaimer(false)} 
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              title="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-6">
            <Card className="space-y-6">
              <Input 
                type="number" 
                label="Total Estate Value ($)" 
                required 
                min="1"
                step="any"
                value={estateValue} 
                onChange={e => setEstateValue(e.target.value)} 
              />

              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 font-heading">Survivors</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 w-full">
                      <input 
                        type="checkbox" 
                        checked={heirs.husband} 
                        onChange={e => setHeirs({...heirs, husband: e.target.checked, wife: false})} 
                        className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300" 
                      />
                      Husband
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 w-full">
                      <input 
                        type="checkbox" 
                        checked={heirs.wife} 
                        onChange={e => setHeirs({...heirs, wife: e.target.checked, husband: false})} 
                        className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300" 
                      />
                      Wife
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={heirs.sons > 0} 
                        onChange={e => setHeirs({...heirs, sons: e.target.checked ? 1 : 0})} 
                        className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300" 
                      />
                      Son(s)
                    </label>
                    {heirs.sons > 0 && (
                      <input 
                        type="number" 
                        min="1" 
                        value={heirs.sons} 
                        onChange={e => setHeirs({...heirs, sons: parseInt(e.target.value) || 1})} 
                        className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-md text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={heirs.daughters > 0} 
                        onChange={e => setHeirs({...heirs, daughters: e.target.checked ? 1 : 0})} 
                        className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300" 
                      />
                      Daughter(s)
                    </label>
                    {heirs.daughters > 0 && (
                      <input 
                        type="number" 
                        min="1" 
                        value={heirs.daughters} 
                        onChange={e => setHeirs({...heirs, daughters: parseInt(e.target.value) || 1})} 
                        className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-md text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 w-full">
                      <input 
                        type="checkbox" 
                        checked={heirs.father} 
                        onChange={e => setHeirs({...heirs, father: e.target.checked})} 
                        className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300" 
                      />
                      Father
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 w-full">
                      <input 
                        type="checkbox" 
                        checked={heirs.mother} 
                        onChange={e => setHeirs({...heirs, mother: e.target.checked})} 
                        className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300" 
                      />
                      Mother
                    </label>
                  </div>
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full">Calculate Distribution</Button>
            </Card>
          </div>

          <div className="lg:col-span-6">
            {results.length > 0 ? (
              <Card className="animate-fade-in space-y-6">
                <h2 className="text-sm font-heading font-bold text-slate-800 border-b border-slate-100 pb-4">
                  Distribution Results
                </h2>

                <div className="flex flex-col gap-8">
                  <div className="w-48 h-48 mx-auto relative">
                    <SVGDonut data={results.map((r, i) => ({ name: r.name, percentage: r.percentage, color: colors[i % colors.length] }))} />
                  </div>

                  <div className="space-y-1">
                    <div className="grid grid-cols-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                      <div className="col-span-1">Heir</div>
                      <div className="text-right">Share</div>
                      <div className="text-right">%</div>
                      <div className="text-right">Amount</div>
                    </div>
                    {results.map((r, i) => (
                      <div key={i} className="grid grid-cols-4 text-sm py-2.5 border-b border-slate-50 last:border-0 items-center">
                        <div className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                          <span className="truncate">{r.name}</span>
                        </div>
                        <div className="text-right text-slate-500 font-medium">{r.shareStr}</div>
                        <div className="text-right text-slate-500 font-medium">{r.percentage.toFixed(1)}%</div>
                        <div className="text-right font-bold text-slate-900">${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200/60 rounded-lg text-center text-sm">
                  <span className="text-slate-500 font-medium">Total distributed:</span>{" "}
                  <strong className="text-slate-900 font-bold">${totalDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>{" "}
                  <span className="text-slate-500 font-medium">of</span>{" "}
                  <strong className="text-slate-900 font-bold">${parseFloat(estateValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>{" "}
                  <span className="text-slate-500 font-medium">estate</span>
                </div>
              </Card>
            ) : (
               <Card>
                 <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
                    <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-bold text-slate-800 mb-1">No Results</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                      Enter the total estate value and select the surviving heirs to calculate the distribution.
                    </p>
                  </div>
               </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
