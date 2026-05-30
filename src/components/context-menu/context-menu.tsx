import { Slot } from '@radix-ui/react-slot';
import { ChevronRight } from 'lucide-react';
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
  useActiveItemFocus,
  useClickOutside,
  useControlledState,
  useFloatingPosition,
  useItemRegistry,
  useKeyboardNavigation,
  usePointerPosition,
  usePortalFocusContainer,
  useScrollActiveIntoView,
  useSubmenuSafeArea,
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
  menuItemVariants,
} from '@/primitives/menu-primitive';
import {
  type ContextMenuContentContextValue,
  ContextMenuContentProvider,
  type ContextMenuContextValue,
  ContextMenuProvider,
  type ContextMenuSubContextValue,
  ContextMenuSubProvider,
  IdProvider,
  useContextMenu,
  useContextMenuContent,
  useContextMenuSub,
  useContextMenuSubOptional,
  usePrefixedId,
} from '@/providers';
import { cn, useComposedRefs } from '@/utils';

const SUBMENU_OPEN_DELAY_MS = 100;

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
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isUsingKeyboard, setIsUsingKeyboard] = useState(false);

  const value: ContextMenuContextValue = useMemo(
    () => ({
      baseId,
      open,
      setOpen,
      position,
      setPosition,
      isUsingKeyboard,
      setIsUsingKeyboard,
    }),
    [baseId, open, setOpen, position, isUsingKeyboard],
  );

  // Reset position and keyboard navigation state when menu closes
  useEffect(() => {
    if (!open) {
      setPosition(null);
      setIsUsingKeyboard(false);
    }
  }, [open]);

  return <ContextMenuProvider value={value}>{children}</ContextMenuProvider>;
};
ContextMenuRoot.displayName = 'ContextMenu';

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
        data-component='ContextMenu.Trigger'
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

/**
 * Portal that renders context menu content to a container (defaults to document.body).
 *
 * When nested inside a `ContextMenu.Sub`, it keys off the submenu's open state
 * instead of the root menu's — matching Radix's API where `<ContextMenu.Portal>`
 * is reused at both levels.
 */
const ContextMenuPortal = ({ container, forceMount, children }: ContextMenuPortalProps): ReactElement | null => {
  const { open: rootOpen } = useContextMenu();
  const sub = useContextMenuSubOptional();
  const open = sub ? sub.open : rootOpen;

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

/**
 * The component that pops out when the context menu is open.
 *
 * @remarks
 * **Focus-visible behavior**: Since context menus are always opened via pointer
 * (right-click), focus rings are hidden initially to avoid visual noise. Once the
 * user presses a navigation key (ArrowUp, ArrowDown, Home, End), focus rings appear
 * and remain visible until the menu closes. This provides a clean experience for
 * pointer users while maintaining accessibility for keyboard users.
 */
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
    const { baseId, open, setOpen, position, setIsUsingKeyboard } = useContextMenu();
    const menuId = `${baseId}-content`;
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);
    const [isPortalMode, setIsPortalMode] = useState(false);

    const [active, setActive] = useState<string | undefined>(undefined);
    const { registerItem, unregisterItem, getItems, isItemDisabled, getItemElement } = useItemRegistry();
    const safeAreaCheckRef = useRef<((x: number, y: number) => boolean) | null>(null);

    const computedPosition = usePointerPosition({
      enabled: open,
      mousePosition: position,
      contentRef,
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

        const items = getItems();
        const firstSelectableItem = items.find(itemId => !isItemDisabled(itemId));
        if (firstSelectableItem) {
          setActive(firstSelectableItem);
        }
      }
    }, [open, getItems, isItemDisabled]);

    // Reset active item when menu closes
    useEffect(() => {
      if (!open) setActive(undefined);
    }, [open]);

    const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
      getItems,
      isItemDisabled,
      active,
      setActive,
      loop,
      orientation: 'vertical',
      onSelect: id => {
        getItemElement(id)?.click();
      },
    });

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Tab') {
          setOpen(false);
          return;
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          onEscapeKeyDown?.(e);
          setOpen(false);
          return;
        }

        if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'ArrowRight'].includes(e.key)) {
          setIsUsingKeyboard(true);
        }

        // ArrowRight on a SubTrigger opens its submenu (active stays tracked via aria-activedescendant,
        // so the real focused node is this menu container — we route through the active element's click).
        if (e.key === 'ArrowRight' && active) {
          const activeElement = getItemElement(active);
          if (activeElement?.getAttribute('aria-haspopup') === 'menu') {
            e.preventDefault();
            activeElement.click();
            return;
          }
        }

        handleNavKeyDown(e);
      },
      [handleNavKeyDown, setOpen, onEscapeKeyDown, setIsUsingKeyboard, active, getItemElement],
    );

    // Suppress sibling-item hover while the pointer is inside an open submenu's
    // safe triangle. Capture phase so it fires before any Item's own handler.
    const handlePointerMoveCapture = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
      const check = safeAreaCheckRef.current;
      if (check?.(e.clientX, e.clientY)) {
        e.stopPropagation();
      }
    }, []);

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

    const contentContextValue: ContextMenuContentContextValue = useMemo(
      () => ({
        active,
        setActive,
        registerItem,
        unregisterItem,
        getItems,
        isItemDisabled,
        getItemElement,
        safeAreaCheckRef,
      }),
      [active, registerItem, unregisterItem, getItems, isItemDisabled, getItemElement],
    );

    if (!forceMount && !open) {
      return null;
    }

    return (
      <ContextMenuContentProvider value={contentContextValue}>
        <div
          data-component='ContextMenu.Content'
          ref={composedRefs}
          id={menuId}
          role='menu'
          aria-orientation='vertical'
          aria-activedescendant={active}
          tabIndex={-1}
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'fixed z-40 flex w-fit flex-col items-start gap-y-1 overflow-hidden p-1',
            'border-bdr-subtle bg-surface-neutral rounded-sm border shadow-lg outline-none',
            'data-[state=closed]:animate-out data-[state=open]:animate-in',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            !computedPosition && 'pointer-events-none opacity-0',
            className,
          )}
          style={computedPosition ? { top: computedPosition.top, left: computedPosition.left } : undefined}
          onKeyDown={handleKeyDown}
          onPointerMoveCapture={handlePointerMoveCapture}
          {...props}
        >
          {children}
        </div>
      </ContextMenuContentProvider>
    );
  },
);
ContextMenuContent.displayName = 'ContextMenu.Content';

//
// * ContextMenuItem
//

/**
 * An interactive item within the context menu.
 *
 * @remarks
 * Focus rings are conditionally shown based on keyboard navigation state.
 * See {@link ContextMenuContentProps} for details on focus-visible behavior.
 */
export type ContextMenuItemProps = MenuItemOwnProps;

const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ className, ...props }, ref): ReactElement => {
    const { setOpen, isUsingKeyboard } = useContextMenu();
    const { active, setActive, registerItem, unregisterItem, getItems, isItemDisabled } = useContextMenuContent();
    return (
      <MenuPrimitiveItem
        data-component='ContextMenu.Item'
        ref={ref}
        active={active}
        setActive={setActive}
        setOpen={setOpen}
        registerItem={registerItem}
        unregisterItem={unregisterItem}
        getItems={getItems}
        isItemDisabled={isItemDisabled}
        className={cn(!isUsingKeyboard && 'focus-visible:ring-0 focus-visible:ring-offset-0', className)}
        {...props}
      />
    );
  },
);
ContextMenuItem.displayName = 'ContextMenu.Item';

//
// * ContextMenuLabel
//

export type ContextMenuLabelProps = MenuPrimitiveLabelProps;

const ContextMenuLabel = forwardRef<HTMLDivElement, ContextMenuLabelProps>((props, ref): ReactElement => {
  return <MenuPrimitiveLabel data-component='ContextMenu.Label' ref={ref} {...props} />;
});
ContextMenuLabel.displayName = 'ContextMenu.Label';

//
// * ContextMenuSeparator
//

export type ContextMenuSeparatorProps = MenuPrimitiveSeparatorProps;

const ContextMenuSeparator = forwardRef<HTMLDivElement, ContextMenuSeparatorProps>((props, ref): ReactElement => {
  return <MenuPrimitiveSeparator data-component='ContextMenu.Separator' ref={ref} {...props} />;
});
ContextMenuSeparator.displayName = 'ContextMenu.Separator';

//
// * ContextMenuRadioGroup
//

export type ContextMenuRadioGroupProps = MenuRadioGroupOwnProps;

const ContextMenuRadioGroup = forwardRef<HTMLDivElement, ContextMenuRadioGroupProps>((props, ref): ReactElement => {
  const { setOpen } = useContextMenu();
  return <MenuPrimitiveRadioGroup data-component='ContextMenu.RadioGroup' ref={ref} setOpen={setOpen} {...props} />;
});
ContextMenuRadioGroup.displayName = 'ContextMenu.RadioGroup';

//
// * ContextMenuRadioItem
//

/**
 * A radio item within the context menu.
 *
 * @remarks
 * Focus rings are conditionally shown based on keyboard navigation state.
 * See {@link ContextMenuContentProps} for details on focus-visible behavior.
 */
export type ContextMenuRadioItemProps = MenuRadioItemOwnProps;

const ContextMenuRadioItem = forwardRef<HTMLDivElement, ContextMenuRadioItemProps>(
  ({ className, ...props }, ref): ReactElement => {
    const { isUsingKeyboard } = useContextMenu();
    const { active, setActive, registerItem, unregisterItem, getItems, isItemDisabled } = useContextMenuContent();
    return (
      <MenuPrimitiveRadioItem
        data-component='ContextMenu.RadioItem'
        ref={ref}
        active={active}
        setActive={setActive}
        registerItem={registerItem}
        unregisterItem={unregisterItem}
        getItems={getItems}
        isItemDisabled={isItemDisabled}
        className={cn(!isUsingKeyboard && 'focus-visible:ring-0 focus-visible:ring-offset-0', className)}
        {...props}
      />
    );
  },
);
ContextMenuRadioItem.displayName = 'ContextMenu.RadioItem';

//
// * ContextMenuItemIndicator
//

export type ContextMenuItemIndicatorProps = MenuPrimitiveItemIndicatorProps;

const ContextMenuItemIndicator = forwardRef<HTMLSpanElement, ContextMenuItemIndicatorProps>(
  (props, ref): ReactElement | null => {
    return <MenuPrimitiveItemIndicator data-component='ContextMenu.ItemIndicator' ref={ref} {...props} />;
  },
);
ContextMenuItemIndicator.displayName = 'ContextMenu.ItemIndicator';

//
// * ContextMenuSub
//

/**
 * Wrapper that holds the local open state for a single submenu.
 *
 * Opens on `ArrowRight` / `Enter` / `Space` / hover from its `SubTrigger`.
 * Closes on `ArrowLeft` / `Escape` inside `SubContent`, when the parent's
 * active item changes to something other than the trigger, or when the root
 * menu closes (cascading close).
 */
export type ContextMenuSubProps = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

const ContextMenuSubRoot = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: ContextMenuSubProps): ReactElement => {
  const { baseId, open: rootOpen } = useContextMenu();
  const parentContent = useContextMenuContent();

  const [open, setOpen] = useControlledState(controlledOpen, defaultOpen, onOpenChange);
  const subId = usePrefixedId(undefined, `${baseId}-sub`);
  const contentId = `${subId}-content`;
  const triggerRef = useRef<HTMLDivElement>(null);

  // Cascade close: when the root menu closes, close every descendant sub.
  useEffect(() => {
    if (!rootOpen && open) setOpen(false);
  }, [rootOpen, open, setOpen]);

  // Close when the parent's active item is no longer our trigger. This fires
  // whenever the user hovers a sibling row (assuming the safe triangle didn't
  // suppress the hover) or navigates away with ArrowUp/ArrowDown.
  //
  // ! Do not refocus the trigger here — the parent just moved active to a sibling,
  // so focus belongs to the parent Content's aria-activedescendant target, not the
  // (now inactive) trigger. Parking focus on the trigger lets its Enter/Space handler
  // reopen the submenu instead of activating the hovered sibling.
  useEffect(() => {
    if (open && parentContent.active !== undefined && parentContent.active !== subId) {
      setOpen(false);
    }
  }, [parentContent.active, subId, open, setOpen]);

  const value: ContextMenuSubContextValue = useMemo(
    () => ({
      subId,
      contentId,
      open,
      setOpen,
      triggerRef,
      parentContent,
    }),
    [subId, contentId, open, setOpen, parentContent],
  );

  return <ContextMenuSubProvider value={value}>{children}</ContextMenuSubProvider>;
};
ContextMenuSubRoot.displayName = 'ContextMenu.Sub';

//
// * ContextMenuSubTrigger
//

export type ContextMenuSubTriggerProps = {
  id?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'children'>;

const ContextMenuSubTrigger = forwardRef<HTMLDivElement, ContextMenuSubTriggerProps>(
  (
    {
      id: providedId,
      disabled = false,
      className,
      children,
      onClick,
      onPointerMove,
      onPointerLeave,
      onKeyDown,
      onFocus,
      ...props
    },
    ref,
  ): ReactElement => {
    const { isUsingKeyboard, setIsUsingKeyboard } = useContextMenu();
    const { active, setActive, registerItem, unregisterItem } = useContextMenuContent();
    const { subId, contentId, open, setOpen, triggerRef } = useContextMenuSub();

    const id = providedId ?? subId;
    const isActive = active === id;
    const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const composedRefs = useComposedRefs(ref, triggerRef);

    useEffect(() => {
      registerItem(id, disabled, triggerRef?.current ?? null);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem, triggerRef]);

    useActiveItemFocus({
      ref: triggerRef,
      isActive,
      disabled,
    });

    const clearOpenTimer = useCallback((): void => {
      if (openTimerRef.current !== null) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    }, []);

    useEffect(() => {
      return () => clearOpenTimer();
    }, [clearOpenTimer]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        onClick?.(e);
        if (disabled) return;
        clearOpenTimer();
        setOpen(true);
      },
      [disabled, setOpen, onClick, clearOpenTimer],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>): void => {
        onPointerMove?.(e);
        if (disabled) return;
        if (!isActive) setActive(id);
        if (!open && openTimerRef.current === null) {
          openTimerRef.current = setTimeout(() => {
            openTimerRef.current = null;
            setOpen(true);
          }, SUBMENU_OPEN_DELAY_MS);
        }
      },
      [disabled, isActive, setActive, id, open, setOpen, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: React.PointerEvent<HTMLDivElement>): void => {
        onPointerLeave?.(e);
        clearOpenTimer();
      },
      [clearOpenTimer, onPointerLeave],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        onFocus?.(e);
        if (disabled) return;
        setActive(id);
      },
      [disabled, setActive, id, onFocus],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        onKeyDown?.(e);
        if (disabled) return;

        if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
          if (!open) {
            e.preventDefault();
            e.stopPropagation();
            setIsUsingKeyboard(true);
            clearOpenTimer();
            setOpen(true);
          }
        }
      },
      [disabled, open, setOpen, setIsUsingKeyboard, onKeyDown, clearOpenTimer],
    );

    return (
      <div
        data-component='ContextMenu.SubTrigger'
        ref={composedRefs}
        id={id}
        role='menuitem'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        aria-disabled={disabled || undefined}
        data-active={isActive || undefined}
        data-disabled={disabled || undefined}
        data-state={open ? 'open' : 'closed'}
        data-tone={isActive ? 'inverse' : undefined}
        tabIndex={-1}
        className={cn(
          menuItemVariants({ active: isActive, disabled }),
          !isUsingKeyboard && 'focus-visible:ring-0 focus-visible:ring-offset-0',
          className,
        )}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...props}
      >
        {children}
        <ChevronRight className='ms-auto size-4' aria-hidden='true' />
      </div>
    );
  },
);
ContextMenuSubTrigger.displayName = 'ContextMenu.SubTrigger';

//
// * ContextMenuSubContent
//

export type ContextMenuSubContentProps = {
  forceMount?: boolean;
  loop?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onInteractOutside?: (event: Event) => void;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const ContextMenuSubContent = forwardRef<HTMLDivElement, ContextMenuSubContentProps>(
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
    const { setOpen: setRootOpen, setIsUsingKeyboard } = useContextMenu();
    const { contentId, open, setOpen, triggerRef, parentContent, subId } = useContextMenuSub();
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);
    const [isPortalMode, setIsPortalMode] = useState(false);

    const [active, setActive] = useState<string | undefined>(undefined);
    const { registerItem, unregisterItem, getItems, isItemDisabled, getItemElement } = useItemRegistry();
    const safeAreaCheckRef = useRef<((x: number, y: number) => boolean) | null>(null);

    const position = useFloatingPosition({
      enabled: open,
      anchorRef: triggerRef,
      contentRef,
      side: 'right',
      align: 'start',
    });
    const side = position?.side === 'left' ? 'left' : 'right';

    const { isInSafeArea } = useSubmenuSafeArea({
      enabled: open,
      submenuRef: contentRef,
      side,
    });

    // Register our safe-triangle check with the parent Content so it can suppress
    // sibling hover activation while the user is traveling toward this submenu.
    useEffect(() => {
      if (!open) {
        parentContent.safeAreaCheckRef.current = null;
        return;
      }
      parentContent.safeAreaCheckRef.current = isInSafeArea;
      return () => {
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- intentional teardown of a stable context ref on unmount
        parentContent.safeAreaCheckRef.current = null;
      };
    }, [open, isInSafeArea, parentContent]);

    useLayoutEffect(() => {
      if (!open || !contentRef.current) return;
      setIsPortalMode(contentRef.current.parentElement === document.body);
    }, [open]);

    usePortalFocusContainer(contentRef, isPortalMode);

    // Focus the submenu and select first item once positioned. Gate on `isPositioned`
    // (not `position` identity) so resize/scroll — which produce a fresh position object
    // every time — don't reset the user's active selection.
    const isPositioned = position !== null;
    useEffect(() => {
      if (open && isPositioned && contentRef.current) {
        contentRef.current.focus();
        const items = getItems();
        const firstSelectableItem = items.find(itemId => !isItemDisabled(itemId));
        if (firstSelectableItem) {
          setActive(firstSelectableItem);
        }
      } else if (!open) {
        setActive(undefined);
      }
    }, [open, isPositioned, getItems, isItemDisabled]);

    const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
      getItems,
      isItemDisabled,
      active,
      setActive,
      loop,
      orientation: 'vertical',
      onSelect: id => {
        getItemElement(id)?.click();
      },
    });

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        // ? SubContent is portaled but React synthetic events still bubble through the
        // component tree. Stop propagation on every handled key so the parent Content
        // doesn't also react to ArrowDown/Enter/etc. and move *its* active item.
        if (e.key === 'Tab') {
          e.stopPropagation();
          setRootOpen(false);
          return;
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onEscapeKeyDown?.(e);
          setOpen(false);
          triggerRef?.current?.focus();
          parentContent.setActive(subId);
          return;
        }

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          triggerRef?.current?.focus();
          parentContent.setActive(subId);
          return;
        }

        if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
          e.stopPropagation();
          setIsUsingKeyboard(true);
        }

        if (e.key === 'ArrowRight' && active) {
          const activeElement = getItemElement(active);
          if (activeElement?.getAttribute('aria-haspopup') === 'menu') {
            e.preventDefault();
            activeElement.click();
            return;
          }
        }

        handleNavKeyDown(e);
      },
      [
        handleNavKeyDown,
        setOpen,
        setRootOpen,
        onEscapeKeyDown,
        triggerRef,
        parentContent,
        subId,
        setIsUsingKeyboard,
        active,
        getItemElement,
      ],
    );

    const handlePointerMoveCapture = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
      const check = safeAreaCheckRef.current;
      if (check?.(e.clientX, e.clientY)) {
        e.stopPropagation();
      }
    }, []);

    useClickOutside({
      enabled: open,
      contentRef,
      excludeRefs: [triggerRef as React.RefObject<HTMLElement>],
      onPointerDownOutside,
      onInteractOutside,
      onClose: () => setOpen(false),
    });

    useScrollActiveIntoView({
      containerRef: contentRef,
      activeId: active,
      orientation: 'vertical',
    });

    const contentContextValue: ContextMenuContentContextValue = useMemo(
      () => ({
        active,
        setActive,
        registerItem,
        unregisterItem,
        getItems,
        isItemDisabled,
        getItemElement,
        safeAreaCheckRef,
      }),
      [active, registerItem, unregisterItem, getItems, isItemDisabled, getItemElement],
    );

    if (!forceMount && !open) {
      return null;
    }

    return (
      <IdProvider prefix={subId}>
        <ContextMenuContentProvider value={contentContextValue}>
          <div
            data-component='ContextMenu.SubContent'
            ref={composedRefs}
            id={contentId}
            role='menu'
            aria-orientation='vertical'
            aria-labelledby={subId}
            aria-activedescendant={active}
            tabIndex={-1}
            // Root Content's useClickOutside would treat this portaled subtree as outside and
            // close the whole menu on pointerdown inside a submenu item. Opt out explicitly.
            data-click-outside-ignore
            data-state={open ? 'open' : 'closed'}
            data-side={position?.side ?? 'right'}
            className={cn(
              'fixed z-40 flex w-fit flex-col items-start gap-y-1 overflow-hidden p-1',
              'border-bdr-subtle bg-surface-neutral rounded-sm border shadow-lg outline-none',
              'data-[state=closed]:animate-out data-[state=open]:animate-in',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              !position && 'pointer-events-none opacity-0',
              className,
            )}
            style={position ? { top: position.top, left: position.left, right: position.right } : undefined}
            onKeyDown={handleKeyDown}
            onPointerMoveCapture={handlePointerMoveCapture}
            {...props}
          >
            {children}
          </div>
        </ContextMenuContentProvider>
      </IdProvider>
    );
  },
);
ContextMenuSubContent.displayName = 'ContextMenu.SubContent';

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
  Sub: ContextMenuSubRoot,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
});
