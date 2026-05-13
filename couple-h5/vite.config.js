import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

export default defineConfig({
  root: '.',
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  // 强制加载 .env 文件
  envDir: './',
})