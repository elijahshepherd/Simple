'use client'

import { useEffect, useRef } from 'react'

interface FireworksBackgroundProps {
  color?: 'white' | 'black'
  population?: number
}

export function FireworksBackground({ color = 'white', population = 30 }: FireworksBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
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

    const particles: FireworkParticle[] = []
    let lastTime = performance.now()

    interface FireworkParticle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      life: number
      maxLife: number
      size: number
    }

    class FireworkParticle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      life: number
      maxLife: number
      size: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.vx = (Math.random() - 0.5) * 8
        this.vy = (Math.random() - 0.5) * 8 - 2
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        this.life = 1
        this.maxLife = 1
        this.size = Math.random() * 3 + 2
      }

      update(dt: number) {
        this.x += this.vx * dt
        this.y += this.vy * dt
        this.vy += 0.3 * dt // gravity
        this.life -= dt * 0.5
        this.size *= 0.98
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.life <= 0) return
        ctx.save()
        ctx.globalAlpha = this.life
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const particles: FireworkParticle[] = []
    let lastTime = performance.now()
    let lastSpawn = 0
    let animationId: number

    const spawnFirework = (x: number, y: number) => {
      const count = 30
      for (let i = 0; i < count; i++) {
        const p = new FireworkParticle(x, y)
        p.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        particles.push(p)
      }
    }

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn fireworks randomly
      if (performance.now() - lastSpawn > 800) {
        spawnFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
        lastSpawn = performance.now()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update(1/60)
        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1)
        } else {
          p.draw(ctx)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn fireworks randomly
      if (performance.now() - lastSpawn > 800) {
        spawnFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
        lastSpawn = performance.now()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update(1/60)
        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1)
        } else {
          p.draw(ctx)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      const canvas = document.querySelector('canvas')
      if (canvas) canvas.remove()
    }
  }, [])

  return <canvas className="fixed inset-0 pointer-events-none z-40" ref={canvasRef} />
}

// Simple fireworks background
export function FireworksBackground({ color = 'white', population = 30 }: { color?: 'white' | 'black'; population?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
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

    const particles: FireworkParticle[] = []
    let lastTime = performance.now()

    interface FireworkParticle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      life: number
      maxLife: number
      size: number
    }

    class FireworkParticle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      life: number
      maxLife: number
      size: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.vx = (Math.random() - 0.5) * 8
        this.vy = (Math.random() - 0.5) * 8 - 2
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        this.life = 1
        this.maxLife = 1
        this.size = Math.random() * 3 + 2
      }

      update(dt: number) {
        this.x += this.vx * dt
        this.y += this.vy * dt
        this.vy += 0.3 * dt // gravity
        this.life -= dt * 0.5
        this.size *= 0.98
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.life <= 0) return
        ctx.save()
        ctx.globalAlpha = this.life
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const particles: FireworkParticle[] = []
    let lastTime = performance.now()
    let lastSpawn = 0
    let animationId: number

    const spawnFirework = (x: number, y: number) => {
      const count = 30
      for (let i = 0; i < count; i++) {
        const p = new FireworkParticle(x, y)
        p.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        particles.push(p)
      }
    }

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn fireworks randomly
      if (performance.now() - lastSpawn > 800) {
        spawnFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
        lastSpawn = performance.now()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update(1/60)
        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1)
        } else {
          p.draw(ctx)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    const spawnFirework = (x: number, y: number) => {
      const count = 30
      for (let i = 0; i < count; i++) {
        const p = new FireworkParticle(x, y)
        p.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        particles.push(p)
      }
    }

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn fireworks randomly
      if (performance.now() - lastSpawn > 800) {
        spawnFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
        lastSpawn = performance.now()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update(1/60)
        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1)
        } else {
          p.draw(ctx)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      const canvas = document.querySelector('canvas')
      if (canvas) canvas.remove()
    }
  }, [])

  return <canvas className="fixed inset-0 pointer-events-none z-40" ref={canvasRef} />
}

// Simple fireworks background
export function FireworksBackground({ color = 'white', population = 30 }: { color?: 'white' | 'black'; population?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
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

    const particles: FireworkParticle[] = []
    let lastTime = performance.now()

    interface FireworkParticle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      life: number
      maxLife: number
      size: number
    }

    class FireworkParticle {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      life: number
      maxLife: number
      size: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.vx = (Math.random() - 0.5) * 8
        this.vy = (Math.random() - 0.5) * 8 - 2
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        this.life = 1
        this.maxLife = 1
        this.size = Math.random() * 3 + 2
      }

      update(dt: number) {
        this.x += this.vx * dt
        this.y += this.vy * dt
        this.vy += 0.3 * dt // gravity
        this.life -= dt * 0.5
        this.size *= 0.98
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.life <= 0) return
        ctx.save()
        ctx.globalAlpha = this.life
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const particles: FireworkParticle[] = []
    let lastTime = performance.now()
    let lastSpawn = 0
    let animationId: number

    const spawnFirework = (x: number, y: number) => {
      const count = 30
      for (let i = 0; i < count; i++) {
        const p = new FireworkParticle(x, y)
        p.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        particles.push(p)
      }
    }

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn fireworks randomly
      if (performance.now() - lastSpawn > 800) {
        spawnFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
        lastSpawn = performance.now()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update(1/60)
        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1)
        } else {
          p.draw(ctx)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    const spawnFirework = (x: number, y: number) => {
      const count = 30
      for (let i = 0; i < count; i++) {
        const p = new FireworkParticle(x, y)
        p.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        particles.push(p)
      }
    }

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn fireworks randomly
      if (performance.now() - lastSpawn > 800) {
        spawnFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
        lastSpawn = performance.now()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update(1/60)
        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1)
        } else {
          p.draw(ctx)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      const canvas = document.querySelector('canvas')
      if (canvas) canvas.remove()
    }
  }, [])

  return <canvas className="fixed inset-0 pointer-events-none z-40" ref={canvasRef} />
}