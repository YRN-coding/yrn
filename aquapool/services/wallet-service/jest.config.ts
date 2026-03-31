import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@aquapool/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@aquapool/database$': '<rootDir>/../../packages/database/src/index.ts',
  },
  globals: {
    'ts-jest': {
      tsconfig: { rootDir: '.' },
    },
  },
};

export default config;
