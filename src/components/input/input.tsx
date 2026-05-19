import { cva } from 'class-variance-authority';
import { LockKeyhole } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef, type ReactNode, type Ref } from 'react';
import { FilledOctagonAlert } from '@/icons';
import { usePrefixedId } from '@/providers/id-provider';
import { cn, unwrap } from '@/utils';

const inputContainerVariants = cva(
  [
    'group/input relative flex overflow-hidden rounded-sm',
    'h-12 border focus-within:border-bdr-solid',
    'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring focus-within:ring-offset-3 focus-within:ring-offset-ring-offset',
    'transition-highlight',
  ],
  {
    variants: {
      state: {
        default: 'border-bdr-subtle hover:outline-2 hover:outline-bdr-subtle hover:-outline-offset-1',
        error:
          'border-error focus-within:border-error focus-within:ring-error hover:outline-2 hover:outline-error hover:-outline-offset-1',
        processing: 'input-animated-border border-transparent focus-within:border-transparent hover:outline-none',
      },
      disabled: {
        true: 'select-none focus-within:outline-none hover:outline-none',
      },
      readOnly: {
        true: 'hover:outline-none hover:outline-offset-0',
      },
    },
    defaultVariants: {
      state: 'default',
      disabled: false,
      readOnly: false,
    },
  },
);

//
// * InputAddon
//

export type InputAddonProps = ComponentPropsWithoutRef<'div'>;

const InputAddon = forwardRef<HTMLDivElement, InputAddonProps>(
  ({ className, ...props }: InputAddonProps, ref: ForwardedRef<HTMLDivElement>) => (
    <div
      data-component='Input.Addon'
      ref={ref}
      className={cn(
        'flex min-w-12 shrink-0 items-center justify-center px-4',
        'bg-surface-primary text-sm text-subtle',
        'first:rounded-l-sm first:border-bdr-subtle first:border-r',
        'last:rounded-r-sm last:border-bdr-subtle last:border-l',
        'group-data-[state=error]/input:last:border-error group-data-[state=error]/input:first:border-error',
        className,
      )}
      {...props}
    />
  ),
);

InputAddon.displayName = 'Input.Addon';

//
// * Input
//

export type InputProps = {
  label?: string;
  description?: ReactNode;
  error?: string;
  startAddon?: string | ReactNode;
  endAddon?: string | ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * Indicates an in-flight async operation on the field. Forces read-only behavior,
   * shows a progress cursor and an animated shimmer overlay, and suppresses the error display.
   * Takes priority over `error`.
   */
  processing?: boolean;
  /**
   * Applies a one-shot attention-blink ring around the field (not the label/error). Pair with
   * `useBlinkAttention` for the trigger logic.
   */
  highlight?: boolean;
  /**
   * Ref to the field's container element — the one that wears the blink ring. Pass the same ref
   * to `useBlinkAttention` so the hook can restart the CSS animation directly via the DOM. When
   * provided, `highlight` becomes optional; the hook drives the class on its own.
   */
  highlightRef?: Ref<HTMLDivElement>;
  className?: string;
} & ComponentPropsWithoutRef<'input'>;

const InputRoot = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      description,
      error,
      startAddon,
      endAddon,
      id,
      disabled,
      readOnly,
      processing,
      highlight,
      highlightRef,
      ...props
    }: InputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const inputId = usePrefixedId(unwrap(id));
    const effectiveReadOnly = readOnly || processing;
    const state = processing ? 'processing' : error ? 'error' : 'default';

    return (
      <div data-component='Input' className={cn('w-full', disabled && 'opacity-30', className)}>
        {(!!label || !!description) && (
          <div className='mb-2'>
            {label && (
              <label htmlFor={inputId} className='block font-semibold text-base text-main'>
                <div className='flex items-center gap-2'>
                  {readOnly && !processing && <LockKeyhole size={16} strokeWidth={2.5} />}
                  {label}
                </div>
              </label>
            )}

            {description && <div className='text-sm text-subtle'>{description}</div>}
          </div>
        )}
        <div
          ref={highlightRef}
          className={cn(
            inputContainerVariants({ state, disabled, readOnly: effectiveReadOnly }),
            highlight && 'input-blink-attention',
          )}
          data-state={state}
        >
          {startAddon != null && (typeof startAddon === 'string' ? <InputAddon>{startAddon}</InputAddon> : startAddon)}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!processing && error ? true : undefined}
            aria-busy={processing || undefined}
            className={cn(
              'w-full flex-1 px-4.5 text-base',
              'bg-surface-neutral text-main placeholder:text-subtle',
              'border-0 focus:outline-none',
              'enabled:read-only:bg-surface-primary disabled:select-none',
              startAddon && 'rounded-l-none',
              endAddon && 'rounded-r-none',
              processing ? 'cursor-progress select-none' : readOnly && 'read-only:cursor-default',
            )}
            disabled={disabled}
            readOnly={effectiveReadOnly}
            {...props}
          />

          {endAddon != null && (typeof endAddon === 'string' ? <InputAddon>{endAddon}</InputAddon> : endAddon)}

          {processing && (
            <div
              aria-hidden='true'
              className={cn(
                'pointer-events-none absolute inset-0 opacity-60',
                'bg-[length:var(--shimmer-band-size)_100%] bg-no-repeat',
                'bg-[linear-gradient(90deg,transparent_0%,var(--color-surface-shimmer)_50%,transparent_100%)]',
                'animate-[skeleton-shimmer_1.6s_ease-in-out_infinite]',
              )}
            />
          )}
        </div>

        {!processing && error && (
          <div className='mt-2 flex items-center gap-2 text-error leading-5'>
            <FilledOctagonAlert size={16} />
            {error}
          </div>
        )}
      </div>
    );
  },
);

InputRoot.displayName = 'Input';

export const Input = Object.assign(InputRoot, { Addon: InputAddon });
