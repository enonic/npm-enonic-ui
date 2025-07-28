import { cn } from '@/utils';
import { Root } from '@radix-ui/react-slot';
import type { JSX, ReactNode } from 'react';
import { createPortal, useCallback, useEffect, useRef, useState } from 'react';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

type TooltipCoordinates = {
  top: number;
  left: number;
};

type TooltipPosition = TooltipCoordinates & {
  transformOrigin: string;
  actualSide: TooltipSide;
};

export type TooltipProps = {
  children: ReactNode;
  value: string;
  side?: TooltipSide;
  className?: string;
  asChild?: boolean;
  delay?: number;
};

const oppositeSide = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
} as const;

function useTooltipPosition(
  isOpen: boolean,
  side: TooltipSide,
  triggerRef: React.RefObject<HTMLElement>,
  tooltipRef: React.RefObject<HTMLElement>,
): TooltipPosition {
  const [coords, setCoords] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    transformOrigin: '',
    actualSide: side,
  });

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;
    const padding = 8;

    const calculatePosition = (targetSide: TooltipSide): TooltipPosition => {
      let top = 0;
      let left = 0;
      let transformOrigin = '';

      switch (targetSide) {
        case 'top':
          top = triggerRect.top + window.scrollY - tooltipRect.height - gap;
          left = triggerRect.left + window.scrollX + (triggerRect.width - tooltipRect.width) / 2;
          transformOrigin = 'bottom center';
          break;
        case 'bottom':
          top = triggerRect.bottom + window.scrollY + gap;
          left = triggerRect.left + window.scrollX + (triggerRect.width - tooltipRect.width) / 2;
          transformOrigin = 'top center';
          break;
        case 'left':
          top = triggerRect.top + window.scrollY + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left + window.scrollX - tooltipRect.width - gap;
          transformOrigin = 'center right';
          break;
        case 'right':
          top = triggerRect.top + window.scrollY + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + window.scrollX + gap;
          transformOrigin = 'center left';
          break;
      }

      return {
        top,
        left,
        transformOrigin,
        actualSide: targetSide,
      };
    };

    const isWithinViewport = ({ top, left }: TooltipCoordinates): boolean => {
      const viewportTop = window.scrollY + padding;
      const viewportBottom = window.scrollY + window.innerHeight - tooltipRect.height - padding;
      const viewportLeft = window.scrollX + padding;
      const viewportRight = window.scrollX + window.innerWidth - tooltipRect.width - padding;

      return top >= viewportTop && top <= viewportBottom && left >= viewportLeft && left <= viewportRight;
    };

    let position = calculatePosition(side);
    if (!isWithinViewport(position)) {
      const oppositePosition = calculatePosition(oppositeSide[side]);
      if (isWithinViewport(oppositePosition)) {
        position = oppositePosition;
      }
    }

    setCoords(position);
  }, [isOpen, side]);

  return coords;
}

type TooltipContentProps = {
  children: ReactNode;
  actualSide: TooltipSide;
  className?: string;
  position: TooltipPosition;
  tooltipRef: React.RefObject<HTMLDivElement>;
};

type TooltipTriggerProps = {
  children: ReactNode;
  asChild: boolean;
  triggerRef: React.RefObject<HTMLDivElement>;
  isOpen: boolean;
  onMouseEnter: (e?: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: (e?: React.MouseEvent<HTMLElement>) => void;
  onFocus: (e?: React.FocusEvent<HTMLElement>) => void;
  onBlur: (e?: React.FocusEvent<HTMLElement>) => void;
};

function TooltipTrigger({
  children,
  asChild,
  triggerRef,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: TooltipTriggerProps): JSX.Element {
  const Trigger = asChild ? Root : 'div';

  return (
    <Trigger
      ref={triggerRef}
      className={!asChild ? 'inline-flex' : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-describedby={isOpen ? 'tooltip' : undefined}
      role={!asChild ? 'button' : undefined}
      tabIndex={!asChild ? 0 : undefined}
    >
      {children}
    </Trigger>
  );
}

function TooltipContent({ children, actualSide, className, position, tooltipRef }: TooltipContentProps): JSX.Element {
  return (
    <div
      ref={tooltipRef}
      role='tooltip'
      className={cn('fixed z-50 pointer-events-none', !position.transformOrigin && 'opacity-0')}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transformOrigin: position.transformOrigin,
      }}
    >
      <div
        className={cn(
          'relative w-fit rounded-md px-3 py-1.5 text-xs',
          'bg-main text-rev shadow-md',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          actualSide === 'top' && 'slide-in-from-top-2',
          actualSide === 'bottom' && 'slide-in-from-bottom-2',
          actualSide === 'left' && 'slide-in-from-left-2',
          actualSide === 'right' && 'slide-in-from-right-2',
          className,
        )}
      >
        {children}
        <div
          className={cn(
            'absolute size-2 rotate-45',
            actualSide === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
            actualSide === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
            actualSide === 'left' && 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
            actualSide === 'right' && 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
          )}
          style={{ backgroundColor: 'inherit' }}
        />
      </div>
    </div>
  );
}

export function Tooltip({
  className,
  children,
  value,
  side = 'bottom',
  asChild = true,
  delay = 0,
}: TooltipProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  const coords = useTooltipPosition(isOpen, side, triggerRef, tooltipRef);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => setIsOpen(true), delay);
    } else {
      setIsOpen(true);
    }
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  }, []);

  const handleFocus = useCallback(() => setIsOpen(true), []);
  const handleBlur = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <TooltipTrigger
        asChild={asChild}
        triggerRef={triggerRef}
        isOpen={isOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
      </TooltipTrigger>
      {isOpen &&
        createPortal(
          <TooltipContent
            actualSide={coords.actualSide}
            className={className}
            position={coords}
            tooltipRef={tooltipRef}
          >
            {value}
          </TooltipContent>,
          document.body,
        )}
    </>
  );
}
