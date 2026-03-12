# run-claude-artifact

Run Claude AI artifacts as React applications — no manual project setup needed.

## Usage

### Run an artifact (dev server with HMR)

```bash
npx run-claude-artifact my-app.tsx
```

### Build for deployment (single self-contained HTML file by default)

```bash
npx run-claude-artifact build my-app.tsx
```

Options:

| Flag | Default | Description |
|------|---------|-------------|
| `-o, --out-dir <dir>` | `dist` | Output directory |
| `--no-single-file` | — | Produce multi-file output instead |

### Create a full editable project

```bash
npx run-claude-artifact create my-app.tsx
```

This scaffolds a complete Vite + React project you can edit, extend, and deploy independently:

```
my-app/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx   ← your artifact
    └── main.tsx
```

Then:

```bash
cd my-app
npm install
npm run dev
```

## Docker

Run without installing anything:

```bash
docker run --rm -p 5173:5173 -v $(pwd):/w -w /w claudiombsilva/claude-artifact-runner my-app.tsx
```

## How it works

The `run` command creates a temporary Vite project that wraps your artifact component, symlinks this package's pre-installed `node_modules` (React, lucide-react, recharts, …), and starts a Vite dev server — so the artifact is live in seconds with no extra installs.

The `build` command does the same thing but calls `vite build` and uses [`vite-plugin-singlefile`](https://github.com/richardtallent/vite-plugin-singlefile) to produce a single self-contained `index.html`.

## Bundled dependencies

Artifacts can freely import from:

- `react`, `react-dom`
- `lucide-react`
- `recharts`
- `clsx`, `class-variance-authority`

Tailwind CSS is loaded via CDN in the generated `index.html` for zero-config styling support.

## License

Apache 2.0
