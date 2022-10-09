import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslintPlugin from 'vite-plugin-eslint'; // 引入

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 配置eslintPlugin
    eslintPlugin({
      cache: false,
      include: './src',
    }),
  ],
  base: "./",
  server: {
    port: 9527
  },
  css: {
    //* css模块化
    modules: { // css模块化 文件以.module.[css|less|scss]结尾
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      hashPrefix: 'prefix',
    },
    //* 预编译支持less
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
      },
    },
  }
})
