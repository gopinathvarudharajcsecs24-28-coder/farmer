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
    <header className="bg-emerald-950/95 backdrop-blur-md text-emerald-50 border-b border-emerald-800/60 py-4 px-4 sm:px-6 shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Branding */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 p-2.5 rounded-2xl shadow-md flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <Sprout className="w-5.5 h-5.5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-sans tracking-tight text-white flex items-center gap-2">
              FarmProfit <span className="text-amber-400 font-extrabold text-sm bg-emerald-900/80 px-2 py-0.5 rounded-lg border border-emerald-700/60 shadow-sm">AI</span>
            </h1>
            <p className="text-[11px] text-emerald-300 font-semibold tracking-wide">
              INTELLIGENT CROP MARKET PREDICTOR & SMART PROFIT ADVISOR
            </p>
          </div>
        </div>

        {/* User Stats & Language Selector */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs md:text-sm">
          {/* Active Farmer Indicator */}
          {userEmail && (
            <div className="flex items-center gap-2 bg-emerald-900/50 border border-emerald-800/60 px-3.5 py-2 rounded-xl text-emerald-200 hover:bg-emerald-900/80 transition-all duration-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-emerald-100 hidden sm:inline">{userEmail}</span>
              <span className="font-mono text-emerald-100 sm:hidden">Farmer Account</span>
            </div>
          )}

          {/* Local Session Time */}
          <div className="flex items-center gap-2 bg-emerald-900/50 border border-emerald-800/60 px-3.5 py-2 rounded-xl text-emerald-200 hover:bg-emerald-900/80 transition-all duration-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-medium">July 19, 2026</span>
          </div>

          {/* Multi-language selector */}
          <div className="flex items-center gap-2 bg-emerald-900/40 px-3 py-1.5 rounded-xl border border-emerald-800/60 focus-within:ring-2 focus-within:ring-emerald-500/50 hover:bg-emerald-900/60 transition-all duration-200">
            <Globe className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-emerald-100 text-xs font-bold focus:outline-none border-none cursor-pointer pr-1"
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
