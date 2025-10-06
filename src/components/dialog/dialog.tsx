import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { type DialogContextValue, DialogProvider, useDialog } from '@/providers/dialog-provider';
import { cn } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
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
      if (!isControlled) setUncontrolledOpen(next);
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
} & React.ButtonHTMLAttributes;

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
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
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
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onPointerDownOutside'>;

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

    // Body scroll lock
    useEffect(() => {
      if (!open) return;

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }, [open]);

    // Escape key handling
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
      if (!open) return;
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [open, handleEscapeKey]);

    // Click outside handling
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
      if (!open) return;
      document.addEventListener('pointerdown', handlePointerDownOutside);
      return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
    }, [open, handlePointerDownOutside]);

    // Focus management
    useEffect(() => {
      if (!open) return;

      const previouslyFocused = document.activeElement as HTMLElement | null;

      // Focus on open
      requestAnimationFrame(() => {
        const event = new Event('openautofocus');
        onOpenAutoFocus?.(event);
        if (!event.defaultPrevented && contentRef.current) {
          contentRef.current.focus();
        }
      });

      return () => {
        // Restore focus on close
        requestAnimationFrame(() => {
          const event = new Event('closeautofocus');
          onCloseAutoFocus?.(event);
          if (!event.defaultPrevented && previouslyFocused) {
            previouslyFocused.focus();
          }
        });
      };
    }, [open, onOpenAutoFocus, onCloseAutoFocus]);

    if (!forceMount && !open) {
      return null;
    }

    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div
          ref={contentRef}
          role='dialog'
          aria-modal='true'
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          data-state={open ? 'open' : 'closed'}
          tabIndex={-1}
          className={cn(
            'relative rounded-lg shadow-xl bg-surface-neutral p-10 border border-bdr-subtle',
            'max-w-lg w-full max-h-[90vh] overflow-auto',
            'outline-none',
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
    );
  },
);
DialogContent.displayName = 'Dialog.Content';

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
        className={cn('text-2xl leading-11.5 font-semibold', className)}
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
        className={cn('text-sm text-subtle', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
DialogDescription.displayName = 'Dialog.Description';

//
// * DialogHeader
//

export type DialogHeaderProps = {
  title: string;
  message?: string;
  onMessageChange?: (value: string) => void;
  className?: string;
  children?: ReactNode;
};

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ title, message = '', onMessageChange, className, children }, ref): ReactElement => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const pendingCharRef = useRef<string | null>(null);

    const isPrintable = useCallback(
      (e: KeyboardEvent): boolean => e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey,
      [],
    );

    useEffect(() => {
      if (editing) return;
      const handler = (e: KeyboardEvent): void => {
        if (!isPrintable(e)) return;
        pendingCharRef.current = e.key;
        e.preventDefault();
        setEditing(true);
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [editing, isPrintable]);

    useEffect(() => {
      if (!editing) return;
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
        if (pendingCharRef.current) {
          onMessageChange?.(message + pendingCharRef.current);
          pendingCharRef.current = null;
        }
      });
    }, [editing, message, onMessageChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        onMessageChange?.(e.currentTarget.value);
      },
      [onMessageChange],
    );

    const handleBlur = useCallback(() => {
      setEditing(false);
    }, []);

    const handleButtonClick = useCallback(() => {
      setEditing(true);
    }, []);

    return (
      <div ref={ref} className={cn('relative flex items-start gap-2.5 self-stretch', className)}>
        <div className='flex flex-col items-start gap-2.5 flex-1 min-w-0'>
          <DialogTitle>{title}</DialogTitle>
          {editing ? (
            <Input
              ref={inputRef}
              placeholder='Add a message'
              value={message}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={cn(
                '[&_div.relative]:!border-0',
                '[&_div.relative:focus-within]:!ring-0',
                '[&_div.relative:focus-within]:!ring-offset-0',
              )}
            />
          ) : (
            <Button
              variant='text'
              className='self-start p-0 hover:bg-transparent hover:underline'
              onClick={handleButtonClick}
            >
              {message.trim() ? message : 'Start typing or click here to add a message'}
            </Button>
          )}
          {children}
        </div>
      </div>
    );
  },
);

DialogHeader.displayName = 'Dialog.Header';

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Header: DialogHeader,
});
