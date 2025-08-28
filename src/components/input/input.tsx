import { usePrefixedId } from '@/providers/id-provider';
import { cn, unwrap } from '@/utils';
import { cva } from 'class-variance-authority';
import { LockKeyhole, OctagonAlert } from 'lucide-react';
import { forwardRef } from 'react';

const inputContainerVariants = cva(
  [
    'relative flex rounded-sm overflow-hidden',
    'h-10 border focus-within:border-bdr-solid',
    'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring/50 focus-within:ring-offset-0',
    'transition-highlight duration-100',
  ],
  {
    variants: {
      state: {
        default: 'border-bdr-subtle focus-within:border-bdr-strong',
        error: 'border-error focus-within:border-error focus-within:ring-error/50',
      },
      disabled: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      state: 'default',
      disabled: false,
    },
  },
);

const inputVariants = cva([
  'w-full px-3 text-base h-10',
  'text-main bg-surface-neutral',
  'placeholder:text-subtle',
  'focus:outline-none',
  'disabled:pointer-events-none',
  'read-only:bg-surface-primary',
  'border-0',
]);

const labelVariants = cva(['block text-base font-semibold text-main'], {
  variants: {
    disabled: {
      true: 'opacity-30',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

const descriptionVariants = cva(['text-sm text-subtle'], {
  variants: {
    disabled: {
      true: 'opacity-30',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

const errorVariants = cva(['flex items-center gap-1 text-error mt-1']);

const addonVariants = cva([
  'flex items-center justify-center shrink-0',
  'min-h-10 min-w-10',
  'px-4 text-sm text-subtle bg-surface-primary',
  'first:rounded-l-sm last:rounded-r-sm',
  'first:border-r first:border-bdr-soft',
  'last:border-l last:border-bdr-soft',
]);

export type InputProps = {
  className?: string;
  label?: string;
  description?: string;
  error?: string;
  startAddon?: string | React.ReactElement;
  endAddon?: string | React.ReactElement;
} & React.InputHTMLAttributes;

const renderAddon = (addon: string | React.ReactElement): React.ReactElement => (
  <div className={cn(addonVariants())}>{addon}</div>
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
            <label htmlFor={inputId} className={cn(labelVariants({ disabled }))}>
              <div className='flex items-center gap-1'>
                {readOnly && <LockKeyhole size={16} />}
                {label}
              </div>
            </label>
          )}

          {description && <div className={cn(descriptionVariants({ disabled }))}>{description}</div>}
        </div>

        <div className={cn(inputContainerVariants({ state, disabled }))}>
          {startAddon && renderAddon(startAddon)}

          <input
            ref={ref}
            id={inputId}
            {...props}
            className={cn(inputVariants(), startAddon && 'rounded-l-none', endAddon && 'rounded-r-none', 'flex-1')}
          />

          {endAddon && renderAddon(endAddon)}
        </div>

        {error && (
          <div className={cn(errorVariants())}>
            <OctagonAlert size={16} />
            {error}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
