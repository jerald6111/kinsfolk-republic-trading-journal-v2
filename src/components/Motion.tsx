import React, { useEffect, useRef, useState } from 'react'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Reveal — fades/slides children into view on scroll.
 * Adds the `.in` class (see index.css) when the element enters the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: 0 | 1 | 2 | 3
  className?: string
  as?: any
}) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReduced()) { el.classList.add('in'); return }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('in')
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.18 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const d = delay ? ` d${delay}` : ''
  return (
    <Tag ref={ref as any} className={`reveal${d} ${className}`}>
      {children}
    </Tag>
  )
}

/**
 * TiltCard — pointer-tracking 3D tilt. Wrap content; inner `.pop`/`.pop-sm`
 * children gain parallax depth.
 */
export function TiltCard({
  children,
  className = '',
  max = 9,
  float = false,
}: {
  children: React.ReactNode
  className?: string
  max?: number
  float?: boolean
}) {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const onMove = (ev: React.PointerEvent) => {
    if (prefersReduced()) return
    const scene = sceneRef.current, card = cardRef.current
    if (!scene || !card) return
    const r = scene.getBoundingClientRect()
    const px = (ev.clientX - r.left) / r.width - 0.5
    const py = (ev.clientY - r.top) / r.height - 0.5
    card.style.transform = `rotateY(${px * max}deg) rotateX(${-py * max}deg)`
  }
  const reset = () => {
    if (cardRef.current) cardRef.current.style.transform = 'rotateY(0) rotateX(0)'
  }

  return (
    <div ref={sceneRef} className="scene" onPointerMove={onMove} onPointerLeave={reset}>
      <div ref={cardRef} className={`tilt ${float ? 'bob' : ''} ${className}`}>
        {children}
      </div>
    </div>
  )
}

/**
 * CountUp — animates a number from 0 to `to` once it enters the viewport.
 */
export function CountUp({
  to,
  suffix = '',
  className = '',
  duration = 1100,
}: {
  to: number
  suffix?: string
  className?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [val, setVal] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fmt = (n: number) => (n >= 1000 ? n.toLocaleString('en-US') : String(n))
    if (prefersReduced()) { setVal(to); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        io.unobserve(el)
        let raf = 0, t0 = 0
        const step = (t: number) => {
          if (!t0) t0 = t
          const p = Math.min((t - t0) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(to * eased))
          if (p < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
      })
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  const fmt = (n: number) => (n >= 1000 ? n.toLocaleString('en-US') : String(n))
  return <span ref={ref} className={`tnum ${className}`}>{fmt(val)}{suffix}</span>
}
