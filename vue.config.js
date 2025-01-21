const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack:{
    experiments:{
      asyncWebAssembly:true,
    },
    module:{
      rules:[
        {
          test:/\.wasm$/,
          type:'webassembly/async',
        },
      ],
    },
    resolve:{
      fallback:{
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser"),
        "util": require.resolve("util/"),
        "timers": require.resolve("timers-browserify")
      }
    }
  },
})
