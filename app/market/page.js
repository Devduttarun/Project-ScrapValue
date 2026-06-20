'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Sparkles, BarChart3, Info, RefreshCw } from 'lucide-react'
import Navbar from '@/components/Navbar'

const MATERIALS = [
  { key: 'plastic', name: 'Plastic', icon: '🔵', color: 'from-blue-400 to-cyan-400', desc: 'PET, HDPE, PVC bottles & containers' },
  { key: 'textile', name: 'Textile', icon: '🧵', color: 'from-pink-400 to-rose-400', desc: 'Fabric scraps, cotton, denim' },
  { key: 'metal', name: 'Metal', icon: '⚙️', color: 'from-slate-400 to-blue-400', desc: 'Aluminum cans, steel, copper wire' },
  { key: 'glass', name: 'Glass', icon: '🔷', color: 'from-cyan-400 to-blue-300', desc: 'Clear & colored glass bottles' },
  { key: 'paper', name: 'Paper', icon: '📄', color: 'from-amber-300 to-orange-300', desc: 'Cardboard, newspaper, magazines' },
]

function Page() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/market')
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
                <BarChart3 size={14} /> Live Market Prices
              </div>
              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-2">
                Real-Time <span className="text-gradient-emerald">Commodity Prices</span>
              </h1>
              <p className="text-emerald-900/70">Singapore scrap exchange · Updated every 4 hours</p>
            </div>
            <button onClick={load} className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:bg-white/80">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {MATERIALS.map((m, i) => {
              const price = data?.prices?.[m.key] || 0
              const trend = data?.trends?.[m.key] || 0
              return (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} grid place-items-center text-3xl shadow-lg`}>
                      {m.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                      {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(trend).toFixed(1)}%
                    </div>
                  </div>
                  <div className="font-display font-bold text-2xl mb-1">{m.name}</div>
                  <div className="text-xs text-emerald-700/70 mb-3">{m.desc}</div>
                  <div className="pt-3 border-t border-emerald-100 flex items-baseline gap-2">
                    <span className="font-display font-bold text-3xl text-gradient-emerald">${price.toFixed(2)}</span>
                    <span className="text-xs text-emerald-700/70">SGD / kg</span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Calculator */}
          <div className="glass rounded-3xl p-6 mb-6">
            <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-500" /> Quick Earnings Calculator
            </h3>
            <p className="text-sm text-emerald-900/70 mb-4">Example: Collect 2.5 kg of plastic → 2.5 × ${(data?.prices?.plastic || 0.18).toFixed(2)} = <span className="font-bold text-gradient-emerald">${(2.5 * (data?.prices?.plastic || 0.18)).toFixed(2)}</span></p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MATERIALS.map((m) => {
                const price = data?.prices?.[m.key] || 0
                return (
                  <div key={m.key} className="bg-white/60 rounded-xl p-3 text-center border border-emerald-100/60">
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="text-xs font-semibold text-emerald-700 uppercase">{m.name}</div>
                    <div className="text-xs text-emerald-700/70 mt-1">1 kg = <span className="font-bold text-emerald-900">${price.toFixed(2)}</span></div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 flex gap-3 items-start">
            <Info size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900/70 leading-relaxed">
              Prices shown are estimates from current commodity markets. Clean, sorted materials may attract premium rates. Contamination-free items always earn more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
