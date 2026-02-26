import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { 
  Camera, 
  RotateCcw, 
  Download, 
  Eye, 
  Layers, 
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InventoryItem } from "../types";
import { cn } from "../lib/utils";

export default function VirtualTryOn() {
  const [frames, setFrames] = useState<InventoryItem[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [frameScale, setFrameScale] = useState(1);
  const [framePosition, setFramePosition] = useState({ x: 0, y: 0 });
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const token = localStorage.getItem("visionx_token");
        const res = await fetch("/api/inventory", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const frameItems = data.filter((i: any) => i.type === 'frame' || i.type === 'sunglasses');
        setFrames(frameItems);
        if (frameItems.length > 0) setSelectedFrame(frameItems[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFrames();
  }, []);

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const link = document.createElement("a");
      link.href = imageSrc;
      link.download = "visionx-try-on.png";
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Virtual Try-On</h1>
          <p className="text-slate-500">Experience our collection in real-time using AI-assisted AR.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Assisted Positioning
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Camera Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden relative aspect-video bg-slate-900 border-white/5 shadow-2xl">
            {!isCameraReady && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-slate-950">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Initializing Camera Feed...</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-slate-950 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Camera Access Denied</h3>
                <p className="text-slate-500 max-w-xs">
                  Please enable camera permissions in your browser settings to use the Virtual Try-On feature.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 rounded-xl gradient-bg text-white font-bold"
                >
                  Retry Connection
                </button>
              </div>
            )}
            
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/png"
              onUserMedia={() => {
                setIsCameraReady(true);
                setCameraError(null);
              }}
              onUserMediaError={(err) => {
                console.error("Webcam Error:", err);
                setCameraError(err.toString());
              }}
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: "user" }}
              disablePictureInPicture={false}
              forceScreenshotSourceSize={false}
              imageSmoothing={true}
              mirrored={false}
              screenshotQuality={1}
            />

            {/* Frame Overlay */}
            <AnimatePresence>
              {selectedFrame && isCameraReady && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: frameScale }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  style={{
                    position: 'absolute',
                    top: `calc(50% + ${framePosition.y}px)`,
                    left: `calc(50% + ${framePosition.x}px)`,
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    pointerEvents: 'none'
                  }}
                >
                  <img 
                    src={selectedFrame.image_url || `https://picsum.photos/seed/${selectedFrame.id}/400/200`} 
                    alt="Frame Overlay"
                    className="w-full h-auto drop-shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
              <button 
                onClick={() => setFrameScale(s => Math.max(0.5, s - 0.1))}
                className="p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleCapture}
                className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all"
              >
                <Camera className="w-8 h-8" />
              </button>
              <button 
                onClick={() => setFrameScale(s => Math.min(2, s + 0.1))}
                className="p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Position Controls */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
              <button onClick={() => setFramePosition(p => ({ ...p, y: p.y - 10 }))} className="p-2 rounded-lg bg-slate-950/80 border border-white/10 text-white hover:bg-white/10 transition-all"><ChevronLeft className="w-5 h-5 rotate-90" /></button>
              <div className="flex gap-2">
                <button onClick={() => setFramePosition(p => ({ ...p, x: p.x - 10 }))} className="p-2 rounded-lg bg-slate-950/80 border border-white/10 text-white hover:bg-white/10 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setFramePosition({ x: 0, y: 0 })} className="p-2 rounded-lg bg-slate-950/80 border border-white/10 text-white hover:bg-white/10 transition-all"><RotateCcw className="w-5 h-5" /></button>
                <button onClick={() => setFramePosition(p => ({ ...p, x: p.x + 10 }))} className="p-2 rounded-lg bg-slate-950/80 border border-white/10 text-white hover:bg-white/10 transition-all"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <button onClick={() => setFramePosition(p => ({ ...p, y: p.y + 10 }))} className="p-2 rounded-lg bg-slate-950/80 border border-white/10 text-white hover:bg-white/10 transition-all"><ChevronRight className="w-5 h-5 rotate-90" /></button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Real-time Feed</p>
                <p className="text-slate-500 text-xs">Low latency AR overlay</p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Multi-Layer</p>
                <p className="text-slate-500 text-xs">High fidelity frame rendering</p>
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Instant Save</p>
                <p className="text-slate-500 text-xs">Capture and share your look</p>
              </div>
            </div>
          </div>
        </div>

        {/* Frame Selection */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5 h-[calc(100vh-250px)] flex flex-col">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Select Frames
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {frames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                    selectedFrame?.id === frame.id 
                      ? "bg-cyan-500/10 border-cyan-500/50" 
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-800 border border-white/10">
                      <img 
                        src={frame.image_url || `https://picsum.photos/seed/${frame.id}/200/100`} 
                        alt={frame.model} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{frame.brand}</p>
                      <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{frame.model}</p>
                      <p className="text-xs text-cyan-400 font-bold mt-1">${frame.price}</p>
                    </div>
                  </div>
                  {selectedFrame?.id === frame.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <button className="w-full gradient-bg text-white py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
