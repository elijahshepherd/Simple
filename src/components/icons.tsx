export function WindowsIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="12" y1="7" x2="12" y2="17" />
    </svg>
  )
}

export function LinuxIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.5 5H6L12 2z" />
      <path d="M2 12h20" />
      <path d="M6 22V12" />
      <path d="M18 22V12" />
    </svg>
  )
}

export function MacOSIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M20 14.54a6.84 6.84 0 0 1-2 4.46 2 2 0 0 1-3.45-1.43 2 2 0 0 1-.82-2.7 6.84 6.84 0 0 0-1.5-5.35 2 2 0 0 1-.1-2.67 2 2 0 0 1 1.98-1.86 2 2 0 0 1 2.65.4 6.84 6.84 0 0 1 3.83 5.93 2 2 0 0 1 .1 2.56 2 2 0 0 1-.97 1.78" />
      <path d="M12 22c4.97 0 9-4.03 9-9a8.88 8.88 0 0 0-1.43-5 2 2 0 0 0-2.94-.53 8.35 8.35 0 0 1-5.26 0 2 2 0 0 0-2.94.53A8.88 8.88 0 0 0 3 13c0 4.97 4.03 9 9 9z" />
    </svg>
  )
}