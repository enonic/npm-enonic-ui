import { cva } from 'class-variance-authority';
import { LockKeyhole, OctagonAlert } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef, type ReactElement, type ReactNode } from 'react';
import { usePrefixedId } from '@/providers/id-provider';
import { cn, unwrap } from '@/utils';

const inputContainerVariants = cva(
  [
    'relative flex overflow-hidden rounded-sm',
    'h-12 border focus-within:border-bdr-solid',
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

export type InputProps = {
  label?: string;
  description?: string;
  error?: string;
  startAddon?: string | ReactElement;
  endAddon?: string | ReactElement;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
} & ComponentPropsWithoutRef<'input'>;

type AddonProps = {
  children: ReactNode;
  error: boolean;
};

const Addon = ({ children, error }: AddonProps): ReactElement => (
  <div
    className={cn(
      'flex min-w-12 shrink-0 items-center justify-center px-4',
      'bg-surface-primary text-sm text-subtle',
      'first:rounded-l-sm first:border-bdr-subtle first:border-r',
      'last:rounded-r-sm last:border-bdr-subtle last:border-l',
      error && 'first:border-error last:border-error',
    )}
  >
    {children}
  </div>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, description, error, startAddon, endAddon, id, disabled, readOnly, ...props }: InputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const inputId = usePrefixedId(unwrap(id));
    const state = error ? 'error' : 'default';
    const hasError = state === 'error';

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
        <div className={cn(inputContainerVariants({ state, disabled }))}>
          {startAddon && <Addon error={hasError}>{startAddon}</Addon>}

          <input
            ref={ref}
            id={inputId}
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

          {endAddon && <Addon error={hasError}>{endAddon}</Addon>}
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

Input.displayName = 'Input';
