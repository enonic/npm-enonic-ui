import { type ChangeEvent, type FormEvent, useRef, useState } from 'react';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { Input } from '@/components/input';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { TimePicker } from './time-picker';

export default {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TimePicker>;

type Story = StoryObj<typeof TimePicker>;

const padZero = (num: number): string => String(num).padStart(2, '0');

const getNowValue = (timezone: boolean): string => {
  const now = new Date();
  if (timezone) {
    return `${padZero(now.getUTCHours())}:${padZero(now.getUTCMinutes())}Z`;
  }
  return `${padZero(now.getHours())}:${padZero(now.getMinutes())}`;
};

const toUtcValue = (localValue: string): string => {
  const [hourStr, minuteStr] = localValue.split(':');
  const hour = Number.parseInt(hourStr ?? '0', 10);
  const minute = Number.parseInt(minuteStr ?? '0', 10);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return `${padZero(date.getUTCHours())}:${padZero(date.getUTCMinutes())}Z`;
};

const toLocalValue = (utcValue: string): string => {
  const timePart = utcValue.endsWith('Z') ? utcValue.slice(0, -1) : utcValue;
  const [hourStr, minuteStr] = timePart.split(':');
  const hour = Number.parseInt(hourStr ?? '0', 10);
  const minute = Number.parseInt(minuteStr ?? '0', 10);
  const date = new Date();
  date.setUTCHours(hour, minute, 0, 0);
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
};

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => {
    const [value, setValue] = useState<string | null>(() => getNowValue(false));
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Basic time picker with hour and minute dropdowns separated by a colon.
        </div>
        <TimePicker onValueChange={setValue} />
        <div className='text-subtle text-sm'>Current value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const WithTimezone: Story = {
  name: 'Examples / With Timezone',
  render: () => {
    const [value, setValue] = useState<string | null>(() => getNowValue(true));
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          When timezone is enabled, the current timezone is displayed after the time, and the value is stored in UTC
          format with Z suffix.
        </div>
        <TimePicker timezone onValueChange={setValue} />
        <div className='text-subtle text-sm'>Current value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const Controlled: Story = {
  name: 'Examples / Controlled',
  render: () => {
    const [value, setValue] = useState<string | null>('14:30');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Controlled time picker that displays the current value below.
        </div>
        <TimePicker value={value} onValueChange={setValue} />
        <div className='text-subtle text-sm'>Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const ControlledWithTimezone: Story = {
  name: 'Examples / Controlled with Timezone',
  render: () => {
    const [value, setValue] = useState<string | null>('12:00Z');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Controlled time picker with timezone. The value is in UTC format (ending with Z). The displayed time is
          converted to local time.
        </div>
        <TimePicker value={value} onValueChange={setValue} timezone />
        <div className='text-subtle text-sm'>UTC Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const SideBySide: Story = {
  name: 'Examples / Side by Side Comparison',
  render: () => {
    const [localValue, setLocalValue] = useState<string | null>('14:30');
    const [utcValue, setUtcValue] = useState<string | null>('14:30Z');

    return (
      <div className='flex flex-col items-center gap-6 p-4'>
        <div className='text-subtle max-w-100 text-sm'>
          Comparison of local time (left) vs UTC time with timezone (right). Both are set to represent the same moment.
        </div>
        <div className='flex gap-8'>
          <div className='flex flex-col items-center gap-2'>
            <div className='text-main text-sm font-semibold'>Local Time</div>
            <TimePicker value={localValue} onValueChange={setLocalValue} />
            <div className='text-subtle text-xs'>Value: {localValue}</div>
          </div>
          <div className='flex flex-col items-center gap-2'>
            <div className='text-main text-sm font-semibold'>UTC Time</div>
            <TimePicker value={utcValue} onValueChange={setUtcValue} timezone />
            <div className='text-subtle text-xs'>Value: {utcValue}</div>
          </div>
        </div>
      </div>
    );
  },
};

const parseTime = (value: string): string | null => {
  if (!value) return null;
  const [hourStr, minuteStr] = value.split(':');
  const hour = Number.parseInt(hourStr ?? '', 10);
  const minute = Number.parseInt(minuteStr ?? '', 10);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${padZero(hour)}:${padZero(minute)}`;
};

export const TimeInput: Story = {
  name: 'Examples / Time Input',
  render: () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<string | null>('14:30');
    const [inputValue, setInputValue] = useState('14:30');
    const [open, setOpen] = useState(false);

    const handleTimeChange = (nextValue: string | null): void => {
      setValue(nextValue);
      setInputValue(nextValue ?? '');
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.currentTarget.value;
      setInputValue(nextValue);
      const parsed = parseTime(nextValue);
      if (parsed || nextValue === '') {
        setValue(parsed);
      }
    };

    return (
      <div className='flex w-80 flex-col gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          Type a time or use the icon; the input and picker stay in sync. Press Escape to close the picker and return
          focus to the input.
        </div>
        <TimePicker value={value} onValueChange={handleTimeChange} open={open} onOpenChange={setOpen}>
          <div ref={inputWrapperRef}>
            <Input
              ref={inputRef}
              label='Meeting time'
              placeholder='HH:MM'
              value={inputValue}
              onChange={handleInputChange}
              endAddon={
                <div className='flex h-full w-11 items-center justify-center bg-transparent'>
                  <TimePicker.Trigger className='size-8 bg-transparent' aria-label='Open time picker' />
                </div>
              }
            />
          </div>
          <TimePicker.Content anchorRef={inputWrapperRef} align='start' />
        </TimePicker>
      </div>
    );
  },
};

export const TimeInputInDialog: Story = {
  name: 'Examples / Time Input in Dialog',
  render: () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<string | null>('14:30');
    const [inputValue, setInputValue] = useState('14:30');
    const [pickerOpen, setPickerOpen] = useState(false);

    const handleTimeChange = (nextValue: string | null): void => {
      setValue(nextValue);
      setInputValue(nextValue ?? '');
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.currentTarget.value;
      setInputValue(nextValue);
      const parsed = parseTime(nextValue);
      if (parsed || nextValue === '') {
        setValue(parsed);
      }
    };

    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-120 text-sm'>
          Time picker inside a dialog. The popup is portaled to the body but works correctly with the dialog&apos;s
          focus trap.
        </div>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant='outline'>Open Dialog</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-96'>
              <Dialog.Header>
                <Dialog.Title>Select a Time</Dialog.Title>
                <Dialog.Close />
              </Dialog.Header>
              <Dialog.Body className='-mx-1.5 px-1.5 pb-2'>
                <TimePicker
                  value={value}
                  onValueChange={handleTimeChange}
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                >
                  <div ref={inputWrapperRef}>
                    <Input
                      ref={inputRef}
                      label='Meeting time'
                      placeholder='HH:MM'
                      value={inputValue}
                      onChange={handleInputChange}
                      endAddon={
                        <div className='flex h-full w-11 items-center justify-center bg-transparent'>
                          <TimePicker.Trigger className='size-8 bg-transparent' aria-label='Open time picker' />
                        </div>
                      }
                    />
                  </div>
                  <TimePicker.Content anchorRef={inputWrapperRef} align='start' />
                </TimePicker>
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

export const DefaultValue: Story = {
  name: 'Features / Default Value',
  render: () => {
    const [value, setValue] = useState<string | null>('09:15');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>Time picker initialized with a default value of 09:15.</div>
        <TimePicker defaultValue='09:15' onValueChange={setValue} />
        <div className='text-subtle text-sm'>Current value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const DefaultValueWithTimezone: Story = {
  name: 'Features / Default Value with Timezone',
  render: () => {
    const [value, setValue] = useState<string | null>('08:00Z');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Time picker with timezone initialized with a UTC value. The time is displayed in local time.
        </div>
        <TimePicker defaultValue='08:00Z' timezone onValueChange={setValue} />
        <div className='text-subtle text-sm'>Current value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const HiddenInput: Story = {
  name: 'Features / Hidden Input',
  render: () => {
    const [value, setValue] = useState<string | null>('10:30');
    const [submitted, setSubmitted] = useState('None');

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const result = data.get('meetingTime');
      setSubmitted(typeof result === 'string' && result ? result : 'None');
    };

    return (
      <form onSubmit={handleSubmit} className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Hidden input keeps form submissions in sync with the selected time.
        </div>
        <TimePicker value={value} onValueChange={setValue} name='meetingTime' className='flex-col'>
          <div className='flex items-center gap-2'>
            <TimePicker.HourSelect className='w-20' />
            <span className='text-main text-lg font-bold'>:</span>
            <TimePicker.MinuteSelect className='w-20' />
          </div>
          <TimePicker.HiddenInput />
        </TimePicker>
        <div className='text-subtle text-sm'>Current value: {value ?? 'None'}</div>
        <Button type='submit' size='md'>
          Submit
        </Button>
        <div className='text-subtle text-sm'>Submitted value: {submitted}</div>
      </form>
    );
  },
};

export const HiddenInputWithTimezone: Story = {
  name: 'Features / Hidden Input with Timezone',
  render: () => {
    const [value, setValue] = useState<string | null>('14:00Z');
    const [submitted, setSubmitted] = useState('None');

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const result = data.get('meetingTime');
      setSubmitted(typeof result === 'string' && result ? result : 'None');
    };

    return (
      <form onSubmit={handleSubmit} className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          With timezone enabled, the submitted value is in UTC format with Z suffix.
        </div>
        <TimePicker value={value} onValueChange={setValue} name='meetingTime' timezone className='flex-col'>
          <div className='flex items-center gap-2'>
            <TimePicker.HourSelect className='w-20' />
            <span className='text-main text-lg font-bold'>:</span>
            <TimePicker.MinuteSelect className='w-20' />
          </div>
          <TimePicker.Timezone className='mt-2 text-center' />
          <TimePicker.HiddenInput />
        </TimePicker>
        <div className='text-subtle text-sm'>Current value: {value ?? 'None'}</div>
        <Button type='submit' size='md'>
          Submit
        </Button>
        <div className='text-subtle text-sm'>Submitted UTC value: {submitted}</div>
      </form>
    );
  },
};

export const CustomLayout: Story = {
  name: 'Features / Custom Layout',
  render: () => {
    const [value, setValue] = useState<string | null>(() => getNowValue(false));
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Custom layout using compound components for full control over the structure.
        </div>
        <TimePicker className='flex-col' onValueChange={setValue}>
          <div className='flex items-center gap-2'>
            <TimePicker.HourSelect className='w-20' />
            <span className='text-main text-lg font-bold'>:</span>
            <TimePicker.MinuteSelect className='w-20' />
          </div>
          <TimePicker.Timezone className='mt-2 text-center' />
        </TimePicker>
        <div className='text-subtle text-sm'>Current value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const CustomLayoutWithTimezone: Story = {
  name: 'Features / Custom Layout with Timezone',
  render: () => {
    const [value, setValue] = useState<string | null>(() => getNowValue(true));
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Custom vertical layout with timezone displayed below the time.
        </div>
        <TimePicker timezone className='flex-col' onValueChange={setValue}>
          <div className='flex items-center gap-2'>
            <TimePicker.HourSelect className='w-20' />
            <span className='text-main text-lg font-bold'>:</span>
            <TimePicker.MinuteSelect className='w-20' />
          </div>
          <TimePicker.Timezone className='mt-2 text-center' />
        </TimePicker>
        <div className='text-subtle text-sm'>Current value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const IncorrectValues: Story = {
  name: 'Features / Incorrect Values',
  render: () => {
    const [localValue, setLocalValue] = useState<string | null>('99:99');
    const [utcValue, setUtcValue] = useState<string | null>('25:00Z');

    return (
      <div className='flex flex-col items-center gap-4 p-4'>
        <div className='text-subtle max-w-96 text-sm'>
          Invalid values fall back to the current time display. Selecting a time updates the stored value.
        </div>
        <div className='flex flex-col items-center gap-2'>
          <TimePicker value={localValue} onValueChange={setLocalValue} />
          <div className='text-subtle text-xs'>Stored local value: {localValue ?? 'None'}</div>
        </div>
        <div className='flex flex-col items-center gap-2'>
          <TimePicker value={utcValue} onValueChange={setUtcValue} timezone />
          <div className='text-subtle text-xs'>Stored UTC value: {utcValue ?? 'None'}</div>
        </div>
      </div>
    );
  },
};

export const InvalidState: Story = {
  name: 'Features / Invalid State',
  render: () => {
    const [value, setValue] = useState<string | null>('14:30');
    const [isInvalid, setIsInvalid] = useState(true);

    return (
      <div className='flex flex-col items-center gap-4 p-4'>
        <div className='text-subtle max-w-96 text-sm'>
          The <code className='text-subtle'>invalid</code> prop sets <code className='text-subtle'>aria-invalid</code>{' '}
          on interactive elements for accessibility. Use with validation libraries.
        </div>
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' checked={isInvalid} onChange={e => setIsInvalid(e.currentTarget.checked)} />
          Mark as invalid
        </label>
        <TimePicker value={value} onValueChange={setValue} invalid={isInvalid} />
        <TimePicker value={value} onValueChange={setValue} invalid={isInvalid} native />
        <div className='text-subtle text-sm'>Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const WithTrigger: Story = {
  name: 'Examples / With Trigger',
  render: () => {
    const [value, setValue] = useState<string | null>('14:30');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Time picker with a trigger button. Click the clock icon to open the picker.
        </div>
        <TimePicker value={value} onValueChange={setValue}>
          <TimePicker.Trigger className='border-bdr-subtle rounded-sm border' />
          <TimePicker.Content />
        </TimePicker>
        <div className='text-subtle text-sm'>Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const WithTriggerAndTimezone: Story = {
  name: 'Examples / With Trigger and Timezone',
  render: () => {
    const [value, setValue] = useState<string | null>('12:00Z');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Trigger-based time picker with timezone support. The value is stored in UTC format.
        </div>
        <TimePicker value={value} onValueChange={setValue} timezone>
          <TimePicker.Trigger className='border-bdr-subtle rounded-sm border' />
          <TimePicker.Content />
        </TimePicker>
        <div className='text-subtle text-sm'>UTC Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const TriggerWithCustomContent: Story = {
  name: 'Features / Trigger with Custom Content',
  render: () => {
    const [value, setValue] = useState<string | null>('09:45');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>Trigger with custom content layout inside the popup.</div>
        <TimePicker value={value} onValueChange={setValue} timezone>
          <TimePicker.Trigger className='border-bdr-subtle rounded-sm border' />
          <TimePicker.Content className='flex-col'>
            <div className='flex items-center gap-2'>
              <TimePicker.HourSelect className='w-20' />
              <span className='text-main text-lg font-bold'>:</span>
              <TimePicker.MinuteSelect className='w-20' />
            </div>
            <TimePicker.Timezone className='mt-2 text-center' />
          </TimePicker.Content>
        </TimePicker>
        <div className='text-subtle text-sm'>Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const CustomTrigger: Story = {
  name: 'Features / Custom Trigger',
  render: () => {
    const [value, setValue] = useState<string | null>('16:00');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Custom trigger button using the asChild pattern to render a Button component.
        </div>
        <TimePicker value={value} onValueChange={setValue}>
          <TimePicker.Trigger asChild>
            <Button variant='outline' size='md'>
              Select Time: {value ?? 'None'}
            </Button>
          </TimePicker.Trigger>
          <TimePicker.Content />
        </TimePicker>
        <div className='text-subtle text-sm'>Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const TriggerAlignEnd: Story = {
  name: 'Features / Trigger Align End',
  render: () => {
    const [value, setValue] = useState<string | null>('10:15');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>Content aligned to the end (right) of the trigger button.</div>
        <div className='flex w-full justify-end'>
          <TimePicker value={value} onValueChange={setValue}>
            <TimePicker.Trigger className='border-bdr-subtle rounded-sm border' />
            <TimePicker.Content align='end' />
          </TimePicker>
        </div>
        <div className='text-subtle text-sm'>Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const ReferenceDateDST: Story = {
  name: 'Features / Reference Date (DST)',
  render: () => {
    // Summer date (typically DST in northern hemisphere)
    const summerDate = new Date(2024, 6, 15); // July 15, 2024
    // Winter date (typically standard time in northern hemisphere)
    const winterDate = new Date(2024, 0, 15); // January 15, 2024

    const [season, setSeason] = useState<'summer' | 'winter'>('summer');
    const [value, setValue] = useState<string | null>('12:00Z');

    const selectedDate = season === 'summer' ? summerDate : winterDate;

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
      <div className='flex flex-col items-center gap-4 p-4'>
        <div className='text-subtle max-w-96 text-sm'>
          Select a summer or winter date to see how the timezone offset changes due to Daylight Saving Time (DST). The
          time picker uses the selected date as reference for UTC↔local conversion.
        </div>
        <div className='flex gap-3'>
          <Button size='sm' variant={season === 'summer' ? 'solid' : 'outline'} onClick={() => setSeason('summer')}>
            Summer: {formatDate(summerDate)}
          </Button>
          <Button size='sm' variant={season === 'winter' ? 'solid' : 'outline'} onClick={() => setSeason('winter')}>
            Winter: {formatDate(winterDate)}
          </Button>
        </div>
        <TimePicker value={value} onValueChange={setValue} referenceDate={selectedDate} timezone />
        <div className='flex flex-col items-center gap-1 text-sm'>
          <div className='text-subtle'>UTC Value: {value ?? 'None'}</div>
          <div className='text-subtle'>Reference Date: {formatDate(selectedDate)}</div>
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  name: 'Features / Interactive Playground',
  render: () => {
    const summerDate = new Date(2024, 6, 15); // July 15, 2024
    const winterDate = new Date(2024, 0, 15); // January 15, 2024

    const [value, setValue] = useState<string | null>('12:00Z');
    const [useTrigger, setUseTrigger] = useState(false);
    const [timezone, setTimezone] = useState(true);
    const [season, setSeason] = useState<'summer' | 'winter'>('summer');

    const selectedDate = season === 'summer' ? summerDate : winterDate;

    const handleTimezoneChange = (event: FormEvent<HTMLInputElement>): void => {
      const nextTimezone = event.currentTarget.checked;
      setTimezone(nextTimezone);
      setValue(prev => {
        if (!prev) return prev;
        const isUtc = prev.endsWith('Z');
        if (nextTimezone && !isUtc) return toUtcValue(prev);
        if (!nextTimezone && isUtc) return toLocalValue(prev);
        return prev;
      });
    };

    const handlePreset = (preset: string): void => {
      setValue(timezone ? `${preset}Z` : preset);
    };

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
      <div className='flex flex-col items-center gap-4 p-4'>
        <div className='text-subtle max-w-100 text-sm'>
          Interactive playground to explore all TimePicker features: trigger mode, timezone, reference date for DST, and
          value presets.
        </div>

        {/* Controls */}
        <div className='flex flex-wrap items-center justify-center gap-3 text-sm'>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={useTrigger}
              onChange={e => setUseTrigger(e.currentTarget.checked)}
              className='size-4'
            />
            <span>Use Trigger</span>
          </label>
          <label className='flex items-center gap-2'>
            <input type='checkbox' checked={timezone} onChange={handleTimezoneChange} className='size-4' />
            <span>Timezone</span>
          </label>
        </div>

        {/* Reference Date */}
        {timezone && (
          <div className='flex gap-2'>
            <Button size='sm' variant={season === 'summer' ? 'solid' : 'outline'} onClick={() => setSeason('summer')}>
              {formatDate(summerDate)}
            </Button>
            <Button size='sm' variant={season === 'winter' ? 'solid' : 'outline'} onClick={() => setSeason('winter')}>
              {formatDate(winterDate)}
            </Button>
          </div>
        )}

        {/* Time Picker */}
        {useTrigger ? (
          <TimePicker value={value} onValueChange={setValue} timezone={timezone} referenceDate={selectedDate}>
            <TimePicker.Trigger className='border-bdr-subtle rounded-sm border' />
            <TimePicker.Content />
          </TimePicker>
        ) : (
          <TimePicker value={value} onValueChange={setValue} timezone={timezone} referenceDate={selectedDate} />
        )}

        {/* Presets */}
        <div className='flex gap-2'>
          <Button size='sm' variant='outline' onClick={() => handlePreset('09:00')}>
            09:00
          </Button>
          <Button size='sm' variant='outline' onClick={() => handlePreset('12:00')}>
            12:00
          </Button>
          <Button size='sm' variant='outline' onClick={() => handlePreset('18:00')}>
            18:00
          </Button>
          <Button size='sm' variant='outline' onClick={() => setValue(null)}>
            Clear
          </Button>
        </div>

        {/* Value Display */}
        <div className='text-subtle text-sm'>Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const NativeInput: Story = {
  name: 'Features / Native Input',
  render: () => {
    const [value, setValue] = useState<string | null>('14:30');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Native time input using the built-in time picker. This is the default on mobile devices, or can be forced with
          the native prop.
        </div>
        <TimePicker value={value} onValueChange={setValue} native />
        <div className='text-subtle text-sm'>Value: {value ?? 'None'}</div>
      </div>
    );
  },
};

export const NativeInputWithTimezone: Story = {
  name: 'Features / Native Input with Timezone',
  render: () => {
    const [value, setValue] = useState<string | null>('12:00Z');
    return (
      <div className='flex flex-col items-center gap-3 p-4'>
        <div className='text-subtle max-w-80 text-sm'>
          Native time input with timezone support. The input shows local time, but the value is stored in UTC format.
        </div>
        <TimePicker value={value} onValueChange={setValue} native timezone />
        <div className='text-subtle text-sm'>UTC Value: {value ?? 'None'}</div>
      </div>
    );
  },
};
