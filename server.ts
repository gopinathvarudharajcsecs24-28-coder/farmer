import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it in your Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Crop Prediction Endpoint
app.post("/api/predict", async (req, res) => {
  try {
    const { cropId, cropName, location, quantity, unit, currentPrice } = req.body;

    if (!cropName) {
      return res.status(400).json({ error: "Crop name is required" });
    }

    const ai = getGeminiClient();

    const userPrompt = `
      Provide high-quality agricultural intelligence, price predictions, buyer matching, cold storage suggestions, and weather impact analysis for the following crop:
      Crop Name: ${cropName}
      Current Location: ${location || "India (General)"}
      Quantity: ${quantity || 1} ${unit || "Quintal"}
      Farmer's estimated Current Price: ₹${currentPrice || 2000} per ${unit || "Quintal"}.
      
      Generate realistic pricing predictions for:
      - Today
      - In 2 Days
      - In 5 Days
      - In 1 Week
      
      Determine the best recommendation:
      - Action: SELL_NOW, WAIT_2_DAYS, or WAIT_1_WEEK
      - Reason: A detailed explanation of market trends, price increases, demand status, etc.
      
      Also provide 3-4 recommended buyers matching the location:
      - wholesaler, retail, processor, or exporter (with realistic contact names and numbers)
      
      Provide 2-3 nearby cold storage options if they should wait.
      Include storage cost in ₹/${unit || "Quintal"}/day, contact details, capacity, and vacancy status.
      
      Determine the weather impact on crop harvesting, transportation, or spoilage for the next week, providing a rating of good, warning, or severe.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        cropId: { type: Type.STRING },
        cropName: { type: Type.STRING },
        currentPrice: { type: Type.NUMBER },
        predictions: {
          type: Type.OBJECT,
          properties: {
            today: { type: Type.NUMBER },
            day2: { type: Type.NUMBER },
            day5: { type: Type.NUMBER },
            week1: { type: Type.NUMBER },
          },
          required: ["today", "day2", "day5", "week1"],
        },
        sellingRecommendation: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "Must be exactly: SELL_NOW, WAIT_2_DAYS, or WAIT_1_WEEK" },
            reason: { type: Type.STRING },
          },
          required: ["action", "reason"],
        },
        demandForecast: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, description: "Must be: High, Medium, or Low" },
            trend: { type: Type.STRING, description: "Must be: Rising, Stable, or Declining" },
            reason: { type: Type.STRING },
          },
          required: ["level", "trend", "reason"],
        },
        buyers: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Market location/name, e.g. Salem Wholesale Market" },
              distance: { type: Type.NUMBER, description: "Distance in km from user's location" },
              buyerType: { type: Type.STRING, description: "One of: wholesaler, retail, processor, exporter" },
              buyerName: { type: Type.STRING, description: "Specific buyer contact person or business name" },
              contact: { type: Type.STRING, description: "Indian format phone number, e.g., +91 98765 43210" },
              pricePerUnit: { type: Type.NUMBER, description: "Offered price per unit" },
            },
            required: ["name", "distance", "buyerType", "buyerName", "contact", "pricePerUnit"],
          },
        },
        storageOptions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Cold storage facility name" },
              distance: { type: Type.NUMBER },
              ratePerDay: { type: Type.NUMBER, description: "Storage cost in ₹ per Unit per day" },
              capacity: { type: Type.STRING, description: "E.g. '50 Tons available'" },
              contact: { type: Type.STRING },
              status: { type: Type.STRING, description: "One of: Available, Filling Fast, Full" },
            },
            required: ["name", "distance", "ratePerDay", "capacity", "contact", "status"],
          },
        },
        weatherImpact: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "One of: good, warning, severe" },
            alert: { type: Type.STRING },
            details: { type: Type.STRING },
          },
          required: ["status", "alert", "details"],
        },
      },
      required: [
        "cropId",
        "cropName",
        "currentPrice",
        "predictions",
        "sellingRecommendation",
        "demandForecast",
        "buyers",
        "storageOptions",
        "weatherImpact",
      ],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert agricultural market analyst with detailed, realistic knowledge of Indian crop pricing, wholesale mandis (APMCs), cold storage logistics, weather forecasting, and agricultural supply chain economics. Respond ONLY with valid JSON structure specified in responseSchema.",
      },
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini");
    }

    const predictionData = JSON.parse(response.text.trim());
    // Ensure incoming cropId is set
    predictionData.cropId = cropId || "custom";

    res.json(predictionData);
  } catch (error: any) {
    console.error("Prediction Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate market prediction" });
  }
});

// 2. API: Voice/Text Query Endpoint
app.post("/api/voice-query", async (req, res) => {
  try {
    const { query, cropName, location, language } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getGeminiClient();

    const prompt = `
      Answer the farmer's question in a helpful, friendly, and practical manner.
      Query: "${query}"
      Context Crop: ${cropName || "Any"}
      Location: ${location || "India"}
      Requested Language: ${language || "English"}
      
      Respond with a JSON object containing:
      - "reply": The answer written directly in the script of the requested language (e.g. Hindi, Tamil, Telugu, Marathi, English) if specified, otherwise English. Keep it clear, comforting, and packed with action-oriented farming advice. Max 3-4 sentences.
      - "englishTranslation": If the answer is not in English, provide a clear English translation. If the answer is in English, repeat it here.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        reply: { type: Type.STRING },
        englishTranslation: { type: Type.STRING },
      },
      required: ["reply", "englishTranslation"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        systemInstruction: "You are AgriSmart's AI voice advisor. You reply in a warm, wise, local tone in the specified language (Hindi, Tamil, Telugu, Marathi, Kannada, Bengali, Gujarati, or English) to answer agricultural price, market, weather, or crop queries.",
      },
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini");
    }

    const result = JSON.parse(response.text.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Voice Query Error:", error);
    res.status(500).json({ error: error.message || "Failed to process question" });
  }
});

// 3. API: TTS (Text-to-Speech) Endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getGeminiClient();

    // Select suitable voice based on language/name
    // Supported voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const voiceName = language === "Tamil" || language === "Telugu" ? "Kore" : "Zephyr";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Audio = inlineData?.data;
    const mimeType = inlineData?.mimeType || "audio/mp3";

    if (!base64Audio) {
      return res.status(500).json({ error: "Could not generate speech audio. Please use visual output." });
    }

    res.json({ audioBase64: base64Audio, mimeType });
  } catch (error: any) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: error.message || "Speech synthesis failed" });
  }
});

// Setup Vite Dev server or production static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
