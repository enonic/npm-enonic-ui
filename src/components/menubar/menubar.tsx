import { useItemRegistry, useKeyboardNavigation } from '@/hooks';
import { type MenubarContextValue, MenubarProvider, useMenubar, usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';
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
// * MenubarContent
//

/**
 * Container component that renders the menubar element with keyboard navigation.
 *
 * Implements horizontal arrow key navigation (ArrowLeft/Right), Home/End keys,
 * and Tab key to exit the menubar.
 *
 * @example
 * ```tsx
 * <Menubar.Content aria-label="Main menu" loop>
 *   <Menubar.Button>File</Menubar.Button>
 *   <Menubar.Button>Edit</Menubar.Button>
 * </Menubar.Content>
 * ```
 */
export type MenubarContentProps = {
  /** Accessible label for the menubar (required for screen readers) */
  'aria-label': string;
  /** Whether navigation should loop from last to first item */
  loop?: boolean;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const MenubarContent = forwardRef<HTMLDivElement, MenubarContentProps>(
  (
    { 'aria-label': ariaLabel, loop = true, className, children, onKeyDown, onFocus, onBlur, ...props },
    ref,
  ): ReactElement => {
    const { active, setActive, getItems, isItemDisabled, menubarId, menubarRef } = useMenubar();
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
        handleNavKeyDown(e);
      },
      [onKeyDown, handleNavKeyDown],
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
          // If focus is staying within menubar (e.g., moved to open menu), keep active state
          if (menubarRef.current.contains(relatedTarget)) {
            return;
          }
        }

        // Focus is leaving menubar entirely - reset active state
        setActive(undefined);
      },
      [onBlur, setActive, menubarRef],
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
MenubarContent.displayName = 'Menubar.Content';

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
 * A visual separator between menubar items.
 *
 * Does not participate in keyboard navigation (purely decorative).
 *
 * @example
 * ```tsx
 * <Menubar.Content aria-label="Actions">
 *   <Menubar.Button>File</Menubar.Button>
 *   <Menubar.Separator />
 *   <Menubar.Button>Edit</Menubar.Button>
 * </Menubar.Content>
 * ```
 */
export type MenubarSeparatorProps = {
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const MenubarSeparator = forwardRef<HTMLDivElement, MenubarSeparatorProps>(
  ({ className, ...props }, ref): ReactElement => {
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
// * MenubarMenu (Phase 2 stub)
//

/**
 * Wrapper for integrating Menu component within a Menubar.
 *
 * **Phase 2**: This is currently a stub component. Future implementation will:
 * - Register the menu trigger as a menubar item
 * - Enable ArrowDown to open the menu
 * - Enable ArrowLeft/Right to navigate between menus
 * - Close menu when Tab is pressed
 * - Coordinate focus between menubar and menu contexts
 *
 * @phase2
 * @example
 * ```tsx
 * <Menubar.Menu>
 *   <Menu.Trigger>File</Menu.Trigger>
 *   <Menu.Portal>
 *     <Menu.Content>
 *       <Menu.Item>New</Menu.Item>
 *       <Menu.Item>Open</Menu.Item>
 *     </Menu.Content>
 *   </Menu.Portal>
 * </Menubar.Menu>
 * ```
 */
export type MenubarMenuProps = {
  /** Unique ID for this menu within the menubar */
  id?: string;
  children?: ReactNode;
};

const MenubarMenu = ({ id: _providedId, children }: MenubarMenuProps): ReactElement => {
  // TODO Phase 2: Implement menu integration
  // 1. Generate unique ID: usePrefixedId(providedId, 'menubar-menu')
  // 2. Register with menubar: registerItem(id, false)
  // 3. Track open state and sync with menubar.openMenuId
  // 4. Provide MenubarMenuContext to enhance Menu.Trigger and Menu.Content behavior
  // 5. Handle ArrowDown to open, ArrowLeft/Right to navigate, Tab to exit

  return <>{children}</>;
};
MenubarMenu.displayName = 'Menubar.Menu';

export const Menubar = Object.assign(MenubarRoot, {
  Root: MenubarRoot,
  Content: MenubarContent,
  Button: MenubarButton,
  Separator: MenubarSeparator,
  Menu: MenubarMenu,
});
