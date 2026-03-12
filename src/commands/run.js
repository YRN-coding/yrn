import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { prepareTempProject, cleanup, resolveArtifact } from '../utils.js'

/**
 * Run an artifact in Vite's dev server.
 *
 * The artifact is copied to a temporary directory with a generated entry point
 * and served with hot module replacement via Vite.
 */
export async function runCommand(file, options) {
  const artifactPath = resolveArtifact(file)
  const tempDir = prepareTempProject(artifactPath)

  const handleExit = () => {
    cleanup(tempDir)
    process.exit(0)
  }
  process.on('SIGINT', handleExit)
  process.on('SIGTERM', handleExit)

  console.log(`\n  Running artifact: ${file}\n`)

  const server = await createServer({
    configFile: false,
    root: tempDir,
    plugins: [react()],
    server: {
      port: parseInt(options.port, 10),
      strictPort: false,
    },
    logLevel: 'warn',
  })

  await server.listen()
  server.printUrls()
  console.log('\n  Press Ctrl+C to stop\n')
}
