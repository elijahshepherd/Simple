'use client'

import { useState } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  onCopied?: () => void
}

export function CopyButton({ text, label = 'Copy', className = '', onCopied }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)

  const handleCopy = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopied?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    } finally {
      setCopying(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCopy}
      disabled={copying}
      className={`flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all disabled:opacity-50 ${className}`}
    >
      <AnimatePresence mode="wait">
        {!copied && (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Copy className="w-4 h-4" />
            <span>{label}</span>
          </motion.span>
        )}
        {copied && (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="text-green-500 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Copied!</span>
          </motion.span>
        )}
      </AnimatePresence>
      {copying && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
    </motion.button>
  )
}