'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useScrapStore = create(
  persist(
    (set) => ({
      totalEarnings: 0,
      totalScrapsDiverted: 0,
      totalCO2Saved: 0,
      scanHistory: [],
      lastScan: null,
      userLocation: { lat: null, lng: null },
      marketPrices: {
        plastic: 0.18,
        textile: 0.85,
        metal: 0.52,
        glass: 0.06,
        paper: 0.10,
      },
      addScan: (scan) =>
        set((state) => ({
          scanHistory: [scan, ...state.scanHistory].slice(0, 50),
          totalEarnings: state.totalEarnings + (scan.estimatedValue || 0),
          totalScrapsDiverted:
            state.totalScrapsDiverted + (scan.estimatedWeightKg || 0),
          totalCO2Saved:
            state.totalCO2Saved + (scan.estimatedWeightKg || 0) * 2.1,
          lastScan: scan,
        })),
      setLastScan: (scan) => set({ lastScan: scan }),
      updateLocation: (lat, lng) => set({ userLocation: { lat, lng } }),
      resetStats: () =>
        set({
          totalEarnings: 0,
          totalScrapsDiverted: 0,
          totalCO2Saved: 0,
          scanHistory: [],
          lastScan: null,
        }),
    }),
    { name: 'scrapvalue-store' }
  )
)
