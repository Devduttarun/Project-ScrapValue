'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Lock, Trash2, HelpCircle, Info, Settings as SettingsIcon, Leaf, Heart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useScrapStore } from '@/lib/store'

function Toggle({ value, onChange }) {
  return (
    <button onClick={onChange} className={`w-12 h-7 rounded-full transition relative ${value ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition ${value ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

function Row({ icon, title, sub, right }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-10 h-10 rounded-xl bg-emerald-100 grid place-items-center text-emerald-600">{icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-foreground">{title}</div>
        {sub && <div className="text-xs text-emerald-700/70">{sub}</div>}
      </div>
      {right}
    </div>
  )
}

function Page() {
  const [notif, setNotif] = useState(true)
  const [analytics, setAnalytics] = useState(true)
  const [haptic, setHaptic] = useState(true)
  const { scanHistory, totalEarnings, totalScrapsDiverted, totalCO2Saved, resetStats } = useScrapStore()

  const onReset = () => {
    if (window.confirm('This will clear all your scan history and earnings. Continue?')) {
      resetStats()
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
              <SettingsIcon size={14} /> Preferences
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-3">
              Settings <span className="text-gradient-emerald">& Profile</span>
            </h1>
            <p className="text-emerald-900/70">Manage your account and preferences</p>
          </motion.div>

          {/* Profile / stats card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-300/30 to-teal-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-400 grid place-items-center text-4xl shadow-xl">
                🌱
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-2xl">Earth Champion</div>
                <div className="text-sm text-emerald-700/70">Level 3 Recycler · Member since today</div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <Stat label="Earned" value={`$${totalEarnings.toFixed(2)}`} />
                  <Stat label="Diverted" value={`${totalScrapsDiverted.toFixed(1)} kg`} />
                  <Stat label="CO₂ Saved" value={`${totalCO2Saved.toFixed(1)} kg`} />
                </div>
              </div>
            </div>
          </motion.div>

          <Section title="Notifications">
            <Row icon={<Bell size={18} />} title="Price Alerts" sub="Notify me when scrap prices change" right={<Toggle value={notif} onChange={() => setNotif(!notif)} />} />
            <Row icon={<Heart size={18} />} title="Haptic Feedback" sub="Subtle vibrations during scans" right={<Toggle value={haptic} onChange={() => setHaptic(!haptic)} />} />
          </Section>

          <Section title="Privacy & Data">
            <Row icon={<Lock size={18} />} title="Analytics" sub="Help improve ScrapValue with anonymous usage data" right={<Toggle value={analytics} onChange={() => setAnalytics(!analytics)} />} />
            <Row icon={<Lock size={18} />} title="Privacy Policy" sub="Review data handling practices" right={<span className="text-emerald-600">›</span>} />
            <Row icon={<Lock size={18} />} title="Terms of Service" sub="Read our terms" right={<span className="text-emerald-600">›</span>} />
          </Section>

          <Section title="Account Data">
            <Row icon={<Leaf size={18} />} title="Total Scans" sub={`${scanHistory.length} items recognized`} right={<span className="font-bold text-emerald-700">{scanHistory.length}</span>} />
            <Row icon={<Heart size={18} />} title="Account Created" right={<span className="font-bold text-emerald-700">Today</span>} />
            <div className="p-4 border-t border-emerald-100">
              <button onClick={onReset} className="w-full py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-semibold hover:bg-orange-100 flex items-center justify-center gap-2">
                <Trash2 size={16} /> Clear All Data
              </button>
            </div>
          </Section>

          <Section title="Help & Support">
            <Row icon={<HelpCircle size={18} />} title="FAQ" sub="Common questions answered" right={<span className="text-emerald-600">›</span>} />
            <Row icon={<Info size={18} />} title="Contact Support" sub="support@scrapvalue.com" right={<span className="text-emerald-600">›</span>} />
          </Section>

          <div className="glass rounded-3xl p-6 text-center mt-6">
            <div className="text-3xl mb-2">♻️</div>
            <div className="font-display font-bold text-lg">ScrapValue v1.0.0</div>
            <p className="text-xs text-emerald-700/70 mt-1">Built for a sustainable future · Dedicated to Earth 🌱</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs uppercase tracking-widest font-bold text-emerald-700/80 mb-2 px-2">{title}</h2>
      <div className="glass rounded-2xl divide-y divide-emerald-100/60">{children}</div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/60 rounded-xl p-2 text-center border border-emerald-100/60">
      <div className="text-xs uppercase tracking-widest text-emerald-700/70">{label}</div>
      <div className="font-display font-bold text-lg text-foreground">{value}</div>
    </div>
  )
}

export default Page
