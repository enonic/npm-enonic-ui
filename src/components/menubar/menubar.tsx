import { Slot } from '@radix-ui/react-slot';
import { Circle, CircleDot } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
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
  useFloatingPosition,
  useItemRegistry,
  useKeyboardNavigation,
  usePortalFocusContainer,
  useRovingTabIndex,
  useScrollActiveIntoView,
} from '@/hooks';
import {
  MenuPrimitiveLabel,
  type MenuPrimitiveLabelProps,
  menuItemVariants,
  menuRadioItemVariants,
} from '@/primitives/menu-primitive';
import {
  type MenubarContextValue,
  MenubarMenuProvider,
  MenubarProvider,
  useMenubar,
  useMenubarMenu,
  usePrefixedId,
} from '@/providers';
import { cn, useComposedRefs } from '@/utils';

//
// * MenubarContentContext (internal)
//

type MenubarContentContextValue = {
  registerItem: (id: string, disabled?: boolean, element?: HTMLElement | null) => void;
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

  // Track which menu (if any) is currently open for dropdown integration
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
  ({ 'aria-label': ariaLabel, loop = true, className, children, onKeyDown, onBlur, ...props }, ref): ReactElement => {
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
        const isActionKey = e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ';
        if (isActionKey && active) {
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

    useScrollActiveIntoView({
      containerRef: menubarRef,
      activeId: active,
      orientation: 'horizontal',
    });

    return (
      <div
        ref={composedRefs}
        id={menubarId}
        role='menubar'
        aria-label={ariaLabel}
        aria-orientation='horizontal'
        tabIndex={-1}
        className={cn('flex items-center gap-1.5 p-1.5', className)}
        onKeyDown={handleKeyDown_}
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
      onFocus,
      ...props
    },
    ref,
  ): ReactElement => {
    const id = usePrefixedId(providedId, 'menubar-button');
    const { active, setActive, registerItem, unregisterItem, openMenuId, getItems, isItemDisabled } = useMenubar();
    const isActive = active === id;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const composedRefs = useComposedRefs(ref, buttonRef);

    useEffect(() => {
      registerItem(id, disabled, buttonRef.current);
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
        // Conditional hover: activate button when another menu is open and mouse enters
        if (!disabled && openMenuId && active !== undefined) {
          setActive(id);
        }
      },
      [disabled, openMenuId, setActive, active, id, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerLeave']>>[0]): void => {
        onPointerLeave?.(e);
        // Clear active state unless a menu is open or button has focus
        if ((!openMenuId || openMenuId !== id) && document.activeElement !== buttonRef.current) {
          setActive(undefined);
        }
      },
      [openMenuId, id, setActive, onPointerLeave],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLButtonElement>): void => {
        onFocus?.(e);
        if (disabled) return;
        setActive(id);
      },
      [onFocus, disabled, setActive, id],
    );

    const { tabIndex } = useRovingTabIndex({
      id,
      active,
      disabled,
      getItems,
      isItemDisabled,
    });

    useActiveItemFocus({
      ref: buttonRef,
      isActive,
      disabled,
    });

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRefs}
        id={id}
        role='menuitem'
        tabIndex={tabIndex}
        disabled={disabled}
        aria-disabled={disabled}
        data-disabled={disabled || undefined}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn(
          'group cursor-pointer rounded-sm px-4.5 py-2.5 text-sm outline-none',
          'focus-visible:ring-3 focus-visible:ring-ring',
          'focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset',
          className,
        )}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        {...(!asChild && { type: 'button' })}
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
        className={cn('mx-1 h-4 w-px bg-bdr-subtle', className)}
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
    registerItem(menuId, disabled, triggerRef.current);
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
    {
      asChild,
      className,
      children,
      onClick,
      onKeyDown,
      onPointerMove,
      onPointerDown,
      onPointerLeave,
      onFocus,
      ...props
    },
    ref,
  ): ReactElement => {
    const { menuId, contentId, open, setOpen, triggerRef, menubarContext } = useMenubarMenu();
    const { active, setActive, openMenuId, isItemDisabled, getItems } = menubarContext;
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

        // If nothing is active, don't set active state
        if (active === undefined) return;

        // Always update active state on hover
        setActive(menuId);

        // Conditional hover: if another menu is open, open this one automatically
        if (openMenuId && openMenuId !== menuId) {
          setOpen(true);
        }
      },
      [disabled, openMenuId, menuId, active, setActive, setOpen, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'button'>['onPointerLeave']>>[0]): void => {
        onPointerLeave?.(e);
        // Only clear active state if this menu isn't open
        if (!open && document.activeElement !== triggerRef?.current) {
          setActive(undefined);
        }
      },
      [open, setActive, onPointerLeave, triggerRef],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLButtonElement>): void => {
        onFocus?.(e);
        if (disabled) return;
        setActive(menuId);
      },
      [onFocus, disabled, setActive, menuId],
    );

    const { tabIndex } = useRovingTabIndex({
      id: menuId,
      active,
      disabled,
      getItems,
      isItemDisabled,
    });

    useActiveItemFocus({
      ref: triggerRef,
      isActive,
      disabled,
    });

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRefs}
        id={menuId}
        role='menuitem'
        tabIndex={tabIndex}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        aria-disabled={disabled}
        data-active={open}
        data-disabled={disabled || undefined}
        data-state={open ? 'open' : 'closed'}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn(
          'group cursor-pointer rounded-sm px-4.5 py-2.5 text-sm outline-none',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-3 focus-visible:ring-offset-ring-offset data-[tone=inverse]:focus-visible:ring-ring-alt data-[tone=inverse]:focus-visible:ring-offset-ring-offset-alt',
          open && 'bg-btn-active text-alt',
          disabled && 'pointer-events-none cursor-not-allowed opacity-30',
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        {...(!asChild && { type: 'button' })}
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
  return createPortal(children, targetContainer) as ReactElement;
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
  onEscapeKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
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
    const { getItems: getMenubarItems, setActive: setMenubarActive } = menubarContext;
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);
    const [isPortalMode, setIsPortalMode] = useState(false);

    // Local item registry for menu items
    const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();
    const [active, setActive] = useState<string | undefined>(undefined);
    const position = useFloatingPosition({
      enabled: open,
      triggerRef: triggerRef as React.RefObject<HTMLElement>,
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

        // Escape closes menu and returns focus to the trigger
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          onEscapeKeyDown?.(e);
          triggerRef?.current?.focus();
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

          const direction = e.key === 'ArrowRight' ? 1 : -1;
          let nextIndex = (currentIndex + direction + menubarItems.length) % menubarItems.length;
          let attempts = 0;

          let nextItem = menubarItems[nextIndex];
          while (attempts < menubarItems.length && nextItem && menubarContext.isItemDisabled(nextItem)) {
            nextIndex = (nextIndex + direction + menubarItems.length) % menubarItems.length;
            nextItem = menubarItems[nextIndex];
            attempts += 1;
          }

          const nextMenuId = menubarItems[nextIndex];
          if (!nextMenuId || menubarContext.isItemDisabled(nextMenuId)) {
            return;
          }

          // Activate next menubar item
          setMenubarActive(nextMenuId);

          // Check if next item is a menu trigger
          const nextElement = document.getElementById(nextMenuId);
          nextElement?.focus();
          if (nextElement && nextElement.getAttribute('aria-haspopup') === 'menu') {
            // Open next menu (this will close the current menu via MenubarMenu sync effect)
            menubarContext.setOpenMenuId(nextMenuId);
          } else {
            // Next item is a button, close current menu
            setOpen(false);
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
        menubarContext,
        handleNavKeyDown,
        triggerRef,
      ],
    );

    // Select first non-disabled item when menu opens
    useEffect(() => {
      if (open && position !== null) {
        const items = getItems();
        const firstItem = items.length > 0 ? items[0] : undefined;
        const firstSelectableItem = items.find(itemId => !isItemDisabled(itemId)) ?? firstItem;
        if (firstSelectableItem) {
          setActive(firstSelectableItem);
        }
      } else if (!open) {
        setActive(undefined);
      }
    }, [open, position, getItems, isItemDisabled]);

    useClickOutside({
      enabled: open,
      contentRef,
      excludeRefs: [triggerRef as React.RefObject<HTMLElement>],
      onPointerDownOutside,
      onInteractOutside,
      onClose: () => setOpen(false),
    });

    const contentContextValue = useMemo(
      () => ({
        registerItem,
        unregisterItem,
        getItems,
        isItemDisabled,
        active,
        setActive,
      }),
      [registerItem, unregisterItem, getItems, isItemDisabled, active],
    );

    // Don't render if menu is closed and not force-mounted
    if (!open && !forceMount) {
      return null;
    }

    return (
      <MenubarContentContext.Provider value={contentContextValue}>
        <div
          ref={composedRefs}
          id={contentId}
          role='menu'
          aria-orientation='vertical'
          aria-labelledby={menuId}
          tabIndex={-1}
          data-state={open ? 'open' : 'closed'}
          data-align={align}
          className={cn(
            'fixed z-40 mt-2 flex w-fit flex-col items-start gap-y-1 overflow-hidden p-1',
            'rounded-sm border border-bdr-subtle bg-surface-neutral shadow-lg outline-none',
            // Animations
            'data-[state=closed]:animate-out data-[state=open]:animate-in',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            !position && 'invisible',
            className,
          )}
          style={{ ...position }}
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
 *
 * @remarks
 * When using `asChild`, do not set the `disabled` prop on the child component.
 * The `Menubar.Item`'s `disabled` prop should be the single source of truth.
 * Due to Radix UI Slot's prop merging behavior, child props can override parent props.
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
      onFocus,
      ...props
    },
    ref,
  ): ReactElement => {
    const id = usePrefixedId(providedId, 'menubar-item');
    const { registerItem, unregisterItem, active, setActive, getItems, isItemDisabled } = useMenubarContent();
    const { setOpen, triggerRef } = useMenubarMenu();
    const isActive = active === id;
    const itemRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, itemRef);

    useEffect(() => {
      registerItem(id, disabled, itemRef.current);
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

        // Return focus to trigger so user can continue navigating
        triggerRef?.current?.focus();
      },
      [disabled, onClick, onSelect, setOpen, triggerRef],
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
        if (document.activeElement !== itemRef.current) {
          setActive(undefined);
        }
      },
      [setActive, onPointerLeave],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        onFocus?.(e);
        if (disabled) return;
        setActive(id);
      },
      [onFocus, disabled, setActive, id],
    );

    const { tabIndex } = useRovingTabIndex({
      id,
      active,
      disabled,
      getItems,
      isItemDisabled,
    });

    useActiveItemFocus({
      ref: itemRef,
      isActive,
      disabled,
    });

    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRefs}
        id={id}
        role='menuitem'
        tabIndex={tabIndex}
        disabled={disabled}
        aria-disabled={disabled}
        data-active={isActive || undefined}
        data-disabled={disabled || undefined}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn(menuItemVariants({ active: isActive, disabled }), className)}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
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
export type MenubarLabelProps = MenuPrimitiveLabelProps;

const MenubarLabel = forwardRef<HTMLDivElement, MenubarLabelProps>((props, ref): ReactElement => {
  return <MenuPrimitiveLabel ref={ref} {...props} />;
});
MenubarLabel.displayName = 'Menubar.Label';

//
// * RadioGroup Context
//

type RadioGroupContextValue = {
  value: string | undefined;
  setValue: (value: string) => void;
  closeOnSelect: boolean;
};

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

const useRadioGroup = (): RadioGroupContextValue => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroup components must be used within a RadioGroup');
  }
  return context;
};

//
// * MenubarRadioGroup
//

/**
 * Radio group container for menubar dropdown menus.
 *
 * Manages mutual exclusion state for radio items. Only one radio item
 * within a group can be checked at a time.
 *
 * Must be used within Menubar.Content.
 *
 * @example
 * ```tsx
 * <Menubar.Content>
 *   <Menubar.Label>Text Size</Menubar.Label>
 *   <Menubar.RadioGroup value={size} onValueChange={setSize}>
 *     <Menubar.RadioItem value="small">
 *       <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
 *       Small
 *     </Menubar.RadioItem>
 *     <Menubar.RadioItem value="large">
 *       <Menubar.ItemIndicator>•</Menubar.ItemIndicator>
 *       Large
 *     </Menubar.RadioItem>
 *   </Menubar.RadioGroup>
 * </Menubar.Content>
 * ```
 */
export type MenubarRadioGroupProps = {
  /** Controlled selected value */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Callback when selection changes */
  onValueChange?: (value: string) => void;
  /** Whether to close the menu after a radio item is selected */
  closeOnSelect?: boolean;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const MenubarRadioGroup = forwardRef<HTMLDivElement, MenubarRadioGroupProps>(
  (
    { value: controlledValue, defaultValue, onValueChange, closeOnSelect = false, className, children, ...props },
    ref,
  ): ReactElement => {
    const [value, setValue] = useState<string | undefined>(controlledValue ?? defaultValue);

    // Sync controlled value
    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleSetValue = useCallback(
      (newValue: string) => {
        if (controlledValue === undefined) {
          setValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [controlledValue, onValueChange],
    );

    const contextValue: RadioGroupContextValue = useMemo(
      () => ({
        value,
        setValue: handleSetValue,
        closeOnSelect,
      }),
      [value, handleSetValue, closeOnSelect],
    );

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div ref={ref} role='group' className={cn('relative flex w-full flex-col gap-y-1', className)} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
MenubarRadioGroup.displayName = 'Menubar.RadioGroup';

//
// * MenubarRadioItem
//

/**
 * A radio item within a menubar dropdown menu.
 *
 * Works with Menubar.RadioGroup to provide mutual exclusion.
 * Unlike regular items, radio items do NOT close the menu when selected,
 * allowing users to see their selection state.
 *
 * Must be used within Menubar.RadioGroup and Menubar.Content.
 *
 * @example
 * ```tsx
 * <Menubar.RadioGroup value={view} onValueChange={setView}>
 *   <Menubar.RadioItem value="grid">
 *     <Menubar.ItemIndicator>
 *       <CheckIcon />
 *     </Menubar.ItemIndicator>
 *     Grid View
 *   </Menubar.RadioItem>
 *   <Menubar.RadioItem value="list">
 *     <Menubar.ItemIndicator>
 *       <CheckIcon />
 *     </Menubar.ItemIndicator>
 *     List View
 *   </Menubar.RadioItem>
 * </Menubar.RadioGroup>
 * ```
 */
export type MenubarRadioItemProps = {
  /** Unique ID for this item (auto-generated if not provided) */
  id?: string;
  /** Value identifier for this radio option (required) */
  value: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Callback when the item is selected (optional) */
  onSelect?: (event: Event) => void;
  /** Render as a child element using Radix UI Slot */
  asChild?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'children'>;

const MenubarRadioItem = forwardRef<HTMLDivElement, MenubarRadioItemProps>(
  (
    {
      id: providedId,
      value,
      disabled = false,
      onSelect,
      asChild,
      className,
      children,
      onClick,
      onPointerMove,
      onPointerLeave,
      onFocus,
      onKeyDown,
      ...props
    },
    ref,
  ): ReactElement => {
    const id = usePrefixedId(providedId, 'menubar-radio-item');
    const { registerItem, unregisterItem, active, setActive, getItems, isItemDisabled } = useMenubarContent();
    const { setOpen, triggerRef } = useMenubarMenu();
    const { value: selectedValue, setValue, closeOnSelect } = useRadioGroup();
    const isActive = active === id;
    const isChecked = selectedValue === value;
    const itemRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, itemRef);

    useEffect(() => {
      registerItem(id, disabled, itemRef.current);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        onClick?.(e);
        if (disabled) return;

        setValue(value);
        const event = new Event('select', { bubbles: true, cancelable: true });
        onSelect?.(event);

        // Close menu if closeOnSelect is true
        if (closeOnSelect) {
          setOpen(false);
          // Return focus to trigger so user can continue navigating
          triggerRef?.current?.focus();
        }
      },
      [disabled, value, setValue, onClick, onSelect, closeOnSelect, setOpen, triggerRef],
    );

    const handleKeyDown_ = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        onKeyDown?.(e);
        // Space/Enter key selects the radio item
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!disabled) {
            setValue(value);
            const event = new Event('select', { bubbles: true, cancelable: true });
            onSelect?.(event);

            // Close menu if closeOnSelect is true
            if (closeOnSelect) {
              setOpen(false);
              // Return focus to trigger so user can continue navigating
              triggerRef?.current?.focus();
            }
          }
        }
      },
      [disabled, value, setValue, onKeyDown, onSelect, closeOnSelect, setOpen, triggerRef],
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
        if (document.activeElement !== itemRef.current) {
          setActive(undefined);
        }
      },
      [setActive, onPointerLeave],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        onFocus?.(e);
        if (disabled) return;
        setActive(id);
      },
      [onFocus, disabled, setActive, id],
    );

    const { tabIndex } = useRovingTabIndex({
      id,
      active,
      disabled,
      getItems,
      isItemDisabled,
    });

    useActiveItemFocus({
      ref: itemRef,
      isActive,
      disabled,
    });

    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        // @ts-expect-error - Preact's ForwardedRef type is incompatible with Radix UI Slot's expected ref type
        ref={composedRefs}
        id={id}
        role='menuitemradio'
        tabIndex={tabIndex}
        aria-checked={isChecked}
        aria-disabled={disabled}
        data-active={isActive || undefined}
        data-disabled={disabled || undefined}
        data-state={isChecked ? 'checked' : 'unchecked'}
        data-tone={isActive ? 'inverse' : undefined}
        className={cn('group', menuRadioItemVariants({ active: isActive, disabled, checked: isChecked }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown_}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
MenubarRadioItem.displayName = 'Menubar.RadioItem';

//
// * MenubarItemIndicator
//

/**
 * Indicator component that conditionally renders when its parent radio item is checked.
 *
 * Used within Menubar.RadioItem to display visual feedback for selection state.
 * Only renders when inside a RadioGroup context.
 *
 * Must be used within Menubar.RadioItem.
 *
 * @example
 * ```tsx
 * <Menubar.RadioItem value="option">
 *   <Menubar.ItemIndicator>
 *     <CheckIcon />
 *   </Menubar.ItemIndicator>
 *   Option Label
 * </Menubar.RadioItem>
 * ```
 */
export type MenubarItemIndicatorProps = {
  /** Force mount the indicator even when unchecked (for animation purposes) */
  forceMount?: boolean;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'span'>;

const MenubarItemIndicator = forwardRef<HTMLSpanElement, MenubarItemIndicatorProps>(
  ({ forceMount, className, children, ...props }, ref): ReactElement | null => {
    const radioContext = useContext(RadioGroupContext);

    // If not within a RadioGroup, don't render (could extend for CheckboxItem later)
    if (!radioContext) {
      return null;
    }

    // If no children provided, use default Circle/CircleDot icons
    // The parent RadioItem has data-state attribute that controls which icon shows
    const defaultContent = (
      <>
        <Circle strokeWidth={1.5} className='size-3.5 group-data-[state=checked]:hidden' />
        <CircleDot
          strokeWidth={1.5}
          className='size-3.5 group-data-[state=unchecked]:hidden [&>circle:last-child]:origin-center [&>circle:last-child]:scale-[3.75] [&>circle:last-child]:fill-current'
        />
      </>
    );

    return (
      <span ref={ref} data-indicator className={cn('inline-flex items-center justify-center', className)} {...props}>
        {children ?? defaultContent}
      </span>
    );
  },
);
MenubarItemIndicator.displayName = 'Menubar.ItemIndicator';

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
  RadioGroup: MenubarRadioGroup,
  RadioItem: MenubarRadioItem,
  ItemIndicator: MenubarItemIndicator,
});
