import { GripVertical, X } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef, type ReactElement, useMemo } from 'react';

import { IconButton, type IconButtonProps } from '@/components/icon-button';
import { type TagContextValue, TagProvider, useTag } from '@/providers';
import { cn } from '@/utils';

//
// * Root
//

export type TagProps = {
  /** `li` inside a list of tags, `span` anywhere else. */
  as?: 'span' | 'li';
  /** Red text and border, nothing more: the message is the caller's to attach, as `title` or `aria-describedby`. */
  error?: boolean;
  /** Mutes the chip and disables its handle, remove button and label button. */
  disabled?: boolean;
  /** Being dragged: a grabbing cursor and a ring; the drag itself is the caller's. */
  dragging?: boolean;
} & ComponentPropsWithoutRef<'span'>;

/**
 * One term as a chip: a label, the parts around it — a drag handle, a prefix naming what the label
 * is a value of, a cross that takes the term back — and the states a list of tags puts it in.
 */
const TagRoot = forwardRef<HTMLElement, TagProps>(
  ({ as = 'span', error = false, disabled = false, dragging = false, className, ...props }, ref): ReactElement => {
    const shared = {
      'data-component': 'Tag',
      className: cn(
        'bg-surface-neutral focus-visible:ring-offset-ring-offset inline-flex max-w-full items-center gap-1.5 rounded-sm border px-2.5 py-0.75 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        error ? 'text-error ring-error border-current' : 'border-bdr-strong text-main ring-ring',
        dragging && 'cursor-grabbing ring-1',
        disabled && 'border-bdr-subtle text-subtle cursor-default',
        className,
      ),
      ...props,
    };

    const contextValue = useMemo<TagContextValue>(() => ({ disabled }), [disabled]);

    return (
      <TagProvider value={contextValue}>
        {/* The ref is typed by the element it lands on; the branch is what guarantees the match. */}
        {as === 'li' ? <li ref={ref as ForwardedRef<HTMLLIElement>} {...shared} /> : <span ref={ref} {...shared} />}
      </TagProvider>
    );
  },
);
TagRoot.displayName = 'Tag';

//
// * Handle — a drag handle, for a tag in a sortable list
//

export type TagHandleProps = Omit<IconButtonProps, 'icon' | 'aria-label'> & { 'aria-label': string };

/** The grip at the left edge, a 24px target; the sortable's listeners and `aria-label` are the caller's. */
const TagHandle = forwardRef<HTMLButtonElement, TagHandleProps>(
  ({ disabled, className, ...props }, ref): ReactElement => {
    const tag = useTag();

    return (
      <IconButton
        data-component='Tag.Handle'
        ref={ref}
        icon={GripVertical}
        iconSize='sm'
        variant='text'
        disabled={disabled ?? tag.disabled}
        className={cn(
          '-my-0.5 -ml-1 size-6 shrink-0 touch-none focus-visible:ring-2 focus-visible:ring-offset-2',
          className,
        )}
        {...props}
      />
    );
  },
);
TagHandle.displayName = 'Tag.Handle';

//
// * Prefix — what the label is a value of
//

export type TagPrefixProps = ComponentPropsWithoutRef<'span'>;

/** `ID provider:` before `Company directory`; the separator is the caller's, as its language has it. */
const TagPrefix = forwardRef<HTMLSpanElement, TagPrefixProps>(({ className, ...props }, ref): ReactElement => (
  <span data-component='Tag.Prefix' ref={ref} className={cn('text-subtle truncate', className)} {...props} />
));
TagPrefix.displayName = 'Tag.Prefix';

//
// * Label
//

export type TagLabelProps = {
  /** `button` for a label that does something on click — a tag edited in place. */
  as?: 'span' | 'button';
} & ComponentPropsWithoutRef<'button'>;

const TagLabel = forwardRef<HTMLElement, TagLabelProps>(
  ({ as = 'span', disabled, className, ...props }, ref): ReactElement => {
    const tag = useTag();

    if (as === 'span') {
      return (
        <span data-component='Tag.Label' ref={ref} className={cn('truncate font-semibold', className)} {...props} />
      );
    }

    return (
      <button
        data-component='Tag.Label'
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type='button'
        disabled={disabled ?? tag.disabled}
        className={cn(
          'focus-visible:ring-ring focus-visible:ring-offset-ring-offset truncate font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-default',
          className,
        )}
        {...props}
      />
    );
  },
);
TagLabel.displayName = 'Tag.Label';

//
// * Remove
//

export type TagRemoveProps = Omit<IconButtonProps, 'icon' | 'aria-label'> & { 'aria-label': string };

/** The cross at the right edge, a 24px target; `aria-label` is the caller's, naming what it removes. */
const TagRemove = forwardRef<HTMLButtonElement, TagRemoveProps>(
  ({ disabled, className, ...props }, ref): ReactElement => {
    const tag = useTag();

    return (
      <IconButton
        data-component='Tag.Remove'
        ref={ref}
        icon={X}
        iconSize='sm'
        variant='text'
        disabled={disabled ?? tag.disabled}
        className={cn('-my-0.5 -mr-1 size-6 shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2', className)}
        {...props}
      />
    );
  },
);
TagRemove.displayName = 'Tag.Remove';

export const Tag = Object.assign(TagRoot, {
  Root: TagRoot,
  Handle: TagHandle,
  Prefix: TagPrefix,
  Label: TagLabel,
  Remove: TagRemove,
});
