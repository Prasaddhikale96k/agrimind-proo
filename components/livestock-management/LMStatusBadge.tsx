'use client';

import { LMHealthStatus, LMAnimalStatus } from 
  '@/lib/livestock-management/lm.types';
import { LM_HEALTH_STATUS_CONFIG, LM_STATUS_CONFIG } from 
  '@/lib/livestock-management/lm.constants';

interface HealthProps {
  variant: 'health';
  status: LMHealthStatus;
  size?: 'sm' | 'md';
}

interface AnimalProps {
  variant: 'status';
  status: LMAnimalStatus;
  size?: 'sm' | 'md';
}

type Props = HealthProps | AnimalProps;

export default function LMStatusBadge({ size = 'md', ...props }: Props) {
  const sizeClass = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-sm px-3 py-1';

  if (props.variant === 'health') {
    const config = LM_HEALTH_STATUS_CONFIG[props.status];
    return (
      <span className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        border backdrop-blur-sm ${sizeClass}
        ${config.bg} ${config.text} ${config.border}
      `}>
        <span className={`
          w-1.5 h-1.5 rounded-full ${config.dot}
          ${props.status === 'sick' || props.status === 'critical' 
            ? 'animate-pulse' : ''}
        `} />
        {config.label}
      </span>
    );
  }

  const config = LM_STATUS_CONFIG[props.status];
  return (
    <span className={`
      inline-flex items-center rounded-full font-semibold
      border ${sizeClass} ${config.bg} ${config.text} ${config.border}
    `}>
      {config.label}
    </span>
  );
}