import { Root } from '@radix-ui/react-slot';
import {
  createPortal,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { usePrefixedId } from '@/providers';
import { cn } from '@/utils';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'focus' | 'hover-focus';

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
  value?: ReactNode;
  side?: TooltipSide;
  className?: string;
  asChild?: boolean;
  delay?: number;
  trigger?: TooltipTrigger;
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
  triggerRef: RefObject<HTMLElement>,
  tooltipRef: RefObject<HTMLElement>,
  _value?: ReactNode,
): TooltipPosition {
  const [coords, setCoords] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    transformOrigin: '',
    actualSide: side,
  });

  useLayoutEffect(() => {
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
  }, [isOpen, side, triggerRef, tooltipRef]);

  return coords;
}

type TooltipContentProps = {
  children: ReactNode;
  id?: string;
  actualSide: TooltipSide;
  className?: string;
  position: TooltipPosition;
  tooltipRef: RefObject<HTMLDivElement>;
};

type TooltipTriggerProps = {
  children: ReactNode;
  asChild: boolean;
  triggerRef: RefObject<HTMLDivElement>;
  describedById?: string;
  onMouseEnter?: (e?: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e?: React.MouseEvent<HTMLElement>) => void;
  onFocus?: (e?: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e?: React.FocusEvent<HTMLElement>) => void;
};

function TooltipTrigger({
  children,
  asChild,
  triggerRef,
  describedById,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: TooltipTriggerProps): ReactElement<TooltipTriggerProps> {
  const Trigger = asChild ? Root : 'div';

  return (
    <Trigger
      data-component='Tooltip'
      ref={triggerRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-describedby={describedById}
      {...(!asChild && {
        className: 'inline-flex',
        role: 'button',
        tabIndex: 0,
      })}
    >
      {children}
    </Trigger>
  );
}

function TooltipContent({
  children,
  id,
  actualSide,
  className,
  position,
  tooltipRef,
}: TooltipContentProps): ReactElement<TooltipContentProps> {
  // id set → described element; unset → decorative copy (the sr-only node carries the value).
  return (
    <div
      data-component='Tooltip.Content'
      id={id}
      ref={tooltipRef}
      role={id == null ? undefined : 'tooltip'}
      aria-hidden={id == null ? 'true' : undefined}
      className={cn('pointer-events-none fixed z-50 select-none', !position.transformOrigin && 'opacity-0')}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transformOrigin: position.transformOrigin,
      }}
    >
      <div
        className={cn(
          'relative w-fit rounded-xs px-2 py-1 text-xs',
          'bg-tooltip text-tooltip-foreground shadow-md',
          'whitespace-nowrap',
          'fade-in-0 zoom-in-95 animate-in',
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
            'absolute size-2 rotate-45 bg-inherit',
            actualSide === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
            actualSide === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
            actualSide === 'left' && 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
            actualSide === 'right' && 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
          )}
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
  trigger = 'hover-focus',
}: TooltipProps): ReactElement<TooltipProps> {
  const tooltipId = usePrefixedId(undefined, 'tooltip');
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  const isEmpty = value == null || value === '';
  const canShow = isOpen && !isEmpty;
  const coords = useTooltipPosition(canShow, side, triggerRef, tooltipRef, value);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isEmpty) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => setIsOpen(true), delay);
    } else {
      setIsOpen(true);
    }
  }, [delay, isEmpty]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (!isEmpty) setIsOpen(true);
  }, [isEmpty]);
  const handleBlur = useCallback(() => setIsOpen(false), []);
  const hasHoverTrigger = trigger === 'hover' || trigger === 'hover-focus';
  const hasFocusTrigger = trigger === 'focus' || trigger === 'hover-focus';

  // Plain-text values get a persistent sr-only description (read in any trigger mode,
  // incl. hover-only, and while closed). Rich content is described by the visible node
  // only while open — duplicating it would create phantom tab stops / duplicate ids.
  const isTextValue = typeof value === 'string' || typeof value === 'number';
  const hasPersistentDescription = !isEmpty && isTextValue;
  const describedById = hasPersistentDescription || (!isEmpty && isOpen) ? tooltipId : undefined;

  return (
    <>
      <TooltipTrigger
        asChild={asChild}
        triggerRef={triggerRef}
        describedById={describedById}
        onMouseEnter={hasHoverTrigger ? handleMouseEnter : undefined}
        onMouseLeave={hasHoverTrigger ? handleMouseLeave : undefined}
        onFocus={hasFocusTrigger ? handleFocus : undefined}
        onBlur={hasFocusTrigger ? handleBlur : undefined}
      >
        {children}
      </TooltipTrigger>
      {hasPersistentDescription && (
        <div id={tooltipId} role='tooltip' className='sr-only'>
          {value}
        </div>
      )}
      {canShow &&
        createPortal(
          <TooltipContent
            id={hasPersistentDescription ? undefined : tooltipId}
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
