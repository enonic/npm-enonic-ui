import { Slot } from '@radix-ui/react-slot';
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  useClickOutside,
  useControlledState,
  useFloatingPosition,
  useItemRegistry,
  useKeyboardNavigation,
  usePortalFocusContainer,
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
import { type MenuContextValue, MenuProvider, useMenu, usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';

//
// * Menu
//

export type MenuRootProps = {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  children?: ReactNode;
};

const MenuRoot = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: MenuRootProps): ReactElement => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const baseId = usePrefixedId();

  const [open, setOpen] = useControlledState(controlledOpen, defaultOpen, onOpenChange);
  const [active, setActive] = useState<string | undefined>(undefined);
  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  const value: MenuContextValue = useMemo(
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
      triggerRef,
    }),
    [baseId, open, active, registerItem, unregisterItem, getItems, isItemDisabled, setOpen],
  );

  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (open) {
      setHasOpened(true);
    } else if (hasOpened && triggerRef.current) {
      // Return focus to trigger when menu closes (can't be in MenuContent - it unmounts)
      triggerRef.current.focus();
    }
  }, [open, hasOpened]);

  return <MenuProvider value={value}>{children}</MenuProvider>;
};
MenuRoot.displayName = 'Menu.Root';

//
// * MenuTrigger
//

export type MenuTriggerProps = {
  asChild?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  ({ asChild, onClick, onKeyDown, className, children, ...props }, ref): ReactElement => {
    const { baseId, open, setOpen, triggerRef } = useMenu();
    const triggerId = `${baseId}-trigger`;
    const menuId = `${baseId}-content`;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
      onClick?.(e);
      setOpen(!open);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
      onKeyDown?.(e);
      if (e.key === 'ArrowDown' && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={useComposedRefs(ref, triggerRef)}
        id={triggerId}
        aria-haspopup='menu'
        aria-expanded={open}
        data-active={open}
        aria-controls={open ? menuId : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn('data-[active=true]:bg-btn-active data-[active=true]:text-alt', className)}
        {...(!asChild && { type: 'button' })}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
MenuTrigger.displayName = 'Menu.Trigger';

//
// * MenuPortal
//

export type MenuPortalProps = {
  container?: HTMLElement | null;
  forceMount?: boolean;
  children?: ReactNode;
};

const MenuPortal = ({ container, forceMount, children }: MenuPortalProps): ReactElement | null => {
  const { open } = useMenu();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (!forceMount && !open)) {
    return null;
  }

  return createPortal(children, container ?? document.body);
};
MenuPortal.displayName = 'Menu.Portal';

//
// * MenuContent
//

export type MenuContentProps = {
  forceMount?: boolean;
  align?: 'start' | 'end';
  loop?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
  (
    {
      forceMount,
      align = 'start',
      loop = true,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      className,
      style,
      children,
      ...props
    },
    ref,
  ): ReactElement | null => {
    const { baseId, open, setOpen, active, setActive, getItems, isItemDisabled, triggerRef } = useMenu();
    const menuId = `${baseId}-content`;
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);
    const [isPortalMode, setIsPortalMode] = useState(false);
    const position = useFloatingPosition({
      enabled: open,
      triggerRef,
      contentRef,
      align,
    });

    // Detect portal mode
    useLayoutEffect(() => {
      if (!open || !contentRef.current) return;
      setIsPortalMode(contentRef.current.parentElement === document.body);
    }, [open]);

    // Register with parent focus trap (e.g., Dialog) when in portal mode
    usePortalFocusContainer(contentRef, isPortalMode);

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
          // Close menu and return focus to trigger
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
      excludeRefs: triggerRef ? [triggerRef] : undefined,
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

    const contentStyle = {
      ...(position ?? {}),
      ...((style as React.CSSProperties | undefined) ?? {}),
    };

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
          'fixed z-40 mt-2 flex w-fit flex-col items-start gap-y-1 overflow-hidden p-1',
          'rounded-sm border border-bdr-subtle bg-surface-neutral shadow-lg outline-none',
          // Animations
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          !position && 'pointer-events-none opacity-0',
          className,
        )}
        style={contentStyle}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
MenuContent.displayName = 'Menu.Content';

//
// * MenuItem
//

/**
 * An interactive item within a dropdown menu.
 *
 * Supports keyboard navigation, hover effects, and the onSelect callback.
 * Automatically closes the menu when selected.
 *
 * @example
 * ```tsx
 * <Menu.Content>
 *   <Menu.Item onSelect={() => console.log('New')}>
 *     New File
 *   </Menu.Item>
 *   <Menu.Item disabled>
 *     Save (disabled)
 *   </Menu.Item>
 *   <Menu.Item asChild>
 *     <a href="/export">Export</a>
 *   </Menu.Item>
 * </Menu.Content>
 * ```
 *
 * @remarks
 * When using `asChild`, do not set the `disabled` prop on the child component.
 * The `Menu.Item`'s `disabled` prop should be the single source of truth.
 * Due to Radix UI Slot's prop merging behavior, child props can override parent props.
 */
export type MenuItemProps = MenuItemOwnProps;

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>((props, ref): ReactElement => {
  const { active, setActive, setOpen, registerItem, unregisterItem, getItems, isItemDisabled } = useMenu();
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
MenuItem.displayName = 'Menu.Item';

//
// * MenuLabel
//

export type MenuLabelProps = MenuPrimitiveLabelProps;

const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>((props, ref): ReactElement => {
  return <MenuPrimitiveLabel ref={ref} {...props} />;
});
MenuLabel.displayName = 'Menu.Label';

//
// * MenuSeparator
//

export type MenuSeparatorProps = MenuPrimitiveSeparatorProps;

const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>((props, ref): ReactElement => {
  return <MenuPrimitiveSeparator ref={ref} {...props} />;
});
MenuSeparator.displayName = 'Menu.Separator';

//
// * MenuRadioGroup
//

export type MenuRadioGroupProps = MenuRadioGroupOwnProps;

const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>((props, ref): ReactElement => {
  const { setOpen } = useMenu();
  return <MenuPrimitiveRadioGroup ref={ref} setOpen={setOpen} {...props} />;
});
MenuRadioGroup.displayName = 'Menu.RadioGroup';

//
// * MenuRadioItem
//

export type MenuRadioItemProps = MenuRadioItemOwnProps;

const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>((props, ref): ReactElement => {
  const { active, setActive, registerItem, unregisterItem, getItems, isItemDisabled } = useMenu();
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
MenuRadioItem.displayName = 'Menu.RadioItem';

//
// * MenuItemIndicator
//

export type MenuItemIndicatorProps = MenuPrimitiveItemIndicatorProps;

const MenuItemIndicator = forwardRef<HTMLSpanElement, MenuItemIndicatorProps>((props, ref): ReactElement | null => {
  return <MenuPrimitiveItemIndicator ref={ref} {...props} />;
});
MenuItemIndicator.displayName = 'Menu.ItemIndicator';

export const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Portal: MenuPortal,
  Content: MenuContent,
  Item: MenuItem,
  Label: MenuLabel,
  Separator: MenuSeparator,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  ItemIndicator: MenuItemIndicator,
});
