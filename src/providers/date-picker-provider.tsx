import {
  createContext,
  type KeyboardEventHandler,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useContext,
} from 'react';

export type DatePickerContextValue = {
  baseId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement>;
  focusOnCloseRef?: RefObject<HTMLElement>;
  monthSelectId: string;
  yearSelectId: string;
  prevButtonId: string;
  nextButtonId: string;
  headerActive: string | undefined;
  setHeaderActive: (id: string | undefined) => void;
  registerHeaderItem: (id: string, disabled?: boolean) => void;
  unregisterHeaderItem: (id: string) => void;
  getHeaderItems: () => string[];
  isHeaderItemDisabled: (id: string) => boolean;
  handleHeaderKeyDown: KeyboardEventHandler<HTMLElement>;
  monthSelectOpen: boolean;
  setMonthSelectOpen: (open: boolean) => void;
  yearSelectOpen: boolean;
  setYearSelectOpen: (open: boolean) => void;
  name?: string;
  form?: string;
  value: Date | null;
  setValue: (value: Date | null) => void;
  month: Date;
  setMonth: (month: Date) => void;
  selectDate: (date: Date) => void;
  locale?: Intl.LocalesArgument;
  weekStartsOn: number;
  minYear: number;
  maxYear: number;
  showOutsideDays: boolean;
  showNavigation: boolean;
  monthFormat: 'short' | 'long';
  isDateDisabled: (date: Date) => boolean;
};

const DatePickerContext = createContext<DatePickerContextValue | undefined>(undefined);

export type DatePickerProviderProps = {
  value: DatePickerContextValue;
  children?: ReactNode;
};

export const DatePickerProvider = ({ value, children }: DatePickerProviderProps): ReactElement => {
  return <DatePickerContext.Provider value={value}>{children}</DatePickerContext.Provider>;
};

DatePickerProvider.displayName = 'DatePickerProvider';

export const useDatePicker = (): DatePickerContextValue => {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error('useDatePicker must be used within DatePickerProvider');
  }
  return context;
};
