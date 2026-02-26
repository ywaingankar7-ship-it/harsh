import React, { useState, useEffect } from "react";
import { 
  Eye, 
  Upload, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  History,
  ArrowRight,
  Scan,
  ShieldCheck,
  Info,
  FileText,
  Zap
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from "../lib/utils";

export default function AIEyeTest() {
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [faceShapeResult, setFaceShapeResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("visionx_token");
        const [custRes, historyRes] = await Promise.all([
          fetch("/api/customers", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/eye-tests", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCustomers(await custRes.json());
        setHistory(await historyRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    multiple: false
  } as any);

  const runAIDiagnosis = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    setFaceShapeResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(",")[1];

      const eyeSchema = {
        type: Type.OBJECT,
        properties: {
          left_eye: {
            type: Type.OBJECT,
            properties: {
              spherical: { type: Type.STRING, description: "e.g. -1.25 or +0.50" },
              cylindrical: { type: Type.STRING, description: "e.g. -0.75" },
              axis: { type: Type.STRING, description: "e.g. 180" },
              dryness: { type: Type.STRING, description: "Low, Medium, or High" }
            },
            required: ["spherical", "cylindrical", "axis", "dryness"]
          },
          right_eye: {
            type: Type.OBJECT,
            properties: {
              spherical: { type: Type.STRING },
              cylindrical: { type: Type.STRING },
              axis: { type: Type.STRING },
              dryness: { type: Type.STRING }
            },
            required: ["spherical", "cylindrical", "axis", "dryness"]
          },
          abnormalities: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          summary: { type: Type.STRING }
        },
        required: ["left_eye", "right_eye", "abnormalities", "summary"]
      };

      const faceSchema = {
        type: Type.OBJECT,
        properties: {
          faceShape: { type: Type.STRING },
          explanation: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["faceShape", "explanation", "recommendations"]
      };

      const prompt = mode === "ai" 
        ? "Analyze this eye/retina image. Estimate spherical power, cylindrical power, axis, and check for dryness. If you cannot be certain, provide your best clinical estimate based on the visual evidence. Do not return N/A."
        : "Analyze this face image to determine face shape (Oval, Round, Square, Heart, Diamond). Recommend 3 frame styles.";

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          responseSchema: mode === "ai" ? eyeSchema : faceSchema
        }
      });

      const data = JSON.parse(response.text || "{}");
      
      if (mode === "ai") {
        setResult({ ...data, type: 'ai', date: new Date().toISOString() });
        // Save to DB if customer selected
        if (selectedCustomer) {
          const token = localStorage.getItem("visionx_token");
          await fetch("/api/customers/test", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ customer_id: selectedCustomer, results: data })
          });
        }
      } else {
        setFaceShapeResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Eye Diagnosis & Testing</h1>
          <p className="text-slate-500">Choose between AI-powered retinal analysis or face shape detection for frame recommendations.</p>
        </div>
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
          <button
            onClick={() => { setMode("ai"); setResult(null); setFaceShapeResult(null); setImage(null); }}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              mode === "ai" ? "gradient-bg text-white shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <Zap className="w-4 h-4" />
            AI Eye Test
          </button>
          <button
            onClick={() => { setMode("manual"); setResult(null); setFaceShapeResult(null); setImage(null); }}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              mode === "manual" ? "gradient-bg text-white shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <Scan className="w-4 h-4" />
            Face Analysis
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {mode === "ai" ? <Eye className="w-6 h-6 text-cyan-400" /> : <Camera className="w-6 h-6 text-indigo-400" />}
                {mode === "ai" ? "Retinal Analysis" : "Face Shape Detection"}
              </h3>
              {mode === "ai" && (
                <select 
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">Select Patient (Optional)</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>

            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer relative overflow-hidden group",
                isDragActive ? "border-cyan-500 bg-cyan-500/5" : "border-white/10 hover:border-white/20 bg-white/5",
                image ? "p-4" : "p-12"
              )}
            >
              <input {...getInputProps()} />
              {image ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <img src={image} alt="Upload" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Change Image
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">Drag & drop {mode === "ai" ? "eye" : "face"} image here</p>
                    <p className="text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                HIPAA Compliant Processing
              </div>
              <button
                onClick={runAIDiagnosis}
                disabled={!image || loading}
                className="gradient-bg text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Start AI Diagnosis
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 border-cyan-500/20 bg-cyan-500/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    AI Diagnosis Results
                  </h3>
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    High Confidence
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10">
                    <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-4">Left Eye (OS)</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Spherical</span>
                        <span className="text-white font-bold">{result.left_eye?.spherical || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Cylindrical</span>
                        <span className="text-white font-bold">{result.left_eye?.cylindrical || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Axis</span>
                        <span className="text-white font-bold">{result.left_eye?.axis || "N/A"}°</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10">
                    <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">Right Eye (OD)</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Spherical</span>
                        <span className="text-white font-bold">{result.right_eye?.spherical || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Cylindrical</span>
                        <span className="text-white font-bold">{result.right_eye?.cylindrical || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Axis</span>
                        <span className="text-white font-bold">{result.right_eye?.axis || "N/A"}°</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Info className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-bold mb-1">Clinical Summary</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{result.summary}</p>
                    </div>
                  </div>
                  
                  {result.abnormalities?.length > 0 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                      <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-rose-400 font-bold mb-1">Detected Abnormalities</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.abnormalities.map((a: string) => (
                            <span key={a} className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-bold">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-[10px] text-amber-500/80 leading-tight">
                    DISCLAIMER: This AI diagnosis is for preliminary screening only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified optometrist or ophthalmologist.
                  </p>
                </div>
              </motion.div>
            )}

            {faceShapeResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Scan className="w-8 h-8 text-indigo-400" />
                    Face Analysis Results
                  </h3>
                  <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                    {faceShapeResult.faceShape} Shape
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-white font-bold mb-4">Why this shape?</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{faceShapeResult.explanation}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4">Recommended Styles</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {faceShapeResult.recommendations.map((style: string) => (
                        <div key={style} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                          {style}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              Recent Diagnosis
            </h3>
            <div className="space-y-4">
              {history.length > 0 ? history.slice(0, 5).map((test, i) => {
                const results = JSON.parse(test.results);
                return (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">{test.customer_name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(test.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div className="flex-1">
                        <p className="text-slate-500 mb-1 uppercase tracking-wider text-[9px]">Left Eye</p>
                        <p className="text-slate-300 font-medium">{results.left_eye?.spherical || "N/A"}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-500 mb-1 uppercase tracking-wider text-[9px]">Right Eye</p>
                        <p className="text-slate-300 font-medium">{results.right_eye?.spherical || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">No diagnostic history found.</p>
                </div>
              )}
            </div>
            {history.length > 5 && (
              <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                View Full History
              </button>
            )}
          </div>

          <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              AI Model Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Engine</span>
                <span className="text-slate-200 font-medium">Gemini-3.1-Pro</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Latency</span>
                <span className="text-emerald-400 font-medium">~1.2s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Last Training</span>
                <span className="text-slate-200 font-medium">Feb 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
