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
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-5 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-sans text-emerald-950 tracking-tight flex items-center gap-2">
          <span className="p-1.5 bg-emerald-50 rounded-xl text-emerald-800">🌱</span>
          1. Select Crop & Input Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Select a preset crop below or define your custom crop to analyze local mandi trends.
        </p>
      </div>

      {/* Preset Crops Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {DEFAULT_CROPS.map((crop) => {
          const isSelected = selectedPresetId === crop.id;
          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => handleSelectPreset(crop)}
              className={`p-3.5 rounded-2xl border transition-all text-left relative flex flex-col justify-between h-24 ${
                isSelected 
                  ? "bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500/50" 
                  : "bg-slate-50/60 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10"
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100/50">
                  {getCropIcon(crop.icon)}
                </div>
                {isSelected && (
                  <span className="p-1 bg-emerald-600 rounded-full text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{crop.category}</p>
                <p className="text-sm font-bold text-emerald-950 leading-tight mt-0.5">{crop.name}</p>
              </div>
            </button>
          );
        })}

        {/* Custom Crop Button */}
        <button
          type="button"
          onClick={handleCustomCropToggle}
          className={`p-3.5 rounded-2xl border transition-all text-left relative flex flex-col justify-between h-24 ${
            selectedPresetId === "custom" 
              ? "bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500/50" 
              : "bg-slate-50/60 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10"
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100/50 text-emerald-700">
              <Search className="w-5 h-5" />
            </div>
            {selectedPresetId === "custom" && (
              <span className="p-1 bg-emerald-600 rounded-full text-white">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Other Crop</p>
            <p className="text-sm font-bold text-emerald-950 leading-tight mt-0.5">Custom...</p>
          </div>
        </button>
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Crop Name */}
          <div>
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
              Crop Name
            </label>
            <input
              type="text"
              required
              disabled={!customActive && selectedPresetId !== "custom"}
              placeholder="e.g. Cardamom, Ginger, Soybean"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-emerald-950 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Your Market/Mandi Location</span>
              <span className="text-[10px] text-slate-400 font-normal normal-case">City, State</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-emerald-600">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Salem, Tamil Nadu"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-emerald-950 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
            {/* Quick Location Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className="text-[10px] font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70 transition-colors px-2.5 py-1 rounded-full border border-emerald-100/50"
                >
                  {loc.split(",")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Quantity
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-emerald-950 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Unit selection */}
          <div>
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
              Weight Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'Kg' | 'Quintal')}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-emerald-950 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
            >
              <option value="Quintal">Quintal (100 Kg)</option>
              <option value="Kg">Kilogram (Kg)</option>
            </select>
          </div>

          {/* Estimated current price */}
          <div>
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              Est. Current Price (₹/{unit})
            </label>
            <input
              type="number"
              required
              min="1"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-emerald-950 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading || !cropName.trim()}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-emerald-50 font-bold font-sans py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-emerald-900/10 border-b-4 border-emerald-950 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none text-center text-sm tracking-wide"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Gathering Real-Time Mandi Pricing & AI Insights...
              </span>
            ) : (
              "🔮 Predict Market Prices & Calculate Best Selling Day"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
