import React from 'react';
import { cn } from '../utils';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  symbol?: string;
  suffix?: string;
  colorTheme?: 'teal' | 'cyan' | 'emerald';
}

export function SliderInput({ label, value, onChange, min, max, step = 1, symbol, suffix, colorTheme = 'teal' }: SliderInputProps) {
  const [localValue, setLocalValue] = React.useState(value.toString());

  React.useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setLocalValue(valStr);
    
    let val = parseFloat(valStr);
    if (!isNaN(val)) {
      if (val > max) val = max;
      if (val < min) val = min;
      onChange(val);
    }
  };

  const handleBlur = () => {
    let val = parseFloat(localValue);
    if (isNaN(val)) val = min;
    if (val > max) val = max;
    if (val < min) val = min;
    setLocalValue(val.toString());
    onChange(val);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const accentColor = colorTheme === 'teal' ? 'accent-teal-600' : colorTheme === 'cyan' ? 'accent-cyan-500' : 'accent-emerald-600';
  const borderColor = colorTheme === 'teal' ? 'border-teal-200 focus:border-teal-600 dark:border-teal-800 dark:focus:border-teal-400' : 
                      colorTheme === 'cyan' ? 'border-cyan-200 focus:border-cyan-600 dark:border-cyan-800 dark:focus:border-cyan-400' : 
                      'border-emerald-200 focus:border-emerald-600 dark:border-emerald-800 dark:focus:border-emerald-400';

  return (
    <div className="flex flex-col space-y-2 mb-6">
      <div className="flex justify-between items-center">
        {label && <label className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-tight">{label}</label>}
        <div className="relative flex items-center">
          {symbol && (
            <span className="absolute left-1 text-slate-500 font-bold text-lg">
              {symbol}
            </span>
          )}
          <input
            type="number"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={cn(
              "w-56 text-right border-b-2 bg-transparent outline-none font-bold text-slate-800 dark:text-white text-lg transition-colors",
              borderColor,
              symbol ? "pl-6" : "",
              suffix ? "pr-10" : ""
            )}
            min={min}
            max={max}
            step={step}
          />
          {suffix && (
            <span className="absolute right-1 text-slate-500 font-bold text-lg">
              {suffix}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className={cn("w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer", accentColor)}
      />
      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
        <span>{symbol}{Intl.NumberFormat('en-US', { notation: 'compact' }).format(min)}</span>
        <span>{symbol}{Intl.NumberFormat('en-US', { notation: 'compact' }).format(max)}</span>
      </div>
    </div>
  );
}
