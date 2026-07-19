import React, { useState } from "react";
import Header from "./components/Header";
import CropSelector from "./components/CropSelector";
import PredictionDashboard from "./components/PredictionDashboard";
import VoiceAssistant from "./components/VoiceAssistant";
import { PredictionResult } from "./types";
import { 
  Sprout, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle,
  Award,
  AlertCircle
} from "lucide-react";

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of parameters used for prediction to pass down
  const [cropParams, setCropParams] = useState<{
    cropName: string;
    location: string;
    quantity: number;
    unit: 'Kg' | 'Quintal';
  }>({
    cropName: "Tomato",
    location: "Salem, Tamil Nadu",
    quantity: 10,
    unit: "Quintal"
  });

  const handleAnalyze = async (cropData: {
    cropId: string;
    cropName: string;
    location: string;
    quantity: number;
    unit: 'Kg' | 'Quintal';
    currentPrice: number;
  }) => {
    setIsLoading(true);
    setError(null);
    setCropParams({
      cropName: cropData.cropName,
      location: cropData.location,
      quantity: cropData.quantity,
      unit: cropData.unit
    });

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(cropData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate market prediction. Please verify your server status.");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during crop analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* App Header */}
      <Header 
        selectedLanguage={selectedLanguage} 
        onLanguageChange={setSelectedLanguage}
        userEmail="gopinathvarudharaj@gmail.com"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Banner Alert for Weather/Logistics on startup */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs sm:text-sm text-amber-800 font-medium">
          <div className="flex items-center gap-2.5">
            <span className="p-1 bg-amber-500/20 text-amber-700 rounded-lg">💡</span>
            <span>
              <strong>Tip:</strong> Crop prices are highly volatile. Compare holding expenses with forecasted rises in Salem, Nashik, and Guntur mandis before selling.
            </span>
          </div>
          <span className="hidden md:inline bg-amber-500/20 px-2.5 py-1 rounded text-[11px] font-bold">
            MARKET ALERT
          </span>
        </div>

        {/* Form Selection Stage */}
        <CropSelector onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-5 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Prediction Analysis Failed</h4>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
              <p className="text-xs text-red-700/80 mt-2 font-semibold">
                *Ensure your GEMINI_API_KEY is configured in the secrets menu, then tap Analyze to retry.
              </p>
            </div>
          </div>
        )}

        {/* Results / Interactive Dashboard Workspace */}
        {prediction ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Predictions, Bento Cards & Calculations (2/3 Grid) */}
            <div className="lg:col-span-2 space-y-8">
              <PredictionDashboard 
                prediction={prediction} 
                quantity={cropParams.quantity} 
                unit={cropParams.unit}
              />
            </div>

            {/* Multilingual Voice Assistant (1/3 Grid) */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <VoiceAssistant 
                currentCropName={cropParams.cropName} 
                currentLocation={cropParams.location}
              />
            </div>
          </div>
        ) : (
          /* Introduction Empty State */
          <div className="bg-white rounded-3xl border border-emerald-100/50 shadow-xl p-8 text-center max-w-3xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-800 shadow-inner">
              <Sprout className="w-10 h-10 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-emerald-950 font-sans tracking-tight">
                Empower Your Harvest with FarmProfit AI
              </h3>
              <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
                By combining real-time mandi prices, storage holding analytics, logistics, and weather intelligence, FarmProfit AI calculates when and where to sell to maximize your net pocket profit.
              </p>
            </div>

            {/* Three key pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left pt-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl w-10 h-10 flex items-center justify-center mb-3">
                  <Coins className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Profit Optimization</h4>
                <p className="text-[11px] text-slate-500 mt-1">Calculates actual pocket profit after labor, transport, and mandi commissions.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl w-10 h-10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">AI Price Curves</h4>
                <p className="text-[11px] text-slate-500 mt-1">Estimates 7-day volatility trends to advise if you should wait or sell today.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl w-10 h-10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Storage Matcher</h4>
                <p className="text-[11px] text-slate-500 mt-1">Locates nearby cold storage and estimates holding fees for the wait period.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              Trusted Market Intelligence & Local Price Grounding
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-400/80 text-xs text-center py-6 border-t border-emerald-900 mt-12 font-mono">
        <p>© 2026 FarmProfit AI. Dedicated to smart farming, rural development, and maximizing farmer yield value.</p>
        <p className="mt-1 text-emerald-500/60 text-[10px]">Server Engine Status: Active | Port: 3000 | UTC: 2026-07-19</p>
      </footer>
    </div>
  );
}
