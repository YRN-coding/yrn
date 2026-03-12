import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { prepareTempProject, cleanup, resolveArtifact } from '../utils.js'

/**
 * Build an artifact for deployment.
 *
 * By default the output is a single self-contained HTML file with all JS and
 * CSS inlined (via vite-plugin-singlefile).  Pass --no-single-file to produce
 * the standard Vite multi-file output instead.
 */
export async function buildCommand(file, options) {
  const artifactPath = resolveArtifact(file)
  const tempDir = prepareTempProject(artifactPath)
  const outDir = resolve(process.cwd(), options.outDir || 'dist')

  const plugins = [react()]

  if (options.singleFile !== false) {
    // vite-plugin-singlefile inlines all JS and CSS into a single index.html
    const { viteSingleFile } = await import('vite-plugin-singlefile')
    plugins.push(viteSingleFile())
  }

  console.log(`\n  Building artifact: ${file}\n`)

  try {
    await build({
      configFile: false,
      root: tempDir,
      plugins,
      build: {
        outDir,
        emptyOutDir: true,
        cssCodeSplit: false,
      },
      logLevel: 'info',
    })

    console.log(`\n  Build complete!\n`)
    console.log(`  Output: ${outDir}\n`)
  } finally {
    cleanup(tempDir)
  }
}
