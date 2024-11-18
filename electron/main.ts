import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { release } from "os";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      contextIsolation: false,
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
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    await createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  await createWindow();

  // Setup IPC handlers
  setupIpcHandlers();
});

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      // Focus on the main window if the user tried to open another
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Handle IPC messages
function setupIpcHandlers() {
  // Example IPC handler for saving settings
  ipcMain.handle("save-settings", async (_event, settings: any) => {
    try {
      // Here you would implement your settings saving logic
      // For example, saving to electron-store or a file
      return { success: true };
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      return { success: false, error: error.message };
    }
  });

  // Example IPC handler for loading settings
  ipcMain.handle("load-settings", async () => {
    try {
      // Here you would implement your settings loading logic
      return { success: true, settings: {} };
    } catch (error: any) {
      console.error("Failed to load settings:", error);
      return { success: false, error: error.message };
    }
  });

  // Add window control handlers
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

// Handle any uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
