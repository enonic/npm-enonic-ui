import { cva } from 'class-variance-authority';
import { LockKeyhole, OctagonAlert } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef, type ReactNode } from 'react';
import { usePrefixedId } from '@/providers/id-provider';
import { cn, unwrap } from '@/utils';

const textareaContainerVariants = cva(
  [
    'relative flex overflow-hidden rounded-sm',
    'border focus-within:border-bdr-solid',
    'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring focus-within:ring-offset-3 focus-within:ring-offset-ring-offset',
    'transition-highlight',
  ],
  {
    variants: {
      state: {
        default: 'border-bdr-subtle focus-within:border-bdr-strong',
        error: 'border-error focus-within:border-error focus-within:ring-error',
      },
      disabled: {
        true: 'select-none',
      },
    },
    defaultVariants: {
      state: 'default',
      disabled: false,
    },
  },
);

export type InputAddonProps = ComponentPropsWithoutRef<'div'>;

const InputAddon = forwardRef<HTMLDivElement, InputAddonProps>(
  ({ className, ...props }: InputAddonProps, ref: ForwardedRef<HTMLDivElement>) => (
    <div
      ref={ref}
      className={cn(
        'absolute right-0 bottom-0 items-center',
        'bg-surface-primary/50 text-sm',
        'rounded-tl-sm rounded-br-sm px-1.5 py-0.5',
        className,
      )}
      {...props}
    />
  ),
);

InputAddon.displayName = 'InputAddon';

export type TextAreaProps = {
  label?: string;
  description?: ReactNode;
  endAddon?: string | ReactNode;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  resizable?: boolean;
  /**
   * Enables automatic content-based sizing using CSS `field-sizing: content`.
   * @see https://caniuse.com/mdn-css_properties_field-sizing
   * @note Not supported in Firefox as of Feb 2025
   */
  autoSize?: boolean;
  className?: string;
} & ComponentPropsWithoutRef<'textarea'>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      description,
      endAddon,
      error,
      id,
      disabled,
      readOnly,
      resizable = false,
      autoSize = false,
      rows = 2,
      ...props
    }: TextAreaProps,
    ref: ForwardedRef<HTMLTextAreaElement>,
  ) => {
    const textareaId = usePrefixedId(unwrap(id));
    const state = error ? 'error' : 'default';

    return (
      <div className={cn('w-full', disabled && 'opacity-30', className)}>
        {(!!label || !!description) && (
          <div className='mb-2'>
            {label && (
              <label htmlFor={textareaId} className='block font-semibold text-base text-main'>
                <div className='flex items-center gap-2'>
                  {readOnly && <LockKeyhole size={16} strokeWidth={2.5} />}
                  {label}
                </div>
              </label>
            )}

            {description && <div className='text-sm text-subtle'>{description}</div>}
          </div>
        )}
        <div className={cn(textareaContainerVariants({ state, disabled }))}>
          <textarea
            ref={ref}
            id={textareaId}
            aria-invalid={!!error || undefined}
            className={cn(
              'w-full flex-1 px-4.5 py-3 text-base',
              resizable ? 'resize-y' : 'resize-none',
              'min-h-[calc(2lh+(--spacing(6)))]',
              'bg-surface-neutral text-main placeholder:text-subtle',
              'border-0 focus:outline-none',
              'enabled:read-only:bg-surface-primary disabled:select-none',
            )}
            style={autoSize ? { fieldSizing: 'content' } : undefined}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            {...props}
          />

          {endAddon != null &&
            (typeof endAddon === 'string' ? (
              <InputAddon className={cn(error && 'text-error')}>{endAddon}</InputAddon>
            ) : (
              endAddon
            ))}
        </div>

        {error && (
          <div className='mt-2 flex items-center gap-2 text-error leading-5'>
            <OctagonAlert size={16} strokeWidth={2.5} />
            {error}
          </div>
        )}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
