'use client'

import { useEffect, useRef } from 'react'

interface RippleProps {
  color?: string
  className?: string
}

export function Ripple({ color = 'currentColor', className = '' }: RippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const ripplesRef = useRef<Array<{ x: number; y: number; radius: number; opacity: number }>>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ripplesRef.current.forEach((ripple, index) => {
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `${color.slice(0, -1)}, ${ripple.opacity})` // Assuming color is rgba
        ctx.lineWidth = 2
        ctx.stroke()

        ripple.radius += 2
        ripple.opacity -= 0.02

        if (ripple.opacity <= 0) {
          ripplesRef.current.splice(index, 1)
        }
      })

      if (ripplesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      ripplesRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        opacity: 1,
      })
      if (!animationRef.current) {
        animate()
      }
    }

    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('click', handleClick)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [color])

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} />
}