import type { StorybookConfig } from '@storybook/react-vite';
import react from '@vitejs/plugin-react';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.plugins = config.plugins?.filter(
      (p) => !(Array.isArray(p) ? p[0] : p)?.name?.includes('react')
    );
    config.plugins?.push(react({ jsxRuntime: 'automatic' }));
    return config;
  },
};

export default config;
