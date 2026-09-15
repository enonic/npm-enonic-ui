import { Fragment, useState } from 'react';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { SearchField } from '@/components/search-field';
import { uiPhrases } from '@/i18n';

import type { Translate } from '@/types';
import type { Meta, StoryObj } from '@storybook/preact-vite';

import { I18nProvider } from './i18n-provider';

const meta: Meta<typeof I18nProvider> = {
  title: 'Providers/I18nProvider',
  component: I18nProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof I18nProvider>;

// What an application's phrase bundle holds for the library's keys. Missing ones stay English.
const norwegian: Record<string, string> = {
  'ui.searchField.placeholder': 'Søk',
  'ui.searchField.label': 'Søk',
  'ui.searchField.clear': 'Tøm',
  'ui.dialog.close': 'Lukk',
};

const translate: Translate = (key, { defaultValue }) => norwegian[key] ?? defaultValue;

const Demo = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex flex-col items-start gap-y-4 p-4'>
      <SearchField className='w-2xs'>
        <SearchField.Icon />
        <SearchField.Input />
        <SearchField.Clear />
      </SearchField>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button variant='outline' label='Open dialog' />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className='w-120'>
            <Dialog.DefaultHeader
              title='Hover the close button'
              description='Its label comes from the provider.'
              withClose
            />
            <Dialog.Body>
              <p className='text-subtle text-sm'>
                Every label the library renders on its own goes through the same function.
              </p>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </div>
  );
};

export const Translated: Story = {
  name: 'Examples / Translated',
  render: () => (
    <I18nProvider translate={translate}>
      <Demo />
    </I18nProvider>
  ),
};

export const WithoutProvider: Story = {
  name: 'Examples / Without Provider',
  render: () => <Demo />,
};

export const Catalogue: Story = {
  name: 'Features / Catalogue',
  render: () => (
    <div className='max-w-120 text-sm'>
      <div className='text-subtle mb-3'>Every key the library can render, with its English.</div>
      <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'>
        {Object.entries(uiPhrases).map(([key, text]) => (
          <Fragment key={key}>
            <dt className='font-mono text-xs'>{key}</dt>
            <dd>{text}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  ),
};
