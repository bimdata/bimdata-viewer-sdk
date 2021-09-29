import VuePlugin from "rollup-plugin-vue";
import scssPlugin from "rollup-plugin-scss";
import url from "@rollup/plugin-url";
import { terser } from "rollup-plugin-terser";
import commonjs from "rollup-plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const isProduction = process.env.BUILD === "production";

const plugins = [
  VuePlugin({
    // This to workaround this issue:
    // https://github.com/vuejs/rollup-plugin-vue/issues/238
    needMap: false,
  }),
  scssPlugin(),
  commonjs(),
  nodeResolve(),
  url({
    limit: 100 * 1024 * 1024,
    include: ["assets/*"],
  }),
];

if (isProduction) {
  plugins.push(terser());
}

export default {
  input: "src/iframeShare.plugin.js",
  output: {
    file: "dist/iframeShare.plugin.js",
    format: "esm",
    sourcemap: !isProduction,
  },
  plugins,
};
