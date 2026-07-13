import React, { useState, useRef, useEffect } from 'react';
import { Settings, Moon, Sun, ChevronDown } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { CURRENCIES, Currency } from '../utils';

export function Header() {
  const { isDarkMode, toggleDarkMode, currency, setCurrency } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">FinCalc<span className="text-teal-600">Suite</span></span>
      </div>

      <div className="flex items-center gap-6">
        {/* Currency Selector */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-full px-3 py-1 relative" ref={dropdownRef}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Currency</span>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-1 bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            {currency.code} ({currency.symbol})
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isSettingsOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50 overflow-hidden">
              {CURRENCIES.map((c: Currency) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c);
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                    currency.code === c.code ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  {c.code} ({c.symbol})
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l dark:border-slate-700 pl-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
