'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin, Navigation, Sparkles, AlertCircle, Loader2, Star, ExternalLink,
  Recycle, ChevronRight,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useScrapStore } from '@/lib/store'

const SINGAPORE_DEFAULT = { lat: 1.3521, lng: 103.8198 }

function Page() {
  const { userLocation, updateLocation } = useScrapStore()
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('buyers')
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [usingDefault, setUsingDefault] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const loadPlaces = async (lat, lng) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&category=all&radius=8000`)
      const json = await res.json()
      setPlaces(json.places || [])
    } catch (e) {
      console.error(e)
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation unavailable.')
      return
    }
    setError(null)
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude)
        setUsingDefault(false)
        loadPlaces(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setError('Location denied. Showing Singapore central.')
        setUsingDefault(true)
        updateLocation(SINGAPORE_DEFAULT.lat, SINGAPORE_DEFAULT.lng)
        loadPlaces(SINGAPORE_DEFAULT.lat, SINGAPORE_DEFAULT.lng)
      },
      { enableHighAccuracy: true, timeout: 6000 }
    )
  }

  useEffect(() => {
    if (userLocation.lat !== null) {
      loadPlaces(userLocation.lat, userLocation.lng)
    } else {
      // auto-default to Singapore
      setUsingDefault(true)
      updateLocation(SINGAPORE_DEFAULT.lat, SINGAPORE_DEFAULT.lng)
      loadPlaces(SINGAPORE_DEFAULT.lat, SINGAPORE_DEFAULT.lng)
    }
    // eslint-disable-next-line
  }, [])

  const hotspots = [
    { id: 'h1', name: 'Marina Bay Eco Quay', tag: 'Mixed materials', icon: '🌆', distance: 1.4 },
    { id: 'h2', name: 'Tiong Bahru Food Centre', tag: 'High plastic volume', icon: '🍜', distance: 2.0 },
    { id: 'h3', name: 'Bukit Timah Park', tag: 'Community drop-zone', icon: '🌳', distance: 3.5 },
    { id: 'h4', name: 'Jurong Industrial Park', tag: 'Metal & paper hub', icon: '🏭', distance: 7.8 },
  ]

  // Build Google Static Maps URL with markers
  const mapImage = (() => {
    if (!userLocation.lat) return null
    const center = `${userLocation.lat},${userLocation.lng}`
    const markers = places.slice(0, 12).map((p, i) => `markers=color:0x10b981%7Clabel:${i + 1}%7C${p.lat},${p.lng}`).join('&')
    const userMarker = `markers=color:0x2563eb%7Clabel:U%7C${userLocation.lat},${userLocation.lng}`
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=13&size=1200x500&scale=2&maptype=roadmap&${userMarker}&${markers}&style=feature:landscape%7Ccolor:0xecfdf5&style=feature:water%7Ccolor:0xa5f3fc&style=feature:poi.park%7Celement:geometry%7Ccolor:0xa7f3d0&style=feature:road%7Celement:geometry%7Ccolor:0xffffff&key=${apiKey}`
  })()

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 border border-emerald-200 text-sm font-medium text-emerald-700">
              <MapPin size={14} /> Live Map
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-3">
              Recyclers <span className="text-gradient-emerald">Near You</span>
            </h1>
            <p className="text-emerald-900/70">Live Google Places data with verified buyers and hotspots</p>
          </motion.div>

          {/* Location bar */}
          <div className="glass rounded-2xl p-3 mb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 grid place-items-center text-emerald-600"><MapPin size={18} /></div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-emerald-700/70">{usingDefault ? 'Default: Singapore central' : 'Your location'}</div>
              <div className="text-sm font-semibold">{userLocation.lat?.toFixed(4)}, {userLocation.lng?.toFixed(4)}</div>
            </div>
            <button onClick={requestLocation} className="btn-eco px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
              <Navigation size={14} /> Use my location
            </button>
          </div>
          {error && <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}

          {/* Map */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl overflow-hidden mb-6 relative">
            {mapImage ? (
              <div className="relative">
                <img src={mapImage} alt="Map of nearby recyclers" className="w-full h-[420px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/40 via-transparent to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="h-[420px] grid place-items-center">
                <Loader2 className="animate-spin text-emerald-500" size={28} />
              </div>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 glass rounded-2xl p-1 mb-4 max-w-md">
            <button onClick={() => setTab('buyers')} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${tab === 'buyers' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-emerald-800'}`}>
              Buyers ({places.length})
            </button>
            <button onClick={() => setTab('hotspots')} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${tab === 'hotspots' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-emerald-800'}`}>
              Hotspots
            </button>
          </div>

          {tab === 'buyers' && (
            loading ? (
              <div className="glass rounded-3xl p-10 text-center">
                <Loader2 className="animate-spin mx-auto text-emerald-500 mb-2" size={28} />
                <div className="text-emerald-800 font-semibold">Loading verified buyers…</div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {places.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.03 }}
                    className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/80 transition cursor-pointer group"
                    onClick={() => setSelected(p)}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} grid place-items-center text-white flex-shrink-0`}>
                      <span className="font-display font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold truncate">{p.name}</div>
                      <div className="text-xs text-emerald-700/70 truncate">{p.address}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-emerald-600">{p.distance} km</div>
                      <div className="text-xs text-emerald-700/70 flex items-center justify-end gap-1"><Star size={10} /> {p.rating.toFixed(1)}</div>
                    </div>
                    <ChevronRight size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                  </motion.div>
                ))}
              </div>
            )
          )}

          {tab === 'hotspots' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {hotspots.map((h) => (
                <div key={h.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                  <div className="text-4xl">{h.icon}</div>
                  <div className="flex-1">
                    <div className="font-display font-bold">{h.name}</div>
                    <div className="text-xs text-emerald-700/70">{h.tag}</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">{h.distance} km</div>
                </div>
              ))}
            </div>
          )}

          {/* Detail modal */}
          {selected && (
            <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-50 grid place-items-center p-4" onClick={() => setSelected(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
              >
                <div className={`p-6 bg-gradient-to-br ${selected.color} text-white relative`}>
                  <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 grid place-items-center">×</button>
                  <Recycle size={36} className="mb-3" />
                  <div className="font-display font-bold text-2xl leading-tight">{selected.name}</div>
                  <div className="text-sm opacity-90">{selected.type}</div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-emerald-500" /> {selected.address}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <div className="text-xs uppercase text-emerald-700/70 tracking-widest">Distance</div>
                      <div className="font-display font-bold text-lg">{selected.distance} km</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <div className="text-xs uppercase text-emerald-700/70 tracking-widest">Rating</div>
                      <div className="font-display font-bold text-lg">{selected.rating.toFixed(1)} ⭐</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <div className="text-xs uppercase text-emerald-700/70 tracking-widest">Status</div>
                      <div className="font-display font-bold text-lg">{selected.openNow === false ? 'Closed' : 'Open'}</div>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&destination_place_id=${selected.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-eco w-full px-4 py-3 rounded-2xl flex items-center justify-center gap-2 mt-2"
                  >
                    Open in Google Maps <ExternalLink size={16} />
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
