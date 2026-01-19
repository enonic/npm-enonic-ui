import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { CircleAlert, CircleCheck, CircleX, Info, type LucideIcon, X } from 'lucide-react';
import {
  Children,
  type ComponentPropsWithoutRef,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Button } from '@/components/button';
import { IconButton, type IconButtonProps } from '@/components/icon-button';
import { Link, type LinkProps } from '@/components/link';
import { useControlledState } from '@/hooks';
import { ToastProvider, useToast } from '@/providers';
import { cn } from '@/utils';

export type ToastProps = {
  id?: string | number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  withClose?: boolean;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const toastTones = ['success', 'info', 'warning', 'error'] as const;
export type ToastTone = (typeof toastTones)[number];

const toneIcons: Record<ToastTone, LucideIcon> = {
  success: CircleCheck,
  info: Info,
  warning: CircleAlert,
  error: CircleX,
};

const toastIconVariants = cva('row-start-1 flex size-6 flex-none items-center justify-center', {
  variants: {
    variant: {
      success: '[&_svg]:fill-success',
      info: '[&_svg]:fill-info',
      warning: '[&_svg]:fill-warn',
      error: '[&_svg]:fill-error',
      custom: 'text-surface-tertiary',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

const isToastTone = (value?: string): value is ToastTone =>
  typeof value === 'string' && toastTones.includes(value as ToastTone);

const ToastTitle = forwardRef<HTMLHeadingElement, { asChild?: boolean } & ComponentPropsWithoutRef<'h4'>>(
  ({ children, asChild, className, ...props }, ref): ReactElement => {
    const Comp = asChild ? Slot : 'h4';
    return (
      <Comp
        // @ts-expect-error - Slot ref typing incompatibility with Preact
        ref={ref}
        className={cn('font-semibold text-alt text-lg', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
ToastTitle.displayName = 'Toast.Title';

const ToastDescription = forwardRef<HTMLParagraphElement, { asChild?: boolean } & ComponentPropsWithoutRef<'p'>>(
  ({ className, asChild, children, ...props }, ref): ReactElement => {
    const Comp = asChild ? Slot : 'p';
    return (
      <Comp
        // @ts-expect-error - Slot ref typing incompatibility with Preact
        ref={ref}
        className={cn('text-md', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
ToastDescription.displayName = 'Toast.Description';

const ToastLink = forwardRef<HTMLAnchorElement, LinkProps>(({ className, ...props }, ref): ReactElement => {
  return <Link ref={ref} external={false} data-tone='inverse' className={cn('w-fit text-md', className)} {...props} />;
});
ToastLink.displayName = 'Toast.Link';

const ToastButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Button>>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <Button
        ref={ref}
        variant='outline'
        size='md'
        className={cn('border-alt bg-transparent px-2 text-alt hover:bg-notification-secondary', className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
ToastButton.displayName = 'Toast.Button';

const ToastClose = forwardRef<HTMLButtonElement, { asChild?: boolean } & Omit<IconButtonProps, 'icon'>>(
  ({ asChild, onClick, children, className, ...props }, ref): ReactElement => {
    const { setOpen } = useToast();

    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setOpen?.(false);
      }
    };

    if (asChild) {
      return (
        <Slot
          // @ts-expect-error - Slot ref typing incompatibility with Preact
          ref={ref}
          onClick={handleClick}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <IconButton
        ref={ref}
        icon={X}
        iconSize='lg'
        iconStrokeWidth={1}
        aria-label='Close notification'
        title='Close notification'
        variant='text'
        size='sm'
        className={cn('bg-transparent text-alt hover:bg-btn-tertiary-hover hover:text-alt', className)}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
ToastClose.displayName = 'Toast.Close';

export type ToastIconProps = {
  /** Built-in icon tone. Ignored when children are provided. */
  tone?: ToastTone;
  /** Custom icon element. Overrides built-in icon. */
  children?: ReactNode;
  /** Additional CSS classes for the icon wrapper. */
  className?: string;
};

const ToastIcon = ({ tone, children, className }: ToastIconProps): null => {
  const { setIconSlot, setTone } = useToast();
  const resolvedTone = isToastTone(tone) ? tone : undefined;

  const iconElement = useMemo(() => {
    // Custom icon provided as children
    if (children) {
      return <div className={toastIconVariants({ variant: 'custom', className })}>{children}</div>;
    }

    // Built-in icon based on tone
    const IconComponent = resolvedTone ? toneIcons[resolvedTone] : Info;

    return (
      <div className={toastIconVariants({ variant: resolvedTone, className })}>
        <IconComponent className='scale-125 text-surface-tertiary' size={24} strokeWidth={2} aria-hidden='true' />
      </div>
    );
  }, [children, resolvedTone, className]);

  useLayoutEffect(() => {
    setIconSlot?.(iconElement);
    return () => setIconSlot?.(null);
  }, [iconElement, setIconSlot]);

  useLayoutEffect(() => {
    setTone?.(resolvedTone);
    return () => setTone?.(undefined);
  }, [resolvedTone, setTone]);

  return null;
};
ToastIcon.displayName = 'Toast.Icon';

const ToastRoot = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      id,
      open: controlledOpen,
      defaultOpen = true,
      onOpenChange,
      withClose,
      className,
      role,
      'aria-live': ariaLive,
      children,
      ...rest
    },
    ref,
  ) => {
    const toastId = typeof id === 'number' ? `${id}` : id;
    const [open, setOpen] = useControlledState(controlledOpen, defaultOpen, onOpenChange);
    const [iconSlot, setIconSlot] = useState<ReactNode | null>(null);
    const [tone, setTone] = useState<ToastTone>();
    const defaultRole = tone === 'error' || tone === 'warning' ? 'alert' : 'status';
    const defaultAriaLive = defaultRole === 'alert' ? 'assertive' : 'polite';

    const childArray = Children.toArray(children);
    const actionButtons = childArray.filter(
      (child): child is ReactElement => isValidElement(child) && child.type === ToastButton,
    );
    const contentChildren = childArray.filter(child => !actionButtons.includes(child));

    if (!open) {
      return null;
    }

    return (
      <ToastProvider value={{ setOpen, setIconSlot, tone, setTone }}>
        <div
          ref={ref}
          id={toastId}
          data-toast-id={toastId}
          role={role ?? defaultRole}
          aria-live={ariaLive ?? defaultAriaLive}
          className={cn(
            // Custom properties to make the focus ring look correct in any theme
            '[--color-ring-offset:var(--color-surface-tertiary)] [--color-ring:var(--color-ring-alt)]',
            'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center',
            'w-full max-w-130 gap-2.5 p-5',
            'rounded-lg border border-bdr-soft bg-surface-tertiary text-alt',
            className,
          )}
          {...rest}
        >
          {iconSlot}
          <div className='row-start-1 flex w-full flex-col gap-1 text-left'>{contentChildren}</div>
          <div
            className={cn(
              'col-start-3 row-start-1 grid h-full items-center justify-items-end gap-2',
              actionButtons.length > 0 && 'content-between',
            )}
          >
            {withClose && <ToastClose />}
            {actionButtons}
          </div>
        </div>
      </ToastProvider>
    );
  },
);
ToastRoot.displayName = 'Toast';

export const Toast = Object.assign(ToastRoot, {
  Icon: ToastIcon,
  Title: ToastTitle,
  Description: ToastDescription,
  Link: ToastLink,
  Button: ToastButton,
  Close: ToastClose,
});
