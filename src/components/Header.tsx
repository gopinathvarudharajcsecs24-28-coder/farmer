import React from "react";
import { Sprout, Globe, User, Clock } from "lucide-react";
import { LANGUAGES } from "../data";

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  userEmail?: string;
}

export default function Header({ selectedLanguage, onLanguageChange, userEmail }: HeaderProps) {
  return (
    <header className="bg-emerald-950 text-emerald-50 border-b border-emerald-800/40 py-4 px-4 sm:px-6 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-emerald-950 p-2 rounded-xl shadow-inner flex items-center justify-center animate-pulse">
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
              FarmProfit <span className="text-amber-400 font-extrabold text-lg bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">AI</span>
            </h1>
            <p className="text-xs text-emerald-300 font-medium">
              Intelligent Crop Market Predictor & Smart Profit Advisor
            </p>
          </div>
        </div>

        {/* User Stats & Language Selector */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs md:text-sm">
          {/* Active Farmer Indicator */}
          {userEmail && (
            <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-800 px-3 py-1.5 rounded-lg text-emerald-200">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-emerald-100 hidden sm:inline">{userEmail}</span>
              <span className="font-mono text-emerald-100 sm:hidden">Farmer Account</span>
            </div>
          )}

          {/* Local Session Time */}
          <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-800 px-3 py-1.5 rounded-lg text-emerald-200">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">July 19, 2026</span>
          </div>

          {/* Multi-language selector */}
          <div className="flex items-center gap-2 bg-emerald-900/40 px-3 py-1 rounded-lg border border-emerald-800">
            <Globe className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-emerald-100 text-xs font-semibold focus:outline-none border-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-emerald-950 text-emerald-100">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
