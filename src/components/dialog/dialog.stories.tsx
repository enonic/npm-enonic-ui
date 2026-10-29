import { BadgeInfo, ChevronLeft, ChevronRight, Loader2, Plus, TriangleAlert, User } from 'lucide-react';
import { type ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { expect, userEvent, waitFor } from 'storybook/test';

import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Combobox } from '@/components/combobox';
import { Input } from '@/components/input';
import { Listbox } from '@/components/listbox';
import { RadioGroup } from '@/components/radio-group';
import { Stepper } from '@/components/stepper';
import { Tab } from '@/components/tab';
import { Toast } from '@/components/toast';
import { Tooltip } from '@/components/tooltip';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Dialog } from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Dialog>;

//
// * Examples
//

export const BasicDialog: Story = {
  name: 'Examples / Basic',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='flex flex-col gap-2.5'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open as Controlled' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Button variant='outline' label='Open Uncontrolled (Trigger)' />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader
                title='Welcome to Dashboard'
                description='Get started with your new workspace'
                withClose
              />
              <Dialog.Body>
                <div className='space-y-3'>
                  <p>
                    This is a basic dialog example using all default components. It includes a header with title and
                    description, a body section for content, and a footer with action buttons.
                  </p>
                  <p className='text-subtle text-sm'>
                    You can close this dialog by clicking outside, pressing Escape, or using the buttons below.
                  </p>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' size='lg' onClick={() => setOpen(false)} label='Maybe Later' />
                <Button variant='solid' size='lg' onClick={() => setOpen(false)} label='Get Started' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const LoadingDialog: Story = {
  name: 'Examples / Loading',
  render: () => {
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(0);

    const startProcess = (): void => {
      setOpen(true);
      setProgress(0);

      let current = 0;
      const interval = setInterval(() => {
        if (current >= 100) {
          clearInterval(interval);
          setTimeout(() => setOpen(false), 500);
          return;
        }
        current += 10;
        setProgress(current);
      }, 500);
    };

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={startProcess} label='Start Processing' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-100'>
              <Dialog.Body className='flex flex-col items-center justify-center space-y-4 py-8'>
                <Loader2 className='text-main size-12 animate-spin' />
                <div className='space-y-2 text-center'>
                  <p className='font-semibold'>Processing your request</p>
                  <p className='text-subtle text-sm'>Please wait while we sync your data...</p>
                  <p className='text-subtle text-xs'>{progress}% complete</p>
                </div>
              </Dialog.Body>
              <Dialog.Footer className='justify-center'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setOpen(false);
                    setProgress(0);
                  }}
                  label='Cancel'
                  size='sm'
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const QuickConfirmation: Story = {
  name: 'Examples / Quick Confirmation',
  render: () => {
    const [open, setOpen] = useState(false);

    const handleConfirm = (): void => {
      console.log('Confirmed');
      setOpen(false);
    };

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Enable Feature' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-96'>
              <Dialog.Body className='py-2 text-center'>
                <p className='font-medium'>Enable experimental features?</p>
                <p className='text-subtle mt-1 text-sm'>This may affect application stability.</p>
              </Dialog.Body>
              <Dialog.Footer className='justify-center'>
                <Button variant='outline' size='lg' onClick={() => setOpen(false)} label='Cancel' />
                <Button variant='solid' size='lg' onClick={handleConfirm} label='Enable' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const FormDialog: Story = {
  name: 'Examples / Form',
  render: () => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isDirty, setIsDirty] = useState(false);

    const validate = (): boolean => {
      const newErrors: { email?: string; password?: string } = {};

      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Invalid email format';
      }

      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (): void => {
      if (validate()) {
        console.log('Form submitted:', { email, password });
        setOpen(false);
        setEmail('');
        setPassword('');
        setIsDirty(false);
        setErrors({});
      }
    };

    const handleEscapeKeyDown = (e: KeyboardEvent): void => {
      if (isDirty) {
        e.preventDefault();
      }
    };

    const handlePointerDownOutside = (e: PointerEvent): void => {
      if (isDirty) {
        e.preventDefault();
      }
    };

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Sign In' startIcon={User} />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content
              className='w-120'
              onEscapeKeyDown={handleEscapeKeyDown}
              onPointerDownOutside={handlePointerDownOutside}
            >
              <Dialog.DefaultHeader title='Sign In' description='Enter your credentials to access your account.' />
              <Dialog.Body className='space-y-4'>
                <div className='space-y-2'>
                  <Input
                    label='Email'
                    type='email'
                    value={email}
                    onChange={e => {
                      setEmail(e.currentTarget.value);
                      setIsDirty(true);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    placeholder='you@example.com'
                  />
                  {errors.email && <p className='text-error text-sm'>{errors.email}</p>}
                </div>

                <div className='space-y-2'>
                  <Input
                    label='Password'
                    type='password'
                    value={password}
                    onChange={e => {
                      setPassword(e.currentTarget.value);
                      setIsDirty(true);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder='Enter password'
                  />
                  {errors.password && <p className='text-error text-sm'>{errors.password}</p>}
                </div>

                {isDirty && (
                  <p className='text-subtle text-xs'>
                    <TriangleAlert className='mr-1 inline size-3' />
                    Dialog will not close while form has unsaved changes
                  </p>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant='outline'
                  size='lg'
                  onClick={() => {
                    setOpen(false);
                    setEmail('');
                    setPassword('');
                    setIsDirty(false);
                    setErrors({});
                  }}
                  label='Cancel'
                />
                <Button variant='solid' size='lg' onClick={handleSubmit} label='Sign In' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const OpenByDefault: Story = {
  name: 'Examples / Open By Default',
  tags: ['!autodocs'],
  render: () => {
    return (
      <Dialog defaultOpen>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className='w-auto min-w-auto gap-5'>
            <Dialog.DefaultHeader title='Hey!' description='I was opened automatically' />
            <Dialog.Body className='bg-surface-info text-info flex items-center gap-2 rounded-md p-4'>
              <BadgeInfo />
              <span>As soon as component mounted.</span>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  },
};

export const NestedConfirmation: Story = {
  name: 'Examples / Nested Confirmation',
  render: () => {
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [savedData, setSavedData] = useState({ name: '', email: '' });

    const isDirty = formData.name !== savedData.name || formData.email !== savedData.email;

    const requestClose = (): void => {
      if (confirmOpen) return;
      if (isDirty) {
        setConfirmOpen(true);
        return;
      }
      setOpen(false);
    };

    const handleOpenChange = (nextOpen: boolean): void => {
      if (nextOpen) {
        setOpen(true);
        return;
      }
      requestClose();
    };

    const handleDiscard = (): void => {
      setConfirmOpen(false);
      setOpen(false);
      setFormData(savedData);
    };

    const handleSave = (): void => {
      setSavedData(formData);
      setOpen(false);
    };

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Edit Profile' startIcon={User} />

        {/* Main Dialog */}
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader
                title='Edit Profile'
                description='Make changes to your profile here'
                withClose={false}
              />

              <Dialog.Body className='-m-2 space-y-4 p-2'>
                <Input
                  label='Name'
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.currentTarget.value }))}
                  placeholder='Enter your name'
                />
                <Input
                  label='Email'
                  type='email'
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.currentTarget.value }))}
                  placeholder='Enter your email'
                />
                {isDirty && (
                  <p className='text-subtle pt-1 text-xs'>
                    <TriangleAlert className='mr-1 inline size-3' />
                    You have unsaved changes
                  </p>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant='outline' size='lg' onClick={requestClose} label='Cancel' />
                <Button variant='solid' size='lg' onClick={handleSave} label='Save Changes' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>

        {/* Confirmation Dialog - renders on top due to DOM order */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className='z-40 bg-transparent' />
            <Dialog.Content className='w-96'>
              <Dialog.Body className='py-2'>
                <h2 className='text-lg font-semibold'>Discard changes?</h2>
                <p className='text-subtle mt-2 text-sm'>You have unsaved changes that will be lost.</p>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' size='lg' onClick={() => setConfirmOpen(false)} label='Keep Editing' />
                <Button
                  className='border-error bg-error text-alt hover:bg-error/90 active:bg-error/80'
                  variant='solid'
                  size='lg'
                  onClick={handleDiscard}
                  label='Discard'
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

//
// * Features
//

export const KeyboardAccessibleDialog: Story = {
  name: 'Features / Keyboard Accessible Dialog',
  render: () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState('step1');
    const [completed, setCompleted] = useState(false);

    return (
      <div className='space-y-3'>
        <Button
          variant='solid'
          label='Open keyboard steps'
          onClick={() => {
            setStep('step1');
            setCompleted(false);
            setOpen(true);
          }}
        />
        {completed && <p role='status'>All done!</p>}
        <Dialog open={open} onOpenChange={setOpen} step={step} onStepChange={setStep}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.StepHeader step='step1' title='1. Start' withClose />
              <Dialog.StepHeader step='step2' title='2. Keep going' withClose />
              <Dialog.StepHeader step='step3' title='3. Finish' withClose />
              <Dialog.Body className='space-y-4'>
                <Dialog.StepContent step='step1'>First step</Dialog.StepContent>
                <Dialog.StepContent step='step2'>Second step</Dialog.StepContent>
                <Dialog.StepContent step='step3'>Last step</Dialog.StepContent>
                <div className='text-subtle space-y-1 text-sm'>
                  <p>Keyboard accessible! Use ⌘ on Mac or Ctrl on Windows/Linux.</p>
                  <p>Previous: ⌘/Ctrl + Shift + Enter</p>
                  <p>Next: ⌘/Ctrl + Enter</p>
                  <p>Complete: ⌘/Ctrl + Enter</p>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.StepIndicator
                  previousLabel='Previous'
                  nextLabel='Next'
                  lastStepLabel='Complete'
                  keyboardShortcuts
                  dots
                  onLastStep={() => {
                    setCompleted(true);
                    setOpen(false);
                  }}
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const KeyboardActionCounter: Story = {
  name: 'Features / Keyboard Action Counter',
  render: () => {
    const [primary, setPrimary] = useState(0);
    const [secondary, setSecondary] = useState(0);

    return (
      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant='solid' label='Open shortcut counter' />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.DefaultHeader title='Shortcut counter' description='Try the keys or click the buttons.' withClose />
            <Dialog.Body className='space-y-2'>
              <p>Primary: {primary}</p>
              <p>Secondary: {secondary}</p>
              <p className='text-subtle text-sm'>Use ⌘ on Mac or Ctrl on Windows/Linux. Add Shift for secondary.</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Shortcut asChild shortcut='secondary'>
                <Button variant='outline' label='Secondary' onClick={() => setSecondary(count => count + 1)} />
              </Dialog.Shortcut>
              <Dialog.Shortcut asChild>
                <Button variant='solid' label='Primary' onClick={() => setPrimary(count => count + 1)} />
              </Dialog.Shortcut>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  },
};

export const CustomHeader: Story = {
  name: 'Features / Custom Header',
  render: () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(['Project Alpha', 'Project Beta', 'Project Gamma']);

    const handleNew = (): void => {
      const newItem = `Project ${String.fromCharCode(65 + items.length)}`;
      setItems([...items, newItem]);
    };

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Custom Header' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-140'>
              <Dialog.Header className='flex flex-col gap-2.5'>
                <Dialog.Title className='bg-surface-info text-info flex items-center gap-2 rounded-sm px-4 py-3'>
                  <BadgeInfo strokeWidth={2} />
                  <span className='flex-1 text-sm font-semibold uppercase'>Add new project?</span>
                  <Button
                    className='border-info text-info hover:bg-info/10 active:bg-info bg-transparent'
                    variant='outline'
                    onClick={handleNew}
                    label='Add'
                    size='sm'
                  />
                </Dialog.Title>
                <Dialog.Description>
                  <h2 className='text-2xl font-semibold'>Project Manager</h2>
                  <p>Manage and organize your active projects</p>
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body className='space-y-2'>
                {items.map(item => (
                  <div
                    key={item}
                    className='border-bdr-subtle flex items-center justify-between rounded-sm border px-3 py-1'
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant='outline' size='lg' label='Close' />
                </Dialog.Close>
                <Button variant='solid' size='lg' onClick={() => setOpen(false)} label='Save Changes' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const ScrollableContent: Story = {
  name: 'Features / Scrollable Content',
  render: () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);

    const items = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      name: `Selectable Item ${i + 1}`,
    }));

    const toggleItem = (id: number): void => {
      setSelected(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
    };

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Select Items' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='h-150'>
              <Dialog.DefaultHeader
                title='Select Items'
                description={`${selected.length} of ${items.length} items selected`}
                withClose
              />
              <Dialog.Body>
                {items.map(({ id, name }) => (
                  <Checkbox
                    key={id}
                    className={'hover:bg-surface-neutral-hover rounded-sm px-3 py-1'}
                    label={name}
                    checked={selected.includes(id)}
                    onCheckedChange={() => toggleItem(id)}
                  />
                ))}
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' size='lg' onClick={() => setOpen(false)} label='Cancel' />
                <Button
                  variant='solid'
                  size='lg'
                  onClick={() => setOpen(false)}
                  label={`Confirm (${selected.length})`}
                  disabled={selected.length === 0}
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const LargeDialog: Story = {
  name: 'Features / Large Dialog',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='View Details' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='max-w-auto h-160 w-200'>
              <Dialog.DefaultHeader
                title='Project Overview'
                description='Comprehensive view of project metrics and statistics'
                withClose
              />
              <Dialog.Body className='space-y-6'>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='border-bdr-subtle rounded-lg border p-4'>
                    <p className='text-subtle text-sm'>Total Tasks</p>
                    <p className='mt-1 text-3xl font-bold'>127</p>
                  </div>
                  <div className='border-bdr-subtle rounded-lg border p-4'>
                    <p className='text-subtle text-sm'>Completed</p>
                    <p className='text-success mt-1 text-3xl font-bold'>89</p>
                  </div>
                  <div className='border-bdr-subtle rounded-lg border p-4'>
                    <p className='text-subtle text-sm'>Pending</p>
                    <p className='text-warn mt-1 text-3xl font-bold'>38</p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold'>Recent Activity</h3>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(key => (
                    <div key={key} className='border-bdr-subtle rounded-lg border p-3'>
                      <p className='font-medium'>Task #{key} completed</p>
                      <p className='text-subtle text-sm'>2 hours ago by Team Member</p>
                    </div>
                  ))}
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold'>Team Members</h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(key => (
                      <div key={key} className='border-bdr-subtle flex items-center gap-3 rounded-lg border p-3'>
                        <div className='bg-main/10 flex size-10 items-center justify-center rounded-full'>
                          <User className='size-5' />
                        </div>
                        <div>
                          <p className='font-medium'>Member {key}</p>
                          <p className='text-subtle text-sm'>Developer</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' size='lg' onClick={() => setOpen(false)} label='Close' />
                <Button variant='solid' size='lg' onClick={() => setOpen(false)} label='Export Report' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const MultiStepWizard: Story = {
  name: 'Features / Multi-Step Wizard',
  render: () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState('step1');
    const [projectName, setProjectName] = useState('');
    const [projectType, setProjectType] = useState('');
    const [teamSize, setTeamSize] = useState('');

    const isFirstStep = step === 'step1';
    const isLastStep = step === 'step3';

    const canProceed =
      step === 'step1'
        ? projectName.length > 0
        : step === 'step2'
          ? projectType.length > 0
          : step === 'step3'
            ? teamSize.length > 0
            : false;

    const handleFinish = (): void => {
      console.log('Wizard completed:', { projectName, projectType, teamSize });
      setOpen(false);
      setStep('step1');
      setProjectName('');
      setProjectType('');
      setTeamSize('');
    };

    return (
      <div className='space-y-4'>
        <Button
          variant='solid'
          onClick={() => setOpen(true)}
          label='Create New Project'
          startIcon={Plus}
          iconStrokeWidth={2}
        />

        <Dialog open={open} onOpenChange={setOpen} step={step} onStepChange={setStep}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-140'>
              <Dialog.StepHeader
                step='step1'
                helper='Step 1 of 3'
                title='Create Project'
                description='Enter basic project information'
              />
              <Dialog.StepHeader
                step='step2'
                helper='Step 2 of 3'
                title='Create Project'
                description='Choose your project type'
              />
              <Dialog.StepHeader
                step='step3'
                helper='Step 3 of 3'
                title='Create Project'
                description='Set up your team'
              />

              <Dialog.Body className='-mx-2 px-2'>
                <Dialog.StepContent step='step1'>
                  <div className='space-y-3'>
                    <Input
                      label='Project Name'
                      value={projectName}
                      onChange={e => setProjectName(e.currentTarget.value)}
                      placeholder='Enter project name'
                    />
                    <p className='text-subtle text-sm'>
                      Choose a descriptive name for your project. You can always change it later.
                    </p>
                  </div>
                </Dialog.StepContent>

                <Dialog.StepContent step='step2'>
                  <div className='space-y-2'>
                    <h5 className='font-semibold'>Project Type</h5>
                    <div className='space-y-2'>
                      {['Web Application', 'Mobile App', 'Desktop Software', 'API Service'].map(type => (
                        <Button
                          key={type}
                          className='w-full justify-start border'
                          variant={projectType === type ? 'solid' : 'outline'}
                          onClick={() => setProjectType(type)}
                          label={type}
                          size='lg'
                        />
                      ))}
                    </div>
                  </div>
                </Dialog.StepContent>

                <Dialog.StepContent step='step3'>
                  <div className='space-y-2'>
                    <h5 className='font-semibold'>Expected Team Size</h5>
                    <div className='space-y-2'>
                      {['Just me', '2-5 people', '6-10 people', '11+ people'].map(team => (
                        <Button
                          key={team}
                          className='w-full justify-start border'
                          variant={teamSize === team ? 'solid' : 'outline'}
                          onClick={() => setTeamSize(team)}
                          label={team}
                          size='lg'
                        />
                      ))}
                    </div>
                  </div>
                </Dialog.StepContent>
              </Dialog.Body>

              <Dialog.Footer>
                <Stepper.Previous asChild>
                  <Button
                    variant='outline'
                    size='lg'
                    label='Back'
                    startIcon={ChevronLeft}
                    className={isFirstStep ? 'invisible' : undefined}
                    iconStrokeWidth={2}
                  />
                </Stepper.Previous>
                <div className='flex-1' />
                <Button
                  variant='outline'
                  size='lg'
                  onClick={() => {
                    setOpen(false);
                    setStep('step1');
                  }}
                  label='Cancel'
                />
                {!isLastStep ? (
                  <Stepper.Next asChild>
                    <Button
                      variant='solid'
                      size='lg'
                      label='Next'
                      endIcon={ChevronRight}
                      disabled={!canProceed}
                      iconStrokeWidth={2}
                    />
                  </Stepper.Next>
                ) : (
                  <Button
                    variant='solid'
                    size='lg'
                    onClick={handleFinish}
                    label='Create Project'
                    disabled={!canProceed}
                  />
                )}
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const AutoFocusInput: Story = {
  name: 'Features / Auto-Focus Input',
  render: () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOpenAutoFocus = (event: Event): void => {
      // Keep ownership of custom focus behavior after Dialog.Content gets baseline focus.
      event.preventDefault();
      inputRef.current?.focus();
    };

    const handleSubmit = (): void => {
      console.log('Submitted:', name);
      setOpen(false);
      setName('');
    };

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Quick Add Name' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120' onOpenAutoFocus={handleOpenAutoFocus}>
              <Dialog.DefaultHeader title='Add New Contact' description='Enter the contact name to continue' />
              <Dialog.Body className='-mx-3 space-y-3 px-3'>
                <Input
                  ref={inputRef}
                  label='Full Name'
                  value={name}
                  onChange={e => setName(e.currentTarget.value)}
                  placeholder='Enter name...'
                  onKeyDown={e => {
                    if (e.key === 'Enter' && name.trim()) {
                      handleSubmit();
                    }
                  }}
                />
                <p className='text-subtle text-xs'>The input receives focus automatically when the dialog opens.</p>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' size='lg' onClick={() => setOpen(false)} label='Cancel' />
                <Button variant='solid' size='lg' onClick={handleSubmit} label='Add Contact' disabled={!name.trim()} />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const StepsDialog: Story = {
  name: 'Features / Steps',
  render: () => {
    const handleLastStep = (): void => {
      console.log('Last step action triggered');
    };

    return (
      <div className='flex flex-col gap-2.5'>
        <Dialog defaultStep='step1'>
          <Dialog.Trigger>
            <Button variant='solid' label='Open dialog with steps' />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='max-w-auto h-160 w-200'>
              <Dialog.StepHeader
                step='step1'
                helper='Optional helper for first step'
                title='1. This is the title on first step'
                description='Optional description for first step'
                withClose
              />
              <Dialog.StepHeader
                step='step2'
                helper='Optional helper for second step'
                title='2. This is the title on the second step'
                description='Optional description for second step'
                withClose
              />
              <Dialog.StepHeader
                step='step3'
                helper='Optional helper for third step'
                title='3. This is the title on the third step'
                description='Optional description for third step'
                withClose
              />

              <Dialog.Body className='border-bdr-subtle flex size-full flex-col items-center justify-center rounded-md border border-dashed'>
                <Dialog.StepContent step='step1'>Step 1 Content</Dialog.StepContent>
                <Dialog.StepContent step='step2'>Step 2 Content</Dialog.StepContent>
                <Dialog.StepContent step='step3'>Step 3 Content</Dialog.StepContent>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.StepIndicator
                  previousLabel='Previous'
                  nextLabel='Next'
                  lastStepLabel='Submit'
                  onLastStep={handleLastStep}
                  dots
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const ResponsiveStepIndicator: Story = {
  name: 'Features / Responsive Step Indicator',
  parameters: {
    docs: {
      description: {
        story:
          'Toggle between compact and wide dialog widths to verify that navigation responds to its own container, not the viewport. Navigate to the last step and click Create Project to review the check-to-spinner transition.',
      },
    },
  },
  render: () => {
    const [compact, setCompact] = useState(true);
    const [pending, setPending] = useState(false);

    const handleLastStep = (): void => {
      setPending(true);
      setTimeout(() => setPending(false), 2000);
    };

    const contentClassName = compact ? 'max-w-auto h-160 w-100' : 'max-w-auto h-160 w-200';

    return (
      <div className='flex flex-col gap-2.5'>
        <Button
          variant='outline'
          label={compact ? 'Use wide dialog' : 'Use compact dialog'}
          onClick={() => setCompact(value => !value)}
        />
        <Dialog defaultStep='step2'>
          <Dialog.Trigger asChild>
            <Button variant='solid' label='Open responsive steps dialog' />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className={contentClassName}>
              <Dialog.StepHeader
                step='step1'
                helper='Step 1 of 3'
                title='1. Project details'
                description='Enter the basic project information'
                withClose
              />
              <Dialog.StepHeader
                step='step2'
                helper='Step 2 of 3'
                title='2. Project settings'
                description='Configure how the project should behave'
                withClose
              />
              <Dialog.StepHeader
                step='step3'
                helper='Step 3 of 3'
                title='3. Review project'
                description='Confirm the details before creating the project'
                withClose
              />

              <Dialog.Body className='border-bdr-subtle flex size-full flex-col items-center justify-center rounded-md border border-dashed'>
                <Dialog.StepContent step='step1'>Project details</Dialog.StepContent>
                <Dialog.StepContent step='step2'>Project settings</Dialog.StepContent>
                <Dialog.StepContent step='step3'>Project review</Dialog.StepContent>
              </Dialog.Body>

              <Dialog.Footer className='flex flex-col'>
                <Dialog.StepIndicator
                  previousLabel='Previous'
                  nextLabel='Next'
                  lastStepLabel='Create Project'
                  onLastStep={handleLastStep}
                  dots
                  pending={pending}
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const DialogStepIndicatorWithTooltips: Story = {
  name: 'Features / Step Indicator with Tooltips',
  render: () => {
    const stepMap = new Map<string, string>([
      ['step1', 'First step'],
      ['step2', 'Second step'],
      ['step3', 'Third step'],
    ]);

    const handleLastStep = (): void => {
      console.log('Last step action triggered');
    };

    return (
      <div className='flex flex-col gap-2.5'>
        <Dialog defaultStep='step1'>
          <Dialog.Trigger>
            <Button variant='solid' label='Open dialog with tooltips on steps' />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='max-w-auto h-160 w-200'>
              <Dialog.StepHeader
                step='step1'
                helper='Optional helper for first step'
                title='1. This is the title on first step'
                description='Optional description for first step'
                withClose
              />
              <Dialog.StepHeader
                step='step2'
                helper='Optional helper for second step'
                title='2. This is the title on the second step'
                description='Optional description for second step'
                withClose
              />
              <Dialog.StepHeader
                step='step3'
                helper='Optional helper for third step'
                title='3. This is the title on the third step'
                description='Optional description for third step'
                withClose
              />

              <Dialog.Body className='border-bdr-subtle flex size-full flex-col items-center justify-center rounded-md border border-dashed'>
                <Dialog.StepContent step='step1'>Step 1 Content</Dialog.StepContent>
                <Dialog.StepContent step='step2'>Step 2 Content</Dialog.StepContent>
                <Dialog.StepContent step='step3'>Step 3 Content</Dialog.StepContent>
              </Dialog.Body>

              <Dialog.Footer className='flex flex-col'>
                <Dialog.StepIndicator
                  previousLabel='Previous'
                  nextLabel='Next'
                  lastStepLabel='Submit'
                  onLastStep={handleLastStep}
                  renderDot={(dot, step) => (
                    <Tooltip delay={150} side='top' value={String(stepMap.get(step))}>
                      {dot}
                    </Tooltip>
                  )}
                  dots
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const DisabledStepIndicator: Story = {
  name: 'Features / Disabled Step Indicator',
  render: () => {
    return (
      <div className='flex flex-col gap-2.5'>
        <Dialog defaultStep='step2'>
          <Dialog.Trigger>
            <Button variant='solid' label='Open dialog with disabled navigation' />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='max-w-auto h-160 w-200'>
              <Dialog.StepHeader
                step='step1'
                helper='Step 1 of 3'
                title='1. First step'
                description='Navigation is disabled'
                withClose
              />
              <Dialog.StepHeader
                step='step2'
                helper='Step 2 of 3'
                title='2. Second step'
                description='Navigation is disabled'
                withClose
              />
              <Dialog.StepHeader
                step='step3'
                helper='Step 3 of 3'
                title='3. Third step'
                description='Navigation is disabled'
                withClose
              />

              <Dialog.Body className='border-bdr-subtle flex size-full flex-col items-center justify-center rounded-md border border-dashed'>
                <Dialog.StepContent step='step1'>Step 1 Content</Dialog.StepContent>
                <Dialog.StepContent step='step2'>Step 2 Content</Dialog.StepContent>
                <Dialog.StepContent step='step3'>Step 3 Content</Dialog.StepContent>
              </Dialog.Body>

              <Dialog.Footer className='flex flex-col'>
                <Dialog.StepIndicator previousLabel='Previous' nextLabel='Next' dots disabled />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const PendingStepIndicator: Story = {
  name: 'Features / Pending Step Indicator',
  render: () => {
    const [pending, setPending] = useState(false);

    const handleLastStep = (): void => {
      setPending(true);
      setTimeout(() => setPending(false), 2000);
    };

    return (
      <div className='flex flex-col gap-2.5'>
        <Dialog defaultStep='step1'>
          <Dialog.Trigger>
            <Button variant='solid' label='Open dialog with pending state' />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='max-w-auto h-160 w-200'>
              <Dialog.StepHeader
                step='step1'
                helper='Step 1 of 3'
                title='1. First step'
                description='Navigate to last step to see pending state'
                withClose
              />
              <Dialog.StepHeader
                step='step2'
                helper='Step 2 of 3'
                title='2. Second step'
                description='Navigate to last step to see pending state'
                withClose
              />
              <Dialog.StepHeader
                step='step3'
                helper='Step 3 of 3'
                title='3. Third step'
                description='Click "Create Project" to trigger pending state'
                withClose
              />

              <Dialog.Body className='border-bdr-subtle flex size-full flex-col items-center justify-center rounded-md border border-dashed'>
                <Dialog.StepContent step='step1'>Step 1 Content</Dialog.StepContent>
                <Dialog.StepContent step='step2'>Step 2 Content</Dialog.StepContent>
                <Dialog.StepContent step='step3'>Step 3 Content</Dialog.StepContent>
              </Dialog.Body>

              <Dialog.Footer className='flex flex-col'>
                <Dialog.StepIndicator
                  previousLabel='Previous'
                  nextLabel='Next'
                  lastStepLabel='Create Project'
                  onLastStep={handleLastStep}
                  dots
                  pending={pending}
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const ControlledStepsDialog: Story = {
  name: 'Features / Controlled steps',
  render: () => {
    const [step, setStep] = useState('step1');

    return (
      <div className='flex flex-col gap-2.5'>
        <Dialog step={step} onStepChange={setStep}>
          <Dialog.Trigger>
            <Button variant='solid' label='Open dialog with steps' />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='max-w-auto h-160 w-200'>
              <Dialog.StepHeader
                step='step1'
                helper='Optional helper for first step'
                title='1. This is the title on first step'
                description='Optional description for first step'
                withClose
              />
              <Dialog.StepHeader
                step='step2'
                helper='Optional helper for second step'
                title='2. This is the title on the second step'
                description='Optional description for second step'
                withClose
              />
              <Dialog.StepHeader
                step='step3'
                helper='Optional helper for third step'
                title='3. This is the title on the third step'
                description='Optional description for third step'
                withClose
              />

              <Dialog.Body className='border-bdr-subtle flex size-full flex-col items-center justify-center rounded-md border border-dashed'>
                <Dialog.StepContent step='step1'>Step 1 Content</Dialog.StepContent>
                <Dialog.StepContent step='step2'>Step 2 Content</Dialog.StepContent>
                <Dialog.StepContent step='step3'>Step 3 Content</Dialog.StepContent>
              </Dialog.Body>

              <Dialog.Footer className='flex flex-col gap-5'>
                <Dialog.StepIndicator previousLabel='Previous' nextLabel='Next' dots />
                <p className='text-subtle text-right text-xs'>Current step: {step}</p>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

//
// * Behavior
//

export const NonDismissable: Story = {
  name: 'Behavior / Non-Dismissable',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='flex flex-col gap-2.5'>
        <div className='text-subtle max-w-120 text-sm'>
          This dialog cannot be closed by clicking outside. Use the close button or Escape key to dismiss it.
        </div>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Non-Dismissable Dialog' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120' onPointerDownOutside={e => e.preventDefault()}>
              <Dialog.DefaultHeader
                title='Non-Dismissable Dialog'
                description='Clicking outside will not close this dialog'
                withClose
              />
              <Dialog.Body>
                <p className='text-sm'>
                  Try clicking outside this dialog — it will stay open. You can only close it via the close button or
                  pressing Escape.
                </p>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' size='lg' onClick={() => setOpen(false)} label='Close' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const WithNotification: Story = {
  name: 'Behavior / With Notification',
  render: () => {
    const [open, setOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleDialogChange = (nextOpen: boolean): void => {
      setOpen(nextOpen);
      if (!nextOpen) {
        setShowToast(false);
      }
    };

    return (
      <div className='flex flex-col gap-2.5'>
        <Button variant='solid' onClick={() => setOpen(true)} label='Open Dialog' />

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader
                title='Dialog with Notification'
                description='Test click-outside behavior with portaled toast'
                withClose
              />
              <Dialog.Body>
                <p className='mb-4 text-sm'>
                  Click &ldquo;Show Notification&rdquo; to render a Toast via portal to document.body. The toast appears
                  outside the dialog&apos;s DOM tree, but clicking it should not dismiss this dialog.
                </p>
                <Button
                  variant='outline'
                  onClick={() => setShowToast(true)}
                  label='Show Notification'
                  disabled={showToast}
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' size='lg' onClick={() => handleDialogChange(false)} label='Close' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>

        {showToast &&
          createPortal(
            <div className='fixed top-4 right-4 z-50'>
              <Toast open={showToast} onOpenChange={setShowToast} withClose>
                <Toast.Icon tone='info' />
                <Toast.Title>Notification</Toast.Title>
                <Toast.Description>This toast is portaled to document.body, outside the dialog DOM.</Toast.Description>
              </Toast>
            </div>,
            document.body,
          )}
      </div>
    );
  },
};

export const NonModal: Story = {
  name: 'Behavior / Non-Modal',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const [open, setOpen] = useState(false);
    const [outside, setOutside] = useState('');
    const [inside, setInside] = useState('');

    return (
      <div className='flex min-h-svh flex-col items-start gap-2.5 p-6'>
        <div className='text-subtle max-w-120 text-sm'>
          With <code>modal={'{false}'}</code> the focus trap is disabled and the dialog does not block the rest of the
          page. The field below stays fully interactive — clickable, hoverable, typeable — while the dialog is open. A
          non-modal dialog does not dismiss on outside click; close it with Escape or the close button.
        </div>
        <div className='w-80'>
          <Input label='Outside field' value={outside} onChange={e => setOutside(e.currentTarget.value)} />
        </div>
        <Button variant='solid' onClick={() => setOpen(!open)} label='Open Non-Modal Dialog' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Content modal={false} className='w-120'>
              <Dialog.DefaultHeader
                title='Non-Modal Dialog'
                description='Focus is not trapped — try the field outside'
                withClose
              />
              <Dialog.Body className='-mx-3 px-3 pb-3'>
                <Input label='Inside field' value={inside} onChange={e => setInside(e.currentTarget.value)} />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

// Dialog focus lands a frame late, so an assertion made straight after an interaction reads a
// state a competing restore is about to overwrite: settle the frame first, then assert.
//
// The focus stories close via the close button, not Escape. `userEvent.keyboard` only delivers to
// an element it focused itself, so it silently misses a dialog that moved focus programmatically;
// a real Escape key press does close them.

const settleFrames = async (): Promise<void> => {
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const waitForFocus = async (element: HTMLElement): Promise<void> => {
  await waitFor(() => {
    if (document.activeElement !== element) {
      throw new Error(`Focus has not reached ${element.dataset.testid ?? element.tagName} yet`);
    }
  });
};

const dialogContent = (): HTMLElement | null => document.querySelector("[data-component='Dialog.Content']");

// A key press must not outrun the effects that listen for it.
const waitForDialogOpen = async (): Promise<HTMLElement> => {
  return await waitFor(() => {
    const element = dialogContent();
    if (element == null) throw new Error('Dialog did not open');
    if (!element.contains(document.activeElement)) throw new Error('Dialog has not taken focus yet');
    return element;
  });
};

const waitForDialogClosed = async (): Promise<void> => {
  await waitFor(() => {
    if (dialogContent() != null) throw new Error('Dialog is still open');
  });
};

const byTestId = <T extends HTMLElement>(id: string): T => {
  const element = document.querySelector<T>(`[data-testid='${id}']`);
  if (element == null) throw new Error(`No element with data-testid="${id}"`);
  return element;
};

const byComponent = <T extends HTMLElement>(name: string): T => {
  const element = document.querySelector<T>(`[data-component='${name}']`);
  if (element == null) throw new Error(`No element with data-component="${name}"`);
  return element;
};

export const AutoFocusSteps: Story = {
  name: 'Behavior / Auto Focus Steps',
  tags: ['interactions-smoke'],
  render: () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState('step1');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='text-subtle max-w-120 space-y-2 text-sm'>
          <p>
            A step marks the field that should take focus with <code>data-autofocus</code>. On open, and after Next or
            Back, the field marked in the shown step gets focus. Each step decides what to mark, or marks nothing at
            all.
          </p>
          <p>Step 1: Name is required, so it carries the marker while it is empty.</p>
          <p>Step 2: nothing is required, so nothing is marked and focus stays on the button.</p>
          <p>Step 3: both fields are required, but Email is pre-filled, so only Phone carries the marker.</p>
          <p>
            A field that already has a value drops the marker. On the first and last step the button you pressed
            disables, so without a marker the first focusable field takes focus instead.
          </p>
          <p>Dots are untouched: click them or use arrow keys and focus stays on the dot.</p>
        </div>
        <Button
          data-testid='opener'
          variant='solid'
          label='Open'
          onClick={() => {
            setStep('step1');
            setOpen(true);
          }}
        />

        <Dialog open={open} onOpenChange={setOpen} step={step} onStepChange={setStep}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.StepHeader step='step1' title='1. Identity' withClose />
              <Dialog.StepHeader step='step2' title='2. Work' withClose />
              <Dialog.StepHeader step='step3' title='3. Contact' withClose />
              <Dialog.Body className='-m-2 space-y-4 p-2'>
                <Dialog.StepContent step='step1'>
                  <div className='space-y-4'>
                    <p className='text-subtle text-sm'>Name is required, so it is marked while it is empty.</p>
                    <div>
                      <label htmlFor='auto-focus-steps-name' className='text-main mb-2 block text-base font-semibold'>
                        Name <span className='text-error'>*</span>
                      </label>
                      <Input
                        id='auto-focus-steps-name'
                        data-testid='name'
                        data-autofocus={name === '' || undefined}
                        required
                        placeholder='Required'
                        value={name}
                        onChange={event => setName(event.currentTarget.value)}
                      />
                    </div>
                    <Input data-testid='nickname' label='Nickname' placeholder='Optional' />
                  </div>
                </Dialog.StepContent>
                <Dialog.StepContent step='step2'>
                  <div className='space-y-4'>
                    <p className='text-subtle text-sm'>
                      Nothing is required here, so nothing is marked. Focus stays on the button you pressed.
                    </p>
                    <Input data-testid='company' label='Company' placeholder='Optional' />
                    <Input data-testid='role' label='Role' placeholder='Optional' />
                  </div>
                </Dialog.StepContent>
                <Dialog.StepContent step='step3'>
                  <div className='space-y-4'>
                    <p className='text-subtle text-sm'>
                      Both are required. Email is pre-filled from your account, so only Phone is marked while it is
                      empty.
                    </p>
                    <div>
                      <label htmlFor='auto-focus-steps-email' className='text-main mb-2 block text-base font-semibold'>
                        Email <span className='text-error'>*</span>
                      </label>
                      <Input
                        id='auto-focus-steps-email'
                        data-testid='email'
                        type='email'
                        required
                        defaultValue='you@example.com'
                      />
                    </div>
                    <div>
                      <label htmlFor='auto-focus-steps-phone' className='text-main mb-2 block text-base font-semibold'>
                        Phone <span className='text-error'>*</span>
                      </label>
                      <Input
                        id='auto-focus-steps-phone'
                        data-testid='phone'
                        data-autofocus={phone === '' || undefined}
                        type='tel'
                        required
                        placeholder='+47 ...'
                        value={phone}
                        onChange={event => setPhone(event.currentTarget.value)}
                      />
                    </div>
                  </div>
                </Dialog.StepContent>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.StepIndicator
                  previousLabel='Back'
                  nextLabel='Next'
                  lastStepLabel='Done'
                  dots
                  onLastStep={() => setOpen(false)}
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const opener = canvasElement.querySelector<HTMLButtonElement>("[data-testid='opener']");
    if (opener == null) throw new Error('No opener button');
    const next = (): HTMLButtonElement => byComponent('Stepper.Next');
    const dot = (index: number): HTMLButtonElement => {
      const element = document.querySelectorAll<HTMLButtonElement>("[data-component='Stepper.Dots'] [role='tab']")[
        index
      ];
      if (element == null) throw new Error(`No dot at index ${index}`);
      return element;
    };

    await step('Open: marked Name takes focus', async () => {
      await userEvent.click(opener);
      await waitForDialogOpen();
      await waitForFocus(byTestId('name'));
    });

    await step('Next to step 2: no marker, focus stays on Next', async () => {
      // Autofocus lands before the panels register, so Next is disabled for a tick after open.
      await waitFor(() => expect(next()).toBeEnabled());
      await userEvent.click(next());
      await settleFrames();
      await expect(document.activeElement).toBe(next());
    });

    await step('Next to step 3: pre-filled Email skipped, Phone takes focus', async () => {
      await userEvent.click(next());
      await waitForFocus(byTestId('phone'));
      await settleFrames();
      await expect(document.activeElement).toBe(byTestId('phone'));
    });

    await step('Click dot 1: focus stays on the dot', async () => {
      await userEvent.click(dot(0));
      await settleFrames();
      await expect(document.activeElement).toBe(dot(0));
    });

    await step('ArrowRight: focus moves to dot 2, not into a field', async () => {
      await userEvent.keyboard('{ArrowRight}');
      await waitForFocus(dot(1));
      await settleFrames();
      await expect(document.activeElement).toBe(dot(1));
    });

    await step('Close: focus returns to Open', async () => {
      await userEvent.click(byComponent('Dialog.DefaultClose'));
      await waitForDialogClosed();
      await waitForFocus(opener);
    });
  },
};

export const AutoFocusNestedDialog: Story = {
  name: 'Behavior / Auto Focus Nested Dialog',
  tags: ['interactions-smoke'],
  render: () => {
    const [open, setOpen] = useState(false);
    const [noteOpen, setNoteOpen] = useState(false);
    const [step, setStep] = useState('step1');

    return (
      <div className='flex flex-col items-center gap-y-3 p-4'>
        <div className='text-subtle max-w-120 space-y-2 text-sm'>
          <p>
            A plain dialog opened from inside a step focuses its own <code>data-autofocus</code> field, not the one
            marked in the step behind it.
          </p>
          <p>Step 1 marks Name. The Add note button opens a plain dialog that marks Note.</p>
        </div>
        <Button
          data-testid='opener'
          variant='solid'
          label='Open'
          onClick={() => {
            setStep('step1');
            setOpen(true);
          }}
        />

        <Dialog open={open} onOpenChange={setOpen} step={step} onStepChange={setStep}>
          <Dialog.Portal>
            <Dialog.Overlay />
            {/* Clicks in the nested dialog count as outside clicks here, so outside-click dismissal is off. */}
            <Dialog.Content className='w-120' onInteractOutside={event => event.preventDefault()}>
              <Dialog.StepHeader step='step1' title='1. Identity' withClose />
              <Dialog.StepHeader step='step2' title='2. Review' withClose />
              <Dialog.Body className='-m-2 space-y-4 p-2'>
                <Dialog.StepContent step='step1'>
                  <div className='space-y-4'>
                    <Input data-testid='name' data-autofocus label='Name' placeholder='Marked in this step' />
                    <Button
                      data-testid='add-note'
                      variant='outline'
                      label='Add note'
                      startIcon={Plus}
                      onClick={() => setNoteOpen(true)}
                    />

                    <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
                      <Dialog.Portal>
                        <Dialog.Overlay />
                        <Dialog.Content className='w-96'>
                          <Dialog.DefaultHeader title='Add note' withClose />
                          <Dialog.Body className='-m-2 p-2'>
                            <Input data-testid='note' data-autofocus label='Note' placeholder='Marked in this dialog' />
                          </Dialog.Body>
                          <Dialog.Footer>
                            <Button
                              data-testid='note-done'
                              variant='solid'
                              label='Done'
                              onClick={() => setNoteOpen(false)}
                            />
                          </Dialog.Footer>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog>
                  </div>
                </Dialog.StepContent>
                <Dialog.StepContent step='step2'>
                  <p className='text-subtle text-sm'>Nothing to focus here.</p>
                </Dialog.StepContent>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.StepIndicator
                  previousLabel='Back'
                  nextLabel='Next'
                  lastStepLabel='Done'
                  onLastStep={() => setOpen(false)}
                />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const opener = canvasElement.querySelector<HTMLButtonElement>("[data-testid='opener']");
    if (opener == null) throw new Error('No opener button');

    await step('Open: marked Name takes focus', async () => {
      await userEvent.click(opener);
      await waitForDialogOpen();
      await waitForFocus(byTestId('name'));
    });

    await step('Open nested: its own marked Note takes focus, not Name', async () => {
      await userEvent.click(byTestId('add-note'));
      await waitFor(() => byTestId('note'));
      await waitForFocus(byTestId('note'));
    });

    await step('Close nested: focus returns to Add note', async () => {
      await userEvent.click(byTestId('note-done'));
      await waitFor(() => {
        if (document.querySelector("[data-testid='note']") != null) throw new Error('Nested dialog is still open');
      });
      await waitForFocus(byTestId('add-note'));
    });
  },
};

export const ViewSwapFocus: Story = {
  name: 'Behavior / Focus Across View Swaps',
  tags: ['interactions-smoke'],
  render: () => {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'main' | 'confirm'>('main');
    const continueRef = useRef<HTMLButtonElement>(null);
    const gateRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = (next: boolean): void => {
      setOpen(next);
      if (!next) setView('main');
    };

    return (
      <div className='flex flex-col gap-2.5'>
        <Button data-testid='opener' variant='solid' onClick={() => setOpen(true)} label='Open' />

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <Dialog.Portal>
            <Dialog.Overlay />

            {view === 'main' && (
              <Dialog.Content
                className='w-120'
                onOpenAutoFocus={event => {
                  event.preventDefault();
                  continueRef.current?.focus();
                }}
              >
                <Dialog.DefaultHeader title='Main view' description='Focus starts on Continue' />
                <Dialog.Footer>
                  <Button
                    ref={continueRef}
                    data-testid='continue'
                    variant='solid'
                    size='lg'
                    onClick={() => setView('confirm')}
                    label='Continue'
                  />
                </Dialog.Footer>
              </Dialog.Content>
            )}

            {view === 'confirm' && (
              <Dialog.Content
                className='w-120'
                onOpenAutoFocus={event => {
                  event.preventDefault();
                  gateRef.current?.focus();
                }}
              >
                <Dialog.DefaultHeader title='Confirm view' description='Focus moves to the field' />
                <Dialog.Body className='-mx-3 px-3 pb-3'>
                  <Input ref={gateRef} data-testid='gate' label='Type to confirm' />
                </Dialog.Body>
              </Dialog.Content>
            )}
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const opener = canvasElement.querySelector<HTMLButtonElement>("[data-testid='opener']");
    if (opener == null) throw new Error('No opener button');

    await userEvent.click(opener);
    await waitForDialogOpen();
    await waitForFocus(byTestId('continue'));

    await userEvent.click(byTestId('continue'));
    const gate = await waitFor(() => byTestId<HTMLInputElement>('gate'));
    await waitForFocus(gate);
    await settleFrames();
    await expect(document.activeElement).toBe(gate);

    await userEvent.keyboard('{Escape}');
    await waitForDialogClosed();
    await waitForFocus(opener);
  },
};

export const FocusRestoreOnClose: Story = {
  name: 'Behavior / Focus Restore On Close',
  tags: ['interactions-smoke'],
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='flex flex-col gap-2.5'>
        <Button data-testid='opener' variant='solid' onClick={() => setOpen(true)} label='Open' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader title='Plain dialog' description='Closing returns focus to the opener' />
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button data-testid='close' variant='solid' size='lg' label='Close' />
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const opener = canvasElement.querySelector<HTMLButtonElement>("[data-testid='opener']");
    if (opener == null) throw new Error('No opener button');

    await userEvent.click(opener);
    await waitForDialogOpen();

    await userEvent.click(byTestId('close'));
    await waitForDialogClosed();
    await waitForFocus(opener);
    await settleFrames();
    await expect(document.activeElement).toBe(opener);
  },
};

const EffectFocusedInput = (): ReactElement => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return <Input ref={ref} data-testid='focused' label='Focused in useEffect' />;
};

const LayoutEffectFocusedInput = (): ReactElement => {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => ref.current?.focus(), []);
  return <Input ref={ref} data-testid='focused' label='Focused in useLayoutEffect' />;
};

export const ConsumerFocusOnOpen: Story = {
  name: 'Behavior / Consumer Focus On Open',
  tags: ['interactions-smoke'],
  render: () => {
    const [mode, setMode] = useState<'effect' | 'layout-effect' | null>(null);

    return (
      <div className='flex flex-col gap-2.5'>
        <Button data-testid='open-effect' variant='solid' onClick={() => setMode('effect')} label='Open (effect)' />
        <Button
          data-testid='open-layout-effect'
          variant='solid'
          onClick={() => setMode('layout-effect')}
          label='Open (layout effect)'
        />

        <Dialog open={mode != null} onOpenChange={open => !open && setMode(null)}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-120'>
              <Dialog.DefaultHeader title='Consumer focus' description='A field focused on mount keeps the focus' />
              <Dialog.Body className='flex flex-col gap-2.5'>
                <Input data-autofocus label='Marked with data-autofocus' />
                {mode === 'layout-effect' ? <LayoutEffectFocusedInput /> : <EffectFocusedInput />}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const effectOpener = canvasElement.querySelector<HTMLButtonElement>("[data-testid='open-effect']");
    const layoutEffectOpener = canvasElement.querySelector<HTMLButtonElement>("[data-testid='open-layout-effect']");
    if (effectOpener == null || layoutEffectOpener == null) throw new Error('Missing openers');

    await userEvent.click(effectOpener);
    await waitForDialogOpen();
    await settleFrames();
    await expect(document.activeElement).toBe(byTestId('focused'));

    await userEvent.keyboard('{Escape}');
    await waitForDialogClosed();
    await waitForFocus(effectOpener);

    await userEvent.click(layoutEffectOpener);
    await waitForDialogOpen();
    await settleFrames();
    await expect(document.activeElement).toBe(byTestId('focused'));
  },
};

export const PreventedCloseAutoFocus: Story = {
  name: 'Behavior / Prevented Close Auto-Focus',
  tags: ['interactions-smoke'],
  render: () => {
    const [open, setOpen] = useState(false);
    const elsewhereRef = useRef<HTMLButtonElement>(null);

    return (
      <div className='flex flex-col gap-2.5'>
        <Button data-testid='opener' variant='solid' onClick={() => setOpen(true)} label='Open' />
        <Button ref={elsewhereRef} data-testid='elsewhere' variant='outline' label='Elsewhere' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content
              className='w-120'
              onCloseAutoFocus={event => {
                event.preventDefault();
                // Deferred past the trap teardown, same as the built-in restore.
                requestAnimationFrame(() => elsewhereRef.current?.focus());
              }}
            >
              <Dialog.DefaultHeader title='Custom close focus' description='The opener must not win it back' />
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button data-testid='close' variant='solid' size='lg' label='Close' />
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const opener = canvasElement.querySelector<HTMLButtonElement>("[data-testid='opener']");
    const elsewhere = canvasElement.querySelector<HTMLButtonElement>("[data-testid='elsewhere']");
    if (opener == null || elsewhere == null) throw new Error('Missing buttons');

    await userEvent.click(opener);
    await waitForDialogOpen();

    await userEvent.click(byTestId('close'));
    await waitForDialogClosed();
    await waitForFocus(elsewhere);
    await settleFrames();
    await expect(document.activeElement).toBe(elsewhere);
  },
};

export const PreventedCloseOnRootUnmount: Story = {
  name: 'Behavior / Prevented Close On Root Unmount',
  tags: ['interactions-smoke'],
  render: () => {
    const [mounted, setMounted] = useState(false);

    return (
      <div className='flex flex-col gap-2.5'>
        <Button data-testid='opener' variant='solid' onClick={() => setMounted(true)} label='Open' />
        <Button data-testid='unmount' variant='outline' onClick={() => setMounted(false)} label='Unmount' />

        {mounted && (
          <Dialog defaultOpen>
            <Dialog.Portal>
              <Dialog.Overlay />
              <Dialog.Content className='w-120' onCloseAutoFocus={event => event.preventDefault()}>
                <Dialog.DefaultHeader title='Root unmount' description='Prevention must survive the root going away' />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const opener = canvasElement.querySelector<HTMLButtonElement>("[data-testid='opener']");
    const unmount = canvasElement.querySelector<HTMLButtonElement>("[data-testid='unmount']");
    if (opener == null || unmount == null) throw new Error('Missing buttons');

    await userEvent.click(opener);
    await waitForDialogOpen();

    await userEvent.click(unmount);
    await waitForDialogClosed();
    await settleFrames();
    await expect(document.activeElement).not.toBe(opener);
  },
};

export const WidgetShortcuts: Story = {
  name: 'Behavior / Shortcuts From Widgets',
  tags: ['interactions-smoke'],
  render: () => {
    const [primaryCount, setPrimaryCount] = useState(0);
    const [secondaryCount, setSecondaryCount] = useState(0);
    const [actionState, setActionState] = useState('enabled');
    const [radio, setRadio] = useState('one');
    const [selection, setSelection] = useState<readonly string[]>(['one']);
    const [tab, setTab] = useState('one');
    const [comboSelection, setComboSelection] = useState<readonly string[]>(['one']);

    return (
      <Dialog>
        <Listbox selectionMode='multiple' defaultSelection={['one']}>
          <Listbox.Content label='Outside dialog'>
            <Listbox.Item value='one'>Outside one</Listbox.Item>
            <Listbox.Item value='two' data-testid='shortcut-outside-two'>
              Outside two
            </Listbox.Item>
          </Listbox.Content>
        </Listbox>
        <Dialog.Trigger asChild>
          <Button label='Open widget shortcuts' />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className='w-140'>
            <Dialog.DefaultHeader title='Widget shortcuts' />
            <Dialog.Body className='space-y-4'>
              <label>
                Action state
                <select
                  aria-label='Action state'
                  value={actionState}
                  onChange={event => setActionState(event.currentTarget.value)}
                >
                  {['enabled', 'disabled', 'pending', 'missing'].map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <RadioGroup name='shortcut-radio' value={radio} onValueChange={setRadio}>
                <RadioGroup.Item value='one' data-testid='shortcut-radio-one'>
                  Radio one
                </RadioGroup.Item>
                <RadioGroup.Item value='two' data-testid='shortcut-radio-two'>
                  Radio two
                </RadioGroup.Item>
              </RadioGroup>
              <Listbox selectionMode='multiple' selection={selection} onSelectionChange={setSelection}>
                <Listbox.Content label='Shortcut listbox'>
                  <Listbox.Item value='one' data-testid='shortcut-list-one'>
                    List one
                  </Listbox.Item>
                  <Listbox.Item value='two' data-testid='shortcut-list-two'>
                    List two
                  </Listbox.Item>
                </Listbox.Content>
              </Listbox>
              <Tab value={tab} onValueChange={setTab} activationMode='manual' autoFocusTrigger={false}>
                <Tab.List aria-label='Shortcut tabs'>
                  <Tab.Trigger value='one' data-testid='shortcut-tab-one'>
                    Tab one
                  </Tab.Trigger>
                  <Tab.Trigger value='two' data-testid='shortcut-tab-two'>
                    Tab two
                  </Tab.Trigger>
                </Tab.List>
                <Tab.Content value='one'>First panel</Tab.Content>
                <Tab.Content value='two'>Second panel</Tab.Content>
              </Tab>
              <Combobox
                defaultOpen
                closeOnBlur={false}
                selectionMode='multiple'
                selection={comboSelection}
                onSelectionChange={setComboSelection}
              >
                <Combobox.Content>
                  <Combobox.Control>
                    <Combobox.Search>
                      <Combobox.Input aria-label='Shortcut combobox' data-testid='shortcut-combo-input' />
                    </Combobox.Search>
                  </Combobox.Control>
                  <Combobox.Portal>
                    <Combobox.Popup>
                      <Listbox.Content label='Shortcut combobox options'>
                        <Listbox.Item value='one' data-testid='shortcut-combo-one'>
                          Combo one
                        </Listbox.Item>
                        <Listbox.Item value='two' data-testid='shortcut-combo-two'>
                          Combo two
                        </Listbox.Item>
                      </Listbox.Content>
                    </Combobox.Popup>
                  </Combobox.Portal>
                </Combobox.Content>
              </Combobox>
              <output data-testid='shortcut-values'>{JSON.stringify({ radio, selection, tab, comboSelection })}</output>
              <output data-testid='shortcut-counts'>
                {primaryCount},{secondaryCount}
              </output>
            </Dialog.Body>
            <Dialog.Footer>
              {(['primary', 'secondary'] as const).map(shortcut => (
                <Dialog.Shortcut
                  key={shortcut}
                  shortcut={shortcut}
                  disabled={actionState === 'disabled'}
                  pending={actionState === 'pending'}
                  shortcutEnabled={actionState !== 'missing'}
                  onClick={() => {
                    if (shortcut === 'primary') setPrimaryCount(count => count + 1);
                    else setSecondaryCount(count => count + 1);
                  }}
                >
                  {shortcut}
                </Dialog.Shortcut>
              ))}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  },
  play: async ({ canvasElement }) => {
    const opener = canvasElement.querySelector('[data-component="Dialog.Trigger"]');
    if (opener == null) throw new Error('No opener button');
    await userEvent.click(opener);
    await waitForDialogOpen();
    const isMac = /Mac|iPhone|iPad/i.test(navigator.platform);
    const modifier = isMac ? 'Meta' : 'Control';
    const values = byTestId('shortcut-values');
    const initialValues = values.textContent;
    const counts = byTestId('shortcut-counts');
    const targets = ['radio-two', 'list-two', 'tab-two', 'combo-input', 'combo-two'];
    let count = 0;

    for (const target of targets) {
      byTestId(`shortcut-${target}`).focus();
      await settleFrames();
      await expect(byTestId(`shortcut-${target}`)).toHaveFocus();
      await userEvent.keyboard(`{${modifier}>}{Enter}{/${modifier}}`);
      count++;
      await waitFor(() => expect(counts).toHaveTextContent(`${count},${count - 1}`));
      await userEvent.keyboard(`{${modifier}>}{Shift>}{Enter}{/Shift}{/${modifier}}`);
      await waitFor(() => expect(counts).toHaveTextContent(`${count},${count}`));

      // Reserved repeat and IME chords must cancel native activation without running either action.
      for (const shiftKey of [false, true]) {
        for (const ignoredEvent of [{ repeat: true }, { isComposing: true }, { keyCode: 229 }]) {
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            ctrlKey: !isMac,
            metaKey: isMac,
            shiftKey,
            bubbles: true,
            composed: true,
            cancelable: true,
            ...ignoredEvent,
          });
          await expect(byTestId(`shortcut-${target}`).dispatchEvent(event)).toBe(false);
          await expect(event.defaultPrevented).toBe(true);
        }
      }
      await settleFrames();
      await expect(counts).toHaveTextContent(`${count},${count}`);
      await expect(values.textContent).toBe(initialValues);
      await expect(byTestId('shortcut-combo-input')).toHaveAttribute('aria-expanded', 'true');
    }

    const actionState = document.querySelector<HTMLSelectElement>('select[aria-label="Action state"]');
    if (actionState == null) throw new Error('No action state control');
    for (const state of ['disabled', 'pending', 'missing']) {
      await userEvent.selectOptions(actionState, state);
      for (const target of targets) {
        byTestId(`shortcut-${target}`).focus();
        await settleFrames();
        for (const shiftKey of [false, true]) {
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            ctrlKey: !isMac,
            metaKey: isMac,
            shiftKey,
            bubbles: true,
            composed: true,
            cancelable: true,
          });
          await expect(byTestId(`shortcut-${target}`).dispatchEvent(event)).toBe(false);
          await expect(event.defaultPrevented).toBe(true);
        }
        await expect(counts).toHaveTextContent(`${count},${count}`);
        await expect(values.textContent).toBe(initialValues);
        await expect(byTestId('shortcut-combo-input')).toHaveAttribute('aria-expanded', 'true');
      }
    }

    // Chords the dialog does not own keep selecting in the widget, including Ctrl+Enter on macOS.
    byTestId('shortcut-list-two').focus();
    await settleFrames();
    const otherModifier = isMac ? 'Control' : 'Meta';
    for (const chord of [
      `{${otherModifier}>}{Enter}{/${otherModifier}}`,
      `{${modifier}>}{Alt>}{Enter}{/Alt}{/${modifier}}`,
      '{Control>}{Meta>}{Enter}{/Meta}{/Control}',
      `{${modifier}>} {/${modifier}}`,
    ]) {
      await userEvent.keyboard(chord);
      await waitFor(() => expect(byTestId('shortcut-list-two')).toHaveAttribute('aria-selected', 'true'));
      await userEvent.keyboard(chord);
      await waitFor(() => expect(byTestId('shortcut-list-two')).toHaveAttribute('aria-selected', 'false'));
      await expect(counts).toHaveTextContent(`${count},${count}`);
    }

    // Radio Enter/Space are consumed; arrow navigation selects, Home/End move to the bounds.
    byTestId('shortcut-radio-one').focus();
    await userEvent.keyboard('{Enter} ');
    await expect(byTestId('shortcut-radio-one')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(byTestId('shortcut-radio-two')).toHaveFocus());
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(byTestId('shortcut-radio-one')).toHaveFocus());
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(byTestId('shortcut-radio-two')).toHaveFocus());
    await expect(byTestId('shortcut-radio-two')).toHaveAttribute('aria-checked', 'true');

    // Listbox Enter and Space toggle the focused option.
    byTestId('shortcut-list-two').focus();
    await settleFrames();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(byTestId('shortcut-list-two')).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard(' ');
    await waitFor(() => expect(byTestId('shortcut-list-two')).toHaveAttribute('aria-selected', 'false'));

    // Manual tabs activate on Enter/Space, while arrows only move focus.
    byTestId('shortcut-tab-one').focus();
    await settleFrames();
    await userEvent.keyboard('{ArrowRight}');
    await waitForFocus(byTestId('shortcut-tab-two'));
    await settleFrames();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(byTestId('shortcut-tab-two')).toHaveAttribute('aria-selected', 'true'));
    await settleFrames();
    await userEvent.keyboard('{ArrowLeft}');
    await waitForFocus(byTestId('shortcut-tab-one'));
    await settleFrames();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(byTestId('shortcut-tab-one')).toHaveAttribute('aria-selected', 'true'));
    await userEvent.tab();
    await expect(byTestId('shortcut-tab-one')).not.toHaveFocus();

    // Combobox Space selects without closing; plain Enter closes the popup.
    byTestId('shortcut-combo-two').focus();
    await settleFrames();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(byTestId('shortcut-combo-two')).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(byTestId('shortcut-combo-input')).toHaveAttribute('aria-expanded', 'false'));
    await expect(counts).toHaveTextContent(`${count},${count}`);
    await userEvent.keyboard('{Escape}');
    await waitForDialogClosed();
    byTestId('shortcut-outside-two').focus();
    await settleFrames();
    await userEvent.keyboard(`{${modifier}>}{Enter}{/${modifier}}`);
    await waitFor(() => expect(byTestId('shortcut-outside-two')).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard(`{${modifier}>}{Shift>}{Enter}{/Shift}{/${modifier}}`);
    await waitFor(() => expect(byTestId('shortcut-outside-two')).toHaveAttribute('aria-selected', 'false'));
  },
};
