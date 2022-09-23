module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false,
        http: false,
        https: false,
      }
    }
  },
  chainWebpack: config => {
    config.module.rules.delete('svg');
    config.module.rules.delete('images');
    config.module.rule('file-loader')
      .test( /\.(png|jpe?g|gif|gltf|svg)$/i)
      .use('file-loader')
      .loader('file-loader')
      .tap(options => {
        if(!options) {
          options = {};
        }
        options.esModule = false;
        return options
      })
      .end();
  }
}
