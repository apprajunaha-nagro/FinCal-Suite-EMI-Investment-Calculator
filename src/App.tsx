/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import { Header } from './components/Header';
import { EmiCalculator } from './components/EmiCalculator';
import { InvestmentCalculator } from './components/InvestmentCalculator';
import { cn } from './utils';
import { Calculator, TrendingUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'EMI' | 'INVESTMENT'>('EMI');

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
        <Header />
        
        <main className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
          <div className="flex justify-center shrink-0">
            <div className="inline-flex bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-full shadow-inner border border-slate-300/50 dark:border-slate-700/50 backdrop-blur-sm relative">
              <button
                onClick={() => setActiveTab('EMI')}
                className={cn(
                  "relative z-10 flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ease-out",
                  activeTab === 'EMI' 
                    ? "bg-gradient-to-br from-teal-500 to-teal-700 shadow-md text-white shadow-teal-500/20" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                )}
              >
                <Calculator className={cn("w-4 h-4 transition-transform duration-300", activeTab === 'EMI' ? "scale-110" : "")} />
                EMI Calculator
              </button>
              <button
                onClick={() => setActiveTab('INVESTMENT')}
                className={cn(
                  "relative z-10 flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ease-out",
                  activeTab === 'INVESTMENT' 
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-md text-white shadow-cyan-500/20" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                )}
              >
                <TrendingUp className={cn("w-4 h-4 transition-transform duration-300", activeTab === 'INVESTMENT' ? "scale-110" : "")} />
                Investment Calculator
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex justify-center pb-12">
            <div className="w-full max-w-5xl h-full flex flex-col">
              {activeTab === 'EMI' ? <EmiCalculator /> : <InvestmentCalculator />}
            </div>
          </div>
        </main>
      </div>
    </SettingsProvider>
  );
}

