import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar, 
  Map, 
  Phone, 
  CloudRain, 
  ShieldAlert, 
  CheckCircle, 
  DollarSign, 
  Layers, 
  ChevronRight, 
  Calculator,
  Info,
  Building,
  ArrowRight,
  Truck
} from "lucide-react";
import { PredictionResult, ExpenseDetails } from "../types";

interface PredictionDashboardProps {
  prediction: PredictionResult;
  quantity: number;
  unit: 'Kg' | 'Quintal';
}

export default function PredictionDashboard({ prediction, quantity, unit }: PredictionDashboardProps) {
  // Profit Calculator State
  const [calcQuantity, setCalcQuantity] = useState<number>(quantity);
  const [calcPrice, setCalcPrice] = useState<number>(prediction.predictions.today);
  const [expenses, setExpenses] = useState<ExpenseDetails>({
    transportCost: Math.round(quantity * 35),
    labourCost: Math.round(quantity * 20),
    packagingCost: Math.round(quantity * 15),
    commissionFee: Math.round((prediction.predictions.today * quantity) * 0.02), // 2% default commission
    quantity: quantity
  });

  // Keep calculator in sync when crop prediction changes
  useEffect(() => {
    setCalcQuantity(quantity);
    setCalcPrice(prediction.predictions.today);
    setExpenses({
      transportCost: Math.round(quantity * 35),
      labourCost: Math.round(quantity * 20),
      packagingCost: Math.round(quantity * 15),
      commissionFee: Math.round((prediction.predictions.today * quantity) * 0.02),
      quantity: quantity
    });
  }, [prediction, quantity]);

  // Expenses Calculations
  const totalExpenses = Number(expenses.transportCost) + Number(expenses.labourCost) + Number(expenses.packagingCost) + Number(expenses.commissionFee);
  const grossRevenue = calcQuantity * calcPrice;
  const netProfit = grossRevenue - totalExpenses;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Wait time calculation
  const getWaitDays = () => {
    switch (prediction.sellingRecommendation.action) {
      case "WAIT_2_DAYS": return 2;
      case "WAIT_1_WEEK": return 7;
      default: return 0;
    }
  };

  const waitDays = getWaitDays();

  // Price comparison
  const getExpectedFuturePrice = () => {
    switch (prediction.sellingRecommendation.action) {
      case "WAIT_2_DAYS": return prediction.predictions.day2;
      case "WAIT_1_WEEK": return prediction.predictions.week1;
      default: return prediction.predictions.today;
    }
  };

  const futurePrice = getExpectedFuturePrice();
  const futureGrossRevenue = calcQuantity * futurePrice;

  // Custom SVG Chart Dimensions & Computations
  const chartPoints = [
    { label: "Today", value: prediction.predictions.today },
    { label: "Day 2", value: prediction.predictions.day2 },
    { label: "Day 5", value: prediction.predictions.day5 },
    { label: "1 Week", value: prediction.predictions.week1 }
  ];

  const pricesOnly = chartPoints.map(p => p.value);
  const maxPrice = Math.max(...pricesOnly) * 1.05;
  const minPrice = Math.min(...pricesOnly) * 0.95;
  const priceRange = maxPrice - minPrice;

  // SVG dimensions
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Coordinates mapping
  const points = chartPoints.map((pt, index) => {
    const x = paddingLeft + (index / (chartPoints.length - 1)) * chartWidth;
    // Prevent divide by zero if priceRange is 0
    const ratio = priceRange > 0 ? (pt.value - minPrice) / priceRange : 0.5;
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return { x, y, ...pt };
  });

  // Construct curved SVG path (catmull-rom or simple bezier lines)
  const pathData = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    // Bezier control points
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, "");

  // Area path for gradient fill under line
  const areaPathData = `${pathData} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  return (
    <div className="space-y-8">
      {/* SECTION 1: AI Selling Day Predictor Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl text-emerald-50 shadow-xl overflow-hidden border border-emerald-800/80 relative">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-stretch gap-8 relative z-10">
          {/* Recommendation Action Column */}
          <div className="lg:w-2/5 flex flex-col justify-between">
            <div>
              <span className="bg-emerald-800/60 border border-emerald-700/60 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                AI Selling Recommendation
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-sans text-white mt-5 tracking-tight">
                {prediction.sellingRecommendation.action === "SELL_NOW" && "Sell Today!"}
                {prediction.sellingRecommendation.action === "WAIT_2_DAYS" && "Hold for 2 Days"}
                {prediction.sellingRecommendation.action === "WAIT_1_WEEK" && "Hold for 1 Week"}
              </h3>
              <p className="text-emerald-100/90 text-sm mt-4 leading-relaxed font-semibold">
                {prediction.sellingRecommendation.reason}
              </p>
            </div>

            {/* Quick stats badges */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-emerald-950/50 border border-emerald-800/80 p-4 rounded-2xl shadow-inner hover:border-emerald-700 transition-all duration-200">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Mandi Price Today</span>
                <p className="text-2xl font-extrabold font-mono text-amber-300 mt-1">₹{prediction.predictions.today}</p>
              </div>
              <div className="bg-emerald-950/50 border border-emerald-800/80 p-4 rounded-2xl shadow-inner hover:border-emerald-700 transition-all duration-200">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Max Expected</span>
                <p className="text-2xl font-extrabold font-mono text-emerald-300 mt-1">₹{Math.max(prediction.predictions.today, prediction.predictions.day2, prediction.predictions.day5, prediction.predictions.week1)}</p>
              </div>
            </div>
          </div>

          {/* Interactive Pricing Trend Chart Column */}
          <div className="lg:w-3/5 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-5 flex flex-col justify-between relative shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-sans text-emerald-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                AI Predicted Trend (₹ / {unit})
              </span>
              <span className="text-[10px] bg-emerald-800/80 border border-emerald-700/60 px-3 py-1 rounded-full text-emerald-100 font-bold uppercase tracking-wider">
                7-Day Window
              </span>
            </div>

            {/* SVG custom line chart */}
            <div className="relative w-full h-[180px] bg-emerald-950/80 rounded-xl overflow-hidden p-1.5 border border-emerald-900/80 shadow-inner">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono text-[10px] fill-emerald-300 select-none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.33, 0.66, 1].map((ratio, i) => {
                  const y = paddingTop + ratio * chartHeight;
                  const priceLabel = Math.round(maxPrice - ratio * priceRange);
                  return (
                    <g key={i} className="opacity-15">
                      <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#34d399" strokeWidth="1" strokeDasharray="3" />
                      <text x={10} y={y + 3} className="fill-emerald-400 font-bold">{priceLabel}</text>
                    </g>
                  );
                })}

                {/* Fill Area */}
                <path d={areaPathData} fill="url(#areaGrad)" />

                {/* Smooth Curve Line */}
                <path d={pathData} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

                {/* Data Points */}
                {points.map((pt, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#34d399" stroke="#064e3b" strokeWidth="2.5" className="transition-all duration-200 group-hover:r-7" />
                    <text x={pt.x} y={pt.y - 12} textAnchor="middle" className="fill-white font-extrabold text-[10px] font-mono filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      ₹{pt.value}
                    </text>
                    <text x={pt.x} y={paddingTop + chartHeight + 16} textAnchor="middle" className="fill-emerald-300 text-[10px] font-bold">
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            
            <div className="text-center text-[10px] text-emerald-400/90 font-semibold tracking-wide mt-3.5 italic">
              *Predictions powered by AgriSmart's AI Engine modeling recent mandi prices and seasonal supply/demand factors.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Bento Grid for Market Indicators & Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demand Forecast */}
        <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-md p-6 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 rounded-xl text-emerald-700 text-sm">📈</span>
                AI Crop Demand Forecast
              </h4>
              <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${
                prediction.demandForecast.level === "High" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : prediction.demandForecast.level === "Medium"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {prediction.demandForecast.level} Demand
              </span>
            </div>

            <div className="flex items-center gap-4 mt-5 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                {prediction.demandForecast.trend === "Rising" && <TrendingUp className="w-8 h-8 text-emerald-600 animate-bounce" />}
                {prediction.demandForecast.trend === "Stable" && <Minus className="w-8 h-8 text-amber-500" />}
                {prediction.demandForecast.trend === "Declining" && <TrendingDown className="w-8 h-8 text-red-500 animate-pulse" />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demand Trend Direction</p>
                <p className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  {prediction.demandForecast.trend} Trend
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-5 leading-relaxed bg-emerald-50/20 border border-emerald-100/30 p-4 rounded-2xl font-medium">
              {prediction.demandForecast.reason}
            </p>
          </div>
        </div>

        {/* Weather & Transport Logistics Impact */}
        <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-md p-6 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-widest flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 rounded-xl text-amber-700 text-sm">⛈️</span>
                Weather Impact & Logistics
              </h4>
              <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${
                prediction.weatherImpact.status === "good" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : prediction.weatherImpact.status === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {prediction.weatherImpact.status.toUpperCase()}
              </span>
            </div>

            {/* Severity Indicator Warning Card */}
            <div className={`mt-5 p-4 rounded-2xl border flex items-start gap-3.5 ${
              prediction.weatherImpact.status === "severe"
                ? "bg-red-50/60 border-red-100 text-red-950"
                : prediction.weatherImpact.status === "warning"
                ? "bg-amber-50/60 border-amber-100 text-amber-950"
                : "bg-emerald-50/60 border-emerald-100 text-emerald-950"
            }`}>
              <div className="p-2.5 bg-white rounded-xl shadow-sm mt-0.5 border border-inherit">
                {prediction.weatherImpact.status === "severe" ? (
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                ) : prediction.weatherImpact.status === "warning" ? (
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="font-extrabold text-sm tracking-tight">{prediction.weatherImpact.alert}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">{prediction.weatherImpact.details}</p>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4 text-emerald-700" />
                Transport Status Risk
              </span>
              <span className={`text-xs font-extrabold ${
                prediction.weatherImpact.status === "severe" ? "text-red-600" : "text-emerald-700"
              }`}>
                {prediction.weatherImpact.status === "severe" ? "High Spoilage & Road Delays" : "Safe Transport Clearances"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Dynamic Profit After Expenses Calculator */}
      <div className="bg-gradient-to-br from-emerald-50/30 to-slate-50/40 rounded-3xl border border-emerald-100/80 shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-emerald-100/50">
          <div>
            <h3 className="text-lg font-extrabold font-sans text-emerald-950 tracking-tight flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-100 rounded-xl text-emerald-800 text-sm">🧮</span>
              Interactive Farm Profit Calculator
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Tweak and calculate real net profit margins after subtracting transport, packaging, labor, and commission expenses.
            </p>
          </div>
          <span className="text-xs bg-emerald-800/10 text-emerald-800 font-bold px-3.5 py-1.5 rounded-full border border-emerald-800/20 shadow-sm self-start sm:self-auto">
            Unit: per {unit}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Panel */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest border-b border-emerald-100/60 pb-1.5 mb-2">
              Tweak Cost Variables
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Crop Quantity
                </label>
                <input
                  type="number"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Transport Cost (₹)
                </label>
                <input
                  type="number"
                  value={expenses.transportCost}
                  onChange={(e) => setExpenses({ ...expenses, transportCost: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Labour Cost (₹)
                </label>
                <input
                  type="number"
                  value={expenses.labourCost}
                  onChange={(e) => setExpenses({ ...expenses, labourCost: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Packaging Cost (₹)
                </label>
                <input
                  type="number"
                  value={expenses.packagingCost}
                  onChange={(e) => setExpenses({ ...expenses, packagingCost: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Commission Fees (₹)
                </label>
                <input
                  type="number"
                  value={expenses.commissionFee}
                  onChange={(e) => setExpenses({ ...expenses, commissionFee: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Outputs/Visual Panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm flex flex-col justify-between">
            {/* Breakdowns */}
            <div>
              <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                Profit Calculation Breakdowns
              </h4>

              <div className="grid grid-cols-3 gap-3.5 text-center mb-6">
                <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">Gross Revenue</span>
                  <span className="text-base sm:text-lg font-extrabold font-mono text-slate-800 block mt-1">₹{grossRevenue.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">Expenses</span>
                  <span className="text-base sm:text-lg font-extrabold font-mono text-red-600 block mt-1">-₹{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-800 block uppercase tracking-wide">Net Profit</span>
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-700 block mt-1">₹{netProfit.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Net Profit Margin</span>
                  <span className="font-mono text-emerald-700 font-extrabold">{profitMargin.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50">
                  <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, profitMargin))}%` }} />
                  <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, 100 - profitMargin))}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold tracking-wider">
                  <span>NET GAIN</span>
                  <span>TOTAL COST</span>
                </div>
              </div>
            </div>

            {/* Smart Comparison Recommendation if holding is better */}
            {waitDays > 0 && (
              <div className="bg-amber-50/80 border border-amber-200/60 p-4 rounded-2xl flex items-start gap-3.5 mt-2">
                <div className="bg-white p-2.5 rounded-xl text-amber-600 shadow-sm mt-0.5 border border-amber-100">
                  <Info className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                    Hold vs. Sell Intelligence Comparison
                  </h5>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed font-semibold">
                    If you wait <strong className="text-amber-950 font-black">{waitDays} days</strong>, prices are predicted to reach <strong className="font-mono font-extrabold text-emerald-800">₹{futurePrice}</strong>. 
                    This could raise your gross revenue to <strong className="font-mono text-emerald-800 font-bold">₹{futureGrossRevenue.toLocaleString()}</strong>, yielding an extra <strong className="font-mono text-emerald-800 font-extrabold">₹{(futureGrossRevenue - grossRevenue).toLocaleString()}</strong> in gross revenues before storage costs are applied.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: AI Recommended Buyers */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold font-sans text-emerald-950 tracking-tight flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-50 rounded-xl text-emerald-700 text-sm">🛒</span>
              AI Recommended Local Buyers & Mandis
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Verified buyers, mills, and mandi brokers offering optimal rates for your crop.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prediction.buyers.map((buyer, idx) => (
            <div key={idx} className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:border-emerald-300/80 hover:bg-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                    buyer.buyerType === "exporter" 
                      ? "bg-purple-50 border-purple-200 text-purple-700" 
                      : buyer.buyerType === "processor"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : buyer.buyerType === "wholesaler"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}>
                    {buyer.buyerType}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 font-mono flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-100">
                    ₹{buyer.pricePerUnit} / {unit}
                  </span>
                </div>

                <h4 className="font-extrabold text-emerald-950 text-sm tracking-tight leading-snug">{buyer.buyerName}</h4>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{buyer.name}</p>

                <div className="grid grid-cols-2 gap-2 mt-4.5 text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1 font-bold">
                    <Map className="w-3.5 h-3.5 text-emerald-600" />
                    {buyer.distance} km
                  </div>
                  <div className="flex items-center gap-1 font-mono text-slate-600 font-bold">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {buyer.contact.split(" ")[1] || buyer.contact}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2.5">
                <a
                  href={`tel:${buyer.contact}`}
                  className="flex-1 bg-white hover:bg-slate-50 text-emerald-950 font-bold text-center text-xs py-2.5 px-3 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Call
                </a>
                <a
                  href={`sms:${buyer.contact}?body=Hello, I have ${quantity} ${unit} of high quality ${prediction.cropName}. Are you interested?`}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-emerald-50 font-bold text-center text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  Send Offer
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: Cold Storage Finder & Automated Cost Estimation */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-base font-extrabold font-sans text-emerald-950 tracking-tight flex items-center gap-2.5">
            <span className="p-1.5 bg-emerald-50 rounded-xl text-emerald-700 text-sm">🏢</span>
            Nearby Cold Storage & Hold Cost Estimator
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Estimated storage costs calculated dynamically for the suggested {waitDays > 0 ? `${waitDays}-day` : "wait"} duration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {prediction.storageOptions.map((facility, idx) => {
            // Calculate storage cost based on wait period
            const rate = facility.ratePerDay;
            const period = waitDays > 0 ? waitDays : 1; // Default to 1 day if immediate sale
            const estimatedCost = rate * quantity * period;

            return (
              <div key={idx} className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:border-emerald-300/80 hover:bg-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="text-sm font-extrabold text-emerald-950 leading-tight">{facility.name}</span>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                      facility.status === "Available" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}>
                      {facility.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 mb-4.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Distance</span>
                      <strong className="text-slate-800 block mt-0.5 font-bold">{facility.distance} km</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Capacity</span>
                      <strong className="text-slate-800 block mt-0.5 font-bold">{facility.capacity}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Storage Rate</span>
                      <strong className="text-slate-800 font-mono block mt-0.5 font-bold">₹{rate}/{unit}/day</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Contact</span>
                      <strong className="text-slate-800 font-mono block mt-0.5 font-bold">{facility.contact}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100/60 p-4 rounded-xl flex items-center justify-between text-xs shadow-sm">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-extrabold block uppercase tracking-wide">Est. Storage Cost ({period} Days)</span>
                    <span className="text-base font-black font-mono text-emerald-950 mt-0.5 block">₹{estimatedCost.toLocaleString()}</span>
                  </div>
                  <a
                    href={`tel:${facility.contact}`}
                    className="bg-emerald-800 hover:bg-emerald-900 text-emerald-50 text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" /> Book Space
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
