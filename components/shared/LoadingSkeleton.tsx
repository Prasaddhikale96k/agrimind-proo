'use client'

import { motion } from 'framer-motion'
import { Leaf, Beef, BarChart3 } from 'lucide-react'

// ═══════════════════════════════════════════════
// SKELETON LOADERS
// ═══════════════════════════════════════════════

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="h-32 bg-gray-100 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-12 animate-pulse" />
        </div>
        <div className="h-2 bg-gray-100 rounded-full w-full animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

export function MetricSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="h-5 bg-gray-100 rounded-full w-12" />
      </div>
      <div className="mt-3">
        <div className="h-8 bg-gray-100 rounded w-20 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-24 mt-2 animate-pulse" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-6">
          <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="col-span-2 space-y-6">
          <div className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          <div className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function CattleSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-50 flex gap-4">
          <div className="h-10 bg-gray-100 rounded w-10 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════
// EMPTY STATES
// ═══════════════════════════════════════════════

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: 'crops' | 'cattle' | 'charts'
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  const IconComponent = icon === 'cattle' ? Beef : icon === 'charts' ? BarChart3 : Leaf

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <IconComponent className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
