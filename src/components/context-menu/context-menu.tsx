import { Slot } from '@radix-ui/react-slot';
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
import {
  useClickOutside,
  useControlledState,
  useItemRegistry,
  useKeyboardNavigation,
  usePointerPosition,
  useScrollActiveIntoView,
} from '@/hooks';
import {
  type MenuItemOwnProps,
  MenuPrimitiveItem,
  MenuPrimitiveItemIndicator,
  type MenuPrimitiveItemIndicatorProps,
  MenuPrimitiveLabel,
  type MenuPrimitiveLabelProps,
  MenuPrimitiveRadioGroup,
  MenuPrimitiveRadioItem,
  MenuPrimitiveSeparator,
  type MenuPrimitiveSeparatorProps,
  type MenuRadioGroupOwnProps,
  type MenuRadioItemOwnProps,
} from '@/primitives/menu-primitive';
import { type ContextMenuContextValue, ContextMenuProvider, useContextMenu, usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';

//
// * ContextMenu
//

export type ContextMenuRootProps = {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  children?: ReactNode;
};

const ContextMenuRoot = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: ContextMenuRootProps): ReactElement => {
  const baseId = usePrefixedId();

  const [open, setOpen] = useControlledState(controlledOpen, defaultOpen, onOpenChange);
  const [active, setActive] = useState<string | undefined>(undefined);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  const value: ContextMenuContextValue = useMemo(
    () => ({
      baseId,
      open,
      setOpen,
      active,
      setActive,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      position,
      setPosition,
    }),
    [baseId, open, active, registerItem, unregisterItem, getItems, isItemDisabled, setOpen, position],
  );

  // Reset position when menu closes
  useEffect(() => {
    if (!open) {
      setPosition(null);
    }
  }, [open]);

  return <ContextMenuProvider value={value}>{children}</ContextMenuProvider>;
};
ContextMenuRoot.displayName = 'ContextMenu.Root';

//
// * ContextMenuTrigger
//

export type ContextMenuTriggerProps = {
  asChild?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>;

const ContextMenuTrigger = forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ asChild, disabled = false, onContextMenu, className, children, ...props }, ref): ReactElement => {
    const { setOpen, setPosition } = useContextMenu();

    const handleContextMenu = useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        if (disabled) {
          return;
        }
        e.preventDefault();
        onContextMenu?.(e);
        setPosition({ x: e.clientX, y: e.clientY });
        setOpen(true);
      },
      [disabled, setOpen, setPosition, onContextMenu],
    );

    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        data-disabled={disabled || undefined}
        onContextMenu={handleContextMenu}
        className={className}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
ContextMenuTrigger.displayName = 'ContextMenu.Trigger';

//
// * ContextMenuPortal
//

export type ContextMenuPortalProps = {
  container?: HTMLElement | null;
  forceMount?: boolean;
  children?: ReactNode;
};

const ContextMenuPortal = ({ container, forceMount, children }: ContextMenuPortalProps): ReactElement | null => {
  const { open } = useContextMenu();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (!forceMount && !open)) {
    return null;
  }

  return createPortal(children, container ?? document.body);
};
ContextMenuPortal.displayName = 'ContextMenu.Portal';

//
// * ContextMenuContent
//

export type ContextMenuContentProps = {
  forceMount?: boolean;
  loop?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  (
    {
      forceMount,
      loop = true,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      className,
      children,
      ...props
    },
    ref,
  ): ReactElement | null => {
    const { baseId, open, setOpen, active, setActive, getItems, isItemDisabled, position } = useContextMenu();
    const menuId = `${baseId}-content`;
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);

    const computedPosition = usePointerPosition({
      enabled: open,
      mousePosition: position,
      contentRef,
    });

    // Focus menu when it opens and select first selectable item
    useEffect(() => {
      if (open && contentRef.current) {
        contentRef.current.focus();

        // Select first non-disabled item
        const items = getItems();
        const firstSelectableItem = items.find(itemId => !isItemDisabled(itemId));
        if (firstSelectableItem) {
          setActive(firstSelectableItem);
        }
      }
    }, [open, getItems, isItemDisabled, setActive]);

    // Keyboard navigation
    const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
      getItems,
      isItemDisabled,
      active,
      setActive,
      loop,
      orientation: 'vertical',
      onSelect: id => {
        const itemElement = document.getElementById(id);
        if (itemElement) {
          itemElement.click();
        }
      },
    });

    // Wrap keyboard handler to handle Tab and Escape (with prop callback)
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Tab') {
          // Close menu
          setOpen(false);
          return;
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          onEscapeKeyDown?.(e);
          setOpen(false);
          return;
        }

        handleNavKeyDown(e);
      },
      [handleNavKeyDown, setOpen, onEscapeKeyDown],
    );

    useClickOutside({
      enabled: open,
      contentRef,
      onPointerDownOutside,
      onInteractOutside,
      onClose: () => setOpen(false),
    });

    useScrollActiveIntoView({
      containerRef: contentRef,
      activeId: active,
      orientation: 'vertical',
    });

    if (!forceMount && !open) {
      return null;
    }

    return (
      <div
        ref={composedRefs}
        id={menuId}
        role='menu'
        aria-orientation='vertical'
        aria-activedescendant={active}
        tabIndex={-1}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'fixed z-40 flex w-fit flex-col items-start gap-y-1 overflow-hidden p-1',
          'rounded-sm border border-bdr-subtle bg-surface-neutral shadow-lg outline-none',
          // Animations
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          !computedPosition && 'pointer-events-none opacity-0',
          className,
        )}
        style={computedPosition ? { top: computedPosition.top, left: computedPosition.left } : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ContextMenuContent.displayName = 'ContextMenu.Content';

//
// * ContextMenuItem
//

export type ContextMenuItemProps = MenuItemOwnProps;

const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>((props, ref): ReactElement => {
  const { active, setActive, setOpen, registerItem, unregisterItem, getItems, isItemDisabled } = useContextMenu();
  return (
    <MenuPrimitiveItem
      ref={ref}
      active={active}
      setActive={setActive}
      setOpen={setOpen}
      registerItem={registerItem}
      unregisterItem={unregisterItem}
      getItems={getItems}
      isItemDisabled={isItemDisabled}
      {...props}
    />
  );
});
ContextMenuItem.displayName = 'ContextMenu.Item';

//
// * ContextMenuLabel
//

export type ContextMenuLabelProps = MenuPrimitiveLabelProps;

const ContextMenuLabel = forwardRef<HTMLDivElement, ContextMenuLabelProps>((props, ref): ReactElement => {
  return <MenuPrimitiveLabel ref={ref} {...props} />;
});
ContextMenuLabel.displayName = 'ContextMenu.Label';

//
// * ContextMenuSeparator
//

export type ContextMenuSeparatorProps = MenuPrimitiveSeparatorProps;

const ContextMenuSeparator = forwardRef<HTMLDivElement, ContextMenuSeparatorProps>((props, ref): ReactElement => {
  return <MenuPrimitiveSeparator ref={ref} {...props} />;
});
ContextMenuSeparator.displayName = 'ContextMenu.Separator';

//
// * ContextMenuRadioGroup
//

export type ContextMenuRadioGroupProps = MenuRadioGroupOwnProps;

const ContextMenuRadioGroup = forwardRef<HTMLDivElement, ContextMenuRadioGroupProps>((props, ref): ReactElement => {
  const { setOpen } = useContextMenu();
  return <MenuPrimitiveRadioGroup ref={ref} setOpen={setOpen} {...props} />;
});
ContextMenuRadioGroup.displayName = 'ContextMenu.RadioGroup';

//
// * ContextMenuRadioItem
//

export type ContextMenuRadioItemProps = MenuRadioItemOwnProps;

const ContextMenuRadioItem = forwardRef<HTMLDivElement, ContextMenuRadioItemProps>((props, ref): ReactElement => {
  const { active, setActive, registerItem, unregisterItem, getItems, isItemDisabled } = useContextMenu();
  return (
    <MenuPrimitiveRadioItem
      ref={ref}
      active={active}
      setActive={setActive}
      registerItem={registerItem}
      unregisterItem={unregisterItem}
      getItems={getItems}
      isItemDisabled={isItemDisabled}
      {...props}
    />
  );
});
ContextMenuRadioItem.displayName = 'ContextMenu.RadioItem';

//
// * ContextMenuItemIndicator
//

export type ContextMenuItemIndicatorProps = MenuPrimitiveItemIndicatorProps;

const ContextMenuItemIndicator = forwardRef<HTMLSpanElement, ContextMenuItemIndicatorProps>(
  (props, ref): ReactElement | null => {
    return <MenuPrimitiveItemIndicator ref={ref} {...props} />;
  },
);
ContextMenuItemIndicator.displayName = 'ContextMenu.ItemIndicator';

export const ContextMenu = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Portal: ContextMenuPortal,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  ItemIndicator: ContextMenuItemIndicator,
});
