import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Button } from './button';

type Story = StoryObj<typeof Button>;

export default {
  title: 'Components/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export const Default: Story = {
  args: {
    label: 'Click me',
    onClick: () => alert('Clicked!'),
  },
};
