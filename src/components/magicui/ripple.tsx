'use client'

import { useEffect, useRef, useState } from 'react'

interface RippleProps {
  className?: string
  color?: string
}

export function Ripple({ className = '', color = 'currentColor' }: RippleProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const triggerRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setRipples(prev => [...prev, { x, y, id: Date.now() + Math.random() }])


    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== Date.now()))
    }, 1000)
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${rippleClass}`}
      onClick={triggerRipple}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    >
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full bg-current opacity-30 pointer-events-none"
          style={{
            width: 0,
            height: 0,
            left: 'var(--ripple-x)',
            top: 'var(--ripple-y)',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ width: 0, height: 0, opacity: 0.4 }}
          animate={{ width: 600, height: 600, opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            '--ripple-x': ripple.x,
            '--ripple-y': ripple.y,
          } as any}
        />
      )}
    </div>
  )
}


export function RippleSimple({ className = '' }: { className?: string }) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const triggerRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - e.currentTarget.getBoundingClientRect().left
        const y = e.clientY - e.currentTarget.getBoundingClientRect().top

        const id = Date.now()

      })
    >
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.3;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out forwards;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }
      `}
    </div>
  )
}


export function RippleEffect({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now() + Math.random()

    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== Date.now()))
    }, 600)
  }

  return (
    <div className={`relative overflow-hidden ${children}`} onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = Date.now() + Math.random()


    }}>
      {children}
    </div>
  )
}


export function Ripple({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.3;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes ripple {
          to {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }
      `}
    </div>
  )
}


export function RippleButton({ children, className = '', onClick, ...props }: {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - e.currentTarget.getBoundingClientRect().left
        const y = e.clientY - e.currentTarget.getBoundingClientRect().top

        const ripple = document.createElement('span')
        ripple.className = 'ripple'
        ripple.style.left = `${e.clientX - e.currentTarget.getBoundingClientRect().left}px`
        ripple.style.top = `${e.clientY - e.currentTarget.getBoundingClientRect().top}px`
        ripple.style.width = '0'
        ripple.style.height = '0'

        e.currentTarget.appendChild(ripple)

        setTimeout(() => {
          ripple.remove()
        }, 600)
      }
    >
      {props.children}
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.3;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out forwards;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }
      `}
    </button>
  )
}

export function Ripple({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.3;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out forwards;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }
      `}
      <style jsx global>{`
        .ripple-element {
          position: absolute;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.3;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out forwards;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }
      `}
    </div>
  )
}