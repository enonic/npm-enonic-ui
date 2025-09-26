import { type DialogContextValue, DialogProvider } from '@/providers/dialog-provider';
import { type ReactElement, type ReactNode, useCallback, useMemo, useState } from 'react';

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

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
});
