import {
  useActiveItemFocus,
  useClickOutside,
  useControlledState,
  useFloatingPosition,
  useItemRegistry,
  useKeyboardNavigation,
  useRovingTabIndex,
  useScrollActiveIntoView,
} from '@/hooks';
import { type MenuContextValue, MenuProvider, useMenu, usePrefixedId } from '@/providers';
import { cn, useComposedRefs } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
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
  const triggerId = usePrefixedId(undefined, 'menu-trigger');
  const menuId = usePrefixedId(undefined, 'menu');

  const [open, setOpen] = useControlledState(controlledOpen, defaultOpen, onOpenChange);
  const [active, setActive] = useState<string | undefined>(undefined);
  const { registerItem, unregisterItem, getItems, isItemDisabled } = useItemRegistry();

  const value: MenuContextValue = useMemo(
    () => ({
      open,
      setOpen,
      active,
      setActive,
      registerItem,
      unregisterItem,
      getItems,
      isItemDisabled,
      triggerId,
      menuId,
      triggerRef,
    }),
    [open, setOpen, active, setActive, registerItem, unregisterItem, getItems, isItemDisabled, triggerId, menuId],
  );

  // Return focus to trigger when menu closes (can't be in MenuContent - it unmounts)
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [open]);

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
    const { open, setOpen, triggerId, menuId, triggerRef } = useMenu();

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
        type={asChild ? undefined : 'button'}
        aria-haspopup='menu'
        aria-expanded={open}
        data-active={open}
        aria-controls={open ? menuId : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn('data-[active=true]:bg-btn-active data-[active=true]:text-alt', className)}
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
      children,
      ...props
    },
    ref,
  ): ReactElement | null => {
    const { open, setOpen, active, setActive, getItems, isItemDisabled, menuId, triggerRef } = useMenu();
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, contentRef);
    const position = useFloatingPosition({
      enabled: open,
      triggerRef,
      contentRef,
      align,
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
          'fixed z-40 flex flex-col items-start w-fit py-2.5 mt-2.5 overflow-hidden',
          'rounded-sm border border-bdr-subtle bg-surface-neutral shadow-lg outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          !position && 'opacity-0 pointer-events-none',
          className,
        )}
        style={{ ...position }}
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

const menuItemVariants = cva('flex w-full items-center px-4.5 py-2.5 gap-x-1.25 cursor-pointer text-sm outline-none', {
  variants: {
    active: {
      true: 'bg-surface-primary-selected text-alt',
      false: '',
    },
    disabled: {
      true: 'hover:bg-transparent opacity-30 select-none pointer-events-none',
      false: '',
    },
  },
  compoundVariants: [
    {
      active: true,
      disabled: false,
      class: [
        // ring and offset colors are swapped for inset ring focus
        'focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring-offset',
        'focus-visible:ring-offset-3 focus-visible:ring-offset-ring',
      ],
    },
  ],
  defaultVariants: {
    active: false,
    disabled: false,
  },
});

export type MenuItemProps = {
  id?: string;
  asChild?: boolean;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (
    {
      id: providedId,
      asChild = false,
      disabled = false,
      onSelect,
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
    const id = usePrefixedId(providedId, providedId ? undefined : 'menu-item');
    const { active, setActive, setOpen, registerItem, unregisterItem, getItems, isItemDisabled } = useMenu();
    const isActive = active === id;
    const itemRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(ref, itemRef);

    useEffect(() => {
      registerItem(id, disabled);
      return () => unregisterItem(id);
    }, [id, disabled, registerItem, unregisterItem]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>): void => {
        onClick?.(e);
        if (disabled) {
          return;
        }
        const event = new Event('select', { bubbles: true, cancelable: true });
        onSelect?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      },
      [disabled, onSelect, setOpen, onClick],
    );

    const handlePointerMove = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerMove']>>[0]): void => {
        onPointerMove?.(e);
        if (!isActive && !disabled) {
          setActive(id);
        }
      },
      [isActive, setActive, id, disabled, onPointerMove],
    );

    const handlePointerLeave = useCallback(
      (e: Parameters<NonNullable<ComponentPropsWithoutRef<'div'>['onPointerLeave']>>[0]): void => {
        onPointerLeave?.(e);
        if (document.activeElement !== itemRef.current) {
          setActive(undefined);
        }
      },
      [setActive, onPointerLeave, itemRef],
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
        aria-disabled={disabled || undefined}
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
MenuItem.displayName = 'Menu.Item';

//
// * MenuLabel
//

export type MenuLabelProps = {
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(({ className, children, ...props }, ref): ReactElement => {
  return (
    <div ref={ref} className={cn('px-3 py-1.5 text-xs font-semibold text-subtle', className)} {...props}>
      {children}
    </div>
  );
});
MenuLabel.displayName = 'Menu.Label';

//
// * MenuSeparator
//

export type MenuSeparatorProps = {
  className?: string;
} & ComponentPropsWithoutRef<'div'>;

const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(({ className, ...props }, ref): ReactElement => {
  return (
    <div
      ref={ref}
      role='separator'
      aria-orientation='horizontal'
      className={cn('my-1 h-px bg-bdr-subtle', className)}
      {...props}
    />
  );
});
MenuSeparator.displayName = 'Menu.Separator';

export const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Portal: MenuPortal,
  Content: MenuContent,
  Item: MenuItem,
  Label: MenuLabel,
  Separator: MenuSeparator,
});
