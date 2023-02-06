import { defineConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import externalGlobals from "rollup-plugin-external-globals";

export default defineConfig(() => {

  const plugins = [
    vue(),
    cssInjectedByJsPlugin(),
    externalGlobals({
      vue: 'BIMDataViewerVue',
    }),
  ];

  return {
    build: {
      lib: {
        entry: "./src/christmasSleigh.plugin.js",
        formats: ["es"],
        name: "christmasSleighPlugin",
        fileName: "christmasSleigh.plugin",
      },
      minify: 'terser',
    },
    assetsInclude: ['assets/*'],
    plugins,
  };
});