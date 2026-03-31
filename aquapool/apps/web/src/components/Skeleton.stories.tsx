import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonCard, SkeletonTable } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: { width: '200px', height: '1rem' },
};

export const MultiLine: Story = {
  args: { lines: 3, width: '100%' },
};

export const Circle: Story = {
  args: { width: 48, height: 48, rounded: 'full' },
};

export const Card: Story = {
  render: () => (
    <div className="w-96">
      <SkeletonCard />
    </div>
  ),
};

export const Table: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <SkeletonTable rows={4} />
    </div>
  ),
};
