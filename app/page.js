'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import {
  ScanLine, Sparkles, Leaf, Wind, Droplets, Sun, Recycle, ArrowRight,
  Zap, TreePine, Waves, Globe2, Network, Award, TrendingUp, Users,
  CircleCheck, ChevronDown, Cpu, BarChart3, Heart, Earth as EarthIcon
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import SmoothScroll from '@/components/SmoothScroll'

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false })

// ============ HERO SECTION ============
function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      {/* atmospheric background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-emerald-50 to-teal-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-yellow-100/60 via-emerald-100/30 to-transparent blur-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(254,249,195,0.7) 0%, rgba(209,250,229,0.4) 40%, transparent 70%)' }} />
        <FloatingOrbs />
      </div>

      {/* 3D Earth Scene */}
      <motion.div className="absolute inset-0" style={{ scale }}>
        <HeroScene />
      </motion.div>

      {/* Foreground UI */}
      <motion.div style={{ y, opacity }} className="relative z-10 h-full container mx-auto px-6 pointer-events-none">
        <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
          <div className="flex flex-col items-start text-left pt-24 lg:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="pointer-events-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass border border-emerald-200/60 text-sm font-medium text-emerald-700">
            <Sparkles size={14} className="text-emerald-500" />
            AI-Powered Material Recognition
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] mb-6"
        >
          Turn Trash<br />
          <span className="text-gradient-emerald">Into Value</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-lg md:text-xl text-emerald-900/80 max-w-xl mb-10 font-medium"
        >
          AI-powered material recognition that rewards sustainable action. Every piece matters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 pointer-events-auto"
        >
          <Link href="/scan" className="btn-eco px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 group">
            <ScanLine size={20} /> Start Scanning Now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
          </Link>
          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="glass px-8 py-4 rounded-2xl font-semibold text-emerald-800 hover:bg-white/70 transition flex items-center gap-2"
          >
            Discover the Story <ChevronDown size={18} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-10 flex items-center gap-6 pointer-events-auto"
        >
          <div className="flex -space-x-2">
            {['🌱','🌊','☀️','🌳'].map((e, i) => (
              <div key={i} className="w-9 h-9 rounded-full glass grid place-items-center text-lg ring-2 ring-white/60">{e}</div>
            ))}
          </div>
          <div className="text-sm text-emerald-800/80">
            <div className="font-bold">12,000+ scans this week</div>
            <div className="text-xs">Join the movement</div>
          </div>
        </motion.div>
          </div>
          <div className="hidden lg:block" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-emerald-700/70 text-xs font-medium uppercase tracking-widest"
        >
          <span>Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

function FloatingOrbs() {
  const orbs = [
    { color: 'from-emerald-300 to-teal-300', x: 10, y: 20, s: 200 },
    { color: 'from-sky-300 to-cyan-300', x: 80, y: 60, s: 280 },
    { color: 'from-yellow-200 to-emerald-200', x: 70, y: 15, s: 180 },
    { color: 'from-teal-200 to-blue-300', x: 20, y: 70, s: 240 },
  ]
  return (
    <>
      {orbs.map((o, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${o.color} blur-3xl opacity-50 animate-drift`}
          style={{
            left: `${o.x}%`, top: `${o.y}%`, width: o.s, height: o.s,
            animationDelay: `${i * 1.5}s`
          }}
        />
      ))}
    </>
  )
}

// ============ SECTION 2 - AI SCAN EXPERIENCE ============
function AIScanSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotateY = useTransform(scrollYProgress, [0, 1], [-180, 180])

  return (
    <section ref={ref} className="relative min-h-screen py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50 via-emerald-50 to-sky-50" />
      <FloatingOrbs />

      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
            <Cpu size={14} /> Neural Vision Engine
          </div>
          <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-6">
            Scan. <span className="text-gradient-emerald">Recognize.</span> Reward.
          </h2>
          <p className="text-xl text-emerald-900/70 max-w-2xl mx-auto">
            Point your camera at any recyclable. Our AI identifies material, weight, and live market value in seconds.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Scanning visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* outer scan rings */}
              {[1, 2, 3].map((r) => (
                <motion.div
                  key={r}
                  className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, delay: r * 0.3 }}
                />
              ))}
              {/* center scan circle */}
              <div className="absolute inset-8 rounded-full glass border-2 border-emerald-300/60 grid place-items-center overflow-hidden">
                <motion.div
                  className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-emerald-100 via-teal-100 to-sky-100 grid place-items-center relative"
                  style={{ rotateY }}
                >
                  <div className="text-7xl">♻️</div>
                  {/* scanning line */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>
              {/* corner brackets */}
              {[[0, 0], [0, 1], [1, 0], [1, 1]].map(([y, x], i) => (
                <div
                  key={i}
                  className={`absolute w-12 h-12 border-emerald-500 ${y === 0 ? 'top-0 border-t-4' : 'bottom-0 border-b-4'} ${x === 0 ? 'left-0 border-l-4' : 'right-0 border-r-4'} rounded-${y === 0 ? (x === 0 ? 'tl' : 'tr') : x === 0 ? 'bl' : 'br'}-3xl`}
                />
              ))}
              {/* floating data points */}
              <ScanDataPoints />
            </div>
          </motion.div>

          {/* Detection details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-4"
          >
            <DetectionCard label="Material Type" value="Plastic (PET)" icon="🔵" accent="from-blue-500 to-cyan-500" delay={0} />
            <DetectionCard label="Confidence Score" value="94.3%" icon="📊" accent="from-emerald-500 to-teal-500" delay={0.1} />
            <DetectionCard label="Estimated Value" value="$0.18 / kg" icon="💎" accent="from-amber-400 to-yellow-500" delay={0.2} />
            <DetectionCard label="Environmental Impact" value="2.1 kg CO₂ saved" icon="🌍" accent="from-green-500 to-emerald-500" delay={0.3} />

            <Link href="/scan" className="btn-eco mt-6 inline-flex px-8 py-4 rounded-2xl font-semibold gap-2 group">
              <ScanLine size={20} /> Try the Scanner
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ScanDataPoints() {
  const points = [
    { x: '90%', y: '20%', label: 'PET' },
    { x: '10%', y: '60%', label: '94%' },
    { x: '85%', y: '75%', label: '0.35kg' },
    { x: '5%', y: '15%', label: '$0.06' },
  ]
  return (
    <>
      {points.map((p, i) => (
        <motion.div
          key={i}
          className="absolute px-2 py-1 rounded-md text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"
          style={{ left: p.x, top: p.y }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + i * 0.15 }}
        >
          {p.label}
        </motion.div>
      ))}
    </>
  )
}

function DetectionCard({ label, value, icon, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${accent} grid place-items-center text-2xl shadow-lg`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-widest text-emerald-700/70 font-medium">{label}</div>
        <div className="text-xl font-display font-bold text-foreground">{value}</div>
      </div>
      <CircleCheck className="text-emerald-500" size={22} />
    </motion.div>
  )
}

// ============ SECTION 3 - VALUE DISCOVERY ============
function ValueDiscoverySection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const categories = [
    { name: 'Plastic', icon: '🔵', value: '+$2.35', color: 'from-blue-400 to-cyan-400', weight: '0.35 kg' },
    { name: 'Metal', icon: '⚙️', value: '+$5.60', color: 'from-slate-400 to-blue-400', weight: '1.20 kg' },
    { name: 'Glass', icon: '🔷', value: '+$0.80', color: 'from-cyan-400 to-blue-300', weight: '2.10 kg' },
    { name: 'Paper', icon: '📄', value: '+$1.45', color: 'from-amber-300 to-orange-300', weight: '1.80 kg' },
  ]

  return (
    <section ref={ref} className="relative min-h-screen py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-emerald-50 to-emerald-100" />
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
            <Sparkles size={14} /> Smart Sorting
          </div>
          <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-6">
            Waste Becomes <span className="text-gradient-emerald">Opportunity</span>
          </h2>
          <p className="text-xl text-emerald-900/70 max-w-2xl mx-auto">
            Watch mixed waste sort itself by category as AI identifies, separates, and assigns value.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15, type: 'spring' }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              <div className="glass rounded-3xl p-8 text-center group cursor-pointer">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${cat.color} grid place-items-center text-5xl shadow-2xl shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition`}
                >
                  {cat.icon}
                </motion.div>
                <div className="font-display font-bold text-2xl mb-1">{cat.name}</div>
                <div className="text-sm text-emerald-700/70 mb-3">{cat.weight}</div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.15, type: 'spring' }}
                  className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg"
                >
                  {cat.value}
                </motion.div>
              </div>
              {/* energy particle */}
              <motion.div
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-400 blur-sm"
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-2xl font-display font-bold text-2xl">
            <TrendingUp className="text-emerald-500" size={24} />
            <span>Total Earned: </span>
            <span className="text-gradient-emerald">$10.20</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============ SECTION 4 - ENVIRONMENTAL IMPACT ============
function ImpactSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  return (
    <section ref={ref} className="relative min-h-screen py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-100 via-emerald-50 to-teal-50" />
      {/* Forest atmosphere */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-20 left-10 text-9xl">🌳</div>
        <div className="absolute bottom-32 right-20 text-8xl">🌲</div>
        <div className="absolute top-1/2 left-1/3 text-7xl">🌿</div>
        <div className="absolute bottom-20 left-1/2 text-9xl">🌳</div>
      </div>

      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
            <TreePine size={14} /> Real Environmental Impact
          </div>
          <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-6">
            Every Scan <span className="text-gradient-emerald">Grows the Planet</span>
          </h2>
          <p className="text-xl text-emerald-900/70 max-w-2xl mx-auto">
            From polluted to pristine — see how collective action restores ecosystems.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactStat icon={<Wind size={28} />} label="CO₂ Saved" value={148720} suffix=" kg" color="from-emerald-400 to-teal-500" />
          <ImpactStat icon={<Recycle size={28} />} label="Waste Diverted" value={62450} suffix=" kg" color="from-sky-400 to-cyan-500" />
          <ImpactStat icon={<Droplets size={28} />} label="Materials Recycled" value={94800} suffix="" color="from-blue-400 to-emerald-400" />
          <ImpactStat icon={<TreePine size={28} />} label="Trees Protected" value={3284} suffix="" color="from-green-400 to-lime-400" />
        </div>

        {/* Transformation visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 glass rounded-3xl p-8 lg:p-12 relative overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="text-emerald-500 fill-emerald-500" size={20} />
                <span className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Our Mission</span>
              </div>
              <h3 className="font-display font-bold text-3xl md:text-4xl mb-4 leading-tight">
                Transforming landscapes,<br /> one scan at a time.
              </h3>
              <p className="text-emerald-900/70 text-lg leading-relaxed mb-6">
                Trees grow. Rivers clear. Air freshens. Wildlife returns. Each scrap diverted from landfill is a small miracle compounded across millions of users worldwide.
              </p>
              <div className="flex flex-wrap gap-2">
                {['🌳 Reforestation', '💧 Clean Water', '🦋 Biodiversity', '☀️ Clean Energy'].map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-white/70 text-sm font-medium border border-emerald-200">{t}</span>
                ))}
              </div>
            </div>
            <div className="relative h-64 lg:h-80">
              <EcosystemVisual />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ImpactStat({ icon, label, value, suffix, color }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)
  const inView = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !inView.current) {
          inView.current = true
          let start = 0
          const duration = 2000
          const startTime = performance.now()
          const tick = (now) => {
            const t = Math.min(1, (now - startTime) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(Math.floor(eased * value))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      })
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="glass rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-emerald-500/10 transition"
    >
      <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${color} grid place-items-center text-white shadow-lg`}>
        {icon}
      </div>
      <div className="font-display font-bold text-3xl md:text-4xl mb-1 text-foreground">
        {display.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-emerald-700/80 font-medium uppercase tracking-wider">{label}</div>
    </motion.div>
  )
}

function EcosystemVisual() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-200">
      {/* Sun */}
      <motion.div
        className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 shadow-[0_0_60px_rgba(251,191,36,0.5)]"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      {/* Mountains */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2">
        <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
          <path d="M 0,200 L 0,120 L 80,60 L 160,100 L 240,40 L 320,80 L 400,30 L 400,200 Z" fill="url(#mountainGrad)" />
          <defs>
            <linearGradient id="mountainGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#34d399" />
              <stop offset="1" stopColor="#065f46" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Trees */}
      <div className="absolute bottom-4 left-4 text-5xl">🌲</div>
      <div className="absolute bottom-8 left-20 text-4xl">🌳</div>
      <div className="absolute bottom-6 right-16 text-5xl">🌲</div>
      <div className="absolute bottom-12 right-32 text-4xl">🌳</div>
      {/* Birds */}
      <motion.div
        className="absolute top-12 left-12 text-2xl"
        animate={{ x: [0, 200, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      >
        🦋
      </motion.div>
    </div>
  )
}

// ============ SECTION 5 - NETWORK ============
function NetworkSection() {
  return (
    <section className="relative min-h-screen py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50 via-sky-50 to-emerald-50" />
      <FloatingOrbs />

      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
            <Network size={14} /> Circular Economy Network
          </div>
          <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-6">
            A Living <span className="text-gradient-emerald">Ecosystem</span>
          </h2>
          <p className="text-xl text-emerald-900/70 max-w-2xl mx-auto">
            Collection points, recycling centers, and AI routing connected by flowing energy.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto h-[480px] glass rounded-3xl overflow-hidden">
          <NetworkVisualization />
        </div>
      </div>
    </section>
  )
}

function NetworkVisualization() {
  const nodes = [
    { id: 'scan', label: 'Scan', icon: '📱', x: 15, y: 50 },
    { id: 'ai', label: 'AI Engine', icon: '🧠', x: 38, y: 30 },
    { id: 'route', label: 'Routing', icon: '🛰️', x: 38, y: 70 },
    { id: 'plastic', label: 'Plastic Hub', icon: '🔵', x: 70, y: 20 },
    { id: 'metal', label: 'Metal Yard', icon: '⚙️', x: 70, y: 50 },
    { id: 'paper', label: 'Paper Mill', icon: '📄', x: 70, y: 80 },
    { id: 'final', label: 'New Products', icon: '✨', x: 92, y: 50 },
  ]
  const connections = [
    ['scan', 'ai'], ['scan', 'route'],
    ['ai', 'plastic'], ['ai', 'metal'], ['ai', 'paper'],
    ['route', 'plastic'], ['route', 'metal'], ['route', 'paper'],
    ['plastic', 'final'], ['metal', 'final'], ['paper', 'final'],
  ]

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" x2="1">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#14b8a6" stopOpacity="1" />
          <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {connections.map((c, i) => {
        const a = nodes.find((n) => n.id === c[0])
        const b = nodes.find((n) => n.id === c[1])
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="url(#lineGrad)" strokeWidth="0.4" />
            <circle r="0.6" fill="#10b981">
              <animateMotion dur={`${2 + i * 0.3}s`} repeatCount="indefinite" path={`M ${a.x},${a.y} L ${b.x},${b.y}`} />
            </circle>
          </g>
        )
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="3.5" fill="white" stroke="#10b981" strokeWidth="0.5" />
          <text x={n.x} y={n.y + 1} fontSize="3" textAnchor="middle" alignmentBaseline="middle">{n.icon}</text>
          <text x={n.x} y={n.y + 6} fontSize="2" textAnchor="middle" fill="#047857" fontWeight="600">{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ============ SECTION 6 - COMMUNITY ============
function CommunitySection() {
  const top = [
    { name: 'Aria K.', score: 2840, kg: 1820, badge: '🌳', tier: 'Forest Guardian' },
    { name: 'Marcus L.', score: 2310, kg: 1490, badge: '🌊', tier: 'Ocean Keeper' },
    { name: 'Sofia R.', score: 1980, kg: 1265, badge: '☀️', tier: 'Solar Hero' },
    { name: 'Daniel W.', score: 1750, kg: 1100, badge: '🌿', tier: 'Green Champion' },
    { name: 'Mei T.', score: 1490, kg: 950, badge: '🦋', tier: 'Earth Friend' },
    { name: 'Hadi B.', score: 1310, kg: 845, badge: '🌎', tier: 'Planet Saver' },
  ]

  return (
    <section className="relative min-h-screen py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-teal-50 to-sky-50" />
      <FloatingOrbs />

      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
            <Users size={14} /> Community Impact
          </div>
          <h2 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-6">
            Together We <span className="text-gradient-emerald">Restore Earth</span>
          </h2>
          <p className="text-xl text-emerald-900/70 max-w-2xl mx-auto">
            Real heroes. Real impact. Join the growing global movement.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {top.map((u, i) => (
            <TiltCard key={u.name} index={i} user={u} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TiltCard({ user, index }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-50, 50], [10, -10]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(mx, [-50, 50], [-10, 10]), { stiffness: 200, damping: 20 })

  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top - r.height / 2)
  }
  const reset = () => { mx.set(0); my.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-3xl p-6 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/0 to-emerald-200/30 opacity-0 group-hover:opacity-100 transition pointer-events-none" />
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl">{user.badge}</div>
        <div className="flex flex-col items-end">
          <div className="text-xs uppercase tracking-widest text-emerald-700/60">Rank</div>
          <div className="font-display font-bold text-2xl text-gradient-emerald">#{index + 1}</div>
        </div>
      </div>
      <div className="font-display font-bold text-xl mb-1">{user.name}</div>
      <div className="text-sm text-emerald-700/70 mb-4">{user.tier}</div>
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-200/40">
        <div>
          <div className="text-xs uppercase tracking-widest text-emerald-700/60 mb-1">Score</div>
          <div className="font-display font-bold text-lg">{user.score.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-emerald-700/60 mb-1">Diverted</div>
          <div className="font-display font-bold text-lg">{user.kg} kg</div>
        </div>
      </div>
    </motion.div>
  )
}

// ============ SECTION 7 - FINAL CTA ============
function FinalCTASection() {
  return (
    <section className="relative min-h-screen py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-emerald-100 to-teal-200" />
      <FloatingOrbs />

      <div className="container relative mx-auto px-6 flex flex-col items-center justify-center text-center">
        {/* Clean Earth visualization */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, type: 'spring' }}
          className="relative w-64 h-64 md:w-80 md:h-80 mb-12"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 via-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/40 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-300 via-teal-300 to-sky-300 grid place-items-center text-7xl">
            🌍
          </div>
          {/* Orbiting clean energy */}
          {['☀️', '💨', '🌊', '🌿'].map((emoji, i) => {
            const angle = (i / 4) * 360
            return (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 text-3xl grid place-items-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                style={{ transformOrigin: '50% 50%' }}
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{ transform: `rotate(${angle}deg) translateX(180px) rotate(-${angle}deg)` }}
                >
                  {emoji}
                </motion.div>
              </motion.div>
            )
          })}
          {/* Pulse rings */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 1.5 }}
            />
          ))}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-display font-bold text-5xl md:text-8xl tracking-tight leading-[1.05] mb-6"
        >
          Every Piece <span className="text-gradient-emerald">Matters</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-xl text-emerald-900/70 max-w-2xl mb-10"
        >
          The world&apos;s most ambitious sustainability movement starts with a single scan.<br />
          Join us.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Link href="/scan" className="relative inline-flex items-center gap-3 group">
            <span className="btn-eco px-12 py-6 text-xl rounded-3xl font-bold flex items-center gap-3 relative z-10">
              <ScanLine size={24} /> Start Scanning
              <ArrowRight size={22} className="group-hover:translate-x-2 transition" />
            </span>
            <span className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-400 blur-2xl opacity-50 group-hover:opacity-100 transition animate-pulse-glow" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-3xl"
        >
          <div className="text-center">
            <div className="font-display font-bold text-3xl text-gradient-emerald">94k+</div>
            <div className="text-sm text-emerald-700/70">Materials Recycled</div>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-3xl text-gradient-emerald">148t</div>
            <div className="text-sm text-emerald-700/70">CO₂ Saved</div>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-3xl text-gradient-emerald">3.2k</div>
            <div className="text-sm text-emerald-700/70">Trees Protected</div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative container mx-auto px-6 mt-20 pt-12 border-t border-emerald-200/40 text-emerald-800/70 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Recycle size={16} className="text-emerald-600" />
          <span>© 2026 ScrapValue · Built for a sustainable future</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/scan" className="hover:text-emerald-600">Scan</Link>
          <Link href="/buyers" className="hover:text-emerald-600">Buyers</Link>
          <Link href="/market" className="hover:text-emerald-600">Market</Link>
          <Link href="/map" className="hover:text-emerald-600">Map</Link>
          <Link href="/settings" className="hover:text-emerald-600">Settings</Link>
        </div>
      </footer>
    </section>
  )
}

// ============ PAGE ============
function App() {
  return (
    <SmoothScroll>
      <div className="relative">
        <div className="grain" />
        <Navbar />
        <main className="relative">
          <HeroSection />
          <AIScanSection />
          <ValueDiscoverySection />
          <ImpactSection />
          <NetworkSection />
          <CommunitySection />
          <FinalCTASection />
        </main>
      </div>
    </SmoothScroll>
  )
}

export default App
