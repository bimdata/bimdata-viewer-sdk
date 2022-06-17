import VuePlugin from "rollup-plugin-vue";
import scssPlugin from "rollup-plugin-scss";
import url from "@rollup/plugin-url";
import { terser } from "rollup-plugin-terser";
import commonjs from "rollup-plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import image from "@rollup/plugin-image";
import replace from '@rollup/plugin-replace';
const isProduction = process.env.BUILD === "production";

const plugins = [
  replace({
    include: ['./src/Iot.vue'],
    "../node_modules/chartist/dist/chartist.min.css": "./node_modules/chartist/dist/chartist.min.css",
    preventAssignment: true,
    delimiters: ["", ""],
  }),
  VuePlugin(),
  scssPlugin(),
  commonjs(),
  nodeResolve(),
  image(),
  url({
    limit: 100 * 1024 * 1024,
    include: ["assets/*"],
  })
];

if (isProduction) {
  plugins.push(terser());
}

export default {
  input: "src/iot.plugin.js",
  output: {
    file: "dist/iot.plugin.js",
    format: "esm",
    sourcemap: !isProduction,
  },
  plugins,
};
