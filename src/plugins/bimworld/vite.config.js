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
        entry: "./src/bimworld.plugin.js",
        formats: ["es"],
        name: "bimworldPlugin",
        fileName: "bimworld.plugin",
      },
      minify: 'terser',
    },
    assetsInclude: ['assets/*'],
    plugins,
  };
});