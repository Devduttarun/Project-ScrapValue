'use client'

import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Earth, OrbitingItems, Particles } from './Earth'

export default function HeroScene() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let raf = null
    const handle = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = -(e.clientY / window.innerHeight) * 2 + 1
        setMouse({ x, y })
        raf = null
      })
    }
    window.addEventListener('mousemove', handle)
    return () => {
      window.removeEventListener('mousemove', handle)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0.5, 12], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 3, 5]} intensity={1.8} color="#fffbe6" />
      <pointLight position={[-5, -3, -5]} intensity={0.6} color="#38bdf8" />
      <pointLight position={[6, 4, 2]} intensity={0.9} color="#a7f3d0" />
      <Suspense fallback={null}>
        <group position={[2.6, -0.5, 0]}>
          <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
            <Earth mouse={mouse} scale={0.85} />
          </Float>
          <OrbitingItems />
        </group>
        <Particles count={250} />
        <Stars radius={60} depth={20} count={500} factor={2.4} fade speed={0.3} />
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.25}
            luminanceSmoothing={0.9}
            mipmapBlur={false}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
