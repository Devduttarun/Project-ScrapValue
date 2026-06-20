'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Recycle, Star, MapPin, Clock, ArrowRight, Sparkles, ShieldCheck, Truck,
  Filter, ScanLine, Navigation, Loader2, AlertCircle,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { BUYERS } from '@/lib/buyers'
import { useScrapStore } from '@/lib/store'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'metal', label: 'Metal' },
  { id: 'glass', label: 'Glass' },
  { id: 'paper', label: 'Paper' },
  { id: 'textile', label: 'Textile' },
]

const SINGAPORE_DEFAULT = { lat: 1.3521, lng: 103.8198 }

function PageInner() {
  const searchParams = useSearchParams()
  const initialCat = (searchParams.get('cat') || 'all').toLowerCase()
  const [filter, setFilter] = useState(initialCat)
  const { lastScan, userLocation, updateLocation } = useScrapStore()
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingDefault, setUsingDefault] = useState(false)
  const [locError, setLocError] = useState(null)

  // filter can be "all", a single category, or a comma list like "plastic,metal,textile"
  const isMultiFilter = filter.includes(',')
  const filterCats = isMultiFilter ? filter.split(',').filter(Boolean) : [filter]

  const fetchPlaces = async (lat, lng, cat) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&category=${cat}&radius=8000`)
      const json = await res.json()
      setPlaces(json.places || [])
    } catch (e) {
      console.error(e)
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  const useLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation unavailable')
      return
    }
    setLocError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude)
        setUsingDefault(false)
        fetchPlaces(pos.coords.latitude, pos.coords.longitude, filter)
      },
      () => {
        setLocError('Location denied. Showing Singapore central by default.')
        setUsingDefault(true)
        updateLocation(SINGAPORE_DEFAULT.lat, SINGAPORE_DEFAULT.lng)
        fetchPlaces(SINGAPORE_DEFAULT.lat, SINGAPORE_DEFAULT.lng, filter)
      },
      { enableHighAccuracy: true, timeout: 6000 }
    )
  }

  useEffect(() => {
    if (userLocation.lat) {
      fetchPlaces(userLocation.lat, userLocation.lng, filter)
    } else {
      setUsingDefault(true)
      updateLocation(SINGAPORE_DEFAULT.lat, SINGAPORE_DEFAULT.lng)
      fetchPlaces(SINGAPORE_DEFAULT.lat, SINGAPORE_DEFAULT.lng, filter)
    }
    // eslint-disable-next-line
  }, [filter])

  // Use real places if found, fallback to seed buyers
  const data = places.length > 0
    ? places
    : (filter === 'all'
        ? BUYERS
        : BUYERS.filter((b) => filterCats.includes(b.category) || b.category === 'multi'))

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
              <Sparkles size={14} /> Real Verified Buyers
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-3">
              Find Your <span className="text-gradient-emerald">Best Buyer</span>
            </h1>
            <p className="text-emerald-900/70 max-w-xl mx-auto">
              Live Google Places network of recycling centers, scrap yards, and upcyclers around you.
            </p>
          </motion.div>

          {lastScan && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center text-white">
                <ScanLine size={22} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-widest text-emerald-700/70">Latest Scan</div>
                <div className="font-display font-bold capitalize">
                  {(lastScan.materials || [{ category: lastScan.category }]).map((m) => m.category).join(' + ')} · ${lastScan.estimatedValue?.toFixed(2)}
                </div>
              </div>
              <Link href="/scan" className="px-4 py-2 rounded-xl bg-white/70 border border-emerald-200 text-emerald-800 text-sm font-semibold hover:bg-white">Scan Again</Link>
            </motion.div>
          )}

          {isMultiFilter && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
              <Sparkles size={14} /> Showing buyers for all {filterCats.length} materials from your scan: <span className="font-semibold capitalize">{filterCats.join(', ')}</span>
            </div>
          )}

          <div className="glass rounded-2xl p-3 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 grid place-items-center text-emerald-600"><MapPin size={18} /></div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-emerald-700/70">{usingDefault ? 'Showing Singapore central' : 'Around your location'}</div>
              <div className="text-sm font-semibold">{userLocation.lat?.toFixed(4)}, {userLocation.lng?.toFixed(4)}</div>
            </div>
            <button onClick={useLocation} className="px-3 py-2 rounded-xl bg-white/80 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-white flex items-center gap-1">
              <Navigation size={14} /> Use my location
            </button>
          </div>
          {locError && <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs flex items-center gap-2"><AlertCircle size={14} /> {locError}</div>}

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
            <Filter size={16} className="text-emerald-600 flex-shrink-0" />
            {CATEGORY_FILTERS.map((f) => {
              const isActive = isMultiFilter ? filterCats.includes(f.id) : filter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'bg-white/70 text-emerald-800 border border-emerald-200 hover:bg-white'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className="glass rounded-3xl p-10 text-center">
              <Loader2 className="animate-spin mx-auto text-emerald-500 mb-2" size={28} />
              <div className="text-emerald-800 font-semibold">Finding verified buyers near you…</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {data.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 6) * 0.05 }}
                  className="glass rounded-3xl overflow-hidden group hover:-translate-y-1 transition-transform"
                >
                  <div className={`h-2 bg-gradient-to-r ${b.color || 'from-emerald-400 to-teal-500'}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color || 'from-emerald-400 to-teal-500'} grid place-items-center text-white shadow-lg flex-shrink-0`}>
                          <Recycle size={26} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display font-bold text-lg leading-tight truncate">{b.name}</div>
                          <div className="text-xs text-emerald-700/70 truncate">{b.type}</div>
                          <div className="text-[11px] text-emerald-700/60 truncate mt-0.5">{b.address}</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                        <ShieldCheck size={10} /> {b.badge || 'Verified'}
                      </div>
                    </div>
                    {isMultiFilter && b.category && b.category !== 'multi' && (
                      <div className="mb-3 -mt-1">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold capitalize">
                          Buys {b.category}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <Mini icon={<Star size={12} />} label="Rating" value={b.rating?.toFixed?.(1) || b.rating || 4.4} />
                      <Mini icon={<MapPin size={12} />} label="Distance" value={`${b.distance} km`} />
                      <Mini icon={<Clock size={12} />} label="Status" value={b.openNow === false ? 'Closed' : 'Open'} accent={b.openNow === false ? 'text-orange-500' : 'text-emerald-600'} />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
                      <div>
                        <div className="text-xs text-emerald-700/70 uppercase tracking-widest">Est. Price</div>
                        <div className="font-display font-bold text-lg text-gradient-emerald">${(b.price || 0.2).toFixed(2)} <span className="text-xs text-emerald-700/70 font-normal">/kg</span></div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}&destination_place_id=${b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-eco px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5"
                      >
                        Directions <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && data.length === 0 && (
            <div className="glass rounded-3xl p-8 text-center">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-emerald-800">No buyers nearby. Try expanding to All or moving your location.</p>
            </div>
          )}

          <div className="mt-10 glass rounded-3xl p-6 text-center">
            <Truck className="mx-auto text-emerald-500 mb-3" size={32} />
            <h3 className="font-display font-bold text-xl mb-1">Need a Pickup?</h3>
            <p className="text-emerald-900/70 text-sm mb-4">For bulk loads (10kg+) we coordinate eco-friendly pickup directly with verified partners.</p>
            <button className="btn-eco px-6 py-3 rounded-2xl text-sm">Request Bulk Pickup</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Mini({ icon, label, value, accent }) {
  return (
    <div className="bg-white/60 rounded-xl p-2 border border-emerald-100/60 text-center">
      <div className="flex items-center justify-center gap-1 text-emerald-700/70 text-[9px] uppercase tracking-widest mb-0.5">{icon} {label}</div>
      <div className={`font-semibold text-sm ${accent || ''}`}>{value}</div>
    </div>
  )
}

function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading…</div>}>
      <PageInner />
    </Suspense>
  )
}

export default Page
