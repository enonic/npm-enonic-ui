import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Input } from '@/components/input';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { BadgeInfo, ChevronLeft, ChevronRight, Loader2, Plus, TriangleAlert, User } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { Dialog } from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const BasicDialog: Story = {
  name: 'Basic Dialog',
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
                <Button variant='outline' onClick={() => setOpen(false)} label='Maybe Later' />
                <Button variant='solid' onClick={() => setOpen(false)} label='Get Started' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const CustomHeader: Story = {
  name: 'Custom Header',
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
                <Dialog.Title className='flex items-center gap-2 bg-surface-info px-4 py-3 rounded-sm text-info'>
                  <BadgeInfo strokeWidth={2} />
                  <span className='flex-1 text-sm font-semibold uppercase'>Add new project?</span>
                  <Button
                    className='bg-transparent hover:bg-info/10 active:bg-info border-info text-info'
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
                {items.map((item, key) => (
                  <div
                    key={key}
                    className='px-3 py-1 border border-bdr-subtle rounded-sm flex justify-between items-center'
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant='outline' label='Close' />
                </Dialog.Close>
                <Button variant='solid' onClick={() => setOpen(false)} label='Save Changes' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const LoadingDialog: Story = {
  name: 'Loading Dialog',
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
              <Dialog.Body className='flex flex-col items-center justify-center py-8 space-y-4'>
                <Loader2 className='w-12 h-12 animate-spin text-main' />
                <div className='text-center space-y-2'>
                  <p className='font-semibold'>Processing your request</p>
                  <p className='text-sm text-subtle'>Please wait while we sync your data...</p>
                  <p className='text-xs text-subtle'>{progress}% complete</p>
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
  name: 'Quick Confirmation',
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
              <Dialog.Body className='text-center py-2'>
                <p className='font-medium'>Enable experimental features?</p>
                <p className='text-sm text-subtle mt-1'>This may affect application stability.</p>
              </Dialog.Body>
              <Dialog.Footer className='justify-center'>
                <Button variant='outline' onClick={() => setOpen(false)} label='Cancel' />
                <Button variant='solid' onClick={handleConfirm} label='Enable' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const FormDialog: Story = {
  name: 'Form Dialog',
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
                  {errors.email && <p className='text-sm text-error'>{errors.email}</p>}
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
                  {errors.password && <p className='text-sm text-error'>{errors.password}</p>}
                </div>

                {isDirty && (
                  <p className='text-xs text-subtle'>
                    <TriangleAlert className='inline w-3 h-3 mr-1' />
                    Dialog will not close while form has unsaved changes
                  </p>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant='outline'
                  onClick={() => {
                    setOpen(false);
                    setEmail('');
                    setPassword('');
                    setIsDirty(false);
                    setErrors({});
                  }}
                  label='Cancel'
                />
                <Button variant='solid' onClick={handleSubmit} label='Sign In' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const ScrollableContent: Story = {
  name: 'Scrollable Content',
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
                    className={'px-3 py-1 rounded-sm hover:bg-surface-primary-hover'}
                    label={name}
                    checked={selected.includes(id)}
                    onCheckedChange={() => toggleItem(id)}
                  />
                ))}
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' onClick={() => setOpen(false)} label='Cancel' />
                <Button
                  variant='solid'
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
  name: 'Large Dialog',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className='space-y-4'>
        <Button variant='solid' onClick={() => setOpen(true)} label='View Details' />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='max-w-auto w-200 h-160'>
              <Dialog.DefaultHeader
                title='Project Overview'
                description='Comprehensive view of project metrics and statistics'
                withClose
              />
              <Dialog.Body className='space-y-6'>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='p-4 border border-bdr-subtle rounded-lg'>
                    <p className='text-sm text-subtle'>Total Tasks</p>
                    <p className='text-3xl font-bold mt-1'>127</p>
                  </div>
                  <div className='p-4 border border-bdr-subtle rounded-lg'>
                    <p className='text-sm text-subtle'>Completed</p>
                    <p className='text-3xl font-bold mt-1 text-success'>89</p>
                  </div>
                  <div className='p-4 border border-bdr-subtle rounded-lg'>
                    <p className='text-sm text-subtle'>Pending</p>
                    <p className='text-3xl font-bold mt-1 text-warn'>38</p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold'>Recent Activity</h3>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className='p-3 border border-bdr-subtle rounded-lg'>
                      <p className='font-medium'>Task #{i + 1} completed</p>
                      <p className='text-sm text-subtle'>2 hours ago by Team Member</p>
                    </div>
                  ))}
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold'>Team Members</h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className='p-3 border border-bdr-subtle rounded-lg flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-main/10 flex items-center justify-center'>
                          <User className='w-5 h-5' />
                        </div>
                        <div>
                          <p className='font-medium'>Member {i + 1}</p>
                          <p className='text-sm text-subtle'>Developer</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' onClick={() => setOpen(false)} label='Close' />
                <Button variant='solid' onClick={() => setOpen(false)} label='Export Report' />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const MultiStepWizard: Story = {
  name: 'Multi-Step Wizard',
  render: () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [projectName, setProjectName] = useState('');
    const [projectType, setProjectType] = useState('');
    const [teamSize, setTeamSize] = useState('');

    const totalSteps = 3;

    const handleNext = (): void => {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    };

    const handleBack = (): void => {
      if (step > 1) {
        setStep(step - 1);
      }
    };

    const handleFinish = (): void => {
      console.log('Wizard completed:', { projectName, projectType, teamSize });
      setOpen(false);
      setStep(1);
      setProjectName('');
      setProjectType('');
      setTeamSize('');
    };

    const canProceed = (): boolean => {
      switch (step) {
        case 1:
          return projectName.length > 0;
        case 2:
          return projectType.length > 0;
        case 3:
          return teamSize.length > 0;
        default:
          return false;
      }
    };

    const description = useMemo(() => {
      if (step === 1) {
        return 'Enter basic project information';
      } else if (step === 2) {
        return 'Choose your project type';
      } else if (step === 3) {
        return 'Set up your team';
      }
      return 'Unknown step';
    }, [step]);

    return (
      <div className='space-y-4'>
        <Button
          variant='solid'
          onClick={() => setOpen(true)}
          label='Create New Project'
          startIcon={Plus}
          iconStrokeWidth={2}
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className='w-140'>
              <Dialog.DefaultHeader title={`Create Project — Step ${step} / ${totalSteps}`} description={description} />

              <Dialog.Body className='space-y-4'>
                {/* Progress Indicator */}
                <div className='flex gap-2'>
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < step ? 'bg-main' : 'bg-surface-primary-hover'}`}
                    />
                  ))}
                </div>

                {/* Step 1: Project Name */}
                {step === 1 && (
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
                )}

                {/* Step 2: Project Type */}
                {step === 2 && (
                  <div className='space-y-2'>
                    <h5 className='font-semibold'>Project Type</h5>
                    <div className='space-y-2'>
                      {['Web Application', 'Mobile App', 'Desktop Software', 'API Service'].map((type, index) => (
                        <Button
                          key={index}
                          className='w-full justify-start border-1'
                          variant={projectType === type ? 'solid' : 'outline'}
                          onClick={() => setProjectType(type)}
                          label={type}
                          size='lg'
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Team Size */}
                {step === 3 && (
                  <div className='space-y-2'>
                    <h5 className='font-semibold'>Expected Team Size</h5>
                    <div className='space-y-2'>
                      {['Just me', '2-5 people', '6-10 people', '11+ people'].map((team, index) => (
                        <Button
                          key={index}
                          className='w-full justify-start border-1'
                          variant={teamSize === team ? 'solid' : 'outline'}
                          onClick={() => setTeamSize(team)}
                          label={team}
                          size='lg'
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button
                  variant='outline'
                  onClick={handleBack}
                  label='Back'
                  startIcon={ChevronLeft}
                  disabled={step === 1}
                  iconStrokeWidth={2}
                />
                <div className='flex-1' />
                <Button
                  variant='outline'
                  onClick={() => {
                    setOpen(false);
                    setStep(1);
                  }}
                  label='Cancel'
                />
                {step < totalSteps ? (
                  <Button
                    variant='solid'
                    onClick={handleNext}
                    label='Next'
                    endIcon={ChevronRight}
                    disabled={!canProceed()}
                    iconStrokeWidth={2}
                  />
                ) : (
                  <Button variant='solid' onClick={handleFinish} label='Create Project' disabled={!canProceed()} />
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
  name: 'Auto-Focus Input',
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
              <Dialog.Body className='space-y-3 -mx-3 px-3'>
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
                <p className='text-xs text-subtle'>The input receives focus automatically when the dialog opens.</p>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='outline' onClick={() => setOpen(false)} label='Cancel' />
                <Button variant='solid' onClick={handleSubmit} label='Add Contact' disabled={!name.trim()} />
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </div>
    );
  },
};

export const OpenByDefault: Story = {
  name: 'Open By Default',
  tags: ['!autodocs'],
  render: () => {
    return (
      <Dialog defaultOpen>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className='min-w-auto w-auto gap-5'>
            <Dialog.DefaultHeader title='Hey!' description='I was opened automatically' />
            <Dialog.Body className='flex items-center gap-2 p-4 bg-surface-info rounded-md text-info'>
              <BadgeInfo />
              <span>As soon as component mounted.</span>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    );
  },
};
