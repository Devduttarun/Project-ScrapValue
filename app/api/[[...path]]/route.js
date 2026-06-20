import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

let cachedClient = null
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL)
    await cachedClient.connect()
  }
  return cachedClient.db(process.env.DB_NAME || 'scrapvalue')
}

const CORS = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data, init = {}) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...CORS, ...(init.headers || {}) },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

const MARKET_PRICES = {
  plastic: 0.18,
  textile: 0.85,
  metal: 0.52,
  glass: 0.06,
  paper: 0.10,
}

const CATEGORIES = ['plastic', 'metal', 'glass', 'paper', 'textile']

// ---------- Mock fallback (now multi-material) ----------
function mockScan() {
  const count = 1 + Math.floor(Math.random() * 2) // 1-2 materials for mock
  const shuffled = [...CATEGORIES].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, count)
  let remaining = 100
  const materials = picked.map((category, i) => {
    const isLast = i === picked.length - 1
    const pct = isLast ? remaining : Math.round((remaining / (picked.length - i)) * (0.6 + Math.random() * 0.8))
    remaining -= pct
    const desc = {
      plastic: 'Clear PET plastic with smooth surface and recyclable composition.',
      metal: 'Aluminum-based metal with reflective surface, high recyclability.',
      glass: 'Transparent glass, easily recycled into new glass products.',
      paper: 'Paper or cardboard, renewable fiber for paper mill recycling.',
      textile: 'Fabric textile, ideal for upcycling into new fashion items.',
    }[category]
    return { category, percentage: Math.max(5, pct), description: desc }
  })
  const totalWeightKg = Number((0.1 + Math.random() * 0.9).toFixed(3))
  return { materials, totalWeightKg, confidenceScore: Number((0.82 + Math.random() * 0.15).toFixed(3)) }
}

// ---------- Gemini multi-material vision call ----------
async function analyzeWithGemini(imageBase64, mimeType = 'image/jpeg') {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const prompt = `You are a material classification AI for a recycling app. Look at the image carefully — it may contain ONE material or MULTIPLE different scrap materials mixed together (e.g. a plastic bottle next to a metal can and a fabric scrap).

Identify EVERY distinct material visible and return ONLY valid JSON (no markdown, no preamble):

{
  "materials": [
    { "category": "plastic|textile|metal|glass|paper", "percentage": number, "description": "1 short sentence about this specific item" }
  ],
  "totalWeightKg": number,
  "confidenceScore": number
}

Rules:
- List one entry per distinct material/item you can see. If there's only one item, return an array with exactly one entry.
- "category" MUST be exactly one of: plastic, textile, metal, glass, paper
- "percentage" = each material's approximate share of the total scrap shown, as a number 0-100. All percentages in the array MUST sum to 100.
- "totalWeightKg" = realistic combined weight estimate for everything visible (typical bottle ~0.3-0.5kg, can ~0.05kg, cardboard box ~0.2-0.5kg, fabric scrap ~0.1-0.3kg)
- "confidenceScore" = overall detection confidence, 0 to 1
- Use visual cues: metal is shiny/reflective and rigid, plastic is dull and semi-flexible, glass is transparent and rigid, textile is woven/soft and bends easily, paper is matte and fibrous
- Return ONLY the JSON object, nothing else.`

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 25000)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 768,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      clearTimeout(t)
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        console.warn(`Gemini ${model} failed:`, res.status, errText.slice(0, 200))
        continue
      }
      const data = await res.json()
      const parts = data?.candidates?.[0]?.content?.parts || []
      const text = parts
        .filter((p) => !p.thought && typeof p.text === 'string')
        .map((p) => p.text)
        .join('\n')
      if (!text) {
        console.warn(`Gemini ${model}: empty response`)
        continue
      }
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) {
        console.warn(`Gemini ${model}: no JSON found in:`, cleaned.slice(0, 200))
        continue
      }
      const parsed = JSON.parse(match[0])
      const materials = Array.isArray(parsed.materials) ? parsed.materials : null
      if (!materials || materials.length === 0) {
        console.warn(`Gemini ${model}: no materials array`)
        continue
      }
      const valid = materials.every((m) => CATEGORIES.includes(m.category))
      if (!valid) {
        console.warn(`Gemini ${model}: invalid category in materials`, materials.map((m) => m.category))
        continue
      }
      // normalize percentages to sum to 100
      const sum = materials.reduce((a, m) => a + (Number(m.percentage) || 0), 0) || 1
      const normalized = materials.map((m) => ({
        ...m,
        percentage: Math.round(((Number(m.percentage) || 0) / sum) * 100),
      }))
      console.log(`✓ Gemini ${model} success: ${normalized.map((m) => m.category).join(', ')}`)
      return {
        materials: normalized,
        totalWeightKg: Number(parsed.totalWeightKg) || 0.3,
        confidenceScore: Number(parsed.confidenceScore) || 0.85,
      }
    } catch (e) {
      console.warn(`Gemini ${model} error:`, e.message)
      continue
    }
  }
  return null
}

async function handleScan(req) {
  try {
    const body = await req.json()
    let { imageBase64, mimeType } = body || {}
    if (!imageBase64) return json({ error: 'imageBase64 required' }, { status: 400 })

    const m = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/)
    if (m) {
      mimeType = mimeType || m[1]
      imageBase64 = m[2]
    }
    mimeType = mimeType || 'image/jpeg'

    let analysis = await analyzeWithGemini(imageBase64, mimeType)
    let usedFallback = false
    if (!analysis) {
      console.log('Falling back to mock scan analysis')
      analysis = mockScan()
      usedFallback = true
    }

    // Compute per-material weight/value, plus totals
    const materials = analysis.materials.map((mat) => {
      const weightKg = Number(((mat.percentage / 100) * analysis.totalWeightKg).toFixed(3))
      const price = MARKET_PRICES[mat.category] || 0.1
      const value = Number((weightKg * price).toFixed(4))
      const co2Saved = Number((weightKg * 2.1).toFixed(3))
      return {
        category: mat.category,
        percentage: mat.percentage,
        description: mat.description || '',
        weightKg,
        marketPrice: price,
        value,
        co2Saved,
      }
    })

    const totalWeightKg = Number(analysis.totalWeightKg.toFixed(3))
    const estimatedValue = Number(materials.reduce((a, m) => a + m.value, 0).toFixed(4))
    const co2Saved = Number(materials.reduce((a, m) => a + m.co2Saved, 0).toFixed(3))
    const primaryMaterial = materials.reduce((a, b) => (b.percentage > a.percentage ? b : a)).category

    const result = {
      materials,
      primaryMaterial,
      totalWeightKg,
      estimatedValue,
      co2Saved,
      confidenceScore: analysis.confidenceScore,
      usedFallback,
      // legacy fields for any older UI still reading single-material shape
      category: primaryMaterial,
      estimatedWeightKg: totalWeightKg,
    }

    try {
      const db = await getDb()
      await db.collection('scans').insertOne({
        id: crypto.randomUUID(),
        ...result,
        createdAt: new Date().toISOString(),
      })
    } catch (e) {
      console.warn('DB persist failed (non-fatal):', e.message)
    }

    return json(result)
  } catch (e) {
    console.error('scan error', e)
    return json({ error: 'scan failed', details: e.message }, { status: 500 })
  }
}

async function handleStats() {
  try {
    const db = await getDb()
    const scans = await db.collection('scans').find({}).sort({ createdAt: -1 }).limit(100).toArray()
    const totalEarnings = scans.reduce((a, s) => a + (s.estimatedValue || 0), 0)
    const totalWeight = scans.reduce((a, s) => a + (s.totalWeightKg || s.estimatedWeightKg || 0), 0)
    const totalCO2 = scans.reduce((a, s) => a + (s.co2Saved || 0), 0)
    const byCategory = {}
    scans.forEach((s) => {
      const mats = s.materials || [{ category: s.category }]
      mats.forEach((m) => {
        byCategory[m.category] = (byCategory[m.category] || 0) + 1
      })
    })
    return json({
      totalScans: scans.length,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalWeight: Number(totalWeight.toFixed(2)),
      totalCO2: Number(totalCO2.toFixed(2)),
      byCategory,
      recent: scans.slice(0, 10).map((s) => ({
        id: s.id,
        materials: s.materials || [{ category: s.category, percentage: 100 }],
        totalWeightKg: s.totalWeightKg || s.estimatedWeightKg,
        estimatedValue: s.estimatedValue,
        createdAt: s.createdAt,
      })),
    })
  } catch (e) {
    return json({ totalScans: 0, totalEarnings: 0, totalWeight: 0, totalCO2: 0, byCategory: {}, recent: [] })
  }
}

async function handleMarket() {
  return json({
    prices: MARKET_PRICES,
    updatedAt: new Date().toISOString(),
    currency: 'SGD',
    trends: { plastic: 2.5, textile: 5.2, metal: -1.8, glass: 0.5, paper: 1.2 },
  })
}

const CATEGORY_META = {
  plastic: { icon: 'recycle', color: 'from-emerald-400 to-teal-500', keywords: ['recycling', 'recycling center'] },
  textile: { icon: 'sparkles', color: 'from-pink-400 to-rose-500', keywords: ['upcycling', 'fashion upcycler', 'textile recycling'] },
  metal: { icon: 'cog', color: 'from-slate-400 to-blue-500', keywords: ['scrap metal', 'metal scrap yard', 'scrap yard'] },
  glass: { icon: 'gem', color: 'from-cyan-400 to-blue-400', keywords: ['glass recycling', 'recycling'] },
  paper: { icon: 'leaf', color: 'from-amber-300 to-orange-400', keywords: ['paper recycling', 'paper mill'] },
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function fetchPlaces(lat, lng, radius, keyword) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return []
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.results || []
  } catch (e) {
    console.warn('Places fetch failed', e.message)
    return []
  }
}

// category param can now be: "all" | "plastic" | "plastic,metal,textile" (comma list)
async function handlePlaces(req) {
  const url = new URL(req.url)
  const lat = parseFloat(url.searchParams.get('lat'))
  const lng = parseFloat(url.searchParams.get('lng'))
  const radius = parseInt(url.searchParams.get('radius') || '6000', 10)
  const categoryParam = (url.searchParams.get('category') || 'all').toLowerCase()
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return json({ error: 'lat,lng required' }, { status: 400 })
  }

  const categories =
    categoryParam === 'all'
      ? Object.keys(CATEGORY_META)
      : categoryParam.split(',').map((c) => c.trim()).filter((c) => CATEGORY_META[c])

  const seen = new Set()
  const all = []

  for (const cat of categories) {
    const meta = CATEGORY_META[cat]
    if (!meta) continue
    for (const kw of meta.keywords) {
      const places = await fetchPlaces(lat, lng, radius, kw)
      for (const p of places) {
        if (!p.place_id || seen.has(p.place_id)) continue
        seen.add(p.place_id)
        const plat = p.geometry?.location?.lat
        const plng = p.geometry?.location?.lng
        if (typeof plat !== 'number' || typeof plng !== 'number') continue
        const distance = Number(haversine(lat, lng, plat, plng).toFixed(2))
        all.push({
          id: p.place_id,
          name: p.name,
          type:
            cat === 'plastic' ? 'Recycling Centre' :
            cat === 'textile' ? 'Fashion Upcycler' :
            cat === 'metal' ? 'Metal Scrap Yard' :
            cat === 'glass' ? 'Glass Facility' :
            cat === 'paper' ? 'Paper Mill' : 'Recycling Centre',
          category: cat,
          color: meta.color,
          address: p.vicinity || p.formatted_address || '',
          lat: plat,
          lng: plng,
          rating: p.rating || 4.4,
          totalRatings: p.user_ratings_total || 0,
          distance,
          openNow: p.opening_hours?.open_now ?? null,
          icon: meta.icon,
          badge: p.business_status === 'OPERATIONAL' ? 'Verified' : 'Active',
          photoRef: p.photos?.[0]?.photo_reference || null,
        })
      }
    }
  }

  all.sort((a, b) => a.distance - b.distance)
  const returned = all.slice(0, 30)
  return json({ places: returned, count: returned.length, totalFound: all.length, queriedAt: new Date().toISOString() })
}

export async function GET(_req, ctx) {
  const { path = [] } = await ctx.params
  const route = (path[0] || '').toLowerCase()
  if (route === 'stats') return handleStats()
  if (route === 'market') return handleMarket()
  if (route === 'places') return handlePlaces(_req)
  return json({ message: 'ScrapValue API · ready', endpoints: ['/api/scan (POST)', '/api/stats', '/api/market', '/api/places?lat=&lng=&category='] })
}

export async function POST(req, ctx) {
  const { path = [] } = await ctx.params
  const route = (path[0] || '').toLowerCase()
  if (route === 'scan') return handleScan(req)
  return json({ error: 'unknown route' }, { status: 404 })
}
