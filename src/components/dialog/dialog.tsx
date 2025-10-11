import { IconButton } from '@/components/icon-button/icon-button';
import { useScrollLock } from '@/hooks/use-scroll-lock';
import { type DialogContextValue, DialogProvider, useDialog } from '@/providers/dialog-provider';
import { cn } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
import { FocusTrap } from 'focus-trap-react';
import { X } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

//
// * Dialog
//

export type DialogRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

const DialogRoot = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogRootProps): ReactElement => {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const open: boolean = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean): void => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const value: DialogContextValue = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <DialogProvider value={value}>{children}</DialogProvider>;
};
DialogRoot.displayName = 'Dialog.Root';

//
// * DialogTrigger
//

export type DialogTriggerProps = {
  children: ReactNode;
} & React.ComponentProps<'button'>;

const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, onClick, ...props }, ref): ReactElement => {
    const { setOpen } = useDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
      onClick?.(e);
      setOpen(true);
    };

    return (
      <button ref={ref} type='button' onClick={handleClick} {...props}>
        {children}
      </button>
    );
  },
);
DialogTrigger.displayName = 'Dialog.Trigger';

//
// * DialogPortal
//

export type DialogPortalProps = {
  children?: ReactNode;
  container?: HTMLElement | null;
  forceMount?: boolean;
};

const DialogPortal = ({ children, container, forceMount }: DialogPortalProps): ReactElement | null => {
  const { open } = useDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (!forceMount && !open)) {
    return null;
  }

  return createPortal(children, container ?? document.body);
};
DialogPortal.displayName = 'Dialog.Portal';

//
// * DialogOverlay
//

export type DialogOverlayProps = {
  className?: string;
  forceMount?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, forceMount, ...props }, ref): ReactElement | null => {
    const { open } = useDialog();

    if (!forceMount && !open) {
      return null;
    }

    return (
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'fixed inset-0 z-30 bg-overlay backdrop-blur-xs',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className,
        )}
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = 'Dialog.Overlay';

//
// * DialogContent
//

export type DialogContentProps = {
  className?: string;
  children?: ReactNode;
  forceMount?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      children,
      className,
      forceMount,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...props
    },
    ref,
  ): ReactElement | null => {
    const { open, setOpen } = useDialog();
    const contentRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    // Combine refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(contentRef.current);
      } else if (ref) {
        ref.current = contentRef.current;
      }
    }, [ref]);

    useScrollLock(open);

    const handleEscapeKey = useCallback(
      (e: KeyboardEvent): void => {
        if (e.key === 'Escape') {
          onEscapeKeyDown?.(e);
          if (!e.defaultPrevented) {
            setOpen(false);
          }
        }
      },
      [onEscapeKeyDown, setOpen],
    );

    useEffect(() => {
      if (!open) {
        return;
      }
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [open, handleEscapeKey]);

    const handlePointerDownOutside = useCallback(
      (e: PointerEvent): void => {
        const target = e.target as Node;
        if (contentRef.current && !contentRef.current.contains(target)) {
          onPointerDownOutside?.(e);
          onInteractOutside?.(e);
          if (!e.defaultPrevented) {
            setOpen(false);
          }
        }
      },
      [onPointerDownOutside, onInteractOutside, setOpen],
    );

    useEffect(() => {
      if (!open) {
        return;
      }
      document.addEventListener('pointerdown', handlePointerDownOutside);
      return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
    }, [open, handlePointerDownOutside]);

    if (!forceMount && !open) {
      return null;
    }

    return (
      <FocusTrap
        active={open}
        focusTrapOptions={{
          initialFocus: false,
          fallbackFocus: () => contentRef.current ?? document.body,
          escapeDeactivates: false,
          clickOutsideDeactivates: false,
          returnFocusOnDeactivate: true,
          allowOutsideClick: true,
          preventScroll: false,
          onActivate: () => {
            requestAnimationFrame(() => {
              const event = new Event('openautofocus');
              onOpenAutoFocus?.(event);
              if (!event.defaultPrevented && contentRef.current) {
                contentRef.current.focus();
              }
            });
          },
          onDeactivate: () => {
            requestAnimationFrame(() => {
              const event = new Event('closeautofocus');
              onCloseAutoFocus?.(event);
            });
          },
        }}
      >
        <div className='fixed inset-0 z-40 flex items-center justify-center p-4'>
          <div
            ref={contentRef}
            role='dialog'
            aria-modal='true'
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            data-state={open ? 'open' : 'closed'}
            tabIndex={-1}
            className={cn(
              'relative rounded-lg shadow-xl bg-surface-neutral',
              'flex flex-col max-w-lg w-full max-h-[90vh] gap-10 p-10',
              'border border-bdr-subtle outline-none overflow-hidden',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </div>
      </FocusTrap>
    );
  },
);
DialogContent.displayName = 'Dialog.Content';

//
// * DialogHeader
//

export type DialogHeaderProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'header'>;

const DialogHeader = forwardRef<HTMLElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <header ref={ref} className={cn('relative grid gap-2.5 self-stretch', className)} {...props}>
        {children}
      </header>
    );
  },
);
DialogHeader.displayName = 'Dialog.Header';

//
// * DialogClose
//

export type DialogCloseProps = {
  asChild?: boolean;
} & ComponentPropsWithoutRef<'button'>;

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, asChild, onClick, ...props }, ref): ReactElement => {
    const { setOpen } = useDialog();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          setOpen(false);
        }
      },
      [onClick, setOpen],
    );

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        type={asChild ? undefined : 'button'}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
DialogClose.displayName = 'Dialog.Close';

//
// * DialogTitle
//

export type DialogTitleProps = {
  asChild?: boolean;
} & ComponentPropsWithoutRef<'h2'>;

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className, asChild, ...props }, ref): ReactElement => {
    const Comp = asChild ? Slot : 'h2';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        className={cn('text-2xl font-semibold', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
DialogTitle.displayName = 'Dialog.Title';

//
// * DialogDescription
//

export type DialogDescriptionProps = {
  asChild?: boolean;
} & ComponentPropsWithoutRef<'p'>;

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ children, className, asChild, ...props }, ref): ReactElement => {
    const Comp = asChild ? Slot : 'p';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        className={cn('', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
DialogDescription.displayName = 'Dialog.Description';

//
// * DialogBody
//

export type DialogBodyProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <div ref={ref} className={cn('min-h-0 flex-1 overflow-y-auto', className)} {...props}>
        {children}
      </div>
    );
  },
);

DialogBody.displayName = 'Dialog.Body';

//
// * DialogFooter
//

export type DialogFooterProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'footer'>;

const DialogFooter = forwardRef<HTMLElement, DialogFooterProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <footer ref={ref} className={cn('flex justify-end gap-2.5', className)} {...props}>
        {children}
      </footer>
    );
  },
);
DialogFooter.displayName = 'Dialog.Footer';

//
// * DialogDefaultClose
//

type DialogDefaultCloseProps = Partial<ComponentPropsWithoutRef<typeof IconButton>>;

const DialogDefaultClose = forwardRef<HTMLButtonElement, DialogDefaultCloseProps>((props, ref): ReactElement => {
  return (
    <DialogClose asChild ref={ref} {...props}>
      <IconButton
        aria-label='Close'
        data-area='close'
        icon={X}
        size='lg'
        iconSize={36}
        iconStrokeWidth={1}
        shape='round'
        variant='filled'
      />
    </DialogClose>
  );
});
DialogDefaultClose.displayName = 'Dialog.DefaultClose';

//
// * DialogDefaultHeader
//

export type DialogDefaultHeaderProps = {
  title: string;
  description?: string;
  withClose?: boolean;
} & ComponentPropsWithoutRef<typeof DialogHeader>;

const DialogDefaultHeader = forwardRef<HTMLElement, DialogDefaultHeaderProps>(
  ({ title, description, withClose, className, children, ...props }, ref): ReactElement => {
    return (
      <DialogHeader ref={ref} className={cn(withClose && 'grid-cols-[minmax(0,1fr)_auto]', className)} {...props}>
        <DialogTitle className={cn(withClose && 'col-start-1 row-start-1 min-w-0')}>{title}</DialogTitle>
        {withClose && <DialogDefaultClose className='col-start-2 row-start-1 row-span-2 self-start justify-self-end' />}
        {description && <DialogDescription className={cn(withClose && 'row-start-2')}>{description}</DialogDescription>}
        {children}
      </DialogHeader>
    );
  },
);
DialogDefaultHeader.displayName = 'Dialog.DefaultHeader';

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Close: DialogClose,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter,
  DefaultClose: DialogDefaultClose,
  DefaultHeader: DialogDefaultHeader,
});
