'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronDown, Download, Terminal, Github, ExternalLink, FileText, FolderOpen, FileCode, Loader2 } from 'lucide-react'

const WindowsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M6.555 1.375L0 2.237v5.45h6.555zM0 13.795l6.555.933V8.313H0zm7.278-5.4l.026 6.378L16 16V8.395zM16 0L7.33 1.244v6.414H16z" fill="currentColor"/>
  </svg>
)

const LinuxIcon = () => (
  <svg width="32" height="32" viewBox="0 0 128 128" fill="currentColor">
    <path fill-rule="evenodd" d="M113.823 104.595c-1.795-1.478-3.629-2.921-5.308-4.525c-1.87-1.785-3.045-3.944-2.789-6.678c.147-1.573-.216-2.926-2.113-3.452c.446-1.154.864-1.928 1.033-2.753c.188-.92.178-1.887.204-2.834c.264-9.96-3.334-18.691-8.663-26.835c-2.454-3.748-5.017-7.429-7.633-11.066c-4.092-5.688-5.559-12.078-5.633-18.981a47.6 47.6 0 0 0-1.081-9.475C80.527 11.956 77.291 7.233 71.422 4.7c-4.497-1.942-9.152-2.327-13.901-1.084c-6.901 1.805-11.074 6.934-10.996 14.088c.074 6.885.417 13.779.922 20.648c.288 3.893-.312 7.252-2.895 10.34c-2.484 2.969-4.706 6.172-6.858 9.397c-1.229 1.844-2.317 3.853-3.077 5.931c-2.07 5.663-3.973 11.373-7.276 16.5c-1.224 1.9-1.363 4.026-.494 6.199c.225.563.363 1.429.089 1.882c-2.354 3.907-5.011 7.345-10.066 8.095c-3.976.591-4.172 1.314-4.051 5.413c.1 3.337.061 6.705-.28 10.021c-.363 3.555.008 4.521 3.442 5.373c7.924 1.968 15.913 3.647 23.492 6.854c3.227 1.365 6.465.891 9.064-1.763c2.713-2.771 6.141-3.855 9.844-3.859c6.285-.005 12.572.298 18.86.369c1.702.02 2.679.653 3.364 2.199c.84 1.893 2.26 3.284 4.445 3.526c4.193.462 8.013-.16 11.19-3.359c3.918-3.948 8.436-7.066 13.615-9.227c1.482-.619 2.878-1.592 4.103-2.648c2.231-1.922 2.113-3.146-.135-5" clip-rule="evenodd" d="M113.823 104.595c-1.795-1.478-3.629-2.921-5.308-4.525c-1.87-1.785-3.045-3.944-2.789-6.678c.147-1.573-.216-2.926-2.113-3.452c.446-1.154.864-1.928 1.033-2.753c.188-.92.178-1.887.204-2.834c.264-9.96-3.334-18.691-8.663-26.835c-2.454-3.748-5.017-7.429-7.633-11.066c-4.092-5.688-5.559-12.078-5.633-18.981a47.6 47.6 0 0 0-1.081-9.475C80.527 11.956 77.291 7.233 71.422 4.7c-4.497-1.942-9.152-2.327-13.901-1.084c-6.901 1.805-11.074 6.934-10.996 14.088c.074 6.885.417 13.779.922 20.648c.288 3.893-.312 7.252-2.895 10.34c-2.484 2.969-4.706 6.172-6.858 9.397c-1.229 1.844-2.317 3.853-3.077 5.931c-2.07 5.663-3.973 11.373-7.276 16.5c-1.224 1.9-1.363 4.026-.494 6.199c.225.563.363 1.429.089 1.882c-2.354 3.907-5.011 7.345-10.066 8.095c-3.976.591-4.172 1.314-4.051 5.413c.1 3.337.061 6.705-.28 10.021c-.363 3.555.008 4.521 3.442 5.373c7.924 1.968 15.913 3.647 23.492 6.854c3.227 1.365 6.465.891 9.064-1.763c2.713-2.771 6.141-3.855 9.844-3.859c6.285-.005 12.572.298 18.86.369c1.702.02 2.679.653 3.364 2.199c.84 1.893 2.26 3.284 4.445 3.526c4.193.462 8.013-.16 11.19-3.359c3.918-3.948 8.436-7.066 13.615-9.227c1.482-.619 2.878-1.592 4.103-2.648c2.231-1.922 2.113-3.146-.135-5" clip-rule="evenodd"/>
  </svg>
)

const MacOSIcon = () => (
  <svg width="32" height="32" viewBox="0 0 26 26" fill="currentColor">
    <title>macos</title>
    <path fill="currentColor" d="M23.934 18.947c-.598 1.324-.884 1.916-1.652 3.086c-1.073 1.634-2.588 3.673-4.461 3.687c-1.666.014-2.096-1.087-4.357-1.069c-2.261.011-2.732 1.089-4.4 1.072c-1.873-.017-3.307-1.854-4.381-3.485c-3.003-4.575-3.32-9.937-1.464-12.79C4.532 7.425 6.61 6.237 8.561 6.237c1.987 0 3.236 1.092 4.879 1.092c1.594 0 2.565-1.095 4.863-1.095c1.738 0 3.576.947 4.889 2.581c-4.296 2.354-3.598 8.49.742 10.132M16.559 4.408c.836-1.073 1.47-2.587 1.24-4.131c-1.364.093-2.959.964-3.891 2.092c-.844 1.027-1.544 2.553-1.271 4.029c1.488.048 3.028-.839 3.922-1.99"/></svg>
  </svg>
)

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
        {fireworks && <Fireworks />}
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

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
  const { resolvedTheme } = useTheme()
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <FireworksBackground color={theme === 'dark' ? 'white' : 'black'} population={30} />
    </div>
  )
}

function CopyToast({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return null
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 bg-[var(--accent)] text-[var(--bg)] px-6 py-4 rounded-xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3"
      onClick={() => setTimeout(() => setCopied(null), 100)}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      <span>Copied to clipboard</span>
    </motion.div>
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

function FireworksBackground({ active }: { active: boolean }) {
  if (!active) return null
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: FireworkParticle[] = []
    const theme = 'dark'

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
        this.vy += 0.3 * dt
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

    const spawnFirework = (x: number, y: number) => {
      const count = 30
      for (let i = 0; i < count; i++) {
        const p = new FireworkParticle(x, y)
        p.color = `hsl(${Math.random() * 360}, 100%, 60%)`
        particles.push(p)
      }
    }

    let lastSpawn = 0
    let animationId: number

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)


      if (time - lastSpawn > 800) {
        spawnFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5)
        lastSpawn = time
      }


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

    return () => cancelAnimationFrame(animationId)
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40" />
}

export default Home