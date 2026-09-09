import React from 'react';

type BadgeStatus = 'PENDING' | 'ASSIGNED' | 'TRAVELING' | 'IN_PROGRESS' | 'COMPLETED' | string;

interface BadgeProps {
  status: BadgeStatus;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  // Define color configurations for every possible workflow status
  const statusMap: Record<string, { bg: string; text: string; defaultLabel: string }> = {
    PENDING: { 
      bg: 'bg-neutral-100', 
      text: 'text-neutral-600', 
      defaultLabel: 'PENDING' 
    },
    ASSIGNED: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      defaultLabel: 'TECH ASSIGNED' 
    },
    TRAVELING: { 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-700', 
      defaultLabel: 'TRAVELING' 
    },
    IN_PROGRESS: { 
      bg: 'bg-amber-50', 
      text: 'text-amber-700', 
      defaultLabel: 'IN PROGRESS' 
    },
    COMPLETED: { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-700', 
      defaultLabel: 'COMPLETED' 
    },
  };

  // Safe fallback: If an unknown status is passed, default to PENDING's colors to prevent crashes
  const config = statusMap[status] || statusMap['PENDING'];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {label || config.defaultLabel}
    </span>
  );
};