// ============================================================================
// TrustBadges — Premium Collection, Hassle-Free, Secure, 24/7 Support
// Matches reference images trust section
// ============================================================================

import { cn } from '@utils';

const BADGES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Premium Collection',
    desc: 'Handpicked designer outfits',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Hassle-Free Rental',
    desc: 'Easy booking & returns',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Secure Payments',
    desc: '100% safe & secure',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    title: '24/7 Support',
    desc: "We're here to help",
  },
] as const;

interface TrustBadgesProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function TrustBadges({ className, variant = 'default' }: TrustBadgesProps) {
  return (
    <div className={cn(
      'rounded-2xl bg-surface border border-border',
      variant === 'compact' ? 'p-4' : 'p-5 sm:p-6',
      className
    )}>
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {BADGES.map((badge) => (
          <div key={badge.title} className="flex flex-col items-center text-center gap-2">
            <div className={cn(
              'flex items-center justify-center rounded-full border border-primary/20 text-primary',
              variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12'
            )}>
              {badge.icon}
            </div>
            <div>
              <p className={cn(
                'font-medium text-text',
                variant === 'compact' ? 'text-[10px]' : 'text-[11px] sm:text-xs'
              )}>
                {badge.title}
              </p>
              <p className={cn(
                'text-text-muted mt-0.5',
                variant === 'compact' ? 'text-[8px] hidden sm:block' : 'text-[9px] sm:text-[10px]'
              )}>
                {badge.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
