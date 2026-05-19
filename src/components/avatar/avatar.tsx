import { cva, type VariantProps } from 'class-variance-authority';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type AvatarContextValue, type AvatarImageLoadingStatus, AvatarProvider, useAvatar } from '@/providers';
import { cn } from '@/utils';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden', {
  variants: {
    size: {
      sm: 'size-6 text-xs',
      md: 'size-8 text-sm',
      lg: 'size-12 text-base',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-md',
    },
  },
  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
});

export type AvatarRootProps = {
  className?: string;
  children?: React.ReactNode;
} & VariantProps<typeof avatarVariants> &
  ComponentPropsWithoutRef<'span'>;

const AvatarRoot = forwardRef<HTMLSpanElement, AvatarRootProps>(
  ({ children, className, size, shape, ...props }, ref): ReactElement => {
    const [imageLoadingStatus, setImageLoadingStatus] = useState<AvatarImageLoadingStatus>('idle');

    const handleImageLoadingStatusChange = useCallback((status: AvatarImageLoadingStatus) => {
      setImageLoadingStatus(status);
    }, []);

    const contextValue = useMemo<AvatarContextValue>(
      () => ({
        imageLoadingStatus,
        onImageLoadingStatusChange: handleImageLoadingStatusChange,
      }),
      [imageLoadingStatus, handleImageLoadingStatusChange],
    );

    return (
      <AvatarProvider value={contextValue}>
        <span
          data-component='Avatar.Root'
          ref={ref}
          className={cn(avatarVariants({ size, shape }), className)}
          {...props}
        >
          {children}
        </span>
      </AvatarProvider>
    );
  },
);
AvatarRoot.displayName = 'Avatar';

export type AvatarImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  onLoadingStatusChange?: (status: AvatarImageLoadingStatus) => void;
} & ComponentPropsWithoutRef<'img'>;

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ src, alt, className, onLoadingStatusChange, ...props }, ref): ReactElement | null => {
    const { imageLoadingStatus, onImageLoadingStatusChange } = useAvatar();
    const [hasError, setHasError] = useState(false);

    // TODO: Use useEffectEvent when fully switch to React or when it's available in Preact

    useEffect(() => {
      setHasError(false);

      if (!src) {
        return;
      }

      onImageLoadingStatusChange('loading');
      onLoadingStatusChange?.('loading');

      const img = new Image();

      const handleLoad = (): void => {
        onImageLoadingStatusChange('loaded');
        onLoadingStatusChange?.('loaded');
      };

      const handleError = (): void => {
        setHasError(true);
        onImageLoadingStatusChange('error');
        onLoadingStatusChange?.('error');
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      img.src = src;

      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    }, [src, onImageLoadingStatusChange, onLoadingStatusChange]);

    if (!src || hasError || imageLoadingStatus === 'error') {
      return null;
    }

    return (
      <img
        data-component='Avatar.Image'
        ref={ref}
        src={src}
        alt={alt}
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = 'Avatar.Image';

export type AvatarFallbackProps = {
  children?: React.ReactNode;
  className?: string;
  delayMs?: number;
} & ComponentPropsWithoutRef<'span'>;

const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ children, className, delayMs = 0, ...props }, ref): ReactElement | null => {
    const { imageLoadingStatus } = useAvatar();
    const [canRender, setCanRender] = useState(delayMs === 0);

    useEffect(() => {
      if (delayMs === 0) {
        return;
      }

      const timerId = setTimeout(() => {
        setCanRender(true);
      }, delayMs);

      return () => {
        clearTimeout(timerId);
      };
    }, [delayMs]);

    const shouldRender = canRender && (imageLoadingStatus === 'idle' || imageLoadingStatus === 'error');

    if (!shouldRender) {
      return null;
    }

    return (
      <span
        data-component='Avatar.Fallback'
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center',
          'cursor-default bg-avatar-fallback font-medium text-alt uppercase',
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
AvatarFallback.displayName = 'Avatar.Fallback';

export const Avatar = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
