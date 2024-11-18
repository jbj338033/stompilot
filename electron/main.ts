import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { release } from "os";
import Store from "electron-store";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

process.env.DIST_ELECTRON = path.join(__dirname, "..");
process.env.DIST = path.join(process.env.DIST_ELECTRON, "dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST_ELECTRON, "public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  console.log("Icon", path.join(process.env.VITE_PUBLIC, "icon.png"));
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // Changed to true for security
      preload: path.join(__dirname, "preload.js"), // Add preload script
    },
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Install React DevTools if in dev mode
    if (!app.isPackaged) {
      try {
        await installExtension(REACT_DEVELOPER_TOOLS);
      } catch (e) {
        console.error("Failed to install React DevTools: ", e);
      }
    }
  } else {
    mainWindow.loadFile(path.join(process.env.DIST, "index.html"));
  }

  // Show window when ready
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  // Open the DevTools if in dev mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed event
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (mainWindow === null) {
    await createWindow();
  }
});

app.whenReady().then(async () => {
  await createWindow();
  setupIpcHandlers();
});

// Prevent multiple instances
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function setupIpcHandlers() {
  // Store handlers
  ipcMain.handle("electron-store-get", async (_event, key) => {
    return store.get(key);
  });

  ipcMain.handle("electron-store-set", async (_event, key, value) => {
    store.set(key, value);
    return true;
  });

  // Window control handlers
  ipcMain.on("window-minimize", () => {
    mainWindow?.minimize();
  });

  ipcMain.on("window-maximize", () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on("window-close", () => {
    mainWindow?.close();
  });

  ipcMain.handle("window-is-maximized", () => {
    return mainWindow?.isMaximized();
  });
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
