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
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean): void => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const [active, setActive] = useState<string | undefined>(undefined);
  const itemsRef = useRef<Map<string, { disabled: boolean }>>(new Map());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const triggerId = usePrefixedId(undefined, 'menu-trigger');
  const menuId = usePrefixedId(undefined, 'menu');

  const registerItem = useCallback((id: string, disabled = false): void => {
    itemsRef.current.set(id, { disabled });
  }, []);

  const unregisterItem = useCallback((id: string): void => {
    itemsRef.current.delete(id);
  }, []);

  const getItems = useCallback((): string[] => {
    return Array.from(itemsRef.current.keys());
  }, []);

  const isItemDisabled = useCallback((id: string): boolean => {
    return itemsRef.current.get(id)?.disabled ?? false;
  }, []);

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
        aria-controls={open ? menuId : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={className}
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

const VIEWPORT_PADDING = 10;

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
    const [position, setPosition] = useState<{ top: number; left: number } | { top: number; right: number } | null>(
      null,
    );

    // Calculate position when menu opens
    useEffect(() => {
      if (!open || !triggerRef?.current || !contentRef.current) {
        return;
      }

      const updatePosition = (): void => {
        if (!triggerRef.current || !contentRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Position below trigger with specified alignment
        let top = triggerRect.bottom;

        // Adjust if overflows bottom edge - show above trigger instead
        if (top + contentRect.height > viewportHeight) {
          top = triggerRect.top - contentRect.height;
        }

        // Adjust if overflows top edge
        if (top < 0) {
          top = VIEWPORT_PADDING;
        }

        if (align === 'start') {
          let left = triggerRect.left;

          if (left + contentRect.width > viewportWidth) {
            left = triggerRect.right - contentRect.width;
          }

          // Adjust if overflows left edge
          if (left < 0) {
            left = VIEWPORT_PADDING;
          }

          setPosition({ top, left });
        } else {
          // For end alignment, use 'right' property (distance from viewport right edge)
          let right = viewportWidth - triggerRect.right;

          // Adjust if menu would overflow left edge
          if (triggerRect.right - contentRect.width < 0) {
            right = viewportWidth - (triggerRect.left + contentRect.width);
          }

          // Adjust if overflows right edge
          if (right < 0) {
            right = VIEWPORT_PADDING;
          }

          setPosition({ top, right });
        }
      };

      // Initial position calculation
      updatePosition();

      // Recalculate on window resize or scroll
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }, [open, triggerRef, align]);

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

    const moveActive = useCallback(
      (delta: number): void => {
        const items = getItems();
        if (!items.length) {
          return;
        }

        const currentIndex = active ? items.indexOf(active) : -1;
        let newIndex: number;
        let attempts = 0;
        const maxAttempts = items.length;

        if (currentIndex === -1) {
          // No active item, start from first or last depending on direction
          newIndex = delta > 0 ? 0 : items.length - 1;
        } else {
          newIndex = currentIndex + delta;
        }

        // Find next non-disabled item
        while (attempts < maxAttempts) {
          // Handle looping and bounds
          if (loop) {
            if (newIndex < 0) {
              newIndex = items.length - 1;
            } else if (newIndex >= items.length) {
              newIndex = 0;
            }
          } else {
            // Clamp to bounds
            if (newIndex < 0 || newIndex >= items.length) {
              return; // Can't move further without looping
            }
          }

          // Check if item is not disabled
          if (!isItemDisabled(items[newIndex])) {
            setActive(items[newIndex]);
            return;
          }

          // Try next item in the same direction
          newIndex += delta;
          attempts++;
        }

        // All items are disabled, do nothing
      },
      [getItems, active, setActive, loop, isItemDisabled],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        const items = getItems();
        if (!items.length) {
          return;
        }

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            moveActive(1);
            break;
          case 'ArrowUp':
            e.preventDefault();
            moveActive(-1);
            break;
          case 'Home':
            e.preventDefault();
            {
              const firstEnabled = items.find(id => !isItemDisabled(id));
              if (firstEnabled) {
                setActive(firstEnabled);
              }
            }
            break;
          case 'End':
            e.preventDefault();
            {
              const lastEnabled = [...items].reverse().find(id => !isItemDisabled(id));
              if (lastEnabled) {
                setActive(lastEnabled);
              }
            }
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (active && !isItemDisabled(active)) {
              // Item will handle its own onSelect
              const itemElement = document.getElementById(active);
              if (itemElement) {
                itemElement.click();
              }
            }
            break;
          case 'Escape':
            e.preventDefault();
            onEscapeKeyDown?.(e);
            setOpen(false);
            break;
          case 'Tab':
            // Close menu and return focus to trigger
            setOpen(false);
            break;
        }
      },
      [getItems, active, moveActive, setActive, isItemDisabled, onEscapeKeyDown, setOpen],
    );

    const handlePointerDownOutside = useCallback(
      (e: PointerEvent): void => {
        const target = e.target as Node;
        // Don't close if clicking the trigger (let trigger's own handler manage it)
        if (triggerRef?.current?.contains(target)) {
          return;
        }
        if (contentRef.current && !contentRef.current.contains(target)) {
          onPointerDownOutside?.(e);
          onInteractOutside?.(e);
          if (!e.defaultPrevented) {
            setOpen(false);
          }
        }
      },
      [onPointerDownOutside, onInteractOutside, setOpen, triggerRef],
    );

    useEffect(() => {
      if (!open) {
        return;
      }
      document.addEventListener('pointerdown', handlePointerDownOutside);
      return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
    }, [open, handlePointerDownOutside]);

    // Scroll active item into view
    useEffect(() => {
      if (!active || !contentRef.current) {
        return;
      }
      const el = contentRef.current.querySelector<HTMLDivElement>(`#${active}`);
      if (el) {
        el.scrollIntoView({
          block: 'nearest',
          behavior: 'auto',
        });
      }
    }, [active]);

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
      true: 'bg-surface-primary-selected',
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
      class: 'text-alt outline-none ring-3 ring-inset ring-bdr-strong',
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

const MenuItem = ({
  id: providedId,
  asChild = false,
  disabled = false,
  onSelect,
  className,
  children,
  ...props
}: MenuItemProps): ReactElement => {
  const id = usePrefixedId(providedId, providedId ? undefined : 'menu-item');
  const { active, setActive, setOpen, registerItem, unregisterItem } = useMenu();
  const isActive = active === id;
  const isDisabled = disabled;

  useEffect(() => {
    registerItem(id, disabled);
    return () => unregisterItem(id);
  }, [id, disabled, registerItem, unregisterItem]);

  const handleClick = useCallback((): void => {
    if (isDisabled) {
      return;
    }
    const event = new Event('select', { bubbles: true, cancelable: true });
    onSelect?.(event);
    if (!event.defaultPrevented) {
      setOpen(false);
    }
  }, [isDisabled, onSelect, setOpen]);

  const handlePointerMove = useCallback(() => {
    if (!isActive) {
      setActive(id);
    }
  }, [isActive, setActive, id]);

  const handlePointerLeave = useCallback(() => {
    setActive(undefined);
  }, [setActive]);

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      id={id}
      role='menuitem'
      aria-disabled={isDisabled}
      data-active={isActive || undefined}
      data-disabled={isDisabled || undefined}
      className={cn(menuItemVariants({ active: isActive, disabled: isDisabled }), className)}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </Comp>
  );
};
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
