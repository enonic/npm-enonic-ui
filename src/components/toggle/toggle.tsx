import {
  Button,
  type ButtonIconProps,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  type ButtonVariantsProps,
} from '@/components/button';
import { useControlledState } from '@/hooks';
import { type ForwardedRef, forwardRef } from 'react';

export type ToggleProps = {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
} & Omit<ButtonProps, 'onClick'>;

export type ToggleVariantsProps = ButtonVariantsProps;
export type ToggleVariant = ButtonVariant;
export type ToggleSize = ButtonSize;
export type ToggleIconProps = ButtonIconProps;

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ pressed, defaultPressed = false, onPressedChange, ...props }, ref: ForwardedRef<HTMLButtonElement>) => {
    const [pressedState, setPressedState] = useControlledState(pressed, defaultPressed, onPressedChange);

    return (
      <Button
        ref={ref}
        aria-pressed={pressedState}
        data-state={pressedState ? 'on' : 'off'}
        data-active={pressedState}
        onClick={() => setPressedState(!pressedState)}
        {...props}
      />
    );
  },
);

Toggle.displayName = 'Toggle';
