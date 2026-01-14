import type { Meta, StoryObj } from '@storybook/preact-vite';
import { ChevronLeft, ChevronRight } from 'lucide-preact';
import { useState } from 'react';
import { Button } from '../button';
import { Dialog } from '../dialog/dialog';
import { IconButton } from '../icon-button';
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
        <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
        <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
        <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
          <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
          <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
          <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
          <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
          <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
        </div>

        <div className='flex items-center justify-between'>
          <Stepper.Previous asChild>
            <IconButton icon={ChevronLeft} variant='outline' className='rounded-full' />
          </Stepper.Previous>

          <Stepper.Dots />

          <Stepper.Next asChild>
            <IconButton icon={ChevronRight} variant='outline' className='rounded-full' />
          </Stepper.Next>
        </div>
      </Stepper.Root>
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
          <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
            className='rounded bg-surface-neutral-hover px-3 py-1 text-sm'
          >
            Select step 1
          </button>
          <button
            type='button'
            onClick={() => setStep('step2')}
            className='rounded bg-surface-neutral-hover px-3 py-1 text-sm'
          >
            Select step 2
          </button>
          <button
            type='button'
            onClick={() => setStep('step3')}
            className='rounded bg-surface-neutral-hover px-3 py-1 text-sm'
          >
            Select step 3
          </button>
        </div>
        <p className='text-center text-sm text-subtle'>
          Current: <span className='font-semibold'>{step}</span>
        </p>
      </div>
    );
  },
};

export const SmallOnEdges: Story = {
  name: 'Features / Small on edges',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <ul className='space-y-1 text-sm'>
          <li>Smaller steps on edges.</li>
        </ul>
        <Stepper.Root defaultValue='step1' smallOnEdges className='flex size-96 flex-col gap-4'>
          <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
            <Stepper.Panel value='step1'>Step 1 content</Stepper.Panel>
            <Stepper.Panel value='step2'>Step 2 content</Stepper.Panel>
            <Stepper.Panel value='step3'>Step 3 content</Stepper.Panel>
            <Stepper.Panel value='step4'>Step 4 content</Stepper.Panel>
            <Stepper.Panel value='step5'>Step 5 content</Stepper.Panel>
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
        <ul className='space-y-1 text-sm'>
          <li>Steps 4 and 5 are locked.</li>
        </ul>
        <Stepper.Root defaultValue='step1' className='flex size-96 flex-col gap-4'>
          <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
        <ul className='space-y-1 text-sm'>
          <li>10 steps in total.</li>
          <li>5 dots visible at a time.</li>
          <li>Active dot always centered.</li>
        </ul>

        <Stepper.Root defaultValue='step4' maxVisible={5} className='flex size-96 flex-col gap-4'>
          <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
        <ul className='space-y-1 text-sm'>
          <li>10 steps in total.</li>
          <li>6 dots visible at a time.</li>
          <li>Active dot always centered.</li>
          <li>
            If maxVisible prop is even, its impossible to <br />
            balance dots to the right / left of the central
            <br /> one evenly, so the right side will have one more dot.
          </li>
        </ul>

        <Stepper.Root defaultValue='step4' maxVisible={6} className='flex size-96 flex-col gap-4'>
          <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
          <Dialog.Content className='w-160 max-w-auto'>
            <Stepper.Root defaultValue='step1' smallOnEdges maxVisible={5}>
              <Dialog.Body className='flex size-full flex-col gap-4 p-1.5'>
                <div className='flex flex-col gap-4'>
                  <ul className='space-y-1 text-sm'>
                    <li>10 steps in total.</li>
                    <li>Steps 9 and 10 are locked.</li>
                    <li>5 dots visible at a time.</li>
                    <li>Small dots on edges.</li>
                    <li>Button navigation.</li>
                  </ul>

                  <div className='flex h-96 w-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
                </div>
              </Dialog.Body>

              <Dialog.Footer className='mx-auto mt-5 flex w-fit items-center justify-between p-1.5'>
                <Stepper.Previous asChild>
                  <IconButton icon={ChevronLeft} variant='outline' className='rounded-full' />
                </Stepper.Previous>

                <Stepper.Dots />

                <Stepper.Next asChild>
                  <IconButton icon={ChevronRight} variant='outline' className='rounded-full' />
                </Stepper.Next>
              </Dialog.Footer>
            </Stepper.Root>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  },
};

export const KeyboardNavigation: Story = {
  name: 'Behavior / Keyboard Navigation',
  render: () => {
    return (
      <div className='flex flex-col gap-4'>
        <ul className='space-y-1 text-sm'>
          <li>
            <kbd className='rounded bg-surface-neutral-hover px-1'>Tab</kbd> - Enter/exit the steps list
          </li>
          <li>
            <kbd className='rounded bg-surface-neutral-hover px-1'>Arrow Left/Right</kbd> - Move between and select step
            (if possible)
          </li>
        </ul>
        <Stepper.Root defaultValue='step1' className='flex size-96 flex-col gap-4'>
          <div className='flex size-full items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
          <Stepper.Dots />
        </Stepper.Root>
      </div>
    );
  },
};
