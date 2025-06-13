import VuePlugin from 'rollup-plugin-vue';
import scssPlugin from 'rollup-plugin-scss';
import url from '@rollup/plugin-url';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const isProduction = (process.env.BUILD === 'production');

const plugins = [
  VuePlugin(),
  scssPlugin(),
  commonjs(),
  nodeResolve(),
  url({
    limit: 100 * 1024 *1024,
    include: ['assets/*']
  }),
];

if (isProduction) {
  plugins.push(terser());
}

export default {
  input: 'src/pdfAnnotations.plugin.js',
  output: {
    file: 'dist/pdfAnnotations.plugin.js',
    format: 'esm',
    sourcemap: !isProduction,
  },
  plugins
};
