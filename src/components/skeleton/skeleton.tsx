import { cva, type VariantProps } from 'class-variance-authority';
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react';
import { cn } from '@/utils';

const skeletonVariants = cva('bg-muted', {
  variants: {
    shape: {
      rectangle: 'rounded-sm',
      circle: 'rounded-full',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
      auto: '',
    },
  },
  compoundVariants: [
    { shape: 'rectangle', size: 'sm', class: 'h-4 w-24' },
    { shape: 'rectangle', size: 'md', class: 'h-5 w-32' },
    { shape: 'rectangle', size: 'lg', class: 'h-6 w-40' },
    { shape: 'circle', size: 'sm', class: 'size-6' },
    { shape: 'circle', size: 'md', class: 'size-8' },
    { shape: 'circle', size: 'lg', class: 'size-12' },
  ],
  defaultVariants: {
    shape: 'rectangle',
    size: 'auto',
  },
});

type SkeletonVariantsProps = VariantProps<typeof skeletonVariants>;

export type SkeletonShape = NonNullable<SkeletonVariantsProps['shape']>;
export type SkeletonSize = NonNullable<SkeletonVariantsProps['size']>;

export type SkeletonProps = {
  animated?: boolean;
  className?: string;
} & SkeletonVariantsProps &
  ComponentPropsWithoutRef<'div'>;

export type SkeletonGroupProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

type SkeletonContextValue = {
  inGroup: boolean;
};

const SkeletonContext = createContext<SkeletonContextValue | undefined>(undefined);

const useSkeletonContext = (): SkeletonContextValue => {
  return useContext(SkeletonContext) ?? { inGroup: false };
};

const SkeletonGroup = ({ className, children, ...props }: SkeletonGroupProps): ReactElement => {
  const groupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const overlay = overlayRef.current;
    if (group == null || overlay == null) return;

    const observedChildren = new Set<HTMLElement>();
    let resizeObserver: ResizeObserver;

    const sync = (): void => {
      const groupRect = group.getBoundingClientRect();
      if (groupRect.width === 0 || groupRect.height === 0) return;

      const targets = Array.from(group.querySelectorAll<HTMLElement>('[data-skeleton-mask]'));
      const rects = targets
        .map(target => {
          const rect = target.getBoundingClientRect();
          const radius = Number.parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
          const x = rect.left - groupRect.left;
          const y = rect.top - groupRect.top;
          return `<rect x="${x}" y="${y}" width="${rect.width}" height="${rect.height}" rx="${radius}" fill="white"/>`;
        })
        .join('');
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${groupRect.width}' height='${groupRect.height}'>${rects}</svg>`;
      const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

      overlay.style.setProperty('mask-image', url);
      overlay.style.setProperty('-webkit-mask-image', url);
      overlay.style.setProperty('--shimmer-end', `${groupRect.width}px`);
      overlay.dataset.ready = 'true';

      const desired = new Set(targets);
      observedChildren.forEach(child => {
        if (!desired.has(child)) {
          resizeObserver.unobserve(child);
          observedChildren.delete(child);
        }
      });
      targets.forEach(target => {
        if (!observedChildren.has(target)) {
          resizeObserver.observe(target);
          observedChildren.add(target);
        }
      });
    };

    resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(group);
    sync();

    const mutationObserver = new MutationObserver(sync);
    mutationObserver.observe(group, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-skeleton-mask'],
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <SkeletonContext.Provider value={{ inGroup: true }}>
      {/* ! Overriding position to `static` detaches the shimmer overlay from the group's box. */}
      <div data-component='Skeleton.Group' ref={groupRef} className={cn('relative', className)} {...props}>
        {children}
        <div
          ref={overlayRef}
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 animate-skeleton-shimmer'
        />
      </div>
    </SkeletonContext.Provider>
  );
};

SkeletonGroup.displayName = 'Skeleton.Group';

const SkeletonRoot = ({
  animated = true,
  className,
  shape = 'rectangle',
  size = 'auto',
  ...props
}: SkeletonProps): ReactElement => {
  const { inGroup } = useSkeletonContext();

  return (
    <div
      data-component='Skeleton'
      role='presentation'
      aria-hidden='true'
      data-skeleton-mask={animated && inGroup ? 'true' : undefined}
      className={cn(skeletonVariants({ shape, size }), animated && !inGroup && 'animate-pulse', className)}
      {...props}
    />
  );
};

SkeletonRoot.displayName = 'Skeleton';

export const Skeleton = Object.assign(SkeletonRoot, {
  Group: SkeletonGroup,
});
