import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SliderInput } from './SliderInput';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency, cn, numberToWords } from '../utils';

type InvestmentMode = 'SIP' | 'LUMPSUM';

export function InvestmentCalculator() {
  const { currency } = useSettings();
  const [mode, setMode] = useState<InvestmentMode>('SIP');
  const [amount, setAmount] = useState<number>(25000);
  const [rate, setRate] = useState<number>(12);
  const [duration, setDuration] = useState<number>(15);
  
  // Extra feature: Inflation adjustment
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [useInflation, setUseInflation] = useState<boolean>(true);

  const calculateData = () => {
    let investedAmount = 0;
    let futureValue = 0;
    const dataPoints = [];

    const monthlyRate = rate / 12 / 100;
    const months = duration * 12;
    const annualRate = rate / 100;

    for (let i = 1; i <= duration; i++) {
      let currentInvested = 0;
      let currentFutureValue = 0;

      if (mode === 'LUMPSUM') {
        currentInvested = amount;
        currentFutureValue = amount * Math.pow(1 + annualRate, i);
      } else {
        const currentMonths = i * 12;
        currentInvested = amount * currentMonths;
        if (monthlyRate === 0) {
          currentFutureValue = currentInvested;
        } else {
          currentFutureValue = amount * ((Math.pow(1 + monthlyRate, currentMonths) - 1) / monthlyRate) * (1 + monthlyRate);
        }
      }

      dataPoints.push({
        year: i,
        invested: Math.round(currentInvested),
        returns: Math.max(0, Math.round(currentFutureValue - currentInvested)),
        total: Math.round(currentFutureValue)
      });
    }

    if (mode === 'LUMPSUM') {
      investedAmount = amount;
      futureValue = amount * Math.pow(1 + annualRate, duration);
    } else {
      investedAmount = amount * months;
      if (monthlyRate === 0) {
        futureValue = investedAmount;
      } else {
        futureValue = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      }
    }

    const estimatedReturns = futureValue - investedAmount;
    
    // Inflation adjusted real value formula: FV / (1 + inflation/100)^N
    const realValue = futureValue / Math.pow(1 + inflationRate / 100, duration);

    return { investedAmount, estimatedReturns, futureValue, realValue, dataPoints };
  };

  const { investedAmount, estimatedReturns, futureValue, realValue, dataPoints } = calculateData();

  return (
    <section className="flex-1 flex flex-col md:flex-row bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden h-full">
      {/* Inputs Section */}
      <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-cyan-50/30 dark:bg-cyan-900/10 shrink-0">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 rounded-md">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path></svg>
            </span>
            Investment Planner
          </h2>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit mb-8">
            <button
              onClick={() => setMode('SIP')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                mode === 'SIP' 
                  ? "bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              SIP (Monthly)
            </button>
            <button
              onClick={() => setMode('LUMPSUM')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                mode === 'LUMPSUM' 
                  ? "bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              Lumpsum
            </button>
          </div>

          <SliderInput 
            label={mode === 'SIP' ? "Monthly Investment" : "Total Investment"}
            value={amount}
            onChange={setAmount}
            min={0}
            max={1000000000000} 
            step={mode === 'SIP' ? 1000 : 10000}
            symbol={currency.symbol}
            colorTheme="cyan"
          />

          <SliderInput 
            label="Return Rate (% p.a)"
            value={rate}
            onChange={setRate}
            min={1}
            max={50}
            step={0.1}
            suffix="%"
            colorTheme="cyan"
          />

          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-tight">Investment Period</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={duration || ''} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-24 text-right border-b-2 border-cyan-200 focus:border-cyan-600 outline-none font-bold text-slate-800 dark:text-white dark:bg-slate-800 text-lg transition-colors pr-10" 
                />
                <span className="absolute right-1 text-slate-500 font-bold text-lg pointer-events-none">Yrs</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div className="mt-8 flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-tight">Inflation Adjusted</h4>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Real value at {inflationRate}% inflation</p>
            </div>
            <input 
              type="checkbox" 
              checked={useInflation} 
              onChange={(e) => setUseInflation(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
            />
          </div>
          
          {useInflation && (
            <div className="mt-4">
               <SliderInput 
                  label=""
                  value={inflationRate}
                  onChange={setInflationRate}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                  colorTheme="emerald"
                />
            </div>
          )}

        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 flex flex-col p-6 bg-slate-50/30 dark:bg-slate-800/30">
        <div className="grid grid-cols-3 gap-2 mb-6 shrink-0">
          <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 flex flex-col justify-start">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Invested</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words" title={formatCurrency(investedAmount, currency)}>{formatCurrency(investedAmount, currency)}</p>
            <p className="text-[9px] text-slate-500/70 dark:text-slate-400/70 font-medium capitalize mt-0.5" title={numberToWords(investedAmount)}>{numberToWords(investedAmount)}</p>
          </div>
          <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 flex flex-col justify-start">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Returns</p>
            <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 break-words" title={'+' + formatCurrency(estimatedReturns, currency)}>+{formatCurrency(estimatedReturns, currency)}</p>
            <p className="text-[9px] text-cyan-600/70 dark:text-cyan-400/70 font-medium capitalize mt-0.5" title={numberToWords(estimatedReturns)}>{numberToWords(estimatedReturns)}</p>
          </div>
          <div className="p-3 bg-cyan-600 rounded-lg text-white flex flex-col justify-start">
            <p className="text-[9px] font-bold text-white/70 uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-sm font-black text-white break-words" title={formatCurrency(futureValue, currency)}>{formatCurrency(futureValue, currency)}</p>
            <p className="text-[9px] text-white/70 font-medium capitalize mt-0.5" title={numberToWords(futureValue)}>{numberToWords(futureValue)}</p>
          </div>
        </div>

        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tickFormatter={(val) => `${val}y`} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis 
                tickFormatter={(val) => {
                  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return val;
                }} 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                width={40}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value, currency)}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="invested" name="Invested" stroke="#94a3b8" fillOpacity={1} fill="url(#colorInvested)" stackId="1" />
              <Area type="monotone" dataKey="returns" name="Returns" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorReturns)" stackId="1" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {useInflation && inflationRate > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inflation-Adjusted Real Value:</p>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(realValue, currency)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
