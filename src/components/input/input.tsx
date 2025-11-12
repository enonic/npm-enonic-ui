import { usePrefixedId } from '@/providers/id-provider';
import { cn, unwrap } from '@/utils';
import { cva } from 'class-variance-authority';
import { LockKeyhole, OctagonAlert } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ForwardedRef, forwardRef, type ReactElement, type ReactNode } from 'react';

const inputContainerVariants = cva(
  [
    'relative flex rounded-sm overflow-hidden',
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
      'flex items-center justify-center shrink-0 min-w-12 px-4',
      'text-sm text-subtle bg-surface-primary',
      'first:rounded-l-sm first:border-r first:border-bdr-subtle',
      'last:rounded-r-sm last:border-l last:border-bdr-subtle',
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
              <label htmlFor={inputId} className='block text-base font-semibold text-main'>
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
              'flex-1 w-full px-4.5 text-base',
              'text-main bg-surface-neutral placeholder:text-subtle',
              'border-0 focus:outline-none',
              'disabled:select-none enabled:read-only:bg-surface-primary',
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
          <div className='flex items-center gap-2 mt-2 leading-5 text-error'>
            <OctagonAlert size={16} strokeWidth={2.5} />
            {error}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
