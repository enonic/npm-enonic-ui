import type { Meta, StoryObj } from '@storybook/preact-vite';

import { ContentIcons } from './content-icons';

const meta: Meta<typeof ContentIcons> = {
  title: 'Visual References/Content Icons',
  component: ContentIcons,
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof ContentIcons>;

export const Default: Story = {};
