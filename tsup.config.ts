import { defineConfig } from 'tsup'

export default defineConfig([
  // CLI binary — CJS only, Node built-ins shimmed
  {
    entry: { 'cli/bin': 'src/cli/bin.ts' },
    format: ['cjs'],
    target: 'node18',
    platform: 'node',
    bundle: true,
    minify: false,
    sourcemap: true,
    dts: false,
    banner: { js: '#!/usr/bin/env node' },
    outDir: 'dist',
    noExternal: ['commander', 'gray-matter', 'zod'],
    external: ['@anthropic-ai/sdk'],
  },
  // Schema + types — ESM + CJS with declarations
  {
    entry: { schema: 'src/schema.ts', types: 'src/types.ts' },
    format: ['esm', 'cjs'],
    target: 'es2022',
    platform: 'neutral',
    bundle: true,
    sourcemap: true,
    dts: true,
    outDir: 'dist',
    noExternal: ['zod'],
  },
  // React components — ESM + CJS, React as external peer dep
  {
    entry: { 'react/index': 'src/react/index.ts' },
    format: ['esm', 'cjs'],
    target: 'es2022',
    platform: 'browser',
    bundle: true,
    sourcemap: true,
    dts: true,
    outDir: 'dist',
    external: ['react', 'react-dom'],
    noExternal: ['zod', 'gray-matter'],
  },
  // MCP server — CJS only, fully bundled
  {
    entry: { 'mcp/server': 'src/mcp/server.ts' },
    format: ['cjs'],
    target: 'node18',
    platform: 'node',
    bundle: true,
    minify: false,
    sourcemap: true,
    dts: false,
    banner: { js: '#!/usr/bin/env node' },
    outDir: 'dist',
    noExternal: ['@modelcontextprotocol/sdk', 'gray-matter', 'zod'],
    external: ['@anthropic-ai/sdk'],
  },
  // Browser hub bundle — IIFE, fully self-contained (for lac serve + lac export)
  {
    entry: { 'hub': 'src/react/hub-browser.tsx' },
    format: ['iife'],
    globalName: 'LacHubBrowser',
    target: 'es2020',
    platform: 'browser',
    bundle: true,
    minify: true,
    sourcemap: false,
    dts: false,
    outDir: 'dist',
    noExternal: ['react', 'react-dom', 'zod'],
    outExtension: () => ({ js: '.js' }),
  },
])
