import { Crop } from "./types";

export const DEFAULT_CROPS: Crop[] = [
  {
    id: "tomato",
    name: "Tomato",
    category: "vegetable",
    icon: "Tomato",
    basePrice: 1800, // ₹ per Quintal
    unit: "Quintal",
    currentDemand: "High",
  },
  {
    id: "onion",
    name: "Onion",
    category: "vegetable",
    icon: "Layers",
    basePrice: 2200,
    unit: "Quintal",
    currentDemand: "Medium",
  },
  {
    id: "potato",
    name: "Potato",
    category: "vegetable",
    icon: "CircleDot",
    basePrice: 1400,
    unit: "Quintal",
    currentDemand: "High",
  },
  {
    id: "paddy",
    name: "Paddy (Rice)",
    category: "grain",
    icon: "Wheat",
    basePrice: 2183, // MSP
    unit: "Quintal",
    currentDemand: "High",
  },
  {
    id: "wheat",
    name: "Wheat",
    category: "grain",
    icon: "Sprout",
    basePrice: 2275, // MSP
    unit: "Quintal",
    currentDemand: "Medium",
  },
  {
    id: "cotton",
    name: "Cotton",
    category: "grain",
    icon: "Sparkles",
    basePrice: 6620,
    unit: "Quintal",
    currentDemand: "Medium",
  },
  {
    id: "turmeric",
    name: "Turmeric",
    category: "spice",
    icon: "Flame",
    basePrice: 11500,
    unit: "Quintal",
    currentDemand: "High",
  },
  {
    id: "cardamom",
    name: "Cardamom",
    category: "spice",
    icon: "Leaf",
    basePrice: 1600, // per Kg
    unit: "Kg",
    currentDemand: "Medium",
  },
  {
    id: "apple",
    name: "Apple",
    category: "fruit",
    icon: "Apple",
    basePrice: 8500,
    unit: "Quintal",
    currentDemand: "High",
  },
  {
    id: "mango",
    name: "Mango",
    category: "fruit",
    icon: "Citrus",
    basePrice: 4500,
    unit: "Quintal",
    currentDemand: "Low",
  }
];

export const POPULAR_LOCATIONS = [
  "Salem, Tamil Nadu",
  "Nashik, Maharashtra",
  "Guntur, Andhra Pradesh",
  "Azadpur Mandi, Delhi",
  "Indore, Madhya Pradesh",
  "Shimla, Himachal Pradesh",
  "Kolkata, West Bengal",
  "Bengaluru, Karnataka",
  "Surat, Gujarat",
  "Choutuppal, Telangana"
];

export const LANGUAGES = [
  { code: "English", label: "English" },
  { code: "Hindi", label: "हिन्दी (Hindi)" },
  { code: "Tamil", label: "தமிழ் (Tamil)" },
  { code: "Telugu", label: "తెలుగు (Telugu)" },
  { code: "Marathi", label: "मराठी (Marathi)" },
  { code: "Kannada", label: "ಕನ್ನಡ (Kannada)" },
  { code: "Bengali", label: "বাংলা (Bengali)" },
  { code: "Gujarati", label: "ગુજરાતી (Gujarati)" }
];
