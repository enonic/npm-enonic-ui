import type { Meta, StoryObj } from '@storybook/preact-vite';
import { BadgeInfo, ChevronLeft, ChevronRight, Loader2, Plus, TriangleAlert, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Input } from '@/components/input';
import { Stepper } from '@/components/stepper';
import { Toast } from '@/components/toast';
import { Tooltip } from '@/components/tooltip';
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
                  <p className='text-sm text-subtle'>
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

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setOpen(false), 500);
            return 100;
          }
          return prev + 10;
        });
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
                <Loader2 className='size-12 animate-spin text-main' />
                <div className='space-y-2 text-center'>
                  <p className='font-semibold'>Processing your request</p>
                  <p className='text-sm text-subtle'>Please wait while we sync your data...</p>
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
                <p className='mt-1 text-sm text-subtle'>This may affect application stability.</p>
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
            <Dialog.Body className='flex items-center gap-2 rounded-md bg-surface-info p-4 text-info'>
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
                  <p className='pt-1 text-subtle text-xs'>
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
                <h2 className='font-semibold text-lg'>Discard changes?</h2>
                <p className='mt-2 text-sm text-subtle'>You have unsaved changes that will be lost.</p>
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
                <Dialog.Title className='flex items-center gap-2 rounded-sm bg-surface-info px-4 py-3 text-info'>
                  <BadgeInfo strokeWidth={2} />
                  <span className='flex-1 font-semibold text-sm uppercase'>Add new project?</span>
                  <Button
                    className='border-info bg-transparent text-info hover:bg-info/10 active:bg-info'
                    variant='outline'
                    onClick={handleNew}
                    label='Add'
                    size='sm'
                  />
                </Dialog.Title>
                <Dialog.Description>
                  <h2 className='font-semibold text-2xl'>Project Manager</h2>
                  <p>Manage and organize your active projects</p>
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body className='space-y-2'>
                {items.map(item => (
                  <div
                    key={item}
                    className='flex items-center justify-between rounded-sm border border-bdr-subtle px-3 py-1'
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
                    className={'rounded-sm px-3 py-1 hover:bg-surface-neutral-hover'}
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
            <Dialog.Content className='h-160 w-200 max-w-auto'>
              <Dialog.DefaultHeader
                title='Project Overview'
                description='Comprehensive view of project metrics and statistics'
                withClose
              />
              <Dialog.Body className='space-y-6'>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='rounded-lg border border-bdr-subtle p-4'>
                    <p className='text-sm text-subtle'>Total Tasks</p>
                    <p className='mt-1 font-bold text-3xl'>127</p>
                  </div>
                  <div className='rounded-lg border border-bdr-subtle p-4'>
                    <p className='text-sm text-subtle'>Completed</p>
                    <p className='mt-1 font-bold text-3xl text-success'>89</p>
                  </div>
                  <div className='rounded-lg border border-bdr-subtle p-4'>
                    <p className='text-sm text-subtle'>Pending</p>
                    <p className='mt-1 font-bold text-3xl text-warn'>38</p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold'>Recent Activity</h3>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(key => (
                    <div key={key} className='rounded-lg border border-bdr-subtle p-3'>
                      <p className='font-medium'>Task #{key} completed</p>
                      <p className='text-sm text-subtle'>2 hours ago by Team Member</p>
                    </div>
                  ))}
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold'>Team Members</h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(key => (
                      <div key={key} className='flex items-center gap-3 rounded-lg border border-bdr-subtle p-3'>
                        <div className='flex size-10 items-center justify-center rounded-full bg-main/10'>
                          <User className='size-5' />
                        </div>
                        <div>
                          <p className='font-medium'>Member {key}</p>
                          <p className='text-sm text-subtle'>Developer</p>
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
                    <p className='text-sm text-subtle'>
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
      // Prevent default focus on dialog content
      event.preventDefault();
      // Focus the input instead
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
            <Dialog.Content className='h-160 w-200 max-w-auto'>
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

              <Dialog.Body className='flex size-full flex-col items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
            <Dialog.Content className='h-160 w-200 max-w-auto'>
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

              <Dialog.Body className='flex size-full flex-col items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
            <Dialog.Content className='h-160 w-200 max-w-auto'>
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

              <Dialog.Body className='flex size-full flex-col items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
            <Dialog.Content className='h-160 w-200 max-w-auto'>
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

              <Dialog.Body className='flex size-full flex-col items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
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
            <Dialog.Content className='h-160 w-200 max-w-auto'>
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

              <Dialog.Body className='flex size-full flex-col items-center justify-center rounded-md border border-bdr-subtle border-dashed'>
                <Dialog.StepContent step='step1'>Step 1 Content</Dialog.StepContent>
                <Dialog.StepContent step='step2'>Step 2 Content</Dialog.StepContent>
                <Dialog.StepContent step='step3'>Step 3 Content</Dialog.StepContent>
              </Dialog.Body>

              <Dialog.Footer className='flex flex-col gap-5'>
                <Dialog.StepIndicator previousLabel='Previous' nextLabel='Next' dots />
                <p className='text-right text-subtle text-xs'>Current step: {step}</p>
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
