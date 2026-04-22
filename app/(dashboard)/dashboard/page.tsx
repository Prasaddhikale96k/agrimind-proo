'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWeather, FALLBACK_WEATHER, WeatherData } from '@/lib/weatherService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Farm } from '@/types';

const FARM_METRICS = [
  { id: 'crop-health', icon: '🌿', label: 'Crop Health', value: '85%', numericValue: 85, status: 'Good', statusColor: '#10B981', progressColor: '#10B981' },
  { id: 'soil-moisture', icon: '💧', label: 'Soil Moisture', value: '42%', numericValue: 42, status: 'Good', statusColor: '#10B981', progressColor: '#3B82F6' },
  { id: 'temperature', icon: '🌡️', label: 'Temperature', value: '36°C', numericValue: 72, status: 'High', statusColor: '#F59E0B', progressColor: '#F59E0B' },
  { id: 'sunlight', icon: '☀️', label: 'Sunlight', value: '8.5 hrs', numericValue: 85, status: 'Optimal', statusColor: '#10B981', progressColor: '#F97316' },
];

const MINI_CARDS = [
  { id: 'plant-health', icon: '🌿', iconBg: 'rgba(16,185,129,0.1)', status: 'Good', statusColor: '#10B981', statusBg: 'rgba(16,185,129,0.12)', value: 85, displayValue: '85', unit: '%', label: 'Crop Health', progress: 85, progressColor: '#10B981', accentColor: '#10B981' },
  { id: 'wind-speed', icon: '💨', iconBg: 'rgba(59,130,246,0.1)', status: 'Normal', statusColor: '#3B82F6', statusBg: 'rgba(59,130,246,0.12)', value: 3.2, displayValue: '3.2', unit: 'm/s', label: 'Wind Speed', progress: 32, progressColor: '#3B82F6', accentColor: '#3B82F6' },
  { id: 'temperature', icon: '🌡️', iconBg: 'rgba(245,158,11,0.1)', status: 'High', statusColor: '#F59E0B', statusBg: 'rgba(245,158,11,0.12)', value: 32, displayValue: '32', unit: '°C', label: 'Temperature', progress: 65, progressColor: '#F59E0B', accentColor: '#F59E0B' },
  { id: 'soil-ph', icon: '🧪', iconBg: 'rgba(139,92,246,0.1)', status: 'Good', statusColor: '#8B5CF6', statusBg: 'rgba(139,92,246,0.12)', value: 6.8, displayValue: '6.8', unit: 'pH', label: 'Soil pH', progress: 68, progressColor: '#8B5CF6', accentColor: '#8B5CF6' },
  { id: 'rainfall', icon: '🌧️', iconBg: 'rgba(6,182,212,0.1)', status: 'Good', statusColor: '#06B6D4', statusBg: 'rgba(6,182,212,0.12)', value: 12, displayValue: '12', unit: 'mm', label: 'Rainfall', progress: 40, progressColor: '#06B6D4', accentColor: '#06B6D4' },
  { id: 'crop-yield', icon: '🌾', iconBg: 'rgba(16,185,129,0.1)', status: 'Good', statusColor: '#10B981', statusBg: 'rgba(16,185,129,0.12)', value: 92, displayValue: '92', unit: '%', label: 'Crop Yield', progress: 92, progressColor: '#10B981', accentColor: '#10B981' },
];

const AI_INSIGHTS = [
  'Your crops are thriving today! The overall health index is 85%.',
  'Soil moisture levels are optimal. No irrigation needed today.',
  'Wind speed is low — ideal conditions for pesticide application.',
  'Consider adding a new crop to your plot.',
];

const STATIC_PLOTS = [
  { id: 'PL-OL', name: 'Tomato Garden', health: 94, moisture: 28, color: '#10B981', crop: 'Cherry Tomato', stage: 'Fruiting', icon: '🍅', area: '4.2 Ac' },
  { id: 'CL-ODL', name: 'Wheat Field', health: 87, moisture: 45, color: '#F59E0B', crop: 'HD-2967 Wheat', stage: 'Vegetative', icon: '🌾', area: '5.8 Ac' },
  { id: 'PL-B', name: 'Rice Paddy', health: 72, moisture: 65, color: '#3B82F6', crop: 'Rice Paddy', stage: 'Growing', icon: '🌾', area: '2.5 Ac' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 24, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } } };
const slideLeft = { hidden: { opacity: 0, x: -32 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65 } } };
const slideRight = { hidden: { opacity: 0, x: 32 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65 } } };
const springPop = { hidden: { opacity: 0, scale: 0.88, y: 20 }, visible: { opacity: 1, scale: 1, y: 0 } };

function useCountUp(target: number, duration = 1800, delay = 200): [number, boolean] {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        setCount(parseFloat(current.toFixed(1)));
        if (progress < 1) { requestAnimationFrame(tick); } else { setCount(target); setDone(true); }
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return [count, done];
}

function useTypewriter(text: string, speed = 35, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);
  useEffect(() => {
    setDisplayed(''); setIsDone(false); let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; } else { setIsDone(true); clearInterval(interval); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, isDone };
}

function WeatherCard({ weather }: { weather: WeatherData }) {
  const forecastData = [
    { day: 'Mon', icon: '⛅', high: 35, low: 24, rain: '10%' },
    { day: 'Tue', icon: '☀️', high: 37, low: 26, rain: '5%' },
    { day: 'Wed', icon: '🌧️', high: 29, low: 22, rain: '80%' },
    { day: 'Thu', icon: '⛅', high: 32, low: 23, rain: '30%' },
    { day: 'Fri', icon: '☀️', high: 36, low: 25, rain: '5%' },
    { day: 'Sat', icon: '🌤️', high: 34, low: 24, rain: '15%' },
    { day: 'Sun', icon: '☀️', high: 38, low: 27, rain: '2%' },
  ];

  const extraMetrics = [
    { icon: '🌅', label: 'Sunrise', value: '6:12 AM' },
    { icon: '🌇', label: 'Sunset', value: '7:45 PM' },
    { icon: '🔆', label: 'UV Index', value: '8 (High)' },
    { icon: '💨', label: 'Air Quality', value: 'AQI 42 (Good)' },
    { icon: '🌧️', label: 'Rain Chance', value: '15%' },
    { icon: '👁️', label: 'Visibility', value: '8 km' },
  ];

  return (
    <motion.div variants={slideLeft} initial="hidden" animate="visible" whileHover={{ boxShadow: '0 20px 60px rgba(16,185,129,0.13)', transition: { duration: 0.3 } }}
      style={{ background: 'linear-gradient(145deg, #ffffff, #f0fdf4)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden', flex: 1, minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>Current Weather</span>
        <span style={{ color: '#9CA3AF', fontSize: '13px' }}>H: {weather.tempMax}° / L: {weather.tempMin}°</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', position: 'relative', zIndex: 1 }}>
        <motion.div animate={{ y: [0, -8, 0], rotateY: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '56px' }}>{weather.iconEmoji}</span>
        </motion.div>
        <div>
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: '48px', fontWeight: '800', color: '#111827', lineHeight: 1, letterSpacing: '-2px' }}>{weather.temp}°C</motion.div>
          <div style={{ color: '#6B7280', fontSize: '15px', marginTop: '4px' }}>{weather.condition}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9CA3AF', fontSize: '13px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <span>📍</span><span>{weather.location}</span>
        {weather.isLive && <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ marginLeft: '6px', fontSize: '10px', color: '#16a34a', fontWeight: '700', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>● LIVE</motion.span>}
      </div>

      {/* 3 Main Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
        {[{ icon: '💧', label: 'Humidity', value: `${weather.humidity}%` }, { icon: '💨', label: 'Wind', value: `${weather.windSpeed} m/s` }, { icon: '🌡️', label: 'Feels like', value: `${weather.feelsLike}°C` }].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} whileHover={{ scale: 1.04, background: '#f0fdf4' }}
            style={{ background: '#F9FAFB', borderRadius: '16px', padding: '16px', textAlign: 'center', border: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{item.icon}</div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Extra 6 Metrics Grid */}
      <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}
        initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        {extraMetrics.map((m) => (
          <motion.div key={m.label} variants={{ hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } }}
            whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(34,197,94,0.12)' }}
            style={{ background: 'white', borderRadius: '14px', padding: '12px 10px', textAlign: 'center', border: '1px solid #e5e7eb', cursor: 'default' }}>
            <div style={{ fontSize: '22px' }}>{m.icon}</div>
            <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '4px' }}>{m.label}</p>
            <p style={{ fontWeight: '700', fontSize: '14px', color: '#374151' }}>{m.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 7-Day Forecast Strip */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: '600', color: '#374151', marginBottom: '10px', fontSize: '14px' }}>📅 7-Day Forecast</p>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {forecastData.map((day, i) => (
            <motion.div key={day.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}
              whileHover={{ scale: 1.08, background: '#f0fdf4' }}
              style={{ minWidth: '70px', background: '#f9fafb', borderRadius: '14px', padding: '10px 8px', textAlign: 'center', border: '1px solid #f3f4f6', cursor: 'pointer', flexShrink: 0 }}>
              <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>{day.day}</p>
              <div style={{ fontSize: '22px', margin: '6px 0' }}>{day.icon}</div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{day.high}°</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{day.low}°</p>
              <p style={{ fontSize: '10px', color: '#3b82f6', marginTop: '4px' }}>💧{day.rain}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sunrise/Sunset Arc */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', borderRadius: '16px', padding: '16px 20px', border: '1px solid #fde68a' }}>
        <p style={{ fontWeight: '600', color: '#92400e', fontSize: '13px', marginBottom: '12px' }}>☀️ Sun Tracker</p>
        <div style={{ position: 'relative', height: '60px' }}>
          <svg width="100%" height="60" viewBox="0 0 300 60">
            <path d="M 10 55 Q 150 -10 290 55" fill="none" stroke="#fde68a" strokeWidth="2" strokeDasharray="4 4" />
            <motion.circle cx="150" cy="10" r="8" fill="#f59e0b" animate={{ cx: [10, 150, 290], cy: [55, 10, 55] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '12px', color: '#78350f' }}>🌅 6:12 AM</span>
            <span style={{ fontSize: '12px', color: '#78350f' }}>🌇 7:45 PM</span>
          </div>
        </div>
      </motion.div>

      {/* Agricultural Advisory Banner */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
        style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '16px', padding: '14px 18px', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.span style={{ fontSize: '28px' }} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>🌾</motion.span>
        <div>
          <p style={{ fontWeight: '700', color: '#15803d', fontSize: '13px' }}>Agricultural Advisory</p>
          <p style={{ color: '#16a34a', fontSize: '12px', marginTop: '2px' }}>Good day for irrigation - low wind expected</p>
        </div>
        <motion.span style={{ marginLeft: 'auto', background: '#22c55e', color: 'white', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>View Tips</motion.span>
      </motion.div>
    </motion.div>
  );
}

function AIInsightsCard() {
  const [insightIndex, setInsightIndex] = useState(0);
  const currentInsight = AI_INSIGHTS[insightIndex];
  const { displayed, isDone } = useTypewriter(currentInsight, 32, 400);
  useEffect(() => {
    if (!isDone) return;
    const timer = setTimeout(() => { setInsightIndex((prev) => (prev + 1) % AI_INSIGHTS.length); }, 5000);
    return () => clearTimeout(timer);
  }, [isDone, insightIndex]);

  return (
    <motion.div variants={slideRight} initial="hidden" animate="visible" whileHover={{ boxShadow: '0 16px 48px rgba(102,126,234,0.15)', y: -2, transition: { duration: 0.3 } }}
      style={{ background: 'linear-gradient(135deg, #F8F7FF 0%, #FFF9F0 100%)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(102,126,234,0.15)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <motion.span animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.2, 1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} style={{ fontSize: '20px', display: 'inline-block' }}>✨</motion.span>
        <span style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>AI Advisor</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(16,185,129,0.1)', borderRadius: '20px', padding: '3px 10px' }}>
          <motion.div animate={{ scale: [1, 1.8, 1], opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: '10px', color: '#10B981', fontWeight: '700' }}>Active</span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={insightIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
          style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.7, minHeight: '48px' }}>
          {displayed}
          {!isDone && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ display: 'inline-block', marginLeft: '2px', color: '#10B981' }}>|</motion.span>}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

function FarmMetricsCard() {
  return (
    <motion.div variants={slideRight} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
      style={{ background: '#FFFFFF', borderRadius: '20px', padding: '20px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', flex: 1 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Farm Metrics</h3>
      <div>
        {FARM_METRICS.map((metric, i) => (
          <motion.div key={metric.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            whileHover={{ backgroundColor: '#F9FAFB', x: 4, transition: { duration: 0.2 } }}
            style={{ display: 'flex', alignItems: 'center', padding: '10px 8px', borderRadius: '12px', marginBottom: '4px', cursor: 'pointer' }}>
            <motion.div whileHover={{ scale: 1.12, rotate: 8 }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${metric.progressColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginRight: '12px', flexShrink: 0 }}>{metric.icon}</motion.div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500', marginBottom: '5px' }}>{metric.label}</div>
              <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${metric.numericValue}%` }} transition={{ duration: 1.6, delay: 0.6 + i * 0.12, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: '2px', background: metric.progressColor }} />
              </div>
              <div style={{ fontSize: '11px', color: metric.statusColor, fontWeight: '600', marginTop: '3px' }}>{metric.status}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{metric.value}</span>
              <span style={{ color: '#D1D5DB', fontSize: '14px' }}>›</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function MiniCard({ card, index }: { card: typeof MINI_CARDS[0]; index: number }) {
  const [count] = useCountUp(card.value, 1600, 400 + index * 80);
  const displayCount = card.value % 1 === 0 ? Math.round(count) : count.toFixed(1);
  return (
    <motion.div variants={springPop} whileHover={{ y: -7, scale: 1.03, boxShadow: `0 18px 44px ${card.accentColor}22`, transition: { duration: 0.28 } }} whileTap={{ scale: 0.97 }}
      style={{ background: '#FFFFFF', borderRadius: '18px', padding: '18px', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '14px', right: '14px', background: card.statusBg, color: card.statusColor, fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>{card.status}</div>
      <motion.div whileHover={{ scale: 1.15, rotate: 8 }} style={{ width: '42px', height: '42px', borderRadius: '12px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>{card.icon}</motion.div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '4px' }}>
        <span style={{ fontSize: '34px', fontWeight: '800', color: '#111827', lineHeight: 1, letterSpacing: '-1px' }}>{displayCount}</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>{card.unit}</span>
      </div>
      <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500', marginBottom: '12px' }}>{card.label}</div>
      <div style={{ height: '3px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${card.progress}%` }} transition={{ duration: 1.6, delay: 0.5 + index * 0.08, ease: 'easeOut' }} style={{ height: '100%', background: card.progressColor, borderRadius: '2px' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: `${card.accentColor}07`, pointerEvents: 'none' }} />
    </motion.div>
  );
}

function FarmOverview({ plots = STATIC_PLOTS }: { plots?: typeof STATIC_PLOTS }) {
  return (
    <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.65 }}
      style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Farm Overview</h3>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6B7280' }}>Nashik, Maharashtra · 12.5 Acres</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.08)', padding: '7px 14px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.15)' }}>
          <motion.div animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>{plots.length} Active Plots</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {plots.map((plot, i) => (
          <motion.div key={plot.id} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.12, duration: 0.5, type: 'spring', stiffness: 100 }}
            whileHover={{ scale: 1.03, y: -4, boxShadow: `0 14px 36px ${plot.color}22`, transition: { duration: 0.25 } }} whileTap={{ scale: 0.97 }}
            style={{ background: `linear-gradient(135deg, ${plot.color}0D 0%, ${plot.color}06 100%)`, border: `1.5px solid ${plot.color}30`, borderRadius: '16px', padding: '18px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: `${plot.color}18`, color: plot.color, fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', marginBottom: '10px' }}><span>{plot.icon}</span><span>{plot.id}</span></div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '3px' }}>{plot.name}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>{plot.crop}</div>
            <div style={{ fontSize: '11px', color: plot.color, fontWeight: '600', marginBottom: '14px', background: `${plot.color}12`, display: 'inline-block', padding: '2px 8px', borderRadius: '8px' }}>{plot.stage}</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div><div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '3px' }}>🌿 Health</div><div style={{ fontSize: '18px', fontWeight: '800', color: plot.color }}>{plot.health}%</div></div>
              <div><div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '3px' }}>💧 Moisture</div><div style={{ fontSize: '18px', fontWeight: '800', color: '#3B82F6' }}>{plot.moisture}%</div></div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '3px' }}>Area</div><div style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>{plot.area}</div></div>
            </div>
            <div style={{ position: 'absolute', bottom: '-12px', right: '-12px', width: '64px', height: '64px', borderRadius: '50%', background: `${plot.color}08`, pointerEvents: 'none' }} />
          </motion.div>
        ))}
      </div>
      <div style={{ height: '1px', background: '#F3F4F6', marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Active Crops</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[{ name: 'Cherry Tomato', stage: 'Fruiting', health: 94, icon: '🍅', color: '#10B981' }, { name: 'HD-2967 Wheat', stage: 'Vegetative', health: 87, icon: '🌾', color: '#F59E0B' }].map((crop, i) => (
            <motion.div key={i} whileHover={{ scale: 1.04, y: -2 }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F9FAFB', borderRadius: '14px', padding: '10px 14px', border: '1px solid #F0F0F0' }}>
              <span style={{ fontSize: '22px' }}>{crop.icon}</span>
              <div><div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{crop.name}</div><div style={{ fontSize: '11px', color: '#9CA3AF' }}>{crop.stage}</div></div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: crop.color, marginLeft: '8px' }}>{crop.health}%</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function NewUserPrompt() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)', borderRadius: '20px', padding: '28px', border: '2px solid #10B981', boxShadow: '0 4px 20px rgba(16,185,129,0.15)', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🌱</div>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#065F46' }}>Setup Your Farm</h3>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#059669' }}>Start tracking your agricultural plots</p>
        </div>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
        Welcome! Let's set up your first plot to start tracking crops, monitoring soil conditions, and getting AI-powered insights for your farm.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link href="/onboarding" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#10B981', color: 'white', fontSize: '14px', fontWeight: '600', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s' }}>
          <span>🚜</span> Add Your First Plot
        </Link>
      </div>
    </motion.div>
  );
}

function ExistingUserActions({ plotCount }: { plotCount: number }) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const quickActions = [
    { id: 'add-crop', label: 'Add Crop', icon: '🌱', emoji: '🌾', color: 'from-green-500 to-emerald-600', bgGlow: 'rgba(34,197,94,0.3)', description: 'Register new crop', shortcut: '⌘C', href: '/crops' },
    { id: 'add-plot', label: 'Add Plot', icon: '📍', emoji: '🗺️', color: 'from-blue-500 to-cyan-600', bgGlow: 'rgba(59,130,246,0.3)', description: 'Map new farm plot', shortcut: '⌘P', href: '/onboarding' },
    { id: 'reports', label: 'Reports', icon: '📊', emoji: '📈', color: 'from-purple-500 to-violet-600', bgGlow: 'rgba(139,92,246,0.3)', description: 'Analytics & insights', shortcut: '⌘R', href: '/reports' },
    { id: 'ai-advisor', label: 'AI Advisor', icon: '🤖', emoji: '✨', color: 'from-amber-500 to-orange-600', bgGlow: 'rgba(245,158,11,0.3)', description: 'Get AI recommendations', shortcut: '⌘A', href: '/ai' },
    { id: 'irrigation', label: 'Irrigation', icon: '💧', emoji: '🚿', color: 'from-teal-500 to-cyan-600', bgGlow: 'rgba(20,184,166,0.3)', description: 'Schedule watering', shortcut: '⌘I', href: '/weather' },
    { id: 'market', label: 'Market Prices', icon: '💰', emoji: '📉', color: 'from-rose-500 to-pink-600', bgGlow: 'rgba(244,63,94,0.3)', description: 'Live commodity prices', shortcut: '⌘M', href: '/fassal-deal' },
  ];

  const handleRipple = (e: React.MouseEvent, id: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const ripple = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), 600);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>⚡ Quick Actions</span>
        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{plotCount} active plots</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        {quickActions.map((action, i) => (
          <Link key={action.id} href={action.href} onClick={(e) => handleRipple(e, action.id)} onMouseEnter={() => setHoveredAction(action.id)} onMouseLeave={() => setHoveredAction(null)}
            style={{ position: 'relative', textDecoration: 'none', cursor: 'pointer' }}>
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300 }}
              whileHover={{ y: -6, scale: 1.03, boxShadow: `0 16px 32px ${action.bgGlow}` }} whileTap={{ scale: 0.97 }}
              style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)', borderRadius: '16px', padding: '14px 10px', border: hoveredAction === action.id ? `1.5px solid ${action.bgGlow.replace('0.3', '0.6')}` : '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              {ripples.filter(r => r.id.toString().startsWith(action.id.slice(0, 3))).map(r => (
                <motion.span key={r.id} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.5 }}
                  style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', left: r.x - 10, top: r.y - 10, pointerEvents: 'none' }} />
              ))}
              <motion.div animate={{ rotate: hoveredAction === action.id ? [0, -8, 8, 0] : 0 }} transition={{ duration: 0.4 }} style={{ fontSize: '28px', marginBottom: '8px' }}>{action.emoji}</motion.div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{action.label}</div>
              <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '6px' }}>{action.description}</div>
              <kbd style={{ fontSize: '9px', padding: '2px 6px', background: '#F3F4F6', borderRadius: '4px', color: '#6B7280', fontFamily: 'monospace' }}>{action.shortcut}</kbd>
              {hoveredAction === action.id && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '12px', color: '#10B981' }}>→</motion.div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER);
  const [isClient, setIsClient] = useState(false);
  const [plots, setPlots] = useState<typeof STATIC_PLOTS>([]);
  const [loadingPlots, setLoadingPlots] = useState(true);
  const { user } = useAuth();

  const loadWeather = useCallback(async () => {
    try { const data = await fetchWeather(20.0059, 73.7898); setWeather(data); } catch { /* keep fallback */ }
  }, []);

  useEffect(() => { setIsClient(true); }, []);
  
  useEffect(() => {
    if (!isClient) return;
    loadWeather();
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isClient, loadWeather]);

  // Fetch user's plots from database
  useEffect(() => {
    async function fetchPlots() {
      if (!user) {
        // Use static data for non-authenticated view
        setPlots(STATIC_PLOTS);
        setLoadingPlots(false);
        return;
      }
      
      try {
        const { data: farmsData, error } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (farmsData && farmsData.length > 0) {
          const mappedPlots = (farmsData as Farm[]).map((farm, i) => ({
            id: farm.plot_id || `PL-${i + 1}`,
            name: farm.name,
            plot_name: farm.plot_name || farm.name,
            health: Math.floor(Math.random() * 30) + 70,
            moisture: Math.floor(Math.random() * 40) + 25,
            color: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'][i % 4],
            crop: farm.soil_type || 'Mixed',
            stage: 'Growing',
            icon: ['🍅', '🌾', '🌱', '🍇'][i % 4],
            area: farm.area_acres ? `${farm.area_acres} Ac` : '5.0 Ac',
          }));
          setPlots(mappedPlots);
        } else {
          setPlots([]);
        }
      } catch (err) {
        console.error('Error fetching plots:', err);
        setPlots(STATIC_PLOTS); // Fallback to static data on error
      } finally {
        setLoadingPlots(false);
      }
    }
    
    fetchPlots();
  }, [user]);

  const isNewUser = !loadingPlots && plots.length === 0;

  if (!isClient) {
    return (
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#10B981' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflowY: 'auto', minHeight: '100%', boxSizing: 'border-box', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 25%, #f0f9ff 50%, #fefce8 75%, #f0fdf4 100%)', backgroundSize: '400% 400%', animation: 'gradientShift 15s ease infinite' }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; }
        .pulse-green::before { content: ''; position: absolute; inset: -4px; border-radius: inherit; background: rgba(34,197,94,0.3); animation: pulse 2s ease-out infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
      `}</style>
      
      {/* Stats Overview Strip */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[{ label: 'Total Area', value: '12.5', unit: 'Ac', icon: '🌾', trend: '+2.3%', color: '#10B981' }, { label: 'Active Crops', value: '3', unit: '', icon: '🌿', trend: 'All Healthy', color: '#10B981' }, { label: 'Crop Health', value: '84', unit: '%', icon: '💚', trend: '+5%', color: '#22c55e' }, { label: 'Water Saved', value: '2.3', unit: 'kL', icon: '💧', trend: '-12% saved', color: '#3B82F6' }, { label: 'AI Actions', value: '2', unit: '', icon: '🤖', trend: 'Action needed', color: '#F59E0B' }, { label: 'Revenue', value: '1.2', unit: 'L', icon: '💰', trend: '+8%', color: '#8B5CF6' }].map((stat, i) => (
          <motion.div key={stat.label} variants={{ hidden: { y: 30, opacity: 0, scale: 0.8 }, visible: { y: 0, opacity: 1, scale: 1, transition: { delay: i * 0.1, type: 'spring', stiffness: 200 } } }}
            whileHover={{ y: -8, scale: 1.05, boxShadow: `0 20px 40px ${stat.color}25` }}
            className="glass-card" style={{ padding: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</motion.div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>{stat.value}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>{stat.unit}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontSize: '10px', fontWeight: '600', color: stat.color, background: `${stat.color}12`, padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>{stat.trend}</div>
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `${stat.color}08`, pointerEvents: 'none' }} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
        <WeatherCard weather={weather} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AIInsightsCard />
          <FarmMetricsCard />
        </div>
      </motion.div>
      
      {/* CONDITIONAL UI: State A (New User) vs State B (Existing User) */}
      {isNewUser ? (
        <NewUserPrompt />
      ) : (
        <>
          <ExistingUserActions plotCount={plots.length} />
          <FarmOverview plots={plots} />
        </>
      )}
      
      {/* Mini cards always show */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '20px' }}>
        {MINI_CARDS.map((card, i) => <MiniCard key={card.id} card={card} index={i} />)}
      </motion.div>
    </div>
  );
}