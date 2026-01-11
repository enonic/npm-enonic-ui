import { cva } from 'class-variance-authority';
import { OctagonAlert, Square } from 'lucide-react';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { useControlledState } from '@/hooks';
import { FilledSquareCheck, FilledSquareMinus } from '@/icons';
import { usePrefixedId } from '@/providers/id-provider';
import { cn, unwrap } from '@/utils';

const checkboxIconWrapperVariants = cva(['inline-flex shrink-0'], {
  variants: {
    labeled: {
      true: '',
      false:
        'after:-inset-1 after:-z-10 relative z-0 after:pointer-events-auto after:absolute after:rounded-sm after:content-[""]',
    },
  },
  defaultVariants: {
    labeled: false,
  },
});

type CheckboxState = 'default' | 'error';
export type CheckboxAlign = 'left' | 'right';
export type CheckboxChecked = boolean | 'indeterminate';

export type CheckboxProps = {
  className?: string;
  label?: string;
  defaultChecked?: CheckboxChecked;
  checked?: CheckboxChecked;
  align?: CheckboxAlign;
  error?: boolean;
  errorMessage?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  onCheckedChange?: (checked: CheckboxChecked) => void;
  /**
   * Click handler attached to the label element (the entire clickable area).
   * Note: This is intentionally on label, not the hidden input, since the label
   * is what users interact with visually.
   */
  onClick?: (e: React.MouseEvent<HTMLLabelElement>) => void;
  /** Capture phase click handler on the label element. */
  onClickCapture?: (e: React.MouseEvent<HTMLLabelElement>) => void;
  /** Mouse down handler on the label element. Useful for preventing default focus behavior. */
  onMouseDown?: (e: React.MouseEvent<HTMLLabelElement>) => void;
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'readOnly'
  | 'disabled'
  | 'onChange'
  | 'checked'
  | 'defaultChecked'
  | 'required'
  | 'name'
  | 'value'
  | 'onClick'
  | 'onClickCapture'
  | 'onMouseDown'
>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      className,
      name,
      label,
      defaultChecked = false,
      checked,
      align = 'left',
      error,
      disabled,
      readOnly,
      required,
      value = 'on',
      onCheckedChange,
      errorMessage,
      onClick,
      onClickCapture,
      onMouseDown,
      ...props
    },
    ref,
  ) => {
    const inputId = usePrefixedId(unwrap(id));
    const state: CheckboxState = error ? 'error' : 'default';
    const editable = !disabled && !readOnly;
    const labeled = !!label;

    const [checkedState, setCheckedState] = useControlledState(checked, defaultChecked, onCheckedChange);
    const isIndeterminate = checkedState === 'indeterminate';
    const isChecked = checkedState === true;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (!editable) return;

      let nextValue: boolean | 'indeterminate';

      if (isIndeterminate) {
        nextValue = false;
      } else {
        nextValue = e.currentTarget.checked;
      }

      setCheckedState(nextValue);
    };

    return (
      <div className='flex w-fit flex-col gap-1'>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- Label with htmlFor is interactive; keyboard events handled by linked input */}
        <label
          htmlFor={inputId}
          onClick={onClick}
          onClickCapture={onClickCapture}
          onMouseDown={onMouseDown}
          className={cn(
            'relative my-0.75 flex select-none items-center gap-2 rounded-xs leading-4 transition-highlight',
            align === 'right' && 'flex-row-reverse justify-end',
            editable && [
              'cursor-pointer',
              'focus-within:outline-none focus-within:ring-3 focus-within:ring-ring focus-within:ring-offset-3 focus-within:ring-offset-ring-offset',
            ],
            error && editable && 'focus-within:ring-error',
            className,
          )}
        >
          <input
            ref={el => {
              if (typeof ref === 'function') ref(el);
              else if (ref) ref.current = el;
              if (el) el.indeterminate = isIndeterminate;
            }}
            {...props}
            id={inputId}
            type='checkbox'
            className='peer sr-only'
            checked={isChecked}
            disabled={readOnly ?? disabled}
            required={required}
            name={name}
            value={value}
            aria-checked={isIndeterminate ? 'mixed' : isChecked}
            aria-disabled={disabled}
            aria-invalid={error}
            aria-readonly={readOnly}
            data-state={isIndeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'}
            data-disabled={disabled ?? undefined}
            onChange={handleChange}
          />

          <span className={checkboxIconWrapperVariants({ labeled })} aria-hidden='true'>
            {isIndeterminate ? (
              <FilledSquareMinus
                className={cn(
                  'size-4 transition-highlight',
                  !editable && 'opacity-30',
                  state === 'error' ? 'text-error' : 'text-main group-data-[tone=inverse]:text-alt',
                )}
              />
            ) : isChecked ? (
              <FilledSquareCheck
                className={cn(
                  'size-4 transition-highlight',
                  !editable && 'opacity-30',
                  state === 'error' ? 'text-error' : 'text-main group-data-[tone=inverse]:text-alt',
                )}
              />
            ) : (
              <Square
                className={cn(
                  'size-4 transition-highlight',
                  !editable && 'opacity-30',
                  state === 'error' ? 'text-error' : 'text-main group-data-[tone=inverse]:text-alt',
                )}
              />
            )}
          </span>

          {label && (
            <span className={cn('text-main group-data-[tone=inverse]:text-alt', disabled && 'opacity-30')}>
              {label}
            </span>
          )}
        </label>
        {state === 'error' && errorMessage && (
          <div className={cn('flex items-center gap-2 text-error leading-5', disabled && 'opacity-30')}>
            <OctagonAlert size={14} strokeWidth={2.5} />
            {errorMessage}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
