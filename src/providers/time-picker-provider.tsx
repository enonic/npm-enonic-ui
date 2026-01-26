import {
  createContext,
  type KeyboardEventHandler,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useContext,
} from 'react';

export type TimePickerContextValue = {
  baseId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement>;
  hourTriggerRef: RefObject<HTMLButtonElement>;
  minuteTriggerRef: RefObject<HTMLButtonElement>;
  hourSelectId: string;
  minuteSelectId: string;
  selectorActive: string | undefined;
  setSelectorActive: (id: string | undefined) => void;
  registerSelectorItem: (id: string, disabled?: boolean) => void;
  unregisterSelectorItem: (id: string) => void;
  getSelectorItems: () => string[];
  isSelectorItemDisabled: (id: string) => boolean;
  handleSelectorKeyDown: KeyboardEventHandler<HTMLElement>;
  hourSelectOpen: boolean;
  setHourSelectOpen: (open: boolean) => void;
  minuteSelectOpen: boolean;
  setMinuteSelectOpen: (open: boolean) => void;
  shouldFocusSelectors: boolean;
  setShouldFocusSelectors: (shouldFocus: boolean) => void;
  referenceDate: Date;
  value: string | null;
  setValue: (value: string | null) => void;
  hour: number;
  minute: number;
  setHour: (hour: number) => void;
  setMinute: (minute: number) => void;
  timezone: boolean;
  timezoneOffset: string;
  name?: string;
  form?: string;
  invalid?: boolean;
};

const TimePickerContext = createContext<TimePickerContextValue | undefined>(undefined);

export type TimePickerProviderProps = {
  value: TimePickerContextValue;
  children?: ReactNode;
};

export const TimePickerProvider = ({ value, children }: TimePickerProviderProps): ReactElement => {
  return <TimePickerContext.Provider value={value}>{children}</TimePickerContext.Provider>;
};

TimePickerProvider.displayName = 'TimePickerProvider';

export const useTimePicker = (): TimePickerContextValue => {
  const context = useContext(TimePickerContext);
  if (!context) {
    throw new Error('useTimePicker must be used within TimePickerProvider');
  }
  return context;
};
