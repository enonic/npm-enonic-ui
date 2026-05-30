import { type ChangeEvent, type FormEvent, useRef, useState } from 'react';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { Input } from '@/components/input';
import { Selector } from '@/components/selector';
import { TimePicker } from '@/components/time-picker';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { DatePicker } from './date-picker';

export default {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>;

type Story = StoryObj<typeof DatePicker>;

const formatISODate = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseISODate = (value: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }
  return parsed;
};

const padZero = (num: number): string => String(num).padStart(2, '0');

const getNowTimeValueUtc = (): string => {
  const now = new Date();
  return `${padZero(now.getUTCHours())}:${padZero(now.getUTCMinutes())}Z`;
};

const formatDisplayTime = (value: string | null, referenceDate: Date | null): string => {
  if (!value) return '';
  if (!value.endsWith('Z')) return value;

  const timePart = value.slice(0, -1);
  const [hourStr, minuteStr] = timePart.split(':');
  const hour = Number.parseInt(hourStr ?? '0', 10);
  const minute = Number.parseInt(minuteStr ?? '0', 10);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value;

  const date = new Date(referenceDate ?? new Date());
  date.setUTCHours(hour, minute, 0, 0);
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

const formatDateTimeValue = (date: Date | null, time: string | null): string => {
  if (!date) return '';
  const dateValue = formatISODate(date);
  const timeValue = formatDisplayTime(time, date);
  if (!timeValue) return dateValue;
  return `${dateValue} ${timeValue}`;
};

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>Click the calendar icon to open the date picker popover.</div>
      <DatePicker defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const DateInput: Story = {
  name: 'Examples / Date Input',
  render: () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<Date | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);

    const handleDateChange = (nextValue: Date | null): void => {
      setValue(nextValue);
      setInputValue(formatISODate(nextValue));
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.currentTarget.value;
      setInputValue(nextValue);
      const parsed = parseISODate(nextValue);
      if (parsed || nextValue === '') {
        setValue(parsed);
      }
    };

    return (
      <div className='flex w-80 flex-col gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          Type a date or use the icon; the input and picker stay in sync. Press Escape to close the picker and return
          focus to the input.
        </div>
        <DatePicker
          value={value}
          onValueChange={handleDateChange}
          open={open}
          onOpenChange={setOpen}
          focusOnCloseRef={inputRef}
          className='w-80'
        >
          <div ref={inputWrapperRef}>
            <Input
              ref={inputRef}
              label='Due date'
              placeholder='YYYY-MM-DD'
              value={inputValue}
              onChange={handleInputChange}
              endAddon={
                <div className='flex h-full w-11 items-center justify-center bg-transparent'>
                  <DatePicker.Trigger className='size-8' aria-label='Open date picker' />
                </div>
              }
            />
          </div>
          <DatePicker.Portal>
            <DatePicker.Content className='w-80' anchorRef={inputWrapperRef} align='start' />
          </DatePicker.Portal>
        </DatePicker>
      </div>
    );
  },
};

export const DateInputInDialog: Story = {
  name: 'Examples / Date Input in Dialog',
  render: () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<Date | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);

    const handleDateChange = (nextValue: Date | null): void => {
      setValue(nextValue);
      setInputValue(formatISODate(nextValue));
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.currentTarget.value;
      setInputValue(nextValue);
      const parsed = parseISODate(nextValue);
      if (parsed || nextValue === '') {
        setValue(parsed);
      }
    };

    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          Date picker inside a dialog. The calendar popup is portaled to the body but works correctly with the
          dialog&apos;s focus trap.
        </div>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant='outline'>Open Dialog</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-112'>
              <Dialog.Header>
                <Dialog.Title>Select a Date</Dialog.Title>
                <Dialog.Close />
              </Dialog.Header>
              <Dialog.Body className='-mx-1.5 px-1.5 pb-2'>
                <DatePicker
                  value={value}
                  onValueChange={handleDateChange}
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                  focusOnCloseRef={inputRef}
                  className='w-full'
                >
                  <div ref={inputWrapperRef}>
                    <Input
                      className={'w-full'}
                      ref={inputRef}
                      label='Due date'
                      placeholder='YYYY-MM-DD'
                      value={inputValue}
                      onChange={handleInputChange}
                      endAddon={
                        <div className='flex h-full w-11 items-center justify-center bg-transparent'>
                          <DatePicker.Trigger className='size-8' aria-label='Open date picker' />
                        </div>
                      }
                    />
                  </div>
                  <DatePicker.Content anchorRef={inputWrapperRef} align='start' />
                </DatePicker>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant='outline'>Cancel</Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button variant='solid'>Confirm</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const DateTimeInput: Story = {
  name: 'Examples / Date and Time',
  render: () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [valueDate, setValueDate] = useState<Date | null>(() => new Date());
    const [valueTime, setValueTime] = useState<string | null>(() => getNowTimeValueUtc());
    const [inputValue, setInputValue] = useState(() => formatDateTimeValue(new Date(), getNowTimeValueUtc()));
    const [draftDate, setDraftDate] = useState<Date | null>(valueDate);
    const [draftTime, setDraftTime] = useState<string | null>(valueTime);

    const handleOpenChange = (nextOpen: boolean): void => {
      if (nextOpen) {
        setDraftDate(valueDate);
        setDraftTime(valueTime);
      }
      setOpen(nextOpen);
    };

    const handleConfirm = (): void => {
      setValueDate(draftDate);
      setValueTime(draftTime);
      setInputValue(formatDateTimeValue(draftDate, draftTime));
      setOpen(false);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.currentTarget.value;
      setInputValue(nextValue);
      const [datePart, timePart] = nextValue.split(' ');
      const parsedDate = parseISODate(datePart ?? '');
      if (parsedDate || !datePart) {
        setValueDate(parsedDate);
        setDraftDate(parsedDate);
      }
      if (timePart) {
        const [hStr, mStr] = timePart.split(':');
        const h = Number.parseInt(hStr ?? '', 10);
        const m = Number.parseInt(mStr ?? '', 10);
        if (Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          const date = new Date();
          date.setHours(h, m, 0, 0);
          const utcTime = `${padZero(date.getUTCHours())}:${padZero(date.getUTCMinutes())}Z`;
          setValueTime(utcTime);
          setDraftTime(utcTime);
        }
      }
    };

    return (
      <div className='flex w-[360px] flex-col gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          Combined picker with date selection on top and time selection below.
        </div>
        <DatePicker
          value={draftDate}
          onValueChange={setDraftDate}
          open={open}
          onOpenChange={handleOpenChange}
          closeOnSelect={false}
          focusOnCloseRef={inputRef}
          className='w-[360px]'
        >
          <div ref={inputWrapperRef}>
            <Input
              ref={inputRef}
              label='Schedule'
              placeholder='YYYY-MM-DD HH:MM'
              value={inputValue}
              onChange={handleInputChange}
              endAddon={
                <div className='flex h-full w-11 items-center justify-center bg-transparent'>
                  <DatePicker.Trigger className='size-8' aria-label='Open date picker' />
                </div>
              }
            />
          </div>
          <DatePicker.Portal>
            <DatePicker.Content className='w-[360px]' anchorRef={inputWrapperRef} align='start'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <DatePicker.Header />
                  <div className='flex flex-col gap-2'>
                    <DatePicker.Weekdays />
                    <DatePicker.Grid />
                  </div>
                </div>
                <div className='border-bdr-subtle border-t pt-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <TimePicker
                      value={draftTime}
                      onValueChange={setDraftTime}
                      referenceDate={draftDate ?? new Date()}
                      timezone
                    >
                      <div className='flex items-center gap-2'>
                        <TimePicker.HourSelect className='w-20' />
                        <span className='text-main text-lg font-bold'>:</span>
                        <TimePicker.MinuteSelect className='w-20' />
                        <TimePicker.Timezone className='text-subtle ml-1 text-xs' />
                      </div>
                    </TimePicker>
                    <Button size='sm' variant='solid' onClick={handleConfirm}>
                      OK
                    </Button>
                  </div>
                </div>
              </div>
            </DatePicker.Content>
          </DatePicker.Portal>
        </DatePicker>
        <div className='text-subtle text-sm'>Selected: {formatDateTimeValue(valueDate, valueTime) || 'None'}</div>
      </div>
    );
  },
};

export const DateTimeInDialog: Story = {
  name: 'Examples / Date and Time in Dialog',
  render: () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [valueDate, setValueDate] = useState<Date | null>(() => new Date());
    const [valueTime, setValueTime] = useState<string | null>(() => getNowTimeValueUtc());
    const [inputValue, setInputValue] = useState(() => formatDateTimeValue(new Date(), getNowTimeValueUtc()));
    const [draftDate, setDraftDate] = useState<Date | null>(valueDate);
    const [draftTime, setDraftTime] = useState<string | null>(valueTime);

    const handleOpenChange = (nextOpen: boolean): void => {
      if (nextOpen) {
        setDraftDate(valueDate);
        setDraftTime(valueTime);
      }
      setPickerOpen(nextOpen);
    };

    const handleConfirm = (): void => {
      setValueDate(draftDate);
      setValueTime(draftTime);
      setInputValue(formatDateTimeValue(draftDate, draftTime));
      setPickerOpen(false);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.currentTarget.value;
      setInputValue(nextValue);
      const [datePart, timePart] = nextValue.split(' ');
      const parsedDate = parseISODate(datePart ?? '');
      if (parsedDate || !datePart) {
        setValueDate(parsedDate);
        setDraftDate(parsedDate);
      }
      if (timePart) {
        const [hStr, mStr] = timePart.split(':');
        const h = Number.parseInt(hStr ?? '', 10);
        const m = Number.parseInt(mStr ?? '', 10);
        if (Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          const date = new Date();
          date.setHours(h, m, 0, 0);
          const utcTime = `${padZero(date.getUTCHours())}:${padZero(date.getUTCMinutes())}Z`;
          setValueTime(utcTime);
          setDraftTime(utcTime);
        }
      }
    };

    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>Combined date and time picker inside a dialog.</div>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant='outline'>Open Dialog</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Select Date and Time</Dialog.Title>
                <Dialog.Close />
              </Dialog.Header>
              <Dialog.Body className='-mx-1.5 px-1.5 pb-2'>
                <DatePicker
                  value={draftDate}
                  onValueChange={setDraftDate}
                  open={pickerOpen}
                  onOpenChange={handleOpenChange}
                  closeOnSelect={false}
                  focusOnCloseRef={inputRef}
                  className='w-full'
                >
                  <div ref={inputWrapperRef}>
                    <Input
                      ref={inputRef}
                      label='Schedule'
                      placeholder='YYYY-MM-DD HH:MM'
                      value={inputValue}
                      onChange={handleInputChange}
                      endAddon={
                        <div className='flex h-full w-11 items-center justify-center bg-transparent'>
                          <DatePicker.Trigger className='size-8' aria-label='Open date picker' />
                        </div>
                      }
                    />
                  </div>
                  <DatePicker.Content anchorRef={inputWrapperRef} align='start'>
                    <div className='flex flex-col gap-4'>
                      <div className='flex flex-col gap-2'>
                        <DatePicker.Header />
                        <div className='flex flex-col gap-2'>
                          <DatePicker.Weekdays />
                          <DatePicker.Grid />
                        </div>
                      </div>
                      <div className='border-bdr-subtle border-t pt-3'>
                        <div className='flex items-center justify-between gap-3'>
                          <TimePicker
                            value={draftTime}
                            onValueChange={setDraftTime}
                            referenceDate={draftDate ?? new Date()}
                            timezone
                          >
                            <div className='flex items-center gap-2'>
                              <TimePicker.HourSelect className='w-20' />
                              <span className='text-main text-lg font-bold'>:</span>
                              <TimePicker.MinuteSelect className='w-20' />
                              <TimePicker.Timezone className='text-subtle ml-1 text-xs' />
                            </div>
                          </TimePicker>
                          <Button size='sm' variant='solid' onClick={handleConfirm}>
                            OK
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DatePicker.Content>
                </DatePicker>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant='outline'>Cancel</Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button variant='solid'>Confirm</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const DateTimeRangeInDialog: Story = {
  name: 'Examples / Date and Time Range in Dialog',
  render: () => {
    const fromInputRef = useRef<HTMLInputElement>(null);
    const fromWrapperRef = useRef<HTMLDivElement>(null);
    const toInputRef = useRef<HTMLInputElement>(null);
    const toWrapperRef = useRef<HTMLDivElement>(null);

    const [fromOpen, setFromOpen] = useState(false);
    const [fromDate, setFromDate] = useState<Date | null>(() => new Date());
    const [fromTime, setFromTime] = useState<string | null>(() => getNowTimeValueUtc());
    const [fromInputValue, setFromInputValue] = useState(() => formatDateTimeValue(new Date(), getNowTimeValueUtc()));
    const [fromDraftDate, setFromDraftDate] = useState<Date | null>(fromDate);
    const [fromDraftTime, setFromDraftTime] = useState<string | null>(fromTime);

    const [toOpen, setToOpen] = useState(false);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [toTime, setToTime] = useState<string | null>(null);
    const [toInputValue, setToInputValue] = useState('');
    const [toDraftDate, setToDraftDate] = useState<Date | null>(toDate);
    const [toDraftTime, setToDraftTime] = useState<string | null>(toTime);

    const handleFromOpenChange = (nextOpen: boolean): void => {
      if (nextOpen) {
        setFromDraftDate(fromDate);
        setFromDraftTime(fromTime);
      }
      setFromOpen(nextOpen);
    };

    const handleFromConfirm = (): void => {
      setFromDate(fromDraftDate);
      setFromTime(fromDraftTime);
      setFromInputValue(formatDateTimeValue(fromDraftDate, fromDraftTime));
      setFromOpen(false);
    };

    const handleToOpenChange = (nextOpen: boolean): void => {
      if (nextOpen) {
        setToDraftDate(toDate);
        setToDraftTime(toTime);
      }
      setToOpen(nextOpen);
    };

    const handleToConfirm = (): void => {
      setToDate(toDraftDate);
      setToTime(toDraftTime);
      setToInputValue(formatDateTimeValue(toDraftDate, toDraftTime));
      setToOpen(false);
    };

    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          Two date-time pickers inside a dialog for selecting a range.
        </div>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant='outline'>Select Date Range</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Select Date Range</Dialog.Title>
                <Dialog.Close />
              </Dialog.Header>
              <Dialog.Body className='-mx-1.5 flex flex-col gap-4 px-1.5 pb-2'>
                <DatePicker
                  value={fromDraftDate}
                  onValueChange={setFromDraftDate}
                  open={fromOpen}
                  onOpenChange={handleFromOpenChange}
                  closeOnSelect={false}
                  focusOnCloseRef={fromInputRef}
                  className='w-full'
                >
                  <div ref={fromWrapperRef}>
                    <Input
                      ref={fromInputRef}
                      label='From'
                      placeholder='YYYY-MM-DD HH:MM'
                      value={fromInputValue}
                      endAddon={
                        <div className='flex h-full w-11 items-center justify-center bg-transparent'>
                          <DatePicker.Trigger className='size-8' aria-label='Open date picker' />
                        </div>
                      }
                    />
                  </div>
                  <DatePicker.Content anchorRef={fromWrapperRef} align='start'>
                    <div className='flex flex-col gap-4'>
                      <div className='flex flex-col gap-2'>
                        <DatePicker.Header />
                        <div className='flex flex-col gap-2'>
                          <DatePicker.Weekdays />
                          <DatePicker.Grid />
                        </div>
                      </div>
                      <div className='border-bdr-subtle border-t pt-3'>
                        <div className='flex items-center justify-between gap-3'>
                          <TimePicker
                            value={fromDraftTime}
                            onValueChange={setFromDraftTime}
                            referenceDate={fromDraftDate ?? new Date()}
                            timezone
                          >
                            <div className='flex items-center gap-2'>
                              <TimePicker.HourSelect className='w-20' />
                              <span className='text-main text-lg font-bold'>:</span>
                              <TimePicker.MinuteSelect className='w-20' />
                              <TimePicker.Timezone className='text-subtle ml-1 text-xs' />
                            </div>
                          </TimePicker>
                          <Button size='sm' variant='solid' onClick={handleFromConfirm}>
                            OK
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DatePicker.Content>
                </DatePicker>
                <DatePicker
                  value={toDraftDate}
                  onValueChange={setToDraftDate}
                  open={toOpen}
                  onOpenChange={handleToOpenChange}
                  closeOnSelect={false}
                  focusOnCloseRef={toInputRef}
                  className='w-full'
                >
                  <div ref={toWrapperRef}>
                    <Input
                      ref={toInputRef}
                      label='To'
                      placeholder='YYYY-MM-DD HH:MM'
                      value={toInputValue}
                      endAddon={
                        <div className='flex h-full w-11 items-center justify-center bg-transparent'>
                          <DatePicker.Trigger className='size-8' aria-label='Open date picker' />
                        </div>
                      }
                    />
                  </div>
                  <DatePicker.Content anchorRef={toWrapperRef} align='start'>
                    <div className='flex flex-col gap-4'>
                      <div className='flex flex-col gap-2'>
                        <DatePicker.Header />
                        <div className='flex flex-col gap-2'>
                          <DatePicker.Weekdays />
                          <DatePicker.Grid />
                        </div>
                      </div>
                      <div className='border-bdr-subtle border-t pt-3'>
                        <div className='flex items-center justify-between gap-3'>
                          <TimePicker
                            value={toDraftTime}
                            onValueChange={setToDraftTime}
                            referenceDate={toDraftDate ?? new Date()}
                            timezone
                          >
                            <div className='flex items-center gap-2'>
                              <TimePicker.HourSelect className='w-20' />
                              <span className='text-main text-lg font-bold'>:</span>
                              <TimePicker.MinuteSelect className='w-20' />
                              <TimePicker.Timezone className='text-subtle ml-1 text-xs' />
                            </div>
                          </TimePicker>
                          <Button size='sm' variant='solid' onClick={handleToConfirm}>
                            OK
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DatePicker.Content>
                </DatePicker>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant='outline'>Cancel</Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button variant='solid'>Confirm</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const Controlled: Story = {
  name: 'Examples / Controlled',
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date());
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          This story keeps the selected value controlled and renders it below.
        </div>
        <DatePicker value={value} onValueChange={setValue} defaultOpen={false} className='inline-flex items-center'>
          <DatePicker.Trigger className='border-bdr-subtle border' />
          <DatePicker.Portal>
            <DatePicker.Content />
          </DatePicker.Portal>
        </DatePicker>
        <div className='text-subtle text-sm'>Selected: {value ? value.toLocaleDateString() : 'None'}</div>
      </div>
    );
  },
};

export const Trigger: Story = {
  name: 'Examples / Inline',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>
        Inline mode renders the full date picker without a trigger button.
      </div>
      <DatePicker />
    </div>
  ),
};

export const DefaultMonth: Story = {
  name: 'Features / Default Month',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>The popover opens to January 2027 when no value is selected.</div>
      <DatePicker defaultMonth={new Date(2027, 0, 1)} defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const ControlledMonth: Story = {
  name: 'Features / Controlled Month',
  render: () => {
    const [month, setMonth] = useState(new Date(2026, 6, 1));
    const [value, setValue] = useState<Date | null>(new Date(2026, 6, 14));

    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          The visible month is controlled externally while the selected date can change independently.
        </div>
        <DatePicker
          value={value}
          onValueChange={setValue}
          month={month}
          onMonthChange={setMonth}
          defaultOpen={false}
          className='inline-flex items-center'
        >
          <DatePicker.Trigger className='border-bdr-subtle border' />
          <DatePicker.Portal>
            <DatePicker.Content />
          </DatePicker.Portal>
        </DatePicker>
        <div className='text-subtle text-sm'>
          Visible month: {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </div>
      </div>
    );
  },
};

export const Locale: Story = {
  name: 'Features / Locale',
  render: () => {
    const [locale, setLocale] = useState<string>('fr-FR');
    const localeOptions = [
      { label: 'French (fr-FR)', value: 'fr-FR' },
      { label: 'English (en-US)', value: 'en-US' },
      { label: 'German (de-DE)', value: 'de-DE' },
      { label: 'Spanish (es-ES)', value: 'es-ES' },
      { label: 'Norwegian (nb-NO)', value: 'nb-NO' },
    ];

    return (
      <div className='flex w-96 flex-col items-center gap-4 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          Weekday labels, month names, and week start follow the selected locale when supported.
        </div>
        <div className='border-bdr-subtle bg-surface-neutral flex w-full flex-col gap-2 rounded-sm border p-3'>
          <div className='text-main text-sm font-semibold'>Locale</div>
          <Selector.Root value={locale} onValueChange={setLocale}>
            <Selector.Trigger>
              <Selector.Value placeholder='Select locale'>
                {value => localeOptions.find(option => option.value === value)?.label}
              </Selector.Value>
              <Selector.Icon />
            </Selector.Trigger>
            <Selector.Content>
              <Selector.Viewport>
                {localeOptions.map(option => (
                  <Selector.Item key={option.value} value={option.value} textValue={option.label}>
                    <Selector.ItemText>{option.label}</Selector.ItemText>
                    <Selector.ItemIndicator />
                  </Selector.Item>
                ))}
              </Selector.Viewport>
            </Selector.Content>
            <Selector.HiddenSelect />
          </Selector.Root>
        </div>
        <DatePicker locale={locale} weekStartsOn='locale' defaultOpen={false} className='inline-flex items-center'>
          <DatePicker.Trigger className='border-bdr-subtle border' />
          <DatePicker.Portal>
            <DatePicker.Content />
          </DatePicker.Portal>
        </DatePicker>
      </div>
    );
  },
};

export const AlignEnd: Story = {
  name: 'Features / Align End',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>The popover aligns its right edge to the trigger.</div>
      <DatePicker defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content align='end' />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const NoNavigation: Story = {
  name: 'Features / No Navigation',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>Hide the previous/next month buttons in the header.</div>
      <DatePicker showNavigation={false} defaultOpen={false} className='inline-flex items-center' monthFormat={'long'}>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const StayOpen: Story = {
  name: 'Features / Stay Open',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>
        Disable close-on-select to keep the picker open after choosing a date.
      </div>
      <DatePicker closeOnSelect={false} defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const CustomDropdownWidth: Story = {
  name: 'Features / Custom Dropdown Width',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>
        A custom header layout lets you set wider month/year dropdown menus.
      </div>
      <DatePicker defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content>
            <div className='grid gap-3'>
              <div className='grid grid-cols-2 gap-3'>
                <DatePicker.MonthSelect contentClassName='min-w-40' />
                <DatePicker.YearSelect contentClassName='min-w-40' />
              </div>
              <div className='flex flex-col gap-2'>
                <DatePicker.Weekdays />
                <DatePicker.Grid />
              </div>
            </div>
          </DatePicker.Content>
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const LongMonthLabels: Story = {
  name: 'Features / Long Month Labels',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>Month names use the long format instead of the short one.</div>
      <DatePicker monthFormat='long' defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const MinMaxYears: Story = {
  name: 'Features / Min Max Years',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>The year dropdown is limited to 2020–2026.</div>
      <DatePicker minYear={2020} maxYear={2026} defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const MinYearOnly: Story = {
  name: 'Features / Min Year Only',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>Only a minimum year is set; max defaults to the current year.</div>
      <DatePicker minYear={2018} defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const MaxYearOnly: Story = {
  name: 'Features / Max Year Only',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>Only a maximum year is set; min defaults to the current year.</div>
      <DatePicker maxYear={2027} defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const NativeInput: Story = {
  name: 'Features / Native Input',
  render: () => (
    <div className='flex w-72 flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>
        Forces the native date input (useful for mobile-first experiences).
      </div>
      <DatePicker native nativeInputProps={{ 'aria-label': 'Select date' }} />
    </div>
  ),
};

export const HiddenInput: Story = {
  name: 'Features / Hidden Input',
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date());
    const [submitted, setSubmitted] = useState('None');

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const result = data.get('dueDate');
      setSubmitted(typeof result === 'string' && result ? result : 'None');
    };

    return (
      <form onSubmit={handleSubmit} className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          Hidden input keeps form submissions in sync with the selected date.
        </div>
        <DatePicker value={value} onValueChange={setValue} defaultOpen={false} className='inline-flex items-center'>
          <DatePicker.Trigger className='border-bdr-subtle border' />
          <DatePicker.Portal>
            <DatePicker.Content />
          </DatePicker.Portal>
          <DatePicker.HiddenInput name='dueDate' />
        </DatePicker>
        <Button type='submit' size='md'>
          Submit
        </Button>
        <div className='text-subtle text-sm'>Submitted value: {submitted}</div>
      </form>
    );
  },
};

export const WeekStartsSunday: Story = {
  name: 'Features / Week Starts Sunday',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>The week starts on Sunday instead of Monday.</div>
      <DatePicker weekStartsOn={0} defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const HideOutsideDays: Story = {
  name: 'Features / Hide Outside Days',
  render: () => (
    <div className='flex flex-col items-center gap-3 p-4'>
      <div className='text-subtle max-w-120 text-sm'>Days outside the current month are hidden in the grid.</div>
      <DatePicker showOutsideDays={false} defaultOpen={false} className='inline-flex items-center'>
        <DatePicker.Trigger className='border-bdr-subtle border' />
        <DatePicker.Portal>
          <DatePicker.Content />
        </DatePicker.Portal>
      </DatePicker>
    </div>
  ),
};

export const ForceMount: Story = {
  name: 'Behavior / Force Mount',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          The content stays mounted even when closed, which helps with animations or measurements.
        </div>
        <DatePicker open={open} onOpenChange={setOpen} defaultOpen={false} className='inline-flex items-center'>
          <DatePicker.Trigger className='border-bdr-subtle border' />
          <DatePicker.Portal>
            <DatePicker.Content forceMount />
          </DatePicker.Portal>
        </DatePicker>
        <div className='text-subtle text-sm'>Open state: {open ? 'Open' : 'Closed'}</div>
      </div>
    );
  },
};
