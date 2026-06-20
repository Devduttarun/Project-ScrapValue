'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

const EARTH_DAY = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
const EARTH_NORMAL = 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'
const EARTH_SPECULAR = 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'
const EARTH_CLOUDS = 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png'

export function Earth({ scale = 1, mouse = { x: 0, y: 0 } }) {
  const earthRef = useRef()
  const cloudsRef = useRef()
  const atmosphereRef = useRef()

  const [dayMap, normalMap, specMap, cloudMap] = useLoader(TextureLoader, [
    EARTH_DAY,
    EARTH_NORMAL,
    EARTH_SPECULAR,
    EARTH_CLOUDS,
  ])

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05
      // subtle mouse reactive tilt
      earthRef.current.rotation.x = THREE.MathUtils.lerp(
        earthRef.current.rotation.x,
        mouse.y * 0.1,
        0.05
      )
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.02
    }
  })

  return (
    <group scale={scale}>
      {/* Earth */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 96, 96]} />
        <meshPhongMaterial
          map={dayMap}
          normalMap={normalMap}
          specularMap={specMap}
          specular={new THREE.Color('#1e90ff')}
          shininess={18}
        />
      </mesh>
      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.03, 96, 96]} />
        <meshPhongMaterial
          map={cloudMap}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.18}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          uniforms={{
            uColor: { value: new THREE.Color('#86efac') },
            uColor2: { value: new THREE.Color('#38bdf8') },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 uColor;
            uniform vec3 uColor2;
            void main() {
              float intensity = pow(0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
              vec3 col = mix(uColor, uColor2, intensity * 0.7);
              gl_FragColor = vec4(col, intensity);
            }
          `}
        />
      </mesh>
    </group>
  )
}

export function OrbitingItems() {
  const groupRef = useRef()
  const items = useMemo(() => {
    const arr = []
    const N = 16
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2
      const radius = 3.4 + Math.random() * 1.2
      const y = (Math.random() - 0.5) * 1.2
      const speed = 0.15 + Math.random() * 0.15
      const type = i % 4
      arr.push({ angle, radius, y, speed, type, scale: 0.08 + Math.random() * 0.08 })
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.06
    groupRef.current.children.forEach((child, i) => {
      const data = items[i]
      data.angle += delta * data.speed
      child.position.set(
        Math.cos(data.angle) * data.radius,
        data.y + Math.sin(state.clock.elapsedTime + i) * 0.1,
        Math.sin(data.angle) * data.radius
      )
      child.rotation.x += delta * 0.5
      child.rotation.y += delta * 0.3
    })
  })

  const colors = ['#10b981', '#34d399', '#22d3ee', '#a7f3d0', '#fbbf24']

  return (
    <group ref={groupRef}>
      {items.map((item, i) => {
        const color = colors[i % colors.length]
        return (
          <mesh key={i} scale={item.scale}>
            {item.type === 0 && <octahedronGeometry args={[1, 0]} />}
            {item.type === 1 && <icosahedronGeometry args={[1, 0]} />}
            {item.type === 2 && <tetrahedronGeometry args={[1, 0]} />}
            {item.type === 3 && <sphereGeometry args={[0.8, 16, 16]} />}
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function Particles({ count = 800 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 8
      const t = Math.random() * Math.PI * 2
      const p = Math.acos(2 * Math.random() - 1)
      arr[i * 3 + 0] = r * Math.sin(p) * Math.cos(t)
      arr[i * 3 + 1] = r * Math.cos(p) * 0.6
      arr[i * 3 + 2] = r * Math.sin(p) * Math.sin(t)
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.7}
        color="#a7f3d0"
        depthWrite={false}
      />
    </points>
  )
}
