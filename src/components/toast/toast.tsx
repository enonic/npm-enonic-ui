import { Button } from '@/components/button';
import { IconButton, type IconButtonProps } from '@/components/icon-button';
import { Link, type LinkProps } from '@/components/link';
import { useControlledState } from '@/hooks';
import { ToastProvider, useToast } from '@/providers';
import { cn } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
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

export type ToastProps = {
  id?: string | number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  withClose?: boolean;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const toastIconNames = ['success', 'info', 'warning', 'error'] as const;
type ToastTone = (typeof toastIconNames)[number];
type ToastIconValue = ToastTone | Omit<ReactNode, 'string'>;

const toneIcons: Record<ToastTone, LucideIcon> = {
  success: CircleCheck,
  info: Info,
  warning: CircleAlert,
  error: CircleX,
};

const isBuiltInIcon = (icon?: ToastIconValue): icon is ToastTone =>
  typeof icon === 'string' && toastIconNames.includes(icon as ToastTone);

const ToastIconDisplay = forwardRef<
  HTMLDivElement,
  { tone?: ToastTone; children?: ReactNode } & ComponentPropsWithoutRef<'div'>
>(({ tone, children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'size-8 stroke flex flex-none items-center justify-center',
      tone === 'success' && 'fill-success',
      tone === 'info' && 'fill-info',
      tone === 'warning' && 'fill-warn',
      tone === 'error' && 'fill-error',
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
ToastIconDisplay.displayName = 'Toast.IconDisplay';

const renderDefaultIcon = (icon?: ToastIconValue): ReactNode => {
  if (typeof icon === 'string' && isBuiltInIcon(icon)) {
    const IconComponent = toneIcons[icon];
    return (
      <IconComponent className='text-surface-tertiary scale-145' strokeWidth={2.2} fill={icon} aria-hidden='true' />
    );
  }
  if (icon) return icon;
  return <Info className='text-surface-tertiary scale-145' strokeWidth={2.2} fill='info' aria-hidden='true' />;
};

const ToastTitle = forwardRef<HTMLHeadingElement, { asChild?: boolean } & ComponentPropsWithoutRef<'h4'>>(
  ({ children, asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h4';
    return (
      <Comp
        // @ts-expect-error - Slot ref typing incompatibility with Preact
        ref={ref}
        className={cn('text-lg font-semibold text-alt', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
ToastTitle.displayName = 'Toast.Title';

const ToastDescription = forwardRef<HTMLParagraphElement, { asChild?: boolean } & ComponentPropsWithoutRef<'p'>>(
  ({ className, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'p';
    return (
      <Comp
        // @ts-expect-error - Slot ref typing incompatibility with Preact
        ref={ref}
        className={cn('text-sm font-semibold leading-4', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
ToastDescription.displayName = 'Toast.Description';

const ToastLink = forwardRef<HTMLAnchorElement, LinkProps>(({ className, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      external={false}
      data-tone='inverse'
      className={cn('text-sm font-semibold leading-4 w-fit', className)}
      {...props}
    />
  );
});
ToastLink.displayName = 'Toast.Link';

const ToastButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Button>>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant='outline'
        size='sm'
        className={cn('px-2 text-alt border-alt bg-transparent hover:bg-notification-secondary', className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
ToastButton.displayName = 'Toast.Button';

const ToastClose = forwardRef<HTMLButtonElement, { asChild?: boolean } & Omit<IconButtonProps, 'icon'>>(
  ({ asChild, onClick, children, className, ...props }, ref) => {
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
        iconSize={24}
        iconStrokeWidth={1}
        aria-label='Close notification'
        title='Close notification'
        variant='text'
        size='sm'
        className={cn('text-alt bg-transparent hover:text-alt hover:bg-btn-tertiary-hover', className)}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
ToastClose.displayName = 'Toast.Close';

const ToastIcon = ({ icon, children }: { icon?: ToastIconValue; children?: ReactNode }): null => {
  const { setIconSlot, tone: contextTone, setTone } = useToast();

  const memoized = useMemo(() => {
    const inferredTone = isBuiltInIcon(icon) ? icon : contextTone;
    const content = children ?? renderDefaultIcon(icon ?? inferredTone);
    return <ToastIconDisplay tone={inferredTone}>{content}</ToastIconDisplay>;
  }, [children, icon, contextTone]);

  useLayoutEffect(() => {
    setIconSlot?.(memoized);
    return () => setIconSlot?.(null);
  }, [memoized, setIconSlot]);

  useLayoutEffect(() => {
    setTone?.(isBuiltInIcon(icon) ? icon : undefined);
    return () => setTone?.(undefined);
  }, [icon, setTone]);

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
      ['aria-live']: ariaLive,
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
            '[--color-ring:var(--color-ring-alt)] [--color-ring-offset:var(--color-surface-tertiary)]',
            'grid w-115 items-center gap-2.5 rounded-lg border border-bdr-soft bg-surface-tertiary p-5 text-alt opacity-90',
            'grid-cols-[auto_minmax(0,1fr)_auto]',
            className,
          )}
          {...rest}
        >
          {iconSlot && <div className='row-start-1 w-fit'>{iconSlot}</div>}
          <div className='row-start-1 w-full flex flex-col gap-1 text-left'>{contentChildren}</div>
          <div
            className={cn(
              'row-start-1 grid h-full items-center justify-items-end gap-2 col-start-3',
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
