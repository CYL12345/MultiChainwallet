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
  },
})
