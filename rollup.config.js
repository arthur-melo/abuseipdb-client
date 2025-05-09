/* eslint-disable @typescript-eslint/no-var-requires */
const bundleSize = require('rollup-plugin-bundle-size');
const commonjs = require('@rollup/plugin-commonjs');
const { default: dts } = require('rollup-plugin-dts');
const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');

const pkg = require('./package.json');

const input = './lib/index.ts';

// Third party libraries
const libraries = [
  'zod',
  'validator/lib/isIP.js',
  'validator/lib/isIPRange.js',
  'validator/lib/isISO31661Alpha2.js',
  'node:fs',
];

const config = [
  {
    input,
    output: {
      file: pkg.exports['.'].require,
      format: 'cjs',
    },
    plugins: [commonjs(), resolve(), typescript(), bundleSize()],
    external: libraries,
  },

  {
    input,
    output: {
      file: pkg.exports['.'].import,
      format: 'esm',
    },
    plugins: [typescript(), bundleSize()],
    external: libraries,
  },

  {
    input,
    output: {
      file: pkg.exports['.'].types,
      format: 'esm',
    },
    plugins: [dts(), bundleSize()],
  },
];

module.exports = config;
