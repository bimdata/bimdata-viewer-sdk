import VuePlugin from 'rollup-plugin-vue';
import postcss from "rollup-plugin-postcss";
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const isProduction = (process.env.BUILD === 'production');

const plugins = [
  VuePlugin(),
  postcss(),
  commonjs(),
  nodeResolve(),
];

if (isProduction) {
  plugins.push(terser());
}

export default {
  input: 'src/giro3d.plugin.js',
  inlineDynamicImports: true,
  output: {
    file: 'dist/giro3d.plugin.js',
    format: 'esm',
    sourcemap: !isProduction,
  },
  plugins
};
