// vite.config.ts
import { type AddressInfo } from 'net'
import { resolve } from 'path'
import { spawn, type ChildProcess } from 'child_process'
import type { ViteDevServer } from 'vite'
import { defineConfig, build } from 'vite'
import { RollupWatcher } from 'rollup'
import vue from '@vitejs/plugin-vue'

async function bundle(server: ViteDevServer) {
  const address = server.httpServer.address() as AddressInfo
  const host = address.address === '127.0.0.1' ? 'localhost' : address.address

  const appUrl = `http://${host}:${address.port}`

  // this is RollupWatcher, but vite do not export its typing...
  const watcher: any = await build({
    configFile: 'vite.config.electron.ts',
    mode: server.config.mode,
    build: {
      watch: {} // to make a watcher
    },
    define: {
      'import.meta.env.ELECTRON_APP_URL': JSON.stringify(appUrl)
    }
  })

  // use require, it will return a string pointing to the electron binary
  const electron = require('electron') as string

  // resolve the electron main file
  const electronMain = resolve(server.config.root, server.config.build.outDir, 'main.js')

  let child: ChildProcess | undefined

  // exit the process when electron closes
  function exitProcess() {
    process.exit(0)
  }

  // restart the electron process
  function start() {
    if (child) {
      child.kill()
      child = undefined
    }

    child = spawn(electron, [electronMain], {
      windowsHide: false
    })

    child.on('close', exitProcess)
  }

  function startElectron({ code }: any) {
    if (code === 'END') {
      watcher.off('event', startElectron)
      start()
    }
  }

  watcher.on('event', startElectron)

  // watch the build, on change, restart the electron process
  watcher.on('change', () => {
    // make sure we dont kill our application when reloading
    child?.off('close', exitProcess)

    start()
  })
}

export default defineConfig((env) => ({
  // nice feature of vite as the mode can be set by the CLI
  base: env.mode === 'production' ? './' : '/',
  plugins: [
    vue(),
    {
      name: 'electron-vite',
      configureServer(server) {
        server.httpServer.on('listening', () => {
          bundle(server).catch(server.config.logger.error)
        })
      }
    }
  ]
}))
