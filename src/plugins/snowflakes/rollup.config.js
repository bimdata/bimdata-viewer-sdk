import VuePlugin from 'rollup-plugin-vue'
import scssPlugin from 'rollup-plugin-scss'
import url from '@rollup/plugin-url';


export default {
  input: 'src/snowflakes.plugin.js',
  output: {
    file: 'dist/snowflakes.plugin.js',
    format: 'esm'
  },
  plugins: [
    VuePlugin(),
    scssPlugin(),
    url({
    	limit: 100 * 1024 *1024,
    	include: ['assets/*']
    }),
  ]
};
