import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SliderInput } from './SliderInput';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency, cn, numberToWords } from '../utils';

type TenureUnit = 'years' | 'months' | 'days';

export function EmiCalculator() {
  const { currency } = useSettings();
  const [principal, setPrincipal] = useState<number>(5000000);
  const [rate, setRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>('years');
  
  // Extra feature: Prepayment
  const [monthlyPrepayment, setMonthlyPrepayment] = useState<number>(0);

  const calculateEMI = () => {
    let months = tenure;
    if (tenureUnit === 'years') months = tenure * 12;
    if (tenureUnit === 'days') months = tenure / 30.416; // approximate

    const monthlyRate = rate / 12 / 100;
    
    if (monthlyRate === 0) {
      const emi = principal / (months || 1);
      return { emi, totalInterest: 0, totalPayment: principal, newTenureMonths: months, interestSaved: 0 };
    }

    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    
    // Calculate with prepayment
    let balance = principal;
    let actualMonths = 0;
    let actualTotalInterest = 0;
    
    while (balance > 0 && actualMonths < 1200) { // arbitrary cap to prevent infinite loops
      const interestForMonth = balance * monthlyRate;
      actualTotalInterest += interestForMonth;
      
      const principalPayment = (emi + monthlyPrepayment) - interestForMonth;
      
      if (principalPayment <= 0 && monthlyPrepayment === 0) {
        break;
      }
      
      balance -= principalPayment;
      actualMonths++;
    }

    const standardTotalPayment = emi * months;
    const standardTotalInterest = standardTotalPayment - principal;
    
    const actualTotalPayment = principal + actualTotalInterest;
    const interestSaved = Math.max(0, standardTotalInterest - actualTotalInterest);
    const monthsSaved = Math.max(0, Math.round(months - actualMonths));

    return { 
      emi, 
      totalInterest: actualTotalInterest, 
      totalPayment: actualTotalPayment,
      actualMonths,
      interestSaved,
      monthsSaved
    };
  };

  const { emi, totalInterest, totalPayment, interestSaved, monthsSaved } = calculateEMI();

  const chartData = [
    { name: 'Principal', value: principal, color: '#ccfbf1' }, // teal-100
    { name: 'Interest', value: totalInterest, color: '#0d9488' } // teal-600
  ];

  const interestPercentage = totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0;

  return (
    <section className="flex-1 flex flex-col md:flex-row bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden h-full">
      {/* Inputs Section */}
      <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 rounded-md">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path></svg>
            </span>
            EMI Calculator
          </h2>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <SliderInput 
            label="Loan Amount"
            value={principal}
            onChange={setPrincipal}
            min={0}
            max={1000000000000} 
            step={10000}
            symbol={currency.symbol}
            colorTheme="teal"
          />

          <SliderInput 
            label="Interest Rate (%)"
            value={rate}
            onChange={setRate}
            min={0}
            max={100}
            step={0.1}
            suffix="%"
            colorTheme="teal"
          />

          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-tight">Loan Tenure</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={tenure || ''} 
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-20 text-center border-b-2 border-teal-200 focus:border-teal-600 outline-none font-bold text-slate-800 dark:text-white dark:bg-slate-800 text-lg transition-colors" 
                />
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-md p-0.5">
                  <button 
                    className={cn("px-2 py-0.5 text-[10px] font-bold rounded", tenureUnit === 'years' ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-400")}
                    onClick={() => { setTenureUnit('years'); setTenure(20); }}
                  >YRS</button>
                  <button 
                    className={cn("px-2 py-0.5 text-[10px] font-bold rounded", tenureUnit === 'months' ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-400")}
                    onClick={() => { setTenureUnit('months'); setTenure(240); }}
                  >MO</button>
                  <button 
                    className={cn("px-2 py-0.5 text-[10px] font-bold rounded", tenureUnit === 'days' ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-400")}
                    onClick={() => { setTenureUnit('days'); setTenure(7300); }}
                  >DY</button>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={tenureUnit === 'years' ? 50 : tenureUnit === 'months' ? 600 : 18250}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>
          
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold mb-4 text-slate-800 dark:text-slate-200 uppercase tracking-tight flex items-center gap-2">
              <span className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-[9px] px-2 py-0.5 rounded-sm">Simulator</span>
              Extra Monthly Payment
            </h3>
            <SliderInput 
              label=""
              value={monthlyPrepayment}
              onChange={setMonthlyPrepayment}
              min={0}
              max={1000000000000}
              step={1000}
              symbol={currency.symbol}
              colorTheme="teal"
            />
          </div>

        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 flex flex-col p-6 bg-slate-50/30 dark:bg-slate-800/30">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex flex-col justify-between">
            <div>
              <p className="text-[10px] text-teal-500 font-bold uppercase tracking-wider mb-1">Monthly EMI</p>
              <p className="text-2xl font-black text-teal-900 dark:text-teal-300 break-words" title={formatCurrency(emi, currency)}>{formatCurrency(emi, currency)}</p>
              <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70 font-medium capitalize mt-0.5" title={numberToWords(emi)}>
                {numberToWords(emi)}
              </p>
            </div>
            {monthlyPrepayment > 0 && (
              <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-2 font-bold pt-2 border-t border-teal-200 dark:border-teal-800">
                Total Output: {formatCurrency(emi + monthlyPrepayment, currency)}/mo
              </p>
            )}
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col justify-start">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Payment</p>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 break-words" title={formatCurrency(totalPayment, currency)}>{formatCurrency(totalPayment, currency)}</p>
            <p className="text-[10px] text-slate-500/70 dark:text-slate-400/70 font-medium capitalize mt-0.5" title={numberToWords(totalPayment)}>
              {numberToWords(totalPayment)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-bold">INTEREST</span>
              <span className="text-sm font-black text-slate-800 dark:text-white">{interestPercentage}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-600"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Interest: <b className="text-slate-800 dark:text-slate-200">{formatCurrency(totalInterest, currency)}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-100 dark:bg-teal-900/50"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Principal: <b className="text-slate-800 dark:text-slate-200">{formatCurrency(principal, currency)}</b></span>
            </div>
          </div>
        </div>

        {monthlyPrepayment > 0 && (
          <div className="mt-auto bg-teal-50 dark:bg-teal-900/10 p-4 rounded-xl border border-teal-100 dark:border-teal-800">
            <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 mb-2 uppercase tracking-tight">Early Payoff Analysis</h4>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">Interest Saved:</span>
              <span className="font-bold text-teal-800 dark:text-teal-300">{formatCurrency(interestSaved, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">Tenure Reduced By:</span>
              <span className="text-sm font-bold text-teal-800 dark:text-teal-300">{monthsSaved} months</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
