import { cva } from 'class-variance-authority';
import { LockKeyhole } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef, type ReactNode } from 'react';
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
        default: 'hover:-outline-offset-1 border-bdr-subtle hover:outline-2 hover:outline-bdr-subtle',
        error:
          'hover:-outline-offset-1 border-error focus-within:border-error focus-within:ring-error hover:outline-2 hover:outline-error',
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

InputAddon.displayName = 'InputAddon';

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
  className?: string;
} & ComponentPropsWithoutRef<'input'>;

const InputRoot = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, description, error, startAddon, endAddon, id, disabled, readOnly, ...props }: InputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const inputId = usePrefixedId(unwrap(id));
    const state = error ? 'error' : 'default';

    return (
      <div className={cn('w-full', disabled && 'opacity-30', className)}>
        {(!!label || !!description) && (
          <div className='mb-2'>
            {label && (
              <label htmlFor={inputId} className='block font-semibold text-base text-main'>
                <div className='flex items-center gap-2'>
                  {readOnly && <LockKeyhole size={16} strokeWidth={2.5} />}
                  {label}
                </div>
              </label>
            )}

            {description && <div className='text-sm text-subtle'>{description}</div>}
          </div>
        )}
        <div className={cn(inputContainerVariants({ state, disabled, readOnly }))} data-state={state}>
          {startAddon != null && (typeof startAddon === 'string' ? <InputAddon>{startAddon}</InputAddon> : startAddon)}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error || undefined}
            className={cn(
              'w-full flex-1 px-4.5 text-base',
              'bg-surface-neutral text-main placeholder:text-subtle',
              'border-0 focus:outline-none',
              'enabled:read-only:bg-surface-primary disabled:select-none',
              startAddon && 'rounded-l-none',
              endAddon && 'rounded-r-none',
            )}
            disabled={disabled}
            readOnly={readOnly}
            {...props}
          />

          {endAddon != null && (typeof endAddon === 'string' ? <InputAddon>{endAddon}</InputAddon> : endAddon)}
        </div>

        {error && (
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
