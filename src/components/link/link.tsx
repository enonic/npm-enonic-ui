import type { LucideIcon } from '@/types';
import { cn } from '@/utils';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

function isExternalHref(href: string): boolean {
  try {
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return true;

    const location = typeof window !== 'undefined' ? window.location : undefined;

    if (!location) return true;

    const url = new URL(href, location.origin);
    return url.origin !== location.origin;
  } catch {
    return true;
  }
}

function resolveIcon(
  icon: LucideIcon | boolean | undefined,
  defaultIcon: LucideIcon | undefined,
  useDefault = false,
): LucideIcon | undefined {
  if (typeof icon === 'function') return icon;
  if (icon === true || (icon === undefined && useDefault)) return defaultIcon;
  return undefined;
}

export type LinkProps = {
  href: string;
  external?: boolean | 'auto';
  newTab?: boolean;
  leftIcon?: LucideIcon | boolean;
  rightIcon?: LucideIcon | boolean;
} & ComponentPropsWithoutRef<'a'>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, external = 'auto', newTab, leftIcon, rightIcon, children, rel, ...props }, ref) => {
    const ext = external === 'auto' ? isExternalHref(href) : external;
    const target = (newTab ?? ext) ? '_blank' : undefined;

    const LeftIcon = resolveIcon(leftIcon, ArrowRight);
    const RightIcon = resolveIcon(rightIcon, ExternalLink, ext);

    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          'inline-flex items-center align-baseline gap-1',
          'text-sm font-normal underline underline-offset-3 decoration-1',
          'visited:text-link-visited hover:text-main-hover',
          className,
        )}
        target={target}
        rel={newTab || ext ? 'noopener noreferrer' : 'noreferrer'}
        {...props}
      >
        {LeftIcon && <LeftIcon className='inline-block flex-none w-3.5 h-3.5' strokeWidth={1.5} aria-hidden='true' />}
        {children}
        {RightIcon && <RightIcon className='inline-block flex-none w-3.5 h-3.5' strokeWidth={1.5} aria-hidden='true' />}
      </a>
    );
  },
);

Link.displayName = 'Link';
