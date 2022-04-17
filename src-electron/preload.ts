import fs from 'fs'
import { contextBridge } from 'electron'

export type A = () => any

contextBridge.exposeInMainWorld('readSettings', function () {
  return JSON.parse(fs.readFileSync('./settings.json', 'utf-8'))
})
