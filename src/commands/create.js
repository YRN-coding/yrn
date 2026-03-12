import { mkdirSync, writeFileSync, copyFileSync, existsSync, readFileSync } from 'fs'
import { join, resolve, extname, basename } from 'path'
import { resolveArtifact, packageRoot } from '../utils.js'

/**
 * Create a full editable Vite + React project from an artifact.
 *
 * The generated project is self-contained: it has its own package.json,
 * vite.config.ts, tsconfig.json, and src/ directory.  Users can cd into it,
 * run `npm install`, and then `npm run dev` to start hacking on the artifact.
 */
export async function createCommand(file, options) {
  const artifactPath = resolveArtifact(file)
  const ext = extname(file) || '.tsx'
  const artifactBase = basename(file, ext)

  // Sanitise the name for use as an npm package name
  const packageName = artifactBase.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  const projectDir = resolve(process.cwd(), options.outDir || artifactBase)

  if (existsSync(projectDir)) {
    console.error(`\nError: Directory already exists: ${projectDir}\n`)
    process.exit(1)
  }

  // Read our own installed dependency versions so the generated project pins
  // compatible ranges out of the box.
  const ourPkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
  const dep = (name) => ourPkg.dependencies?.[name] ?? '*'

  console.log(`\n  Creating project in: ${projectDir}\n`)

  mkdirSync(join(projectDir, 'src'), { recursive: true })

  // Copy the artifact as src/App.<ext>
  copyFileSync(artifactPath, join(projectDir, 'src', `App${ext}`))

  // package.json
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(
      {
        name: packageName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: dep('react'),
          'react-dom': dep('react-dom'),
          'lucide-react': dep('lucide-react'),
          recharts: dep('recharts'),
          clsx: dep('clsx'),
          'class-variance-authority': dep('class-variance-authority'),
        },
        devDependencies: {
          '@vitejs/plugin-react': dep('@vitejs/plugin-react'),
          vite: dep('vite'),
          '@types/react': '^18.3.12',
          '@types/react-dom': '^18.3.1',
          typescript: '^5.6.3',
        },
      },
      null,
      2,
    ),
  )

  // index.html
  writeFileSync(
    join(projectDir, 'index.html'),
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${artifactBase}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  )

  // src/main.tsx
  writeFileSync(
    join(projectDir, 'src', 'main.tsx'),
    `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`,
  )

  // vite.config.ts
  writeFileSync(
    join(projectDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,
  )

  // tsconfig.json
  writeFileSync(
    join(projectDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
        },
        include: ['src'],
      },
      null,
      2,
    ),
  )

  // .gitignore
  writeFileSync(
    join(projectDir, '.gitignore'),
    `node_modules
dist
.DS_Store
`,
  )

  console.log(`  Project created successfully!\n`)
  console.log(`  Next steps:`)
  console.log(`    cd ${options.outDir || artifactBase}`)
  console.log(`    npm install`)
  console.log(`    npm run dev\n`)
}
