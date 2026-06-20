'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Upload, ScanLine, X, Loader2, CircleCheck, Sparkles, MapPin,
  ArrowRight, Recycle, Image as ImageIcon, RotateCw
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useScrapStore } from '@/lib/store'
import { getDestinationMeta } from '@/lib/buyers'

function Page() {
  const [imageSrc, setImageSrc] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraError, setCameraError] = useState(null)

  const { addScan, setLastScan, scanHistory, totalEarnings, totalCO2Saved } = useScrapStore()

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
  }

  const openCamera = async () => {
    setCameraError(null)
    setCameraOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (e) {
      console.error('Camera error', e)
      setCameraError('Camera unavailable. Please use file upload instead.')
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    const data = c.toDataURL('image/jpeg', 0.85)
    setImageSrc(data)
    setImageBase64(data)
    stopCamera()
    analyze(data)
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result
      setImageSrc(data)
      setImageBase64(data)
      analyze(data)
    }
    reader.readAsDataURL(file)
  }

  const analyze = async (data) => {
    setAnalyzing(true)
    setResult(null)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Scan failed')
      setResult(json)
      setLastScan(json)
    } catch (e) {
      console.error(e)
      alert('Scan failed: ' + e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const confirmAndContinue = () => {
    if (!result) return
    addScan({ id: Date.now().toString(), ...result, timestamp: new Date().toISOString(), image: imageSrc })
    // navigate to buyers with ALL detected categories, comma-separated
    const cats = (result.materials || []).map((m) => m.category).join(',')
    window.location.href = `/buyers?cat=${cats || result.category}`
  }

  const reset = () => {
    setImageSrc(null)
    setImageBase64(null)
    setResult(null)
  }

  useEffect(() => () => stopCamera(), [])

  // result.materials is always present now (array of {category, percentage, description, weightKg, value, co2Saved})
  const materials = result?.materials || []
  const isMulti = materials.length > 1

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
              <Sparkles size={14} /> AI Material Scanner
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-3">
              Scan. Recognize. <span className="text-gradient-emerald">Earn.</span>
            </h1>
            <p className="text-emerald-900/70 max-w-xl mx-auto">
              Snap any recyclable item — even a mix of plastic, metal, glass, paper, or textile — and let our AI break down every material instantly.
            </p>
          </motion.div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="glass rounded-2xl p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-emerald-700/70">Earned</div>
              <div className="text-2xl font-display font-bold text-gradient-emerald">${totalEarnings.toFixed(2)}</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-emerald-700/70">CO₂ Saved</div>
              <div className="text-2xl font-display font-bold text-gradient-emerald">{totalCO2Saved.toFixed(1)} kg</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-emerald-700/70">Scans</div>
              <div className="text-2xl font-display font-bold text-gradient-emerald">{scanHistory.length}</div>
            </div>
          </div>

          {/* Scanner area */}
          {!imageSrc && !cameraOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-3xl p-8 md:p-12 text-center"
            >
              <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-400 grid place-items-center shadow-2xl shadow-emerald-500/30 animate-pulse-glow">
                <ScanLine className="text-white" size={48} strokeWidth={2} />
              </div>
              <h2 className="font-display font-bold text-2xl mb-2">Ready to Scan</h2>
              <p className="text-emerald-900/70 mb-8">Use your camera or upload a photo — mixed materials work too</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <button onClick={openCamera} className="btn-eco flex-1 px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2">
                  <Camera size={20} /> Open Camera
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-6 py-4 rounded-2xl font-semibold bg-white/70 hover:bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center gap-2">
                  <Upload size={20} /> Upload Photo
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <div className="mt-8 grid grid-cols-5 gap-2 max-w-md mx-auto">
                {[
                  { e: '🔵', n: 'Plastic' },
                  { e: '⚙️', n: 'Metal' },
                  { e: '🔷', n: 'Glass' },
                  { e: '📄', n: 'Paper' },
                  { e: '🧵', n: 'Textile' },
                ].map((m) => (
                  <div key={m.n} className="bg-white/50 border border-emerald-200/40 rounded-xl p-2 text-center">
                    <div className="text-2xl">{m.e}</div>
                    <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">{m.n}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Camera view */}
          {cameraOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-3xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold">Camera Capture</h3>
                <button onClick={stopCamera} className="p-2 rounded-lg hover:bg-white/60"><X size={20} /></button>
              </div>
              {cameraError ? (
                <div className="p-6 text-center">
                  <p className="text-emerald-800 mb-4">{cameraError}</p>
                  <button onClick={() => fileInputRef.current?.click()} className="btn-eco px-6 py-3 rounded-2xl">Upload Instead</button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </div>
              ) : (
                <>
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-8 border-2 border-emerald-400/60 rounded-2xl" />
                      <motion.div
                        className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={stopCamera} className="flex-1 px-6 py-3 rounded-2xl font-semibold bg-white/70 border border-emerald-200">Cancel</button>
                    <button onClick={takePhoto} className="btn-eco flex-1 px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2">
                      <Camera size={18} /> Capture
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Analyzing */}
          {imageSrc && analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-3xl p-8 text-center"
            >
              <img src={imageSrc} alt="scan" className="w-full max-w-md mx-auto rounded-2xl mb-6 shadow-lg" />
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="text-emerald-500 animate-spin" size={48} />
                <div className="font-display font-bold text-xl">Analyzing material composition...</div>
                <div className="text-sm text-emerald-700/70">AI vision is identifying every material in this image</div>
                <div className="w-full max-w-xs h-1.5 bg-emerald-100 rounded-full mt-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '90%' }}
                    transition={{ duration: 4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {result && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="glass rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 p-6 text-white text-center">
                  <CircleCheck size={48} className="mx-auto mb-3" />
                  <div className="font-display font-bold text-2xl">
                    {isMulti ? `${materials.length} Materials Detected!` : 'Scrap Detected!'}
                  </div>
                  <div className="text-sm opacity-90 mt-1">
                    {(result.confidenceScore * 100).toFixed(0)}% confidence
                  </div>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-4">
                  <img src={imageSrc} alt="scan" className="w-full aspect-square object-cover rounded-2xl" />

                  <div className="space-y-3">
                    {/* Per-material breakdown */}
                    <div className="space-y-2">
                      {materials.map((mat, i) => (
                        <div key={i} className="bg-white/60 border border-emerald-100 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold capitalize flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {mat.category}
                            </div>
                            <div className="text-sm font-bold text-emerald-700">{mat.percentage}%</div>
                          </div>
                          <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: `${mat.percentage}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-emerald-700/70">
                            <span>{mat.weightKg?.toFixed(2)} kg</span>
                            <span className="font-semibold text-emerald-700">${mat.value?.toFixed(2)}</span>
                          </div>
                          {mat.description && (
                            <div className="text-[11px] text-emerald-700/60 mt-1">{mat.description}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <ResultStat label="Total Weight" value={`${result.totalWeightKg?.toFixed(2)} kg`} />
                    <ResultStat label="Total Reward" value={`$${result.estimatedValue?.toFixed(2)}`} highlight />
                    <ResultStat label="CO₂ Saved" value={`${(result.co2Saved || 0).toFixed(2)} kg`} />
                  </div>
                </div>
              </div>

              {/* Matched destinations - one per material */}
              <div className="space-y-3">
                {materials.map((mat, i) => {
                  const dest = getDestinationMeta(mat.category)
                  return (
                    <div key={i} className={`rounded-3xl overflow-hidden bg-gradient-to-r ${dest.color} text-white shadow-xl shadow-emerald-500/20`}>
                      <div className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 grid place-items-center text-3xl flex-shrink-0">
                          <Recycle size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs uppercase tracking-widest opacity-80">{mat.category} · {mat.percentage}% of scrap</div>
                          <div className="font-display font-bold text-lg">{dest.label}</div>
                          <div className="text-sm opacity-90 flex items-center gap-1 mt-0.5"><MapPin size={14} /> Nearest verified buyer</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={reset} className="px-6 py-4 rounded-2xl font-semibold bg-white/70 hover:bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center gap-2">
                  <RotateCw size={18} /> Scan Another
                </button>
                <button onClick={confirmAndContinue} className="btn-eco px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2">
                  Find Buyers <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Recent scans */}
          {!imageSrc && !cameraOpen && scanHistory.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display font-bold text-lg mb-3 px-2">Recent Scans</h3>
              <div className="glass rounded-2xl divide-y divide-emerald-100">
                {scanHistory.slice(0, 5).map((s) => {
                  const mats = s.materials || [{ category: s.category, percentage: 100 }]
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3">
                      {s.image ? (
                        <img src={s.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-emerald-100 grid place-items-center"><ImageIcon size={16} className="text-emerald-600" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold capitalize truncate">
                          {mats.map((m) => m.category).join(' + ')}
                        </div>
                        <div className="text-xs text-emerald-700/70">
                          {(s.totalWeightKg ?? s.estimatedWeightKg)?.toFixed(2)} kg · ${s.estimatedValue?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultStat({ label, value, cap, highlight }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${highlight ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-white/60 border border-emerald-100'}`}>
      <div className={`text-xs uppercase tracking-widest font-medium ${highlight ? 'text-white/80' : 'text-emerald-700/70'}`}>{label}</div>
      <div className={`font-display font-bold text-lg ${cap ? 'capitalize' : ''} ${highlight ? '' : 'text-foreground'}`}>{value}</div>
    </div>
  )
}

export default Page
