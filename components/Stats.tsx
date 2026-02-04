'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef, useCallback } from 'react'

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  const animateValue = useCallback(() => {
    if (hasAnimated) return

    const duration = 2000
    const startTime = performance.now()
    let rafId: number

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(easeOut * value))

      if (progress < 1) {
        rafId = requestAnimationFrame(updateValue)
      } else {
        setHasAnimated(true)
      }
    }

    rafId = requestAnimationFrame(updateValue)
    return () => cancelAnimationFrame(rafId)
  }, [value, hasAnimated])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          animateValue()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [animateValue, hasAnimated])

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

export function Stats() {
  const stats = [
    {
      value: 10000,
      suffix: '+',
      label: 'Subscriptions Tracked',
    },
    {
      value: 500000,
      prefix: '$',
      label: 'Users Saved',
    },
    {
      value: 48,
      prefix: '$',
      label: 'Average Monthly Savings',
    },
  ]

  return (
    <section id="stats" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              {/* Large Number */}
              <motion.div
                className="text-5xl sm:text-6xl font-bold text-white mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </motion.div>

              {/* Label */}
              <motion.p
                className="text-base sm:text-lg text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
                viewport={{ once: true }}
              >
                {stat.label}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
