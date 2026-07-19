import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Send, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Languages, 
  MessageSquareCode,
  RotateCcw
} from "lucide-react";
import { LANGUAGES } from "../data";

interface VoiceAssistantProps {
  currentCropName: string;
  currentLocation: string;
}

export default function VoiceAssistant({ currentCropName, currentLocation }: VoiceAssistantProps) {
  const [query, setQuery] = useState<string>("");
  const [language, setLanguage] = useState<string>("English");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Conversation state
  const [chatHistory, setChatHistory] = useState<Array<{
    sender: "farmer" | "assistant";
    text: string;
    translation?: string;
    audioUrl?: string;
  }>>([
    {
      sender: "assistant",
      text: "Namaste! I am FarmProfit's AI Voice Advisor. Pick your language, then ask me anything about crop prices, local cold storages, weather alerts, or selling days!",
    }
  ]);

  // Audio state
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Speech API for Voice input
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for webkitSpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = getLanguageCode(language);

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  // Map user-friendly language names to speech recognition locales
  const getLanguageCode = (lang: string) => {
    switch (lang) {
      case "Hindi": return "hi-IN";
      case "Tamil": return "ta-IN";
      case "Telugu": return "te-IN";
      case "Marathi": return "mr-IN";
      case "Kannada": return "kn-IN";
      case "Bengali": return "bn-IN";
      case "Gujarati": return "gu-IN";
      default: return "en-IN";
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not fully supported in this browser. Please type your query!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setQuery("");
      recognitionRef.current.start();
    }
  };

  // Sample quick questions
  const quickPrompts = [
    `Today's ${currentCropName || "Tomato"} price in ${currentLocation.split(",")[0] || "Salem"}?`,
    `Which nearby cold storage has available vacancy?`,
    `Should I wait 1 week to sell my ${currentCropName || "crops"}?`,
    `Will rain disrupt transport in ${currentLocation.split(",")[0] || "Tamil Nadu"} this week?`
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Add user message
    const newHistory = [...chatHistory, { sender: "farmer" as const, text: textToSend }];
    setChatHistory(newHistory);
    setQuery("");
    setIsLoading(true);

    try {
      // 1. Fetch text answer
      const res = await fetch("/api/voice-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          cropName: currentCropName,
          location: currentLocation,
          language
        })
      });

      if (!res.ok) throw new Error("Voice advisor endpoint error");
      const data = await res.json();

      let voiceAudioUrl: string | undefined = undefined;

      // 2. Fetch TTS Audio for native response
      try {
        setIsAudioLoading(true);
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.reply,
            language
          })
        });

        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          if (ttsData.audioBase64) {
            const mime = ttsData.mimeType || "audio/mp3";
            voiceAudioUrl = `data:${mime};base64,${ttsData.audioBase64}`;
          }
        }
      } catch (ttsErr) {
        console.warn("TTS fetch failed, proceeding with text-only reply", ttsErr);
      } finally {
        setIsAudioLoading(false);
      }

      // Add assistant response
      setChatHistory(prev => [
        ...prev,
        {
          sender: "assistant",
          text: data.reply,
          translation: data.englishTranslation !== data.reply ? data.englishTranslation : undefined,
          audioUrl: voiceAudioUrl
        }
      ]);

      // Automatically play if audio is returned
      if (voiceAudioUrl) {
        setTimeout(() => {
          playAudio(voiceAudioUrl!, chatHistory.length + 1);
        }, 100);
      }

    } catch (error) {
      console.error("AI Assistant Error:", error);
      setChatHistory(prev => [
        ...prev,
        {
          sender: "assistant",
          text: "I experienced a glitch fetching the AI advice. Please ensure your Gemini API key is configured and try again!",
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (url: string, index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingAudioIndex === index) {
      // Toggle off
      setPlayingAudioIndex(null);
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingAudioIndex(index);
    
    audio.play().catch((err) => {
      console.warn("Audio playback failed or was interrupted:", err);
      setPlayingAudioIndex(null);
    });

    audio.onerror = (err) => {
      console.warn("Audio element failed to load source:", err);
      setPlayingAudioIndex(null);
    };

    audio.onended = () => {
      setPlayingAudioIndex(null);
    };
  };

  const handleResetHistory = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingAudioIndex(null);
    setChatHistory([
      {
        sender: "assistant",
        text: "Namaste! Chat reset. Pick your language, then ask me anything about crop prices, local cold storages, weather alerts, or selling days!",
      }
    ]);
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden flex flex-col h-[540px]">
      {/* Advisor Header */}
      <div className="bg-emerald-950 text-emerald-50 px-5 py-4 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-800/80 p-1.5 rounded-lg text-amber-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold font-sans text-sm tracking-tight text-white">AI Multilingual Voice Advisor</h3>
            <p className="text-[10px] text-emerald-300">Talk to AgriSmart in native languages</p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetHistory}
            title="Clear Chat History"
            className="p-1.5 hover:bg-emerald-900 rounded-lg text-emerald-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1 bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-800">
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-emerald-100 text-xs font-bold border-none focus:outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-emerald-950 text-emerald-100">
                  {lang.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {chatHistory.map((chat, idx) => {
          const isAssistant = chat.sender === "assistant";
          return (
            <div
              key={idx}
              className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm relative shadow-sm ${
                isAssistant 
                  ? "bg-white border border-slate-100 text-slate-800 rounded-tl-none" 
                  : "bg-emerald-800 text-white rounded-tr-none"
              }`}>
                {/* Voice player for Assistant messages */}
                {isAssistant && chat.audioUrl && (
                  <div className="flex items-center gap-2.5 mb-2 bg-emerald-50 border border-emerald-100/60 p-2 rounded-xl">
                    <button
                      onClick={() => playAudio(chat.audioUrl!, idx)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white shadow-sm transition-all flex items-center justify-center"
                    >
                      {playingAudioIndex === idx ? (
                        <Pause className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <Play className="w-3 h-3 stroke-[3] translate-x-0.5" />
                      )}
                    </button>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800">LISTEN ADVICE</p>
                      {playingAudioIndex === idx ? (
                        // Simulated wave animation
                        <div className="flex items-center gap-0.5 h-3 mt-0.5">
                          <span className="w-0.75 bg-emerald-600 rounded-full animate-pulse h-2" />
                          <span className="w-0.75 bg-emerald-600 rounded-full animate-pulse h-3 delay-75" />
                          <span className="w-0.75 bg-emerald-600 rounded-full animate-pulse h-1 delay-150" />
                          <span className="w-0.75 bg-emerald-600 rounded-full animate-pulse h-2.5 delay-200" />
                          <span className="w-0.75 bg-emerald-600 rounded-full animate-pulse h-1.5 delay-300" />
                        </div>
                      ) : (
                        <span className="text-[9px] text-emerald-600">Click to play sound</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <p className="leading-relaxed font-medium">{chat.text}</p>

                {/* Translation display for native replies */}
                {isAssistant && chat.translation && (
                  <p className="text-xs text-slate-400 border-t border-slate-100 pt-2 mt-2 italic">
                    Translation: {chat.translation}
                  </p>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-bold tracking-wider px-1">
                {isAssistant ? "AI ADVISOR" : "FARMER"}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2 animate-pulse">
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl px-4 py-3 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-emerald-800" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI Advisor is translating, formulating pricing logic & speaking...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts list */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/30 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setQuery(p)}
            className="text-[11px] font-bold text-slate-600 bg-white hover:border-emerald-200 border border-slate-200 px-3 py-1.5 rounded-full whitespace-nowrap transition-all shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2.5">
        {/* Voice button */}
        <button
          onClick={toggleListening}
          className={`p-3.5 rounded-2xl flex items-center justify-center transition-all ${
            isListening 
              ? "bg-red-500 text-white animate-bounce shadow-lg shadow-red-500/20" 
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
          }`}
          title="Click to Speak"
        >
          {isListening ? <MicOff className="w-5 h-5 stroke-[2.5]" /> : <Mic className="w-5 h-5 stroke-[2.5]" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Listening closely... Speak now" : "Type crop question or click mic..."}
          onKeyDown={(e) => e.key === "Enter" && handleSend(query)}
          className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSend(query)}
          disabled={!query.trim() || isLoading}
          className="bg-emerald-800 hover:bg-emerald-900 text-white p-3.5 rounded-2xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
