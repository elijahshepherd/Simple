'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  content: string
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ content, variant = 'default', size = 'md', className, children, ...props }, ref) => {
    const [copied, setCopied] = useState(false)
    const [hovered, setHovered] = useState(false)

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(props.content || '')
      } catch {

        const textArea = document.createElement('textarea')
        textArea.value = props.content || ''
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
    }

    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium rounded-lg
      transition-all duration-200 focus:outline-none focus-visible:ring-2
      focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variants = {
      default: 'bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 active:scale-[0.98]',
      outline: 'border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--bg)]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
          'transition-all duration-200 focus:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98]',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          copied && 'bg-emerald-500 text-white',
          !copied && 'bg-[var(--accent)] text-[var(--bg)] hover:opacity-90',
          className
        )}
        ref={ref}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          navigator.clipboard.writeText(props.content || '')
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
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
              <span>Copy</span>
            </motion.span>
          )}
          {copied && (
            <motion.span
              key="copied"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Copied</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    )
  )
)

CopyButton.displayName = 'CopyButton'