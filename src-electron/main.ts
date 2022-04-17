import { app, BrowserWindow } from 'electron'
import { resolve } from 'path'

let mainWindow: BrowserWindow | undefined

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // preload scripts must be an absolute path
      preload: resolve(__dirname, './preload.js')
    }
  })

  if (import.meta.env.DEV) {
    void mainWindow.loadURL(import.meta.env.ELECTRON_APP_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })

    mainWindow.loadFile(import.meta.env.ELECTRON_APP_URL)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow == null) {
    createWindow()
  }
})
