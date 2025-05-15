import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: true,
    },
    {
      format: 'cjs',
      syntax: ['node 18'],
    },
  ],
  bin: [
    {
      input: 'src/cli.ts',
      output: 'dist/cli.js',
      shebang: true,
    },
    {
      input: 'src/http.ts',
      output: 'dist/http.js',
      shebang: false,
    },
  ],
});
