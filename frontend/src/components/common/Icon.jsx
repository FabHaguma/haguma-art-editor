import React from 'react';

const ICON_MAP = {
  transform: {
    emoji: '🔄',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="6" width="12" height="12" />
        <circle cx="6" cy="6" r="1.5" fill="currentColor" />
        <circle cx="18" cy="6" r="1.5" fill="currentColor" />
        <circle cx="6" cy="18" r="1.5" fill="currentColor" />
        <circle cx="18" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  crop: {
    emoji: '✂️',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h4M7 3v4M17 21h4M21 17v4" />
          <path d="M7 7h10a4 4 0 0 1 4 4v6" />
          <path d="M7 7v10a4 4 0 0 0 4 4h6" />
          <path d="M12 8v8M8 12h8" />
        </svg>
    ),
    
  },
  adjust: {
    emoji: '🎚️',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    ),
  },
  filter: {
    emoji: '✨',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
  },
  brush: {
    emoji: '🖌️',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13.28A7.88 7.88 0 0 0 17.11 7 8.72 8.72 0 0 0 10.6 3 9 9 0 0 0 2 12s.35 2 1.6 2.4c.5.16 1 .44 1.4.8.4.4.7.9.8 1.4.5 1.3 2.4 1.6 2.4 1.6a9 9 0 0 0 9.8-4.92z"></path>
        <path d="M17.11 7A6.9 6.9 0 0 1 22 12v6a2 2 0 0 1-2 2h-2.5"></path>
      </svg>
    ),
  },
  text: {
    emoji: 'T',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7"></polyline>
        <line x1="9" y1="20" x2="15" y2="20"></line>
        <line x1="12" y1="4" x2="12" y2="20"></line>
      </svg>
    ),
  },
  'rotate-cw': {
    emoji: '↻',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 4v6h-6" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  'rotate-ccw': {
    emoji: '↺',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  'flip-h': {
    emoji: '↔️',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 11 17 11 17 3" />
        <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" />
      </svg>
    ),
  },
  'flip-v': {
    emoji: '↕️',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 7 11 7 11 17 3 17" />
        <polyline points="21 17 13 17 13 7 21 7" />
        <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" />
      </svg>
    ),
  },
  lock: {
    emoji: '🔒',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  unlock: {
    emoji: '🔓',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    ),
  },
  menu: {
    emoji: '☰',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  close: {
    emoji: '✕',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  moon: {
    emoji: '🌙',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  sun: {
    emoji: '☀️',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
};

/**
 * Icon component supporting both emoji fallbacks and SVG icons
 * @param {string} name - Icon name from ICON_MAP
 * @param {string} type - 'svg' or 'emoji' (default: 'svg')
 * @param {string} className - Additional CSS classes
 */
const Icon = ({ name, type = 'svg', className = '', ...props }) => {
  const iconData = ICON_MAP[name];
  
  if (!iconData) {
    console.warn(`Icon "${name}" not found in ICON_MAP`);
    return null;
  }

  if (type === 'emoji') {
    return (
      <span className={className} data-icon={name} {...props}>
        {iconData.emoji}
      </span>
    );
  }

  return (
    <span className={className} data-icon={name} {...props}>
      {iconData.svg}
    </span>
  );
};

export default Icon;
