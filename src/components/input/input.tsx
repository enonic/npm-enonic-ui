import { usePrefixedId } from '@/providers/id-provider';
import { cn, unwrap } from '@/utils';
import { cva } from 'class-variance-authority';
import { LockKeyhole, OctagonAlert } from 'lucide-react';
import { forwardRef } from 'react';

const inputContainerVariants = cva(
  [
    'relative flex rounded-sm overflow-hidden',
    'h-10 border focus-within:border-bdr-solid',
    'focus-within:focus-ring transition-highlight',
  ],
  {
    variants: {
      state: {
        default: 'border-bdr-subtle focus-within:border-bdr-strong',
        error: 'border-error focus-within:border-error focus-within:ring-error/50',
      },
      disabled: {
        true: 'pointer-events-none',
      },
    },
    defaultVariants: {
      state: 'default',
      disabled: false,
    },
  },
);

export type InputProps = {
  className?: string;
  label?: string;
  description?: string;
  error?: string;
  startAddon?: string | React.ReactElement;
  endAddon?: string | React.ReactElement;
} & React.InputHTMLAttributes;

const renderAddon = (addon: string | React.ReactElement): React.ReactElement => (
  <div
    className={cn(
      'flex items-center justify-center shrink-0 min-h-10 min-w-10 px-4',
      'text-sm text-subtle bg-surface-primary',
      'first:rounded-l-sm first:border-r first:border-bdr-soft',
      'last:rounded-r-sm last:border-l last:border-bdr-soft',
    )}
  >
    {addon}
  </div>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, description, error, startAddon, endAddon, id, ...props }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    const inputId = usePrefixedId(unwrap(id));

    const disabled = unwrap(props.disabled) ?? false;
    const readOnly = unwrap(props.readOnly) ?? false;
    const state = error ? 'error' : 'default';

    return (
      <div className={cn('w-full', disabled && 'opacity-30', className)}>
        <div className='mb-2'>
          {label && (
            <label
              htmlFor={inputId}
              className={cn('block text-base font-semibold text-main', disabled && 'opacity-30')}
            >
              <div className='flex items-center gap-1'>
                {readOnly && <LockKeyhole size={16} />}
                {label}
              </div>
            </label>
          )}

          {description && <div className={cn('text-sm text-subtle', disabled && 'opacity-30')}>{description}</div>}
        </div>

        <div className={cn(inputContainerVariants({ state, disabled }))}>
          {startAddon && renderAddon(startAddon)}

          <input
            ref={ref}
            id={inputId}
            {...props}
            className={cn(
              'flex-1 w-full px-3 text-base h-10',
              'text-main bg-surface-neutral placeholder:text-subtle',
              'border-0 focus:outline-none',
              'disabled:pointer-events-none read-only:bg-surface-primary',
              startAddon && 'rounded-l-none',
              endAddon && 'rounded-r-none',
            )}
          />

          {endAddon && renderAddon(endAddon)}
        </div>

        {error && (
          <div className='flex items-center gap-2 text-error mt-2'>
            <OctagonAlert size={16} className='text-error' />
            {error}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
