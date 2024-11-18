import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Store API
  store: {
    get: (key: string) => ipcRenderer.invoke("electron-store-get", key),
    set: (key: string, value: any) =>
      ipcRenderer.invoke("electron-store-set", key, value),
  },
  // Window control API
  window: {
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    close: () => ipcRenderer.send("window-close"),
    isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
  },
});
