'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Quote } from 'lucide-react'

const testimonialsRow1 = [
  { name: 'Rajesh Patil', location: 'Nashik, Maharashtra', quote: 'AgriMind Pro helped me reduce water usage by 35% in just one season. The AI recommendations are spot on!', rating: 5, avatar: 'RP' },
  { name: 'Sunita Deshmukh', location: 'Pune, Maharashtra', quote: 'I used to guess when to apply fertilizer. Now the AI tells me exactly what my crops need. My yields increased 28%.', rating: 5, avatar: 'SD' },
  { name: 'Vikram Jadhav', location: 'Nagpur, Maharashtra', quote: 'The financial tracking alone is worth it. I finally know which plot is most profitable and why.', rating: 5, avatar: 'VJ' },
  { name: 'Priya Kulkarni', location: 'Kolhapur, Maharashtra', quote: 'Disease detection saved my cotton crop. I caught the blight early and treated it before it spread.', rating: 5, avatar: 'PK' },
  { name: 'Anil More', location: 'Satara, Maharashtra', quote: 'Best farming app I have ever used. Simple, powerful, and the AI actually understands farming.', rating: 4, avatar: 'AM' },
  { name: 'Deepak Gaikwad', location: 'Ahmednagar, Maharashtra', quote: 'From planting to harvest, AgriMind Pro guides me every step. It is like having an agriculture expert on call.', rating: 5, avatar: 'DG' },
  { name: 'Meena Shinde', location: 'Sangli, Maharashtra', quote: 'The weather alerts have saved me from crop loss multiple times. I trust this app completely.', rating: 5, avatar: 'MS' },
  { name: 'Suresh Pawar', location: 'Solapur, Maharashtra', quote: 'I manage 5 plots across 12 acres. AgriMind Pro makes it feel like managing just one. Incredible tool.', rating: 5, avatar: 'SP' },
]

const testimonialsRow2 = [
  { name: 'Kiran Borade', location: 'Jalgaon, Maharashtra', quote: 'The chat feature is amazing. I ask questions in Marathi and get accurate farming advice instantly.', rating: 5, avatar: 'KB' },
  { name: 'Ashwini Patil', location: 'Dhule, Maharashtra', quote: 'My profit increased by 40% after using AgriMind Pro for one full season. The ROI tracking is eye-opening.', rating: 5, avatar: 'AP' },
  { name: 'Mahesh Chavan', location: 'Nanded, Maharashtra', quote: 'I was skeptical about AI in farming, but the results speak for themselves. My neighbors are now signing up too.', rating: 4, avatar: 'MC' },
  { name: 'Jyoti Mane', location: 'Latur, Maharashtra', quote: 'The soil analysis feature helped me understand why certain plots underperformed. Now I know exactly what to fix.', rating: 5, avatar: 'JM' },
  { name: 'Prakash Sonawane', location: 'Thane, Maharashtra', quote: 'Setting up took 2 minutes. Within a week, I had full visibility into my entire farm operation.', rating: 5, avatar: 'PS' },
  { name: 'Sandhya Nikam', location: 'Raigad, Maharashtra', quote: 'The spray scheduler considers wind speed and humidity. No more wasted chemicals or ineffective spraying.', rating: 5, avatar: 'SN' },
  { name: 'Ganesh Bhosale', location: 'Beed, Maharashtra', quote: 'I have tried many farming apps. AgriMind Pro is the only one that actually delivers on its promises.', rating: 5, avatar: 'GB' },
  { name: 'Rekta Jadhav', location: 'Osmanabad, Maharashtra', quote: 'Financial reports helped me get a bank loan. The detailed records gave the bank confidence in my farming.', rating: 5, avatar: 'RJ' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonialsRow1[0] }) {
  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-2xl border border-green-100 p-5 mx-2 hover:shadow-lg hover:border-green-200 transition-all">
      <Quote className="w-5 h-5 text-green-300 mb-3" />
      <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">{testimonial.quote}</p>
      <StarRating rating={testimonial.rating} />
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-green-700">{testimonial.avatar}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-[10px] text-gray-500">{testimonial.location}</p>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="testimonials" ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Farmers Love AgriMind Pro
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trusted by thousands of farmers across Maharashtra
          </p>
          <motion.div
            className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>
      </div>

      {/* Scrolling rows */}
      <div className="relative overflow-hidden">
        {/* Row 1 - scrolls left */}
        <div className="flex animate-scroll-left py-2">
          {[...testimonialsRow1, ...testimonialsRow1].map((t, i) => (
            <TestimonialCard key={`r1-${i}`} testimonial={t} />
          ))}
        </div>

        {/* Row 2 - scrolls right */}
        <div className="flex animate-scroll-right py-2 mt-4">
          {[...testimonialsRow2, ...testimonialsRow2].map((t, i) => (
            <TestimonialCard key={`r2-${i}`} testimonial={t} />
          ))}
        </div>
      </div>

      {/* Gradient edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
    </section>
  )
}
