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
  devServer: {
    port: 8081, // 使用不同的端口避免与Spring Boot冲突
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot后端地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        },
        logLevel: 'debug' // 可选：调试时启用详细日志
      }
    }
  }
})
