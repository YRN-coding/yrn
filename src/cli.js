import { program } from 'commander'
import { readFileSync } from 'fs'
import { join } from 'path'
import { runCommand } from './commands/run.js'
import { buildCommand } from './commands/build.js'
import { createCommand } from './commands/create.js'
import { packageRoot } from './utils.js'

const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

// If the first argument is not a known subcommand and not a flag,
// treat it as the default "run" command so users can write:
//   run-claude-artifact my-app.tsx
// instead of:
//   run-claude-artifact run my-app.tsx
const subcommands = ['run', 'build', 'create']
const firstArg = process.argv[2]
if (
  firstArg !== undefined &&
  !subcommands.includes(firstArg) &&
  !firstArg.startsWith('-')
) {
  process.argv.splice(2, 0, 'run')
}

program
  .name('run-claude-artifact')
  .description('Run Claude AI artifacts as React applications')
  .version(pkg.version)

program
  .command('run <file>')
  .description('Run an artifact in development mode (default command)')
  .option('-p, --port <port>', 'Port to run on', '5173')
  .action(runCommand)

program
  .command('build <file>')
  .description('Build artifact for deployment (single-file HTML by default)')
  .option('-o, --out-dir <dir>', 'Output directory', 'dist')
  .option('--no-single-file', 'Disable single-file inlining')
  .action(buildCommand)

program
  .command('create <file>')
  .description('Create a full editable project from an artifact')
  .option('-o, --out-dir <dir>', 'Project output directory (default: artifact name)')
  .action(createCommand)

program.parse()
