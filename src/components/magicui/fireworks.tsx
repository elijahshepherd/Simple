'use client'

import { useEffect, useRef } from 'react'

interface FireworksBackgroundProps {
  active: boolean
}

export function FireworksBackground({ active }: FireworksBackgroundProps) {
  const animationRef = useRef<number>()
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    color: string
    life: number
    size: number
  }>>([])
  const lastSpawnRef = useRef(0)

  useEffect(() => {
    if (!active) return

    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.inset = '0'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '40'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    const animate = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = performance.now()
      if (now - lastSpawnRef.current > 800) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height * 0.5
        const count = 30
        for (let i = 0; i < count; i++) {
          particlesRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            color: `hsl(${Math.random() * 360}, 100%, 60%)`,
            life: 1,
            size: Math.random() * 3 + 2,
          })
        }
        lastSpawnRef.current = now
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx / 60
        p.y += p.vy / 60
        p.vy += 0.3 / 60
        p.life -= 0.5 / 60
        p.size *= 0.98

        if (p.life <= 0 || p.size < 0.5) {
          particlesRef.current.splice(i, 1)
        } else {
          ctx.save()
          ctx.globalAlpha = p.life
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      canvas.remove()
    }
  }, [active])

  return null
}