import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "EUR", symbol: "€", locale: "de-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "AED", symbol: "د.إ", locale: "ar-AE" },
] as const;

export type Currency = typeof CURRENCIES[number];

export function formatCurrency(amount: number, currency: Currency): string {
  // Use Intl.NumberFormat for proper formatting based on locale and currency code
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0, // Keep it simple for large numbers
  }).format(amount);
}

const THOUSANDS = ["", "Thousand", "Million", "Billion", "Trillion"];
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

export function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  let words = "";
  
  function convertThreeDigits(n: number): string {
    let str = "";
    if (n > 99) {
      str += ONES[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += TENS[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += ONES[n] + " ";
    }
    return str.trim();
  }
  
  let i = 0;
  let numStr = Math.floor(num).toString();
  
  while (numStr.length > 0) {
    let chunkStr = numStr.slice(-3);
    numStr = numStr.slice(0, -3);
    let chunk = parseInt(chunkStr, 10);
    
    if (chunk > 0) {
      let chunkWords = convertThreeDigits(chunk);
      words = chunkWords + " " + THOUSANDS[i] + " " + words;
    }
    i++;
  }
  
  return words.trim();
}
