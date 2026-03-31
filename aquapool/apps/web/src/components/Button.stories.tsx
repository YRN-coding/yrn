import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Connect Wallet' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'View Markets' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Disconnect' },
};

export const Loading: Story = {
  args: { variant: 'primary', children: 'Confirming...', loading: true },
};

export const Disabled: Story = {
  args: { variant: 'primary', children: 'Unavailable', disabled: true },
};

export const Small: Story = {
  args: { variant: 'primary', size: 'sm', children: 'Send' },
};

export const Large: Story = {
  args: { variant: 'primary', size: 'lg', children: 'Start for free' },
};
