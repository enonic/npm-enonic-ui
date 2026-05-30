import { ChevronLeft, ChevronRight } from 'lucide-preact';
import { useCallback, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Button } from '../button';
import { Dialog } from '../dialog/dialog';
import { IconButton } from '../icon-button';
import { Tooltip } from '../tooltip';
import { Stepper, type StepperRootProps } from './stepper';

type Story = StoryObj<StepperRootProps>;

export default {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<StepperRootProps>;

//
// * Examples
//

export const Basic: Story = {
  name: 'Examples / Basic',
  render: () => {
    return (
      <Stepper.Root defaultValue='step1' className='flex size-96 flex-col gap-4'>
        <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
          <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
          <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
          <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
          <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
          <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
        </div>
        <Stepper.Dots />
      </Stepper.Root>
    );
  },
};

export const NavigationWithButtons: Story = {
  name: 'Examples / Navigation with buttons',
  render: () => {
    return (
      <Stepper.Root defaultValue='step1' className='flex size-96 flex-col gap-4'>
        <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
          <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
          <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
          <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
          <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
          <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
        </div>

        <div className='flex items-center justify-between'>
          <Stepper.Previous asChild>
            <Button variant='outline' label='Back' />
          </Stepper.Previous>
          <Stepper.Next asChild>
            <Button variant='outline' label='Next' />
          </Stepper.Next>
        </div>
      </Stepper.Root>
    );
  },
};

export const NavigationWithButtonsAndDots: Story = {
  name: 'Examples / Navigation with buttons and dots',
  render: () => {
    return (
      <Stepper.Root defaultValue='step1' className='flex size-96 flex-col gap-4'>
        <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
          <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
          <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
          <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
          <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
          <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
        </div>

        <div className='grid grid-cols-[1fr_auto_1fr] items-center'>
          <Stepper.Previous asChild>
            <IconButton icon={ChevronLeft} variant='outline' className='justify-self-start rounded-full' />
          </Stepper.Previous>

          <Stepper.Dots />

          <Stepper.Next asChild>
            <IconButton icon={ChevronRight} variant='outline' className='justify-self-end rounded-full' />
          </Stepper.Next>
        </div>
      </Stepper.Root>
    );
  },
};

export const DialogWithStepper: Story = {
  name: 'Examples / With Dialog',
  render: () => {
    return (
      <Dialog>
        <Dialog.Trigger>
          <Button variant='outline' label='Open Dialog with Stepper' />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className='max-w-auto w-120'>
            <Stepper.Root defaultValue='step1' smallOnEdges maxVisible={5}>
              <Dialog.Body className='flex size-full flex-col gap-4 p-1.5'>
                <div className='border-bdr-subtle flex h-48 w-full items-center justify-center rounded-md border border-dashed'>
                  <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
                  <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
                  <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
                  <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
                  <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
                  <Stepper.Panel value='step6'>Step 6 content</Stepper.Panel>
                  <Stepper.Panel value='step7'>Step 7 content</Stepper.Panel>
                  <Stepper.Panel value='step8'>Step 8 content</Stepper.Panel>
                  <Stepper.Panel value='step9' locked>
                    Step 9 content
                  </Stepper.Panel>
                  <Stepper.Panel value='step10' locked>
                    Step 10 content
                  </Stepper.Panel>
                </div>
              </Dialog.Body>

              <Dialog.Footer className='grid grid-cols-[1fr_auto_1fr] items-center p-1.5'>
                <Stepper.Previous asChild>
                  <Button variant='outline' label='Previous' className='justify-self-start' />
                </Stepper.Previous>

                <Stepper.Dots />

                <Stepper.Next asChild>
                  <Button variant='outline' label='Next' className='justify-self-end' />
                </Stepper.Next>
              </Dialog.Footer>
            </Stepper.Root>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  },
};

export const ControlledSteps: Story = {
  name: 'Features / Controlled steps',
  render: () => {
    const [step, setStep] = useState('step1');

    return (
      <div className='space-y-4'>
        <Stepper.Root value={step} onValueChange={setStep} className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
          </div>
          <Stepper.Dots />
        </Stepper.Root>
        <div className='flex items-center justify-center gap-2'>
          <button
            type='button'
            onClick={() => setStep('step1')}
            className='bg-surface-neutral-hover rounded px-3 py-1 text-sm'
          >
            Select step 1
          </button>
          <button
            type='button'
            onClick={() => setStep('step2')}
            className='bg-surface-neutral-hover rounded px-3 py-1 text-sm'
          >
            Select step 2
          </button>
          <button
            type='button'
            onClick={() => setStep('step3')}
            className='bg-surface-neutral-hover rounded px-3 py-1 text-sm'
          >
            Select step 3
          </button>
        </div>
        <p className='text-subtle text-center text-sm'>
          Current: <span className='font-semibold'>{step}</span>
        </p>
      </div>
    );
  },
};

export const ControlledLockedSteps: Story = {
  name: 'Features / Controlled locked steps',
  render: () => {
    const steps = ['step1', 'step2', 'step3'];
    const [lockedSteps, setLockedSteps] = useState<string[]>([]);

    const toggleLock = useCallback(
      (step: string) => {
        if (lockedSteps.includes(step)) {
          setLockedSteps(prev => prev.filter(s => s !== step));
        } else {
          setLockedSteps(prev => [...prev, step]);
        }
      },
      [lockedSteps],
    );

    return (
      <div className='space-y-4'>
        <Stepper.Root defaultValue='step1' className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            {steps.map(step => (
              <Stepper.Panel key={step} value={step} locked={lockedSteps.includes(step)}>
                {step} content
              </Stepper.Panel>
            ))}
          </div>
          <Stepper.Dots />
        </Stepper.Root>
        <div className='flex items-center justify-center gap-2'>
          {steps.map(step => (
            <button
              key={step}
              type='button'
              onClick={() => toggleLock(step)}
              className='bg-surface-neutral-hover rounded px-3 py-1 text-sm'
            >
              {lockedSteps.includes(step) ? `Unlock ${step}` : `Lock ${step}`}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

export const SmallOnEdges: Story = {
  name: 'Features / Small on edges',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <p className='text-subtle text-sm'>Smaller dots on edges.</p>
        <Stepper.Root defaultValue='step5' smallOnEdges maxVisible={5} className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
            <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
            <Stepper.Panel value='step6'>Step 6 content</Stepper.Panel>
            <Stepper.Panel value='step7'>Step 7 content</Stepper.Panel>
            <Stepper.Panel value='step8'>Step 8 content</Stepper.Panel>
            <Stepper.Panel value='step9'>Step 9 content</Stepper.Panel>
          </div>
          <Stepper.Dots />
        </Stepper.Root>
      </div>
    );
  },
};

export const Locked: Story = {
  name: 'Features / Locked steps',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <p className='text-subtle text-sm'>Steps 4 and 5 are locked.</p>
        <Stepper.Root defaultValue='step1' className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4' locked>
              Step 4 content
            </Stepper.Panel>
            <Stepper.Panel value='step5' locked>
              Step 5 content
            </Stepper.Panel>
          </div>
          <Stepper.Dots />
        </Stepper.Root>
      </div>
    );
  },
};

export const MaxVisible: Story = {
  name: 'Features / Maximum visible steps (odd)',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <p className='text-subtle text-sm'>5 out of 10 dots visible at a time, active dot centered.</p>
        <Stepper.Root defaultValue='step4' maxVisible={5} className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
            <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
            <Stepper.Panel value='step6'>Step 6 content</Stepper.Panel>
            <Stepper.Panel value='step7'>Step 7 content</Stepper.Panel>
            <Stepper.Panel value='step8'>Step 8 content</Stepper.Panel>
            <Stepper.Panel value='step9'>Step 9 content</Stepper.Panel>
            <Stepper.Panel value='step10'>Step 10 content</Stepper.Panel>
          </div>
          <Stepper.Dots />
        </Stepper.Root>
      </div>
    );
  },
};

export const EvenMaxVisible: Story = {
  name: 'Features / Maximum visible steps (even)',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <p className='text-subtle text-sm'>6 out of 10 dots visible, right side has one more dot.</p>
        <Stepper.Root defaultValue='step4' maxVisible={6} className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
            <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
            <Stepper.Panel value='step6'>Step 6 content</Stepper.Panel>
            <Stepper.Panel value='step7'>Step 7 content</Stepper.Panel>
            <Stepper.Panel value='step8'>Step 8 content</Stepper.Panel>
            <Stepper.Panel value='step9'>Step 9 content</Stepper.Panel>
            <Stepper.Panel value='step10'>Step 10 content</Stepper.Panel>
          </div>
          <Stepper.Dots />
        </Stepper.Root>
      </div>
    );
  },
};

export const DisabledDots: Story = {
  name: 'Features / Disabled dots',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <p className='text-subtle text-sm'>All dots are disabled and non-interactive.</p>
        <Stepper.Root defaultValue='step2' className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
            <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
          </div>
          <Stepper.Dots disabled />
        </Stepper.Root>
      </div>
    );
  },
};

export const DotsTooltip: Story = {
  name: 'Features / Tooltip',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <p className='text-subtle text-sm'>Dots Tooltip.</p>
        <Stepper.Root defaultValue='step2' className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
            <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
          </div>
          <Stepper.Dots
            renderDot={(dot, step) => (
              <Tooltip delay={150} value={`This is step: ${step}`}>
                {dot}
              </Tooltip>
            )}
          />
        </Stepper.Root>
      </div>
    );
  },
};

export const DotsCustomTooltip: Story = {
  name: 'Features / Custom tooltip',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <p className='text-subtle text-sm'>Custom Dots Tooltip.</p>
        <Stepper.Root defaultValue='step2' className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
            <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
          </div>
          <Stepper.Dots
            renderDot={(dot, step) => (
              <Tooltip delay={150} side='top' value={<span className='font-semibold uppercase'>{step}</span>}>
                {dot}
              </Tooltip>
            )}
          />
        </Stepper.Root>
      </div>
    );
  },
};

export const KeyboardNavigation: Story = {
  name: 'Behavior / Keyboard Navigation',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='bg-surface-primary w-96 rounded-sm p-3 text-sm'>
          <p className='mb-2 font-medium'>Keyboard shortcuts:</p>
          <ul className='text-subtle space-y-1 text-xs'>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Tab</kbd> - Enter/exit the steps list
            </li>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Arrow Left/Right</kbd> - Move between and select
              step
            </li>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>Home</kbd> - Go to first enabled step
            </li>
            <li>
              <kbd className='bg-bdr-subtle text-main rounded px-1'>End</kbd> - Go to last enabled step
            </li>
          </ul>
        </div>
        <Stepper.Root defaultValue='step1' className='flex size-96 flex-col gap-4'>
          <div className='border-bdr-subtle flex size-full items-center justify-center rounded-md border border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
            <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
            <Stepper.Panel value='step6'>Step 6 content</Stepper.Panel>
            <Stepper.Panel value='step7' locked>
              Step 7 content
            </Stepper.Panel>
            <Stepper.Panel value='step8' locked>
              Step 8 content
            </Stepper.Panel>
            <Stepper.Panel value='step9' locked>
              Step 9 content
            </Stepper.Panel>
            <Stepper.Panel value='step10' locked>
              Step 10 content
            </Stepper.Panel>
          </div>

          <div className='grid grid-cols-[1fr_auto_1fr] items-center'>
            <Stepper.Previous asChild>
              <IconButton icon={ChevronLeft} variant='outline' className='justify-self-start rounded-full' />
            </Stepper.Previous>

            <Stepper.Dots />

            <Stepper.Next asChild>
              <IconButton icon={ChevronRight} variant='outline' className='justify-self-end rounded-full' />
            </Stepper.Next>
          </div>
        </Stepper.Root>
      </div>
    );
  },
};
