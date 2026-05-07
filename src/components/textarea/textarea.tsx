import { cva } from 'class-variance-authority';
import { LockKeyhole } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useLayoutEffect,
  useRef,
} from 'react';
import { FilledOctagonAlert } from '@/icons';
import { usePrefixedId } from '@/providers/id-provider';
import { cn, unwrap, useComposedRefs } from '@/utils';
import { SUPPORTS_FIELD_SIZING } from '@/utils/feature-support';

const adjustTextareaHeight = (el: HTMLTextAreaElement): void => {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

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
        default: 'border-bdr-subtle hover:outline-2 hover:outline-bdr-subtle hover:-outline-offset-1',
        error:
          'border-error focus-within:border-error focus-within:ring-error hover:outline-2 hover:outline-error hover:-outline-offset-1',
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

export type TextAreaProps = {
  label?: string;
  description?: ReactNode;
  endAddon?: ReactNode;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  resizable?: boolean;
  /**
   * Enables automatic content-based sizing.
   * Uses CSS `field-sizing: content` when supported, with a JS fallback for browsers that lack it (e.g. Firefox).
   * In the JS fallback, manual resizing is disabled even if `resizable` is true.
   * @see https://caniuse.com/mdn-css_properties_field-sizing
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

    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const composedRef = useComposedRefs(internalRef, ref);

    const useJsAutoSize = autoSize && !SUPPORTS_FIELD_SIZING;

    useLayoutEffect(() => {
      if (!useJsAutoSize) return;
      const el = internalRef.current;
      if (!el) return;

      el.style.resize = 'none';

      let lastWidth = el.clientWidth;

      const handleInput = (): void => adjustTextareaHeight(el);
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        const newWidth = entry.contentRect.width;
        if (newWidth === lastWidth) return;
        lastWidth = newWidth;
        adjustTextareaHeight(el);
      });

      adjustTextareaHeight(el);
      el.addEventListener('input', handleInput);
      observer.observe(el);

      return () => {
        observer.disconnect();
        el.removeEventListener('input', handleInput);
        el.style.height = '';
        el.style.resize = '';
      };
    }, [useJsAutoSize]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: re-adjust height when controlled value changes
    useLayoutEffect(() => {
      if (!useJsAutoSize) return;
      const el = internalRef.current;
      if (!el) return;
      adjustTextareaHeight(el);
    }, [useJsAutoSize, props.value]);

    return (
      <div data-component='TextArea' className={cn('w-full', disabled && 'opacity-30', className)}>
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
        <div className={cn(textareaContainerVariants({ state, disabled, readOnly }))}>
          <textarea
            ref={composedRef}
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

          {endAddon}
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

TextArea.displayName = 'TextArea';
