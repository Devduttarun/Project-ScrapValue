'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, RadialBarChart, RadialBar, BarChart, Bar, CartesianGrid, Legend,
} from 'recharts'
import {
  BarChart3, Award, Sparkles, TreePine, Recycle, Droplets, ScanLine,
  TrendingUp, Wind, Trophy, Target, Zap, ArrowRight, Globe2, Leaf,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useScrapStore } from '@/lib/store'

const CATEGORY_COLORS = {
  plastic: '#3b82f6',
  metal: '#64748b',
  glass: '#06b6d4',
  paper: '#f59e0b',
  textile: '#ec4899',
}

const ACHIEVEMENTS = [
  { id: 'first_scan', icon: '🌱', name: 'First Sprout', desc: 'Complete your first scan', goal: 1, key: 'totalScans' },
  { id: 'eco_warrior', icon: '🌳', name: 'Eco Warrior', desc: '10 successful scans', goal: 10, key: 'totalScans' },
  { id: 'ocean_keeper', icon: '🌊', name: 'Ocean Keeper', desc: 'Divert 5kg of waste', goal: 5, key: 'totalScrapsDiverted' },
  { id: 'forest_guardian', icon: '🌲', name: 'Forest Guardian', desc: 'Save 50kg CO₂', goal: 50, key: 'totalCO2Saved' },
  { id: 'green_millionaire', icon: '💰', name: 'Green Earner', desc: 'Earn $25 in rewards', goal: 25, key: 'totalEarnings' },
  { id: 'solar_hero', icon: '☀️', name: 'Solar Hero', desc: '50 scans completed', goal: 50, key: 'totalScans' },
]

const MILESTONES = [
  { label: 'Bronze Recycler', threshold: 5, badge: '🥉' },
  { label: 'Silver Steward', threshold: 25, badge: '🥈' },
  { label: 'Gold Guardian', threshold: 100, badge: '🥇' },
  { label: 'Diamond Champion', threshold: 500, badge: '💎' },
]

function Page() {
  const { scanHistory, totalEarnings, totalScrapsDiverted, totalCO2Saved } = useScrapStore()
  const [serverStats, setServerStats] = useState(null)

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setServerStats).catch(() => {})
  }, [])

  const stats = {
    totalScans: scanHistory.length,
    totalEarnings,
    totalScrapsDiverted,
    totalCO2Saved,
  }

  // Build category breakdown
  const categoryData = useMemo(() => {
    const byCat = {}
    scanHistory.forEach((s) => {
      const k = s.category || 'plastic'
      byCat[k] = (byCat[k] || 0) + (s.estimatedWeightKg || 0)
    })
    if (Object.keys(byCat).length === 0) {
      return [
        { name: 'plastic', value: 1.8 },
        { name: 'metal', value: 0.6 },
        { name: 'glass', value: 1.2 },
        { name: 'paper', value: 0.9 },
        { name: 'textile', value: 0.4 },
      ]
    }
    return Object.entries(byCat).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
  }, [scanHistory])

  // Build time series (last 7 days)
  const timeData = useMemo(() => {
    const days = []
    const now = Date.now()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      days.push({
        date: d.toLocaleDateString('en', { weekday: 'short' }),
        earnings: 0,
        weight: 0,
      })
    }
    scanHistory.forEach((s) => {
      const t = new Date(s.timestamp || Date.now()).toLocaleDateString('en', { weekday: 'short' })
      const idx = days.findIndex((d) => d.date === t)
      if (idx >= 0) {
        days[idx].earnings += s.estimatedValue || 0
        days[idx].weight += s.estimatedWeightKg || 0
      }
    })
    if (scanHistory.length === 0) {
      // demo data
      const demo = [0.5, 1.2, 0.8, 2.1, 1.6, 3.4, 2.8]
      days.forEach((d, i) => { d.earnings = demo[i]; d.weight = demo[i] * 1.5 })
    }
    return days.map((d) => ({ ...d, earnings: Number(d.earnings.toFixed(2)), weight: Number(d.weight.toFixed(2)) }))
  }, [scanHistory])

  // Goal progress (toward Gold Guardian = 100 scans)
  const milestone = MILESTONES.find((m) => stats.totalScans < m.threshold) || MILESTONES[MILESTONES.length - 1]
  const milestoneProgress = Math.min(100, (stats.totalScans / milestone.threshold) * 100)

  // Co2 gauge (0-100)
  const co2Pct = Math.min(100, (stats.totalCO2Saved / 100) * 100)
  const co2RadialData = [{ name: 'CO2', value: co2Pct, fill: '#10b981' }]

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
                <BarChart3 size={14} /> Personal Dashboard
              </div>
              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight">
                Your <span className="text-gradient-emerald">Impact</span> Story
              </h1>
              <p className="text-emerald-900/70 mt-2">Every scan, every gram, every tree saved.</p>
            </div>
            <Link href="/scan" className="btn-eco px-6 py-3 rounded-2xl flex items-center gap-2 self-start">
              <ScanLine size={18} /> New Scan <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Hero stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Hero icon={<TrendingUp size={22} />} label="Total Earnings" value={`$${stats.totalEarnings.toFixed(2)}`} sub="SGD" color="from-emerald-400 to-teal-500" />
            <Hero icon={<Recycle size={22} />} label="Diverted" value={`${stats.totalScrapsDiverted.toFixed(2)} kg`} sub="from landfill" color="from-sky-400 to-cyan-500" />
            <Hero icon={<Wind size={22} />} label="CO₂ Saved" value={`${stats.totalCO2Saved.toFixed(2)} kg`} sub="emissions" color="from-green-400 to-emerald-500" />
            <Hero icon={<ScanLine size={22} />} label="Scans" value={stats.totalScans} sub="all-time" color="from-amber-400 to-orange-500" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Earnings chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500" /> Earnings This Week</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Last 7 days</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData}>
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="date" stroke="#047857" fontSize={12} />
                    <YAxis stroke="#047857" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #a7f3d0', background: 'rgba(255,255,255,0.95)' }} />
                    <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fill="url(#earnGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* CO2 gauge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4"><Wind size={18} className="text-emerald-500" /> CO₂ Goal</h3>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={co2RadialData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={20} fill="#10b981" background={{ fill: '#d1fae5' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-display font-bold text-3xl text-gradient-emerald">{stats.totalCO2Saved.toFixed(1)}</div>
                  <div className="text-xs text-emerald-700/70 uppercase tracking-widest">kg CO₂ / 100</div>
                </div>
              </div>
              <p className="text-xs text-emerald-700/70 text-center mt-2">
                {(100 - stats.totalCO2Saved).toFixed(1)} kg to next reward tier
              </p>
            </motion.div>

            {/* Category breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-3xl p-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4"><Globe2 size={18} className="text-emerald-500" /> By Category</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {categoryData.map((c, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[c.name] || '#10b981'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #a7f3d0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[c.name] }} />
                    <span className="capitalize text-emerald-900/80">{c.name}</span>
                    <span className="text-emerald-700/60 ml-auto">{c.value} kg</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weight bar chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6 lg:col-span-2">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4"><Recycle size={18} className="text-emerald-500" /> Weight Diverted</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData}>
                    <defs>
                      <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="date" stroke="#047857" fontSize={12} />
                    <YAxis stroke="#047857" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #a7f3d0' }} />
                    <Bar dataKey="weight" fill="url(#wGrad)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Milestone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-3xl p-6 mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg flex items-center gap-2"><Target size={18} className="text-emerald-500" /> Next Milestone</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-3xl">{milestone.badge}</span>
                <span className="font-display font-bold text-emerald-700">{milestone.label}</span>
              </div>
            </div>
            <div className="relative h-4 bg-emerald-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400"
                initial={{ width: 0 }}
                animate={{ width: `${milestoneProgress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-900">
                {stats.totalScans} / {milestone.threshold} scans
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              {MILESTONES.map((m) => (
                <div key={m.label} className={`flex flex-col items-center ${stats.totalScans >= m.threshold ? 'text-emerald-600 font-bold' : 'text-emerald-700/50'}`}>
                  <span className="text-base">{m.badge}</span>
                  <span>{m.threshold}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-5">
            <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2 px-2">
              <Trophy size={20} className="text-amber-500" /> Achievements
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((a, i) => {
                const cur = stats[a.key] || 0
                const done = cur >= a.goal
                const pct = Math.min(100, (cur / a.goal) * 100)
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`glass rounded-2xl p-4 flex gap-3 items-center relative overflow-hidden ${done ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20' : 'opacity-90'}`}
                  >
                    {done && <div className="absolute top-1 right-1 text-xs font-bold text-emerald-600">✓ Unlocked</div>}
                    <div className={`w-14 h-14 rounded-2xl grid place-items-center text-3xl ${done ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md' : 'bg-emerald-100'}`}>
                      {a.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-sm">{a.name}</div>
                      <div className="text-xs text-emerald-700/70 mb-1.5">{a.desc}</div>
                      <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-3xl p-6 mt-5">
            <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4"><Sparkles size={18} className="text-emerald-500" /> Recent Activity</h3>
            {scanHistory.length === 0 ? (
              <div className="text-center py-8 text-emerald-700/60">
                <Leaf className="mx-auto mb-2" size={28} />
                No scans yet. <Link href="/scan" className="text-emerald-600 font-semibold underline">Start scanning</Link> to grow your impact.
              </div>
            ) : (
              <div className="divide-y divide-emerald-100">
                {scanHistory.slice(0, 8).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    {s.image ? (
                      <img src={s.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-300 to-teal-400 grid place-items-center text-white"><Recycle size={18} /></div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold capitalize">{s.category}</div>
                      <div className="text-xs text-emerald-700/70">{s.estimatedWeightKg?.toFixed(2)} kg · {(s.confidenceScore * 100).toFixed(0)}% confidence</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gradient-emerald">+${s.estimatedValue?.toFixed(2)}</div>
                      <div className="text-xs text-emerald-700/60">{s.co2Saved?.toFixed(2) || 0} kg CO₂</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Hero({ icon, label, value, sub, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl translate-x-1/3 -translate-y-1/3" />
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} grid place-items-center text-white shadow-lg mb-3`}>
        {icon}
      </div>
      <div className="text-xs uppercase tracking-widest text-emerald-700/70 font-medium">{label}</div>
      <div className="font-display font-bold text-3xl text-foreground">{value}</div>
      <div className="text-xs text-emerald-700/60 mt-0.5">{sub}</div>
    </motion.div>
  )
}

export default Page
