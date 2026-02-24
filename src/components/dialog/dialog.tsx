import { Slot } from '@radix-ui/react-slot';
import { FocusTrap } from 'focus-trap-react';
import { Loader2, X } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '@/components/icon-button/icon-button';
import { useClickOutside, useControlledState, useScrollLock, useSyncValue } from '@/hooks';
import { usePrefixedId, useStepper } from '@/providers';
import { type DialogContextValue, DialogProvider, useDialog } from '@/providers/dialog-provider';
import { FocusContainerContext } from '@/providers/focus-container-provider';
import { cn, useComposedRefs } from '@/utils';
import { Button } from '../button';
import { Stepper, type StepperDotsProps } from '../stepper';

//
// * Dialog
//

export type DialogRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  step?: string;
  defaultStep?: string;
  onStepChange?: (step: string) => void;
  children?: ReactNode;
};

const DialogRoot = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  step,
  defaultStep,
  onStepChange,
  children,
}: DialogRootProps): ReactElement => {
  const [open, setOpen] = useControlledState(controlledOpen, defaultOpen, onOpenChange);
  const defaultTitleId = usePrefixedId();
  const defaultDescriptionId = usePrefixedId();
  const [titleId, setTitleId] = useState(defaultTitleId);
  const [descriptionId, setDescriptionId] = useState(defaultDescriptionId);
  const isUsingStepper = step || defaultStep || onStepChange;

  const context = useMemo<DialogContextValue>(
    () => ({ open, setOpen, titleId, descriptionId, setTitleId, setDescriptionId }),
    [open, titleId, descriptionId, setOpen],
  );

  if (isUsingStepper) {
    return (
      <DialogProvider value={context}>
        <Stepper.Root asFragment value={step} defaultValue={defaultStep} onValueChange={onStepChange}>
          {children}
        </Stepper.Root>
      </DialogProvider>
    );
  }

  return <DialogProvider value={context}>{children}</DialogProvider>;
};
DialogRoot.displayName = 'Dialog.Root';

//
// * DialogTrigger
//

export type DialogTriggerProps = {
  asChild?: boolean;
  children: ReactNode;
} & ComponentPropsWithoutRef<'button'>;

const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref): ReactElement => {
    const { setOpen } = useDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
      onClick?.(e);
      setOpen(true);
    };

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        onClick={handleClick}
        {...(!asChild && { type: 'button' })}
        {...props}
      >
        {children}
      </Comp>
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
} & ComponentPropsWithoutRef<'div'>;

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
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
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
} & ComponentPropsWithoutRef<'div'>;

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
    const { open, setOpen, titleId, descriptionId } = useDialog();
    const contentRef = useRef<HTMLDivElement>(null);
    const [portalContainers, setPortalContainers] = useState<HTMLElement[]>([]);

    const composedRef = useComposedRefs(ref, contentRef);

    // Registry for portaled content (e.g., Combobox.Popup) to register with focus trap.
    // See rules/patterns.mdc — "Focus Trap with Portaled Content"
    const focusContainerRegistry = useMemo(
      () => ({
        register: (element: HTMLElement) =>
          setPortalContainers(prev => (prev.includes(element) ? prev : [...prev, element])),
        unregister: (element: HTMLElement) => setPortalContainers(prev => prev.filter(el => el !== element)),
      }),
      [],
    );

    // Compute containers array for focus trap (dialog content + registered portals)
    const containerElements = useMemo(() => {
      const result: HTMLElement[] = [];
      if (contentRef.current) result.push(contentRef.current);
      result.push(...portalContainers);
      return result.length > 0 ? result : undefined;
    }, [portalContainers]);

    useScrollLock(open);

    // Create refs from portal containers for click-outside exclusion
    const excludeRefs = useMemo(() => portalContainers.map(el => ({ current: el })), [portalContainers]);

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

    useClickOutside({
      enabled: open,
      contentRef,
      excludeRefs,
      onPointerDownOutside,
      onInteractOutside,
      onClose: () => setOpen(false),
    });

    if (!forceMount && !open) {
      return null;
    }

    return (
      <FocusContainerContext.Provider value={focusContainerRegistry}>
        <FocusTrap
          active={open}
          containerElements={containerElements}
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
                const event = new Event('openautofocus', { bubbles: true, cancelable: true });
                onOpenAutoFocus?.(event);
                if (!event.defaultPrevented && contentRef.current) {
                  contentRef.current.focus();
                }
              });
            },
            onDeactivate: () => {
              requestAnimationFrame(() => {
                const event = new Event('closeautofocus', { bubbles: true, cancelable: true });
                onCloseAutoFocus?.(event);
              });
            },
          }}
        >
          <div className='fixed inset-0 z-40 flex items-center justify-center p-4'>
            <div
              ref={composedRef}
              role='dialog'
              aria-modal='true'
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              data-state={open ? 'open' : 'closed'}
              tabIndex={-1}
              className={cn(
                'relative rounded-lg bg-surface-neutral shadow-xl',
                'flex max-h-[90vh] w-full max-w-lg flex-col gap-10 p-10',
                'overflow-hidden border border-bdr-subtle outline-none',
                'focus:outline-none focus:ring-0',
                'data-[state=closed]:animate-out data-[state=open]:animate-in',
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
      </FocusContainerContext.Provider>
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
        onClick={handleClick}
        {...(!asChild && { type: 'button' })}
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
  id?: string;
  asChild?: boolean;
} & ComponentPropsWithoutRef<'h2'>;

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className, asChild, id, ...props }, ref): ReactElement => {
    const { titleId, setTitleId } = useDialog();
    const Comp = asChild ? Slot : 'h2';

    useSyncValue(id, setTitleId);

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        id={titleId}
        className={cn('font-semibold text-2xl', className)}
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
  id?: string;
  asChild?: boolean;
} & ComponentPropsWithoutRef<'p'>;

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ id, children, asChild, ...props }, ref): ReactElement => {
    const { descriptionId, setDescriptionId } = useDialog();
    const Comp = asChild ? Slot : 'p';

    useSyncValue(id, setDescriptionId);

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        id={descriptionId}
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
  titleId?: string;
  description?: ReactNode;
  descriptionId?: string;
  withClose?: boolean;
} & ComponentPropsWithoutRef<typeof DialogHeader>;

const DialogDefaultHeader = forwardRef<HTMLElement, DialogDefaultHeaderProps>(
  ({ title, titleId, description, descriptionId, withClose, className, children, ...props }, ref): ReactElement => {
    return (
      <DialogHeader ref={ref} className={cn(withClose && 'grid-cols-[minmax(0,1fr)_auto]', className)} {...props}>
        <DialogTitle id={titleId} className={cn(withClose && 'col-start-1 row-start-1 min-w-0')}>
          {title}
        </DialogTitle>
        {withClose && <DialogDefaultClose className='col-start-2 row-span-2 row-start-1 self-start justify-self-end' />}
        {description && (
          <DialogDescription id={descriptionId} className={cn(withClose && 'row-start-2')}>
            {description}
          </DialogDescription>
        )}
        {children}
      </DialogHeader>
    );
  },
);
DialogDefaultHeader.displayName = 'Dialog.DefaultHeader';

//
// * DialogStepHeader
//

export type DialogStepHeaderProps = {
  step: string;
  title: string;
  titleId?: string;
  description?: ReactNode;
  descriptionId?: string;
  helper?: string;
  withClose?: boolean;
} & ComponentPropsWithoutRef<typeof DialogHeader>;

const DialogStepHeader = forwardRef<HTMLElement, DialogStepHeaderProps>((props, ref): ReactElement | null => {
  const { step, title, titleId, description, descriptionId, helper, withClose, className, children, ...restProps } =
    props;

  const { value } = useStepper();

  if (step !== value) return null;

  return (
    <DialogHeader ref={ref} className={cn(withClose && 'grid-cols-[minmax(0,1fr)_auto]', className)} {...restProps}>
      {helper && <p className={cn('font-semibold', withClose && 'col-start-1 row-start-1 min-w-0')}>{helper}</p>}

      <DialogTitle
        id={titleId}
        className={cn(withClose && 'col-start-1 min-w-0', withClose && helper ? 'row-start-2' : 'row-start-1')}
      >
        {title}
      </DialogTitle>

      {withClose && (
        <DialogDefaultClose
          className={cn(
            'col-start-2 row-start-1 self-start justify-self-end',
            helper && description ? 'row-span-3' : 'row-span-2',
          )}
        />
      )}

      {description && (
        <DialogDescription
          id={descriptionId}
          className={cn('text-sm text-subtle', withClose && helper ? 'row-start-3' : 'row-start-2')}
        >
          {description}
        </DialogDescription>
      )}

      {children}
    </DialogHeader>
  );
});
DialogStepHeader.displayName = 'Dialog.StepHeader';

//
// * Dialog.StepContent
//

export type DialogStepContentProps = {
  step: string;
  /** Prevent navigation away from this step */
  locked?: boolean;
  children?: ReactNode;
};

const DialogStepContent = ({ step, locked, children }: DialogStepContentProps): ReactElement => {
  return (
    <Stepper.Panel value={step} locked={locked}>
      {children}
    </Stepper.Panel>
  );
};
DialogStepContent.displayName = 'Dialog.StepContent';

//
// * Dialog.StepIndicator
//

export type DialogStepIndicatorProps = {
  previousLabel: string;
  nextLabel: string;
  lastStepLabel?: string;
  onLastStep?: () => void;
  dots?: boolean;
  disabled?: boolean;
  pending?: boolean;
  tooltip?: StepperDotsProps['tooltip'];
};

const DialogStepIndicator = ({
  previousLabel,
  nextLabel,
  lastStepLabel,
  onLastStep,
  dots,
  disabled,
  pending,
  tooltip,
}: DialogStepIndicatorProps): ReactElement => {
  const { value, getItems } = useStepper();
  const items = getItems();
  const isFirst = value === items[0];
  const isLast = value === items[items.length - 1];
  const isDisabled = disabled || pending;

  return (
    <div className={cn('items-center', dots ? 'grid grid-cols-[1fr_auto_1fr]' : 'flex justify-between')}>
      <Stepper.Previous asChild disabled={isDisabled}>
        <Button variant='outline' label={previousLabel} className={cn('justify-self-start', isFirst && 'invisible')} />
      </Stepper.Previous>
      {dots && <Stepper.Dots disabled={isDisabled} tooltip={tooltip} />}
      {isLast && lastStepLabel ? (
        <Button
          variant='solid'
          label={lastStepLabel}
          disabled={isDisabled}
          onClick={onLastStep}
          className='justify-self-end'
          startIcon={pending ? Loader2 : undefined}
          startIconClassName='animate-spin'
          iconSize='sm'
        />
      ) : (
        <Stepper.Next asChild disabled={isDisabled}>
          <Button variant='solid' label={nextLabel} className='justify-self-end' />
        </Stepper.Next>
      )}
    </div>
  );
};
DialogStepIndicator.displayName = 'Dialog.StepIndicator';

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
  StepHeader: DialogStepHeader,
  StepContent: DialogStepContent,
  StepIndicator: DialogStepIndicator,
});
