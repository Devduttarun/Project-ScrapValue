'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Recycle, Menu, X, ScanLine, Users, TrendingUp, Map as MapIcon, Settings, Home, BarChart3 } from 'lucide-react'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/scan', label: 'Scan', icon: ScanLine },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/buyers', label: 'Buyers', icon: Users },
  { href: '/market', label: 'Market', icon: TrendingUp },
  { href: '/map', label: 'Map', icon: MapIcon },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`glass rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-500 ${
            scrolled ? 'shadow-xl shadow-emerald-500/10' : ''
          }`}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-400 grid place-items-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Recycle className="text-white" size={22} strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 rounded-xl bg-emerald-400 blur-xl opacity-30 group-hover:opacity-50 transition" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-foreground tracking-tight leading-none">
                Scrap<span className="text-gradient-emerald">Value</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium uppercase tracking-widest">
                Turn Trash Into Value
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href
              const Icon = l.icon
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                      : 'text-emerald-800 hover:bg-white/60'
                  }`}
                >
                  <Icon size={16} />
                  {l.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/scan"
              className="btn-eco px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              <ScanLine size={16} /> Start Scanning
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-white/50"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass mt-2 rounded-2xl p-3 flex flex-col gap-1"
          >
            {NAV_LINKS.map((l) => {
              const Icon = l.icon
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    pathname === l.href
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'text-emerald-800 hover:bg-white/60'
                  }`}
                >
                  <Icon size={16} /> {l.label}
                </Link>
              )
            })}
            <Link
              href="/scan"
              onClick={() => setOpen(false)}
              className="btn-eco px-4 py-3 rounded-xl text-sm flex items-center gap-2 justify-center mt-1"
            >
              <ScanLine size={16} /> Start Scanning
            </Link>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
