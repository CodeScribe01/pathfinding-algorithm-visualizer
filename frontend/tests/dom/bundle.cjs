const path = require('path')
const esbuild = require('esbuild')

const ROOT = path.resolve(__dirname, '../..')
const OUTFILE = path.join(__dirname, '.bundle.js')

/**
 * Bundle the app into a single classic script so it can be evaluated inside
 * jsdom (which cannot load ES modules). Vite's `import.meta.env` is replaced
 * with a static object because the IIFE format has no import.meta.
 */
async function bundle() {
  await esbuild.build({
    entryPoints: [path.join(ROOT, 'src/main.jsx')],
    bundle: true,
    format: 'iife',
    jsx: 'automatic',
    outfile: OUTFILE,
    absWorkingDir: ROOT,
    alias: { '@': path.join(ROOT, 'src') },
    loader: { '.css': 'empty' },
    logLevel: 'silent',
    define: {
      'process.env.NODE_ENV': '"development"',
      'import.meta.env': JSON.stringify({
        VITE_API_BASE_URL: 'http://127.0.0.1:8000/api',
        VITE_GITHUB_URL: 'https://github.com/example/pathforge',
        VITE_AUTOSAVE_RUNS: 'false',
        MODE: 'test',
        DEV: true,
        PROD: false,
      }),
    },
  })
  return OUTFILE
}

module.exports = { bundle, OUTFILE }
