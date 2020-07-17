import VuePlugin from 'rollup-plugin-vue';
import scssPlugin from 'rollup-plugin-scss';
import url from '@rollup/plugin-url';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const isProduction = (process.env.BUILD === 'production');

const plugins = [
  VuePlugin(),
  scssPlugin(),
  nodeResolve(),
  commonjs(),
  url({
    limit: 100 * 1024 *1024,
    include: ['assets/*']
  }),
];

if (isProduction) {
  plugins.push(terser());
}

export default {
  input: 'src/iot.plugin.js',
  output: {
    file: 'dist/iot.plugin.js',
    format: 'esm',
    sourcemap: !isProduction
  },
  plugins
};
