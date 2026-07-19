import React, { useState } from "react";
import { 
  MapPin, 
  Scale, 
  Coins, 
  Layers, 
  CircleDot, 
  Wheat, 
  Sprout, 
  Sparkles, 
  Flame, 
  Leaf, 
  Apple, 
  Citrus, 
  Search,
  Check
} from "lucide-react";
import { DEFAULT_CROPS, POPULAR_LOCATIONS } from "../data";
import { Crop } from "../types";

interface CropSelectorProps {
  onAnalyze: (cropData: {
    cropId: string;
    cropName: string;
    location: string;
    quantity: number;
    unit: 'Kg' | 'Quintal';
    currentPrice: number;
  }) => void;
  isLoading: boolean;
}

// Map crop icons to React Lucide elements safely
const getCropIcon = (iconName: string) => {
  switch (iconName) {
    case "Tomato":
      return <span className="text-2xl">🍅</span>; // Use direct elegant emoji for tomato for flawless rendering!
    case "Layers":
      return <Layers className="w-5 h-5 text-amber-600" />;
    case "CircleDot":
      return <CircleDot className="w-5 h-5 text-yellow-700" />;
    case "Wheat":
      return <Wheat className="w-5 h-5 text-amber-500" />;
    case "Sprout":
      return <Sprout className="w-5 h-5 text-emerald-600" />;
    case "Sparkles":
      return <Sparkles className="w-5 h-5 text-yellow-500" />;
    case "Flame":
      return <Flame className="w-5 h-5 text-orange-500" />;
    case "Leaf":
      return <Leaf className="w-5 h-5 text-emerald-500" />;
    case "Apple":
      return <Apple className="w-5 h-5 text-red-500" />;
    case "Citrus":
      return <Citrus className="w-5 h-5 text-yellow-500" />;
    default:
      return <Sprout className="w-5 h-5 text-emerald-600" />;
  }
};

export default function CropSelector({ onAnalyze, isLoading }: CropSelectorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("tomato");
  const [cropName, setCropName] = useState<string>("Tomato");
  const [location, setLocation] = useState<string>("Salem, Tamil Nadu");
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState<'Kg' | 'Quintal'>("Quintal");
  const [currentPrice, setCurrentPrice] = useState<number>(1800);
  const [customActive, setCustomActive] = useState<boolean>(false);

  const handleSelectPreset = (crop: Crop) => {
    setSelectedPresetId(crop.id);
    setCropName(crop.name);
    setUnit(crop.unit);
    setCurrentPrice(crop.basePrice);
    setCustomActive(false);
  };

  const handleCustomCropToggle = () => {
    setSelectedPresetId("custom");
    setCropName("");
    setCurrentPrice(1000);
    setCustomActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;
    onAnalyze({
      cropId: selectedPresetId,
      cropName,
      location,
      quantity,
      unit,
      currentPrice,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-emerald-950/5 transition-all duration-300">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold font-sans text-emerald-950 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-2xl shadow-sm text-lg">🌱</span>
            1. Select Crop & Input Details
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pick a crop below or search custom crop varieties to run instant price intelligence.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-auto">
          <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-800 font-mono uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">7 Mandis Connected</span>
        </div>
      </div>

      {/* Preset Crops Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-6">
        {DEFAULT_CROPS.map((crop) => {
          const isSelected = selectedPresetId === crop.id;
          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => handleSelectPreset(crop)}
              className={`p-4 rounded-2xl border transition-all duration-300 text-left relative flex flex-col justify-between h-28 transform active:scale-95 ${
                isSelected 
                  ? "bg-gradient-to-br from-emerald-50/90 to-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 translate-y-[-2px]" 
                  : "bg-slate-50/40 border-slate-100 hover:border-emerald-300/60 hover:bg-emerald-50/5 hover:translate-y-[-1px]"
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <div className={`p-2.5 rounded-xl shadow-sm border transition-all ${
                  isSelected ? "bg-white border-emerald-200" : "bg-white border-slate-100"
                }`}>
                  {getCropIcon(crop.icon)}
                </div>
                {isSelected && (
                  <span className="p-1 bg-emerald-600 rounded-full text-white shadow-sm ring-2 ring-white">
                    <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                  </span>
                )}
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? "text-emerald-700" : "text-slate-400"
                }`}>{crop.category}</p>
                <p className="text-sm font-extrabold text-emerald-950 leading-tight mt-0.5">{crop.name}</p>
              </div>
            </button>
          );
        })}

        {/* Custom Crop Button */}
        <button
          type="button"
          onClick={handleCustomCropToggle}
          className={`p-4 rounded-2xl border transition-all duration-300 text-left relative flex flex-col justify-between h-28 transform active:scale-95 ${
            selectedPresetId === "custom" 
              ? "bg-gradient-to-br from-emerald-50/90 to-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 translate-y-[-2px]" 
              : "bg-slate-50/40 border-slate-100 hover:border-emerald-300/60 hover:bg-emerald-50/5 hover:translate-y-[-1px]"
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <div className={`p-2.5 rounded-xl shadow-sm border transition-all ${
              selectedPresetId === "custom" ? "bg-white border-emerald-200" : "bg-white border-slate-100"
            } text-emerald-700`}>
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            {selectedPresetId === "custom" && (
              <span className="p-1 bg-emerald-600 rounded-full text-white shadow-sm ring-2 ring-white">
                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
              </span>
            )}
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${
              selectedPresetId === "custom" ? "text-emerald-700" : "text-slate-400"
            }`}>Other Variety</p>
            <p className="text-sm font-extrabold text-emerald-950 leading-tight mt-0.5">Custom Crop...</p>
          </div>
        </button>
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crop Name */}
          <div>
            <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-2">
              Crop Name
            </label>
            <input
              type="text"
              required
              disabled={!customActive && selectedPresetId !== "custom"}
              placeholder="e.g. Cardamom, Ginger, Soybean, Mustard"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-emerald-950 text-sm font-semibold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:outline-none transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Your Market/Mandi Location</span>
              <span className="text-[10px] text-slate-400 font-bold tracking-normal uppercase">City, State</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-emerald-600">
                <MapPin className="w-4.5 h-4.5 stroke-[2.5]" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Salem, Tamil Nadu"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-emerald-950 text-sm font-semibold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:outline-none transition-all duration-200"
              />
            </div>
            {/* Quick Location Suggestions */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {POPULAR_LOCATIONS.slice(0, 5).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className="text-[10px] font-extrabold bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 transition-all duration-200 px-3 py-1.5 rounded-xl border border-emerald-100/40 shadow-sm"
                >
                  📍 {loc.split(",")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              Quantity
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-emerald-950 text-sm font-extrabold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Unit selection */}
          <div>
            <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-2">
              Weight Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'Kg' | 'Quintal')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-emerald-950 text-sm font-extrabold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="Quintal">Quintal (100 Kg)</option>
              <option value="Kg">Kilogram (Kg)</option>
            </select>
          </div>

          {/* Estimated current price */}
          <div>
            <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              Est. Current Price (₹/{unit})
            </label>
            <input
              type="number"
              required
              min="1"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-emerald-950 text-sm font-extrabold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !cropName.trim()}
            className="w-full bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-emerald-50 font-extrabold font-sans py-4.5 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-emerald-900/20 active:translate-y-0.5 transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none text-center text-sm tracking-wider flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg className="animate-spin h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Gathering Real-Time Mandi Pricing & AI Insights...
              </span>
            ) : (
              <>
                <span>🔮</span>
                <span>Predict Market Prices & Calculate Best Selling Day</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
