export type BuyerType = 'wholesaler' | 'retail' | 'processor' | 'exporter';

export interface Crop {
  id: string;
  name: string;
  category: 'vegetable' | 'fruit' | 'grain' | 'spice';
  icon: string;
  basePrice: number; // in ₹ per Quintal or Kg
  unit: 'Kg' | 'Quintal';
  currentDemand: 'High' | 'Medium' | 'Low';
}

export interface ExpenseDetails {
  transportCost: number;
  labourCost: number;
  packagingCost: number;
  commissionFee: number;
  quantity: number; // in unit
}

export interface MarketInfo {
  name: string;
  distance: number; // km
  buyerType: BuyerType;
  buyerName: string;
  contact: string;
  pricePerUnit: number;
}

export interface ColdStorage {
  name: string;
  distance: number; // km
  ratePerDay: number; // ₹/Kg/day or ₹/Quintal/day
  capacity: string;
  contact: string;
  status: 'Available' | 'Filling Fast' | 'Full';
}

export interface PredictionResult {
  cropId: string;
  cropName: string;
  currentPrice: number;
  predictions: {
    today: number;
    day2: number;
    day5: number;
    week1: number;
  };
  sellingRecommendation: {
    action: 'SELL_NOW' | 'WAIT_2_DAYS' | 'WAIT_1_WEEK';
    reason: string;
  };
  demandForecast: {
    level: 'High' | 'Medium' | 'Low';
    trend: 'Rising' | 'Stable' | 'Declining';
    reason: string;
  };
  buyers: MarketInfo[];
  storageOptions: ColdStorage[];
  weatherImpact: {
    status: 'good' | 'warning' | 'severe';
    alert: string;
    details: string;
  };
}

export interface VoiceResponse {
  query: string;
  reply: string;
  audioBase64?: string; // Optional TTS audio
}
