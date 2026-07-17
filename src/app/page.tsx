'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronDown, Download, Terminal, Github, ExternalLink, FileText, FolderOpen, FileCode, Loader2, Check } from 'lucide-react'
import { WindowsIcon, LinuxIcon, MacOSIcon } from '@/components/icons'
import { useTheme } from '@/components/providers/theme-provider'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [showRipple, setShowRipple] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [platformVisible, setPlatformVisible] = useState(false)
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [fireworks, setFireworks] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)
  const platformRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)

    setShowRipple(true)
    setTimeout(() => setShowRipple(false), 1000)

    setTimeout(() => setLogoVisible(true), 1500)

    setTimeout(() => setPlatformVisible(true), 3000)

    setTimeout(() => {
      setSectionsVisible({...sectionsVisible, windows: true})
      setTimeout(() => setSectionsVisible({...sectionsVisible, linux: true}), 200)
      setTimeout(() => setSectionsVisible({...sectionsVisible, macos: true}), 400)
    }, 5000)

  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setFireworks(true)
    setTimeout(() => setFireworks(false), 3000)
  }

  const platformCards = [
    {
      id: 'windows',
      name: 'Windows',
      desc: 'Standalone installer with auto PATH setup',
      icon: <WindowsIcon />,
      install: 'irm https://elijahshepherd.github.io/Simple/simple.exe -OutFile simple.exe; .\\simple.exe',
      uninstall: 'rm -r ~\\AppData\\Local\\Simple; [Environment]::SetEnvironmentVariable("PATH", ($env:PATH -replace ";?" + [Environment]::GetFolderPath("LocalApplicationData") + "\\Simple\\bin") -replace ";$", ""), "User")',
      run: 'Open PowerShell and run the command above. Then open a new terminal and run `simple version` to verify.'
    },
    {
      id: 'linux',
      name: 'Linux',
      desc: 'Native binary via curl',
      icon: <LinuxIcon />,
      install: 'curl -fsSL https://elijahshepherd.github.io/Simple/simple-linux -o simple && chmod +x simple && sudo mv simple /usr/local/bin/',
      uninstall: 'sudo rm /usr/local/bin/simple',
      run: 'Run the curl command in terminal. Then run `simple version` to verify.'
    },
    {
      id: 'macos',
      name: 'macOS',
      desc: 'Native binary via Homebrew',
      icon: <MacOSIcon />,
      install: 'brew install elijahshepherd/simple/simple',
      uninstall: 'brew uninstall simple',
      run: 'Run the brew command in terminal. Then run `simple version` to verify.'
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">
      <AnimatePresence>
        {showRipple && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-0"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)',
              borderRadius: '50%',
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fireworks && <FireworksBackground />}
      </AnimatePresence>

      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
          <AnimatePresence mode="wait">
            {logoVisible && (
              <motion.div
                ref={logoRef}
                key="logo"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                className="flex flex-col items-center mb-16"
              >
                <Image
                  src="https://ik.imagekit.io/tycncf0zq0/Simple-1.0.png?updatedAt=1784241471599"
                  alt="Simple"
                  width={120}
                  height={120}
                  className="rounded-2xl shadow-xl"
                  priority
                />
                <motion.h1
                  className="text-4xl font-bold mt-6 tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Simple
                </motion.h1>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mounted && (
              <motion.div
                ref={platformRef}
                key="platforms"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="w-full max-w-5xl px-4"
              >
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
                >
                  <h2 className="text-3xl font-bold mb-4">Installation</h2>
                  <p className="text-[var(--fg-muted)] max-w-2xl mx-auto">
                    Install Simple on your platform. Each card includes copy-to-clipboard commands.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {platformCards.map((platform, index) => (
                    <PlatformCard
                      key={platform.id}
                      platform={platform}
                      index={index}
                      onCopy={setFireworks}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mounted && (
              <motion.div
                key="commands"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 5, duration: 0.8 }}
                className="w-full max-w-3xl px-4 mt-24"
              >
                <motion.div
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 5.5, duration: 0.8 }}
                >
                  <h2 className="text-2xl font-bold mb-4">Built-in Commands</h2>
                  <div className="grid gap-3 text-left max-w-md mx-auto">
                    <CommandCard command="simple version" description="Show version" />
                    <CommandCard command="simple update" description="Check for updates" />
                    <CommandCard command="simple uninstall" description="Uninstall Simple" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.footer
            className="w-full text-center py-12 border-t border-[var(--border)] text-[var(--fg-subtle)] text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 6, duration: 0.8 }}
          >
            <p>
              Simple Programming Language ·{' '}
              <a href="https://github.com/elijahshepherd/Simple" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent)]">
                GitHub
              </a>
              {' '}·{' '}
              <a href="https://github.com/elijahshepherd/Simple/issues" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent)]">
                Issues
              </a>
            </p>
          </motion.footer>
        </div>

        <AnimatePresence>
          {fireworks && <FireworksBackground />}
        </AnimatePresence>

        <AnimatePresence>
          {copied && (
            <motion.div
              className="fixed bottom-6 right-6 z-50 bg-[var(--accent)] text-[var(--bg)] px-6 py-4 rounded-xl shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <Check className="w-5 h-5" />
              <span>Copied to clipboard</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PlatformCard({ platform, index }: { platform: Platform; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  return (
    <motion.article
      className="platform-card group relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.5 + index * 0.15, duration: 0.6 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px var(--shadow)' }}
      className="platform-card relative overflow-hidden"
    >
      <div className="platform-header flex items-center gap-4 mb-6">
        <div className="platform-icon w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
          {platform.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold">{platform.name}</h3>
          <p className="text-[var(--fg-muted)] text-sm">{platform.desc}</p>
        </div>
      </div>

      <div className="install-section border-t border-[var(--border)] pt-6">
        <div className="mb-4">
          <div className="text-xs uppercase tracking-wider text-[var(--fg-subtle)] mb-3">Install</div>
          <div className="relative">
            <div className="code-block bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 font-mono text-sm overflow-x-auto relative">
              <button
                onClick={() => navigator.clipboard.writeText(platform.install)}
                className="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--bg)] hover:opacity-80 transition-opacity"
              >
                Copy
              </button>
              <pre className="font-mono text-sm overflow-x-auto"><code>{platform.install}</code></pre>
            </div>
            <p className="text-sm text-[var(--fg-muted)] mt-3 text-center">Open terminal and run the command above</p>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border)]">
          <div className="text-xs uppercase tracking-wider text-[var(--fg-subtle)] mb-3">Uninstall</div>
          <div className="relative">
            <div className="code-block bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 font-mono text-sm overflow-x-auto relative">
              <button
                onClick={() => navigator.clipboard.writeText(platform.uninstall)}
                className="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--bg)] hover:opacity-80 transition-opacity"
              >
                Copy
              </button>
              <pre className="font-mono text-sm overflow-x-auto"><code>{platform.uninstall}</code></pre>
            </div>
            <p className="text-sm text-[var(--fg-muted)] mt-3 text-center">Run this command to completely remove Simple</p>
          </div>
        </div>
      </article>
    </motion.article>
  )
}

function CommandCard({ command, description }: { command: string; description: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-colors">
      <div>
        <code className="font-mono text-sm font-medium">{command}</code>
        <p className="text-xs text-[var(--fg-muted)] mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-[var(--fg-subtle)]" />
    </div>
  )
}

function FireworksBackground() {
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