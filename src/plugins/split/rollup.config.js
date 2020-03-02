import VuePlugin from 'rollup-plugin-vue'
import scssPlugin from 'rollup-plugin-scss'

export default {
  input: 'split.plugin.js',
  output: {
    file: 'dist/split.plugin.js',
    format: 'esm'
  },
  plugins: [
    VuePlugin(),
    scssPlugin()
  ]
};
