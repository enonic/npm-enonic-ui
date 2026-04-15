import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, createContext, type ReactElement, type ReactNode, useContext } from 'react';
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
  return (
    <SkeletonContext.Provider value={{ inGroup: true }}>
      <div className={cn('relative', className)} {...props}>
        {children}
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
      role='presentation'
      aria-hidden='true'
      className={cn(
        skeletonVariants({ shape, size }),
        animated && (inGroup ? 'animate-skeleton-shimmer' : 'animate-pulse'),
        className,
      )}
      {...props}
    />
  );
};

SkeletonRoot.displayName = 'Skeleton';

export const Skeleton = Object.assign(SkeletonRoot, {
  Group: SkeletonGroup,
});
