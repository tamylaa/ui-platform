import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { dts } from 'rollup-plugin-dts';

const external = [
  'react',
  'react-dom',
  '@tamyla/ui-components',
  '@tamyla/ui-components-react'
];

const plugins = [
  resolve({
    preferBuiltins: false,
    browser: true
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    declarationMap: false
  })
];

export default defineConfig([
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true
      }
    ],
    external,
    plugins
  },
  
  // Vanilla JS bundle
  {
    input: 'src/vanilla/index.ts',
    output: [
      {
        file: 'dist/vanilla/index.esm.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/vanilla/index.cjs',
        format: 'cjs',
        sourcemap: true
      }
    ],
    external,
    plugins
  },
  
  // React bundle
  {
    input: 'src/react/index.ts',
    output: [
      {
        file: 'dist/react/index.esm.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/react/index.cjs',
        format: 'cjs',
        sourcemap: true
      }
    ],
    external,
    plugins
  },
  
  // Core bundle
  {
    input: 'src/core/index.ts',
    output: [
      {
        file: 'dist/core/index.esm.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/core/index.cjs',
        format: 'cjs',
        sourcemap: true
      }
    ],
    external,
    plugins
  },
  
  // Tokens bundle
  {
    input: 'src/tokens/index.ts',
    output: [
      {
        file: 'dist/tokens/index.esm.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/tokens/index.cjs',
        format: 'cjs',
        sourcemap: true
      }
    ],
    external,
    plugins
  },
  
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts()]
  },
  
  // Vanilla types
  {
    input: 'src/vanilla/index.ts',
    output: {
      file: 'dist/vanilla/index.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts()]
  },
  
  // React types
  {
    input: 'src/react/index.ts',
    output: {
      file: 'dist/react/index.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts()]
  },
  
  // Core types
  {
    input: 'src/core/index.ts',
    output: {
      file: 'dist/core/index.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts()]
  },
  
  // Tokens types
  {
    input: 'src/tokens/index.ts',
    output: {
      file: 'dist/tokens/index.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts()]
  }
]);
