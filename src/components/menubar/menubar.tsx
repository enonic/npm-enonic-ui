import { useItemRegistry, useKeyboardNavigation } from '@/hooks';
import {
  type MenubarContextValue,
  MenubarMenuProvider,
  MenubarProvider,
  useMenubar,
  useMenubarMenu,
  usePrefixedId,
} from '@/providers';
import { cn, useComposedRefs } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

//
// * MenubarContentContext (internal)
//

type MenubarContentContextValue = {
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
};

const MenubarContentContext = createContext<MenubarContentContextValue | undefined>(undefined);

function useMenubarContent(): MenubarContentContextValue {
  const context = useContext(MenubarContentContext);
  if (!context) {
    throw new Error('Menubar menu item components must be used within Menubar.Content');
  }
  return context;
}

//
// * Menubar
//

/**
 * Root component that provides context for the Menubar.
 *
 * Implements the ARIA menubar pattern for horizontal navigation.
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/menubar/}
 *
 * @example
 * ```tsx
 * <Menubar.Root>
 *   <Menubar.Content aria-label="Main navigation">
 *     <Menubar.Button>New</Menubar.Button>
 *     <Menubar.Button>Save</Menubar.Button>
 *   </Menubar.Content>
 * </Menubar.Root>
 * ```
 */
export type MenubarRootProps = {
  /** Default active item ID on initial render */
  defaultActive?: string;
  /** Callback when active item changes */
  onActiveChange?: (active: string | undefined) => void;
  /** Base ID for generating unique IDs */
  id?: string;
  children?: ReactNode;
};

const MenubarRoot = ({ defaultActive, onActiveChange, id, children }: MenubarRootProps): ReactElement => {
  const menubarId = usePrefixedId(id, 'menubar');
  const menubarRef = useRef<HTMLDivElement>(null);

  // Uncontrolled active state
  const [active, setActiveInternal] = useState<string | undefined>(defaultActive);

  // Notify parent when active changes
  const setActive = useCallback(
    (value: string | undefined) => {
      setActiveInternal(value);
      onActiveChange?.(value);
    },
    [onActiveChange],
  );

  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  // Track which menu (if any) is currently open for Phase 2 dropdown integration
  const [openMenuId, setOpenMenuId] = useState<string | undefined>(undefined);

  const value: MenubarContextValue = useMemo(
    () => ({
      active,
      setActive,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      openMenuId,
      setOpenMenuId,
      menubarId,
      menubarRef,
    }),
    [active, setActive, registerItem, unregisterItem, getItems, isItemDisabled, openMenuId, menubarId],
  );

  return <MenubarProvider value={value}>{children}</MenubarProvider>;
};
MenubarRoot.displayName = 'Menubar.Root';

//
// * MenubarNav (internal name for menubar container)
//

/**
 * Container component that renders the menubar element with keyboard navigation.
 *
 * Implements horizontal arrow key navigation (ArrowLeft/Right), Home/End keys,
 * and Tab key to exit the menubar.
 *
 * This is exported as part of the Menubar API but used for the horizontal menubar container,
 * not the dropdown menu content (which is also named MenubarContent but context-aware).
 *
 * @example
 * ```tsx
 * <MenubarNav aria-label="Main menu" loop>
 *   <Menubar.Button>File</Menubar.Button>
 *   <Menubar.Button>Edit</Menubar.Button>
 * </MenubarNav>
 * ```
 */
export type MenubarNavProps = {
  /** Accessible label for the menubar (required for screen readers) */
  'aria-label': string;
  /** Whether navigation should loop from last to first item */
  loop?: boolean;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const MenubarNav = forwardRef<HTMLDivElement, MenubarNavProps>(
  (
    { 'aria-label': ariaLabel, loop = true, className, children, onKeyDown, onFocus, onBlur, ...props },
    ref,
  ): ReactElement => {
    const { active, setActive, getItems, isItemDisabled, menubarId, menubarRef, setOpenMenuId, openMenuId } =
      useMenubar();
    const composedRefs = useComposedRefs(ref, menubarRef);

    const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
      getItems,
      isItemDisabled,
      active,
      setActive,
      loop,
      orientation: 'horizontal',
      onSelect: id => {
        // Trigger click on the active item
        const itemElement = document.getElementById(id);
        if (itemElement) {
          itemElement.click();
        }
      },
    });

    const handleKeyDown_ = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        onKeyDown?.(e);

        // ArrowDown opens menu if active item is a menu trigger
        if (e.key === 'ArrowDown' && active) {
          const activeElement = document.getElementById(active);
          if (activeElement && activeElement.getAttribute('aria-haspopup') === 'menu') {
            e.preventDefault();
            setOpenMenuId(active);
            return;
          }
        }

        // ArrowUp also opens menu (variant behavior)
        if (e.key === 'ArrowUp' && active) {
          const activeElement = document.getElementById(active);
          if (activeElement && activeElement.getAttribute('aria-haspopup') === 'menu') {
            e.preventDefault();
            setOpenMenuId(active);
            return;
          }
        }

        handleNavKeyDown(e);
      },
      [onKeyDown, handleNavKeyDown, active, setOpenMenuId],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        onFocus?.(e);
        // Auto-activate first non-disabled item when menubar receives focus
        if (!active) {
          const items = getItems();
          const firstSelectableItem = items.find(itemId => !isItemDisabled(itemId));
          if (firstSelectableItem) {
            setActive(firstSelectableItem);
          }
        }
      },
      [onFocus, active, getItems, isItemDisabled, setActive],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        onBlur?.(e);

        // Check if focus is leaving the menubar structure entirely
        const relatedTarget = e.relatedTarget;
        if (menubarRef?.current && relatedTarget instanceof Node) {
          // If focus is staying within menubar, keep active state
          if (menubarRef.current.contains(relatedTarget)) {
            return;
          }
        }

        // If a menu is open, don't reset active state (menu is portaled outside DOM tree)
        if (openMenuId) {
          return;
        }

        // Focus is leaving menubar entirely - reset active state
        setActive(undefined);
      },
      [onBlur, setActive, menubarRef, openMenuId],
    );

    // Scroll active item into view
    useEffect(() => {
      if (!active || !menubarRef?.current) {
        return;
      }
      const el = menubarRef.current.querySelector<HTMLElement>(`#${active}`);
      if (el) {
        el.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: 'auto',
        });
      }
    }, [active, menubarRef]);

    return (
      <div
        ref={composedRefs}
        id={menubarId}
        role='menubar'
        aria-label={ariaLabel}
        aria-orientation='horizontal'
        aria-activedescendant={active}
        tabIndex={0}
        className={cn('flex items-center gap-1', 'focus-within:outline-3 focus-within:outline-offset-3', className)}
        onKeyDown={handleKeyDown_}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </div>
    );
  },
);
MenubarNav.displayName = 'Menubar.Nav';

//
// * MenubarButton
//

/**
 * A button item within the menubar.
 *
 * Implements ARIA menuitem role and integrates with menubar keyboard navigation.
 * Supports active state animations via Tailwind transitions.
 *
 * @example
 * ```tsx
 * <Menubar.Button onSelect={() => console.log('clicked')}>
 *   Save
 * </Menubar.Button>
 *
 * <Menubar.Button disabled>Export</Menubar.Button>
 *
 * <Menubar.Button asChild>
 *   <a href="/new">New</a>
 * </Menubar.Button>
 * ```
 */
export type MenubarButtonProps = {
  /** Unique ID for this button (auto-generated if not provided) */
  id?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Callback when the button is selected (clicked or activated via keyboard) */
  onSelect?: (event: Event) => void;
  /** Render as a child element using Radix UI Slot */
  asChild?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'id' | 'children'>;

const MenubarButton = forwardRef<HTMLButtonElement, MenubarButtonProps>(
  (
    {
      id: providedId,
      disabled = false,
      onSelect,
      asChild,
      className,
      children,
      onClick,
      onPointerMove,
      onPointerDown,
      onPointerLeave,
      ...props
    },
    ref,
  ): ReactElement => {
    const id = usePrefixedId(providedId, 'menubar-button');
    const { active, setActive, registerItem, unregisterItem, openMenuId } = useMenubar();
    const isActive = active === id;

    useEffect(() => {
      registerItem(id, disabled);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem]);

    const handlePointerDown = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerDown']>>[0]): void => {
        onPointerDown?.(e);
        if (disabled) return;

        // Set active immediately to prevent handleFocus from auto-activating first item
        setActive(id);
      },
      [disabled, id, onPointerDown, setActive],
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        onClick?.(e);
        if (disabled) return;

        // Only set active if not already active (handles keyboard activation path)
        // Mouse clicks will already be active from handlePointerDown
        if (!isActive) {
          setActive(id);
        }

        const event = new Event('select', { bubbles: true, cancelable: true });
        onSelect?.(event);
      },
      [disabled, isActive, onClick, setActive, id, onSelect],
    );

    const handlePointerMove = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerMove']>>[0]): void => {
        onPointerMove?.(e);
        // Phase 1: Hover activation disabled (openMenuId is always undefined)
        // Phase 2: Hover activates and opens menu only when another menu is already open
        // This implements the "conditional hover" pattern from W3C ARIA APG
        if (!disabled && openMenuId) {
          setActive(id);
          // TODO Phase 2: If this button has a menu, open it and close the previous menu
        }
      },
      [disabled, openMenuId, setActive, id, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerLeave']>>[0]): void => {
        onPointerLeave?.(e);
        // Only clear active state if no menu is open or this item's menu isn't open
        // Phase 2: Prevents clearing active state when user moves into the open menu
        if (!openMenuId || openMenuId !== id) {
          setActive(undefined);
        }
      },
      [openMenuId, id, setActive, onPointerLeave],
    );

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        id={id}
        type={asChild ? undefined : 'button'}
        role='menuitem'
        tabIndex={-1}
        aria-disabled={disabled}
        data-active={isActive || undefined}
        data-disabled={disabled || undefined}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn(
          'group px-3 py-2 rounded-sm text-sm cursor-pointer outline-none',
          isActive && 'bg-surface-primary-selected text-alt',
          disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
          className,
        )}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
MenubarButton.displayName = 'Menubar.Button';

//
// * MenubarSeparator
//

/**
 * A visual separator component that adapts based on context.
 *
 * - Within Menubar.Content (menubar): Renders as vertical separator between buttons
 * - Within Menubar.Menu Content (dropdown): Renders as horizontal separator between items
 *
 * Does not participate in keyboard navigation (purely decorative).
 *
 * @example
 * ```tsx
 * // Vertical separator between menubar buttons
 * <Menubar.Content aria-label="Actions">
 *   <Menubar.Button>File</Menubar.Button>
 *   <Menubar.Separator />
 *   <Menubar.Button>Edit</Menubar.Button>
 * </Menubar.Content>
 *
 * // Horizontal separator between menu items
 * <Menubar.Menu>
 *   <Menubar.Trigger>File</Menubar.Trigger>
 *   <Menubar.Portal>
 *     <Menubar.Content>
 *       <Menubar.Item>New</Menubar.Item>
 *       <Menubar.Separator />
 *       <Menubar.Item>Exit</Menubar.Item>
 *     </Menubar.Content>
 *   </Menubar.Portal>
 * </Menubar.Menu>
 * ```
 */
export type MenubarSeparatorProps = {
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const MenubarSeparator = forwardRef<HTMLDivElement, MenubarSeparatorProps>(
  ({ className, ...props }, ref): ReactElement => {
    // Check if we're inside a menu dropdown or in the menubar itself
    const menuContentContext = useContext(MenubarContentContext);
    const isInsideMenuDropdown = menuContentContext !== undefined;

    if (isInsideMenuDropdown) {
      // Horizontal separator for menu dropdowns
      return (
        <div
          ref={ref}
          role='separator'
          aria-orientation='horizontal'
          className={cn('my-1 h-px w-full bg-bdr-subtle', className)}
          {...props}
        />
      );
    }

    // Vertical separator for menubar
    return (
      <div
        ref={ref}
        role='separator'
        aria-orientation='vertical'
        className={cn('mx-1 w-px h-4 bg-bdr-subtle', className)}
        {...props}
      />
    );
  },
);
MenubarSeparator.displayName = 'Menubar.Separator';

//
// * MenubarMenu
//

/**
 * Wrapper component that integrates dropdown menus within a Menubar.
 *
 * Coordinates between the menubar's horizontal navigation and the menu's
 * vertical navigation, implementing the ARIA menubar pattern with submenus.
 *
 * Features:
 * - Registers menu trigger as a menubar item for keyboard navigation
 * - ArrowDown opens the menu from the menubar
 * - ArrowLeft/Right navigate between menus (closing current, opening adjacent)
 * - Automatic conditional hover (hover opens menu when another menu is open)
 * - Tab closes menu and exits menubar entirely
 *
 * @example
 * ```tsx
 * <Menubar.Menu>
 *   <Menubar.Trigger>File</Menubar.Trigger>
 *   <Menubar.Portal>
 *     <Menubar.Content>
 *       <Menubar.Item>New</Menubar.Item>
 *       <Menubar.Item>Open</Menubar.Item>
 *     </Menubar.Content>
 *   </Menubar.Portal>
 * </Menubar.Menu>
 * ```
 */
export type MenubarMenuProps = {
  /** Unique ID for this menu within the menubar */
  id?: string;
  /** Whether the menu is disabled (cannot be opened) */
  disabled?: boolean;
  children?: ReactNode;
};

const MenubarMenu = ({ id: providedId, disabled = false, children }: MenubarMenuProps): ReactElement => {
  const menuId = usePrefixedId(providedId, 'menubar-menu');
  const contentId = `${menuId}-content`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menubarContext = useMenubar();
  const { registerItem, unregisterItem, openMenuId, setOpenMenuId } = menubarContext;

  // Local open state for this specific menu
  const [open, setOpenInternal] = useState<boolean>(false);

  // Register this menu as a menubar item
  useEffect(() => {
    registerItem(menuId, disabled);
    return () => unregisterItem(menuId);
  }, [menuId, disabled, registerItem, unregisterItem]);

  // Sync local open state with menubar's openMenuId
  useEffect(() => {
    if (openMenuId === menuId && !open) {
      // Another component wants this menu to open
      setOpenInternal(true);
    } else if (openMenuId !== menuId && open) {
      // Another menu has opened, close this one
      setOpenInternal(false);
    }
  }, [openMenuId, menuId, open]);

  // Notify menubar when this menu's open state changes
  const setOpen = useCallback(
    (newOpen: boolean) => {
      setOpenInternal(newOpen);
      setOpenMenuId(newOpen ? menuId : undefined);
    },
    [menuId, setOpenMenuId],
  );

  const value = useMemo(
    () => ({
      menuId,
      contentId,
      open,
      setOpen,
      menubarContext,
      triggerRef,
    }),
    [menuId, contentId, open, setOpen, menubarContext],
  );

  return <MenubarMenuProvider value={value}>{children}</MenubarMenuProvider>;
};
MenubarMenu.displayName = 'Menubar.Menu';

//
// * MenubarTrigger
//

/**
 * Trigger button for a menubar dropdown menu.
 *
 * Opens the menu on click, Enter, Space, or ArrowDown.
 * Implements conditional hover: when another menu is open, hovering this
 * trigger automatically opens its menu and closes the other.
 *
 * Must be used within Menubar.Menu.
 *
 * @example
 * ```tsx
 * <Menubar.Menu>
 *   <Menubar.Trigger>File</Menubar.Trigger>
 *   <Menubar.Portal>
 *     <Menubar.Content>...</Menubar.Content>
 *   </Menubar.Portal>
 * </Menubar.Menu>
 *
 * <Menubar.Menu>
 *   <Menubar.Trigger asChild>
 *     <Button variant="text">Edit</Button>
 *   </Menubar.Trigger>
 *   <Menubar.Portal>
 *     <Menubar.Content>...</Menubar.Content>
 *   </Menubar.Portal>
 * </Menubar.Menu>
 * ```
 */
export type MenubarTriggerProps = {
  /** Render as a child element using Radix UI Slot */
  asChild?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'>;

const MenubarTrigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  (
    { asChild, className, children, onClick, onKeyDown, onPointerMove, onPointerDown, onPointerLeave, ...props },
    ref,
  ): ReactElement => {
    const { menuId, contentId, open, setOpen, triggerRef, menubarContext } = useMenubarMenu();
    const { active, setActive, openMenuId, isItemDisabled } = menubarContext;
    const composedRefs = useComposedRefs(ref, triggerRef);
    const isActive = active === menuId;
    const disabled = isItemDisabled(menuId);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        onClick?.(e);
        if (disabled) return;

        // Toggle menu open/closed
        setOpen(!open);
      },
      [disabled, open, setOpen, onClick],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>): void => {
        onKeyDown?.(e);
        if (disabled) return;

        // ArrowDown opens the menu when this trigger is active
        if (e.key === 'ArrowDown' && !open) {
          e.preventDefault();
          setOpen(true);
        }
        // Space and Enter also open/toggle
        else if ((e.key === ' ' || e.key === 'Enter') && !open) {
          e.preventDefault();
          setOpen(true);
        }
      },
      [disabled, open, setOpen, onKeyDown],
    );

    const handlePointerDown = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerDown']>>[0]): void => {
        onPointerDown?.(e);
        if (disabled) return;

        // Set active immediately (same pattern as MenubarButton)
        setActive(menuId);
      },
      [disabled, menuId, onPointerDown, setActive],
    );

    const handlePointerMove = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerMove']>>[0]): void => {
        onPointerMove?.(e);
        if (disabled) return;

        // Always update active state on hover
        setActive(menuId);

        // Conditional hover: if another menu is open, open this one automatically
        if (openMenuId && openMenuId !== menuId) {
          setOpen(true);
        }
      },
      [disabled, openMenuId, menuId, setActive, setOpen, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerLeave']>>[0]): void => {
        onPointerLeave?.(e);
        // Only clear active state if this menu isn't open
        if (!open) {
          setActive(undefined);
        }
      },
      [open, setActive, onPointerLeave],
    );

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRefs}
        id={menuId}
        type={asChild ? undefined : 'button'}
        role='menuitem'
        tabIndex={-1}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        aria-disabled={disabled}
        data-active={isActive || undefined}
        data-disabled={disabled || undefined}
        data-state={open ? 'open' : 'closed'}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn(
          'group px-3 py-2 rounded-sm text-sm cursor-pointer outline-none',
          isActive && 'bg-surface-primary-selected text-alt',
          disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
MenubarTrigger.displayName = 'Menubar.Trigger';

//
// * MenubarPortal
//

/**
 * Portal component that renders menubar dropdown content to document.body.
 *
 * Prevents z-index stacking issues by rendering outside the DOM hierarchy.
 * Only renders when the menu is open unless `forceMount` is true.
 *
 * Must be used within Menubar.Menu.
 *
 * @example
 * ```tsx
 * <Menubar.Menu>
 *   <Menubar.Trigger>File</Menubar.Trigger>
 *   <Menubar.Portal>
 *     <Menubar.Content>
 *       <Menubar.Item>New</Menubar.Item>
 *     </Menubar.Content>
 *   </Menubar.Portal>
 * </Menubar.Menu>
 * ```
 */
export type MenubarPortalProps = {
  /** Custom container element (defaults to document.body) */
  container?: HTMLElement | null;
  /** Keep content mounted in DOM even when menu is closed */
  forceMount?: boolean;
  children?: ReactNode;
};

const MenubarPortal = ({ container, forceMount = false, children }: MenubarPortalProps): ReactElement | null => {
  const { open } = useMenubarMenu();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering portal after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const shouldRender = forceMount || open;
  if (!shouldRender) {
    return null;
  }

  const targetContainer = container ?? document.body;
  return createPortal(<>{children}</>, targetContainer) as ReactElement;
};
MenubarPortal.displayName = 'Menubar.Portal';

//
// * MenubarContent
//

/**
 * Dropdown content container for a menubar menu.
 *
 * Positioned below the trigger with automatic viewport collision detection.
 * Implements vertical keyboard navigation (ArrowUp/Down) within the menu,
 * plus special ArrowLeft/Right handling to navigate between menus.
 *
 * Must be used within Menubar.Portal and Menubar.Menu.
 *
 * @example
 * ```tsx
 * <Menubar.Menu>
 *   <Menubar.Trigger>File</Menubar.Trigger>
 *   <Menubar.Portal>
 *     <Menubar.Content align="start" loop>
 *       <Menubar.Item>New File</Menubar.Item>
 *       <Menubar.Item>Open File</Menubar.Item>
 *       <Menubar.Separator />
 *       <Menubar.Item>Exit</Menubar.Item>
 *     </Menubar.Content>
 *   </Menubar.Portal>
 * </Menubar.Menu>
 * ```
 */
export type MenubarContentProps = {
  /** Horizontal alignment relative to trigger */
  align?: 'start' | 'end';
  /** Whether navigation should loop from last to first item */
  loop?: boolean;
  /** Keep content mounted in DOM even when menu is closed */
  forceMount?: boolean;
  /** Callback when Escape key is pressed */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** Callback when pointer clicks outside the menu */
  onPointerDownOutside?: (event: PointerEvent) => void;
  /** Callback when any outside interaction occurs */
  onInteractOutside?: (event: Event) => void;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const MenubarContent = forwardRef<HTMLDivElement, MenubarContentProps>(
  (
    {
      align = 'start',
      loop = true,
      forceMount = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      className,
      children,
      onKeyDown,
      ...props
    },
    ref,
  ): ReactElement | null => {
    const { menuId, contentId, open, setOpen, triggerRef, menubarContext } = useMenubarMenu();
    const { getItems: getMenubarItems, setActive: setMenubarActive, menubarRef } = menubarContext;
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);

    // Local item registry for menu items
    const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();
    const [active, setActive] = useState<string | undefined>(undefined);
    const [position, setPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);

    // Don't render if menu is closed and not force-mounted
    if (!open && !forceMount) {
      return null;
    }

    // Keyboard navigation for vertical menu items
    const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
      getItems,
      isItemDisabled,
      active,
      setActive,
      loop,
      orientation: 'vertical',
      onSelect: id => {
        // Trigger click on the active item
        const itemElement = document.getElementById(id);
        if (itemElement) {
          itemElement.click();
        }
      },
    });

    const handleKeyDown_ = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        onKeyDown?.(e);

        // Escape closes menu and returns focus to menubar
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          onEscapeKeyDown?.(e as unknown as KeyboardEvent);
          // Focus returns to menubar container
          if (menubarRef?.current) {
            menubarRef.current.focus();
          }
          return;
        }

        // Tab closes menu and exits menubar entirely
        if (e.key === 'Tab') {
          setOpen(false);
          // Don't prevent default - let Tab move focus naturally
          return;
        }

        // ArrowLeft/Right navigate between menus
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const menubarItems = getMenubarItems();
          const currentIndex = menubarItems.indexOf(menuId);

          if (currentIndex === -1) return;

          const nextIndex =
            e.key === 'ArrowRight'
              ? (currentIndex + 1) % menubarItems.length
              : (currentIndex - 1 + menubarItems.length) % menubarItems.length;

          const nextMenuId = menubarItems[nextIndex];

          // Activate next menubar item
          setMenubarActive(nextMenuId);

          // Check if next item is a menu trigger
          const nextElement = document.getElementById(nextMenuId);
          if (nextElement && nextElement.getAttribute('aria-haspopup') === 'menu') {
            // Open next menu (this will close the current menu via MenubarMenu sync effect)
            menubarContext.setOpenMenuId(nextMenuId);
          } else {
            // Next item is a button, close current menu
            setOpen(false);
            // Focus menubar so keyboard navigation continues
            if (menubarRef?.current) {
              menubarRef.current.focus();
            }
          }

          return;
        }

        // Handle vertical navigation
        handleNavKeyDown(e);
      },
      [
        onKeyDown,
        setOpen,
        onEscapeKeyDown,
        menuId,
        getMenubarItems,
        setMenubarActive,
        menubarRef,
        menubarContext,
        handleNavKeyDown,
      ],
    );

    // Auto-focus menu content and first item when menu opens
    // Wait for position to be calculated so element is visible before focusing
    useEffect(() => {
      if (open && position !== null) {
        // Use requestAnimationFrame to ensure DOM has updated with visibility
        requestAnimationFrame(() => {
          if (contentRef.current) {
            contentRef.current.focus();
          }
        });

        const items = getItems();
        const firstSelectableItem = items.find(itemId => !isItemDisabled(itemId));
        if (firstSelectableItem) {
          setActive(firstSelectableItem);
        }
      } else if (!open) {
        setActive(undefined);
      }
    }, [open, position, getItems, isItemDisabled]);

    // Position calculation
    useEffect(() => {
      if (!open || !triggerRef?.current || !contentRef.current) {
        return;
      }

      const updatePosition = (): void => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Needed for resize/scroll event handlers
        if (!triggerRef?.current || !contentRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 10;

        let top = triggerRect.bottom;
        let left: number | undefined;
        let right: number | undefined;

        // Vertical positioning: flip if overflows bottom
        if (top + contentRect.height > viewportHeight - padding) {
          const topPosition = triggerRect.top - contentRect.height;
          if (topPosition >= padding) {
            top = topPosition;
          }
        }

        // Horizontal positioning based on align
        if (align === 'start') {
          left = triggerRect.left;
          // Flip to right if overflows
          if (left + contentRect.width > viewportWidth - padding) {
            left = undefined;
            right = viewportWidth - triggerRect.right;
          }
        } else {
          // align === 'end'
          right = viewportWidth - triggerRect.right;
          // Flip to left if overflows
          if (triggerRect.right - contentRect.width < padding) {
            right = undefined;
            left = triggerRect.left;
          }
        }

        setPosition({ top, left, right });
      };

      updatePosition();

      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }, [open, align, triggerRef]);

    // Handle click outside to close menu
    useEffect(() => {
      if (!open) return;

      const handlePointerDown = (e: PointerEvent): void => {
        const target = e.target as Node;

        // Don't close if clicking the trigger
        if (triggerRef?.current?.contains(target)) {
          return;
        }

        // Don't close if clicking inside the content
        if (contentRef.current?.contains(target)) {
          return;
        }

        // Clicked outside - close menu
        onPointerDownOutside?.(e);
        onInteractOutside?.(e);
        setOpen(false);
      };

      document.addEventListener('pointerdown', handlePointerDown);
      return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [open, setOpen, onPointerDownOutside, onInteractOutside, triggerRef]);

    const contentContextValue = useMemo(
      () => ({
        registerItem,
        unregisterItem,
        getItems,
        isItemDisabled,
        active,
        setActive,
      }),
      [registerItem, unregisterItem, getItems, isItemDisabled, active, setActive],
    );

    // Render hidden initially to get dimensions, then show with calculated position
    const isPositioned = position !== null;

    return (
      <MenubarContentContext.Provider value={contentContextValue}>
        <div
          ref={composedRefs}
          id={contentId}
          role='menu'
          aria-orientation='vertical'
          aria-activedescendant={active}
          aria-labelledby={menuId}
          tabIndex={-1}
          data-state={open ? 'open' : 'closed'}
          data-align={align}
          style={{
            position: 'fixed',
            top: position ? `${position.top}px` : '0',
            left: position?.left !== undefined ? `${position.left}px` : undefined,
            right: position?.right !== undefined ? `${position.right}px` : undefined,
            zIndex: 9999,
            visibility: isPositioned ? 'visible' : 'hidden',
          }}
          className={cn(
            'min-w-48 bg-surface-neutral border border-bdr-subtle rounded-md p-1 shadow-lg',
            'focus:outline-none',
            className,
          )}
          onKeyDown={handleKeyDown_}
          {...props}
        >
          {children}
        </div>
      </MenubarContentContext.Provider>
    );
  },
);
MenubarContent.displayName = 'Menubar.Content';

//
// * MenubarItem
//

/**
 * An interactive item within a menubar dropdown menu.
 *
 * Supports keyboard navigation, hover effects, and the onSelect callback.
 * Automatically closes the menu when selected.
 *
 * Must be used within Menubar.Content.
 *
 * @example
 * ```tsx
 * <Menubar.Content>
 *   <Menubar.Item onSelect={() => console.log('New file')}>
 *     New File
 *   </Menubar.Item>
 *   <Menubar.Item disabled>
 *     Save (disabled)
 *   </Menubar.Item>
 *   <Menubar.Item asChild>
 *     <a href="/export">Export</a>
 *   </Menubar.Item>
 * </Menubar.Content>
 * ```
 */
export type MenubarItemProps = {
  /** Unique ID for this item (auto-generated if not provided) */
  id?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Callback when the item is selected (clicked or activated via keyboard) */
  onSelect?: (event: Event) => void;
  /** Render as a child element using Radix UI Slot */
  asChild?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'children'>;

const MenubarItem = forwardRef<HTMLDivElement, MenubarItemProps>(
  (
    {
      id: providedId,
      disabled = false,
      onSelect,
      asChild,
      className,
      children,
      onClick,
      onPointerMove,
      onPointerLeave,
      ...props
    },
    ref,
  ): ReactElement => {
    const id = usePrefixedId(providedId, 'menubar-item');
    const { registerItem, unregisterItem, active, setActive } = useMenubarContent();
    const { setOpen, menubarContext } = useMenubarMenu();
    const isActive = active === id;

    useEffect(() => {
      registerItem(id, disabled);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        onClick?.(e);
        if (disabled) return;

        const event = new Event('select', { bubbles: true, cancelable: true });
        onSelect?.(event);

        // Close menu after selection
        setOpen(false);

        // Return focus to menubar so user can continue navigating
        if (menubarContext.menubarRef?.current) {
          menubarContext.menubarRef.current.focus();
        }
      },
      [disabled, onClick, onSelect, setOpen, menubarContext],
    );

    const handlePointerMove = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerMove']>>[0]): void => {
        onPointerMove?.(e);
        if (!disabled) {
          setActive(id);
        }
      },
      [disabled, id, setActive, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerLeave']>>[0]): void => {
        onPointerLeave?.(e);
        setActive(undefined);
      },
      [setActive, onPointerLeave],
    );

    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={ref}
        id={id}
        role='menuitem'
        tabIndex={-1}
        aria-disabled={disabled}
        data-active={isActive || undefined}
        data-disabled={disabled || undefined}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn(
          'group px-3 py-2 rounded-sm text-sm cursor-pointer outline-none',
          isActive && 'bg-surface-primary-selected text-alt',
          disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
          className,
        )}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
MenubarItem.displayName = 'Menubar.Item';

//
// * MenubarLabel
//

/**
 * A non-interactive label for grouping items within a menubar dropdown.
 *
 * Used to provide section headings or context within the menu.
 * Does not participate in keyboard navigation.
 *
 * Must be used within Menubar.Content.
 *
 * @example
 * ```tsx
 * <Menubar.Content>
 *   <Menubar.Label>File Operations</Menubar.Label>
 *   <Menubar.Item>New</Menubar.Item>
 *   <Menubar.Item>Open</Menubar.Item>
 *   <Menubar.Separator />
 *   <Menubar.Label>Recent Files</Menubar.Label>
 *   <Menubar.Item>Document.txt</Menubar.Item>
 * </Menubar.Content>
 * ```
 */
export type MenubarLabelProps = {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const MenubarLabel = forwardRef<HTMLDivElement, MenubarLabelProps>(
  ({ className, children, ...props }, ref): ReactElement => {
    return (
      <div ref={ref} role='none' className={cn('px-3 py-1.5 text-xs font-semibold text-subtle', className)} {...props}>
        {children}
      </div>
    );
  },
);
MenubarLabel.displayName = 'Menubar.Label';

export const Menubar = Object.assign(MenubarRoot, {
  Root: MenubarRoot,
  Nav: MenubarNav,
  Content: MenubarContent, // Dropdown menu content (context-aware via MenubarMenu)
  Button: MenubarButton,
  Separator: MenubarSeparator,
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Portal: MenubarPortal,
  Item: MenubarItem,
  Label: MenubarLabel,
});
