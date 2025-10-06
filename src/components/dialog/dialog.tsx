import { type DialogContextValue, DialogProvider, useDialog } from '@/providers/dialog-provider';
import { type ReactElement, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
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

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Portal: DialogPortal,
});
