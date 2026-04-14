'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function GaugeChart({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = '#00B894',
  label,
  unit = '%',
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  label: string
  unit?: string
}) {
  const circleRef = useRef<SVGCircleElement>(null)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const center = size / 2

  useEffect(() => {
    if (circleRef.current) {
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: circumference - (value / max) * circumference,
          duration: 1.2,
          ease: 'power2.out',
        }
      )
    }
  }, [value, max, circumference])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
        />
      </svg>
      <div className="text-center -mt-8">
        <p className="text-2xl font-bold text-dark">
          {value}
          <span className="text-sm font-normal text-subtle ml-1">{unit}</span>
        </p>
        <p className="text-xs text-subtle mt-1">{label}</p>
      </div>
    </div>
  )
}
