'use client'

import { useEffect, useState } from 'react'

export default function PriceTicker() {
  const [prices, setPrices] = useState<any[]>([])

  useEffect(() => {
    const items = [
      { crop: 'Tomato', price: '₹1,200/q', location: 'Pune', trend: '↑' },
      { crop: 'Wheat', price: '₹2,150/q', location: 'Amritsar', trend: '→' },
      { crop: 'Onion', price: '₹800/q', location: 'Lasalgaon', trend: '↓' },
      { crop: 'Rice', price: '₹1,900/q', location: 'Patna', trend: '↑' },
      { crop: 'Grapes', price: '₹3,500/q', location: 'Nashik', trend: '↑' },
      { crop: 'Cotton', price: '₹6,500/q', location: 'Nagpur', trend: '→' },
      { crop: 'Soybean', price: '₹3,900/q', location: 'Indore', trend: '↓' },
      { crop: 'Chilli', price: '₹8,000/q', location: 'Guntur', trend: '↑' },
      { crop: 'Potato', price: '₹1,050/q', location: 'Nasik', trend: '↑' },
      { crop: 'Maize', price: '₹1,850/q', location: 'Bijapur', trend: '→' },
    ]
    setPrices(items)
  }, [])

  const doubled = [...prices, ...prices]

  return (
    <div className="relative z-10 bg-green-800/60 py-1 overflow-hidden border-t border-green-500/30">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="mx-4 text-xs text-white inline-flex items-center gap-1.5">
            <span className="font-medium">{item.crop}</span>
            <span className="text-green-200">{item.price}</span>
            <span className="text-green-300 text-[10px]">{item.location}</span>
            <span className={item.trend === '↑' ? 'text-green-300' : item.trend === '↓' ? 'text-red-300' : 'text-gray-300'}>
              {item.trend}
            </span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
