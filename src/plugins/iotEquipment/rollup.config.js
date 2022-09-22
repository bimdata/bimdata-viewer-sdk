import VuePlugin from 'rollup-plugin-vue';
import scssPlugin from 'rollup-plugin-scss';
import url from '@rollup/plugin-url';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

const isProduction = (process.env.BUILD === 'production');

const plugins = [
  replace({
    include: ["./src/IotEquipmentGraph.vue"],
    "../node_modules/chartist/dist/chartist.min.css": "./node_modules/chartist/dist/chartist.min.css",
    preventAssignment: true,
    delimiters: ["", ""],
  }),
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
  input: 'src/iotEquipment.plugin.js',
  output: {
    file: 'dist/iotEquipment.plugin.js',
    format: 'esm',
    sourcemap: !isProduction,
  },
  plugins
};
