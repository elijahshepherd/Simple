'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronRight, Copy, Check, ExternalLink, Globe } from 'lucide-react'
import { WindowsIcon, LinuxIcon, MacOSIcon } from '@/components/icons'
import { FireworksBackground } from '@/components/magicui/fireworks'
import { CopyButton } from '@/components/ui/copy-button'

interface Platform {
  id: string
  name: string
  desc: string
  icon: React.ReactNode
  install: string
  uninstall: string
  run: string
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

function PlatformCard({ platform, index, onCopy }: { platform: Platform; index: number; onCopy: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2 + index * 0.15, duration: 0.6 }}
      className="group relative bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--accent)] hover:shadow-[0_0_40px_var(--accent-glow)] transition-all duration-500"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
          {platform.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold">{platform.name}</h3>
          <p className="text-sm text-[var(--fg-muted)]">{platform.desc}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <CommandCard command={platform.install} description="Install command" />
        <CommandCard command={platform.uninstall} description="Uninstall command" />
      </div>

      <CopyButton text={platform.install} onCopied={onCopy} />

      <p className="text-xs text-[var(--fg-muted)] mt-4 pt-4 border-t border-[var(--border)]">
        {platform.run}
      </p>
    </motion.div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [logoVisible, setLogoVisible] = useState(true)
  const [showRipple, setShowRipple] = useState(false)
  const [fireworks, setFireworks] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)
  const platformRef = useRef<HTMLDivElement>(null)

  const platformCards: Platform[] = [
    {
      id: 'windows',
      name: 'Windows',
      desc: 'Native .exe installer',
      icon: <WindowsIcon />,
      install: 'irm https://elijahshepherd.github.io/Simple/simple-windows.exe -OutFile simple.exe && .\\simple.exe',
      uninstall: 'Remove-Item simple.exe',
      run: 'Run the command in PowerShell. Then run `simple version` to verify.'
    },
    {
      id: 'linux',
      name: 'Linux',
      desc: 'Static binary via curl',
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
    }
  ]

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setLogoVisible(false)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  const handleLogoClick = () => {
    if (logoRef.current) {
      setShowRipple(true)
      setTimeout(() => setShowRipple(false), 1000)
    }
  }

  const handlePlatformClick = () => {
    if (platformRef.current) {
      setShowRipple(true)
      setTimeout(() => setShowRipple(false), 1000)
    }
  }

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
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fireworks && <FireworksBackground active={true} />}
      </AnimatePresence>

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
              onClick={handleLogoClick}
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
                    onCopy={handlePlatformClick}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="mt-16 text-center text-[var(--fg-muted)] text-sm"
        >
          <p>Simple Programming Language &copy; 2024 Elijah Shepherd</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <a href="https://github.com/elijahshepherd/Simple" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
              <ExternalLink className="w-3 h-3" />
              GitHub
            </a>
            <a href="https://elijahshepherd.github.io/Simple/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
              <Globe className="w-3 h-3" />
              Docs
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}