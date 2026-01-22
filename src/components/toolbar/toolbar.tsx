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
import {
  useActiveItemFocus,
  useItemRegistry,
  useKeyboardNavigation,
  useRovingTabIndex,
  useScrollActiveIntoView,
} from '@/hooks';
import { usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';

import { ToolbarToggleGroup, ToolbarToggleItem } from './toolbar-toggle-group';

//
// * ToolbarContext
//

export type ToolbarContextValue = {
  toolbarId: string;
  toolbarRef: React.RefObject<HTMLDivElement>;
  active: string | undefined;
  setActive: (id: string | undefined) => void;
  registerItem: (id: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  getItems: () => string[];
  isItemDisabled: (id: string) => boolean;
  orientation: 'horizontal' | 'vertical';
  loop: boolean;
};

const ToolbarContext = createContext<ToolbarContextValue | undefined>(undefined);

export function useToolbar(): ToolbarContextValue {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('Toolbar components must be used within Toolbar.Root');
  }
  return context;
}

/**
 * Hook to optionally access Toolbar context.
 * Returns undefined if not within a Toolbar, allowing components to adapt their behavior.
 */
export function useToolbarOptional(): ToolbarContextValue | undefined {
  return useContext(ToolbarContext);
}

//
// * Toolbar.Root
//

/**
 * Root component that provides context for the Toolbar.
 *
 * Implements the ARIA toolbar pattern for grouping controls.
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/}
 *
 * @example
 * ```tsx
 * <Toolbar.Root orientation="horizontal">
 *   <Toolbar.Container aria-label="Text formatting">
 *     <Toolbar.Item asChild>
 *       <Button>Cut</Button>
 *     </Toolbar.Item>
 *   </Toolbar.Container>
 * </Toolbar.Root>
 * ```
 */
export type ToolbarRootProps = {
  /** Default active item ID on initial render */
  defaultActive?: string;
  /** Callback when active item changes */
  onActiveChange?: (active: string | undefined) => void;
  /** Base ID for generating unique IDs */
  id?: string;
  /** Orientation of toolbar navigation */
  orientation?: 'horizontal' | 'vertical';
  /** Whether navigation should loop from last to first item */
  loop?: boolean;
  children?: ReactNode;
};

const ToolbarRoot = ({
  defaultActive,
  onActiveChange,
  id,
  orientation = 'horizontal',
  loop = true,
  children,
}: ToolbarRootProps): ReactElement => {
  const toolbarId = usePrefixedId(id, 'toolbar');
  const toolbarRef = useRef<HTMLDivElement>(null);

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

  const value: ToolbarContextValue = useMemo(
    () => ({
      toolbarId,
      toolbarRef,
      active,
      setActive,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      orientation,
      loop,
    }),
    [toolbarId, active, setActive, registerItem, unregisterItem, getItems, isItemDisabled, orientation, loop],
  );

  return <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>;
};
ToolbarRoot.displayName = 'Toolbar.Root';

//
// * Toolbar.Container
//

/**
 * Container component that renders the toolbar element with keyboard navigation.
 *
 * Implements arrow key navigation (based on orientation), Home/End keys,
 * and Tab key to enter/exit the toolbar.
 *
 * Uses a thinner focus ring (ring-1) compared to menubar (ring-3).
 *
 * @example
 * ```tsx
 * <Toolbar.Container aria-label="Actions" loop>
 *   <Toolbar.Item asChild><Button>Cut</Button></Toolbar.Item>
 *   <Toolbar.Item asChild><Button>Copy</Button></Toolbar.Item>
 * </Toolbar.Container>
 * ```
 */
export type ToolbarContainerProps = {
  /** Accessible label for the toolbar (required for screen readers) */
  'aria-label': string;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const ToolbarContainer = forwardRef<HTMLDivElement, ToolbarContainerProps>(
  ({ 'aria-label': ariaLabel, className, children, onKeyDown, onBlur, ...props }, ref): ReactElement => {
    const { active, setActive, getItems, isItemDisabled, toolbarId, toolbarRef, orientation, loop } = useToolbar();
    const composedRefs = useComposedRefs(ref, toolbarRef);

    const { handleKeyDown: handleNavKeyDown } = useKeyboardNavigation({
      getItems,
      isItemDisabled,
      active,
      setActive,
      loop,
      orientation,
      onSelect: id => {
        // Trigger click on the active item
        const itemElement = document.getElementById(id);
        if (itemElement) {
          // For button elements, use click()
          if (itemElement instanceof HTMLButtonElement) {
            itemElement.click();
          } else {
            // For other elements, dispatch a click event to trigger handlers
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            itemElement.dispatchEvent(clickEvent);
          }
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

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>): void => {
        onBlur?.(e);

        // Check if focus is leaving the toolbar structure entirely
        const relatedTarget = e.relatedTarget;
        if (toolbarRef.current && relatedTarget instanceof Node) {
          // If focus is staying within toolbar, keep active state
          if (toolbarRef.current.contains(relatedTarget)) {
            return;
          }
        }

        // Focus is leaving toolbar entirely - reset active state
        setActive(undefined);
      },
      [onBlur, setActive, toolbarRef],
    );

    useScrollActiveIntoView({
      containerRef: toolbarRef,
      activeId: active,
      orientation,
    });

    return (
      <div
        ref={composedRefs}
        id={toolbarId}
        role='toolbar'
        aria-label={ariaLabel}
        aria-orientation={orientation}
        tabIndex={-1}
        className={cn(
          'flex items-center gap-1.5 p-2 transition-highlight',
          // Thinner focus ring compared to menubar
          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/25 has-[:focus-visible]:ring-inset',
          orientation === 'vertical' && 'flex-col',
          className,
        )}
        onKeyDown={handleKeyDown_}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ToolbarContainer.displayName = 'Toolbar.Container';

//
// * Toolbar.Item
//

/**
 * A generic wrapper for any component to integrate with toolbar navigation.
 *
 * Uses Radix UI Slot for composition, allowing you to wrap any focusable
 * component (Button, Toggle, custom elements) while maintaining toolbar navigation.
 *
 * Implements roving tabindex and active state management.
 *
 * @example
 * ```tsx
 * <Toolbar.Item asChild>
 *   <Button>Save</Button>
 * </Toolbar.Item>
 *
 * <Toolbar.Item asChild>
 *   <Toggle pressed={bold} onPressedChange={setBold}>
 *     Bold
 *   </Toggle>
 * </Toolbar.Item>
 *
 * <Toolbar.Item disabled>
 *   <Button>Export</Button>
 * </Toolbar.Item>
 * ```
 *
 * @remarks
 * When using `asChild`, do not set the `disabled` prop on the child component.
 * The `Toolbar.Item`'s `disabled` prop should be the single source of truth.
 * Due to Radix UI Slot's prop merging behavior, child props can override parent props.
 */
export type ToolbarItemProps = {
  /** Unique ID for this item (auto-generated if not provided) */
  id?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Render as a child element using Radix UI Slot */
  asChild?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'children'>;

const ToolbarItem = forwardRef<HTMLDivElement, ToolbarItemProps>(
  (
    { id: providedId, disabled = false, asChild, children, onPointerMove, onPointerDown, onFocus, ...props },
    ref,
  ): ReactElement => {
    const id = usePrefixedId(providedId, 'toolbar-item');
    const { active, setActive, registerItem, unregisterItem, getItems, isItemDisabled } = useToolbar();
    const isActive = active === id;
    const itemRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, itemRef);

    useEffect(() => {
      // Register item in DOM order (useEffect runs in render order)
      registerItem(id, disabled);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem]);

    const handlePointerDown = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerDown']>>[0]): void => {
        onPointerDown?.(e);
        if (disabled) return;

        // Set active immediately to prevent handleFocus from auto-activating first item
        setActive(id);
      },
      [disabled, id, onPointerDown, setActive],
    );

    const handlePointerMove = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerMove']>>[0]): void => {
        onPointerMove?.(e);
        // Don't set active on hover - focus should not follow the mouse
      },
      [onPointerMove],
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
        tabIndex={tabIndex}
        disabled={disabled}
        aria-disabled={disabled}
        data-disabled={disabled || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onFocus={handleFocus}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
ToolbarItem.displayName = 'Toolbar.Item';

//
// * Toolbar.Separator
//

/**
 * A visual separator component that adapts based on toolbar orientation.
 *
 * - Horizontal toolbar: Renders as vertical separator (divider bar)
 * - Vertical toolbar: Renders as horizontal separator
 *
 * Does not participate in keyboard navigation (purely decorative).
 *
 * @example
 * ```tsx
 * <Toolbar.Container aria-label="Actions">
 *   <Toolbar.Item asChild><Button>Cut</Button></Toolbar.Item>
 *   <Toolbar.Separator />
 *   <Toolbar.Item asChild><Button>Copy</Button></Toolbar.Item>
 * </Toolbar.Container>
 * ```
 */
export type ToolbarSeparatorProps = {
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  ({ className, ...props }, ref): ReactElement => {
    const { orientation } = useToolbar();

    if (orientation === 'vertical') {
      // Horizontal separator for vertical toolbar
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

    // Vertical separator for horizontal toolbar (default)
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
ToolbarSeparator.displayName = 'Toolbar.Separator';

//
// * Toolbar (main export)
//

export const Toolbar = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
  Container: ToolbarContainer,
  Item: ToolbarItem,
  Separator: ToolbarSeparator,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
});
