import {
  mkdtempSync,
  writeFileSync,
  copyFileSync,
  symlinkSync,
  rmSync,
  existsSync,
} from 'fs'
import { join, resolve, dirname, extname } from 'path'
import { tmpdir } from 'os'
import { fileURLToPath } from 'url'

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)
export const packageRoot = resolve(__dirname, '..')

/**
 * Resolve and validate an artifact file path from the user's cwd.
 */
export function resolveArtifact(file) {
  const artifactPath = resolve(process.cwd(), file)
  if (!existsSync(artifactPath)) {
    console.error(`\nError: File not found: ${file}\n`)
    process.exit(1)
  }
  return artifactPath
}

/**
 * Create a temporary Vite project directory for the given artifact.
 * The artifact is copied as "App.<ext>" and a minimal entry point is generated.
 * Our package's node_modules are symlinked so all dependencies resolve without
 * a separate npm install step.
 */
export function prepareTempProject(artifactPath) {
  const tempDir = mkdtempSync(join(tmpdir(), 'claude-artifact-'))
  const ext = extname(artifactPath) || '.tsx'
  const destName = `App${ext}`

  // Copy the artifact file
  copyFileSync(artifactPath, join(tempDir, destName))

  // Symlink our node_modules so imports resolve without a separate install
  symlinkSync(join(packageRoot, 'node_modules'), join(tempDir, 'node_modules'))

  // Minimal HTML with Tailwind CDN (handles the common Tailwind-based artifacts)
  writeFileSync(
    join(tempDir, 'index.html'),
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Claude Artifact</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.jsx"></script>
  </body>
</html>`,
  )

  // Entry point that renders the artifact component
  writeFileSync(
    join(tempDir, 'main.jsx'),
    `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './${destName}'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`,
  )

  return tempDir
}

/**
 * Remove a temporary project directory silently.
 */
export function cleanup(tempDir) {
  try {
    rmSync(tempDir, { recursive: true, force: true })
  } catch {
    // best-effort cleanup
  }
}
