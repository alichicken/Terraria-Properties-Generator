import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Simple store using JSON file
const storePath = path.join(app.getPath('userData'), 'config.json');

function loadStore(): Record<string, unknown> {
  try {
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load store:', e);
  }
  return {};
}

function saveStore(data: Record<string, unknown>) {
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

const store = {
  data: loadStore() as Record<string, unknown>,
  get(key: string): unknown {
    return this.data[key];
  },
  set(key: string, value: unknown): void {
    this.data[key] = value;
    saveStore(this.data);
  }
};

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    },
    backgroundColor: '#f9f9f9'
  });

  // Create application menu
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        { label: '新建项目', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu-new-project') },
        { label: '打开项目', accelerator: 'CmdOrCtrl+O', click: () => handleOpenProject() },
        { label: '保存', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu-save') },
        { type: 'separator' },
        { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '生成',
      submenu: [
        { label: '生成 C# 代码', accelerator: 'CmdOrCtrl+G', click: () => mainWindow?.webContents.send('menu-generate-code') },
        { type: 'separator' },
        { label: '复制到剪贴板', accelerator: 'CmdOrCtrl+Shift+C', click: () => mainWindow?.webContents.send('menu-copy-code') }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '关于', click: () => showAboutDialog() }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, the structure is: dist/main/main/index.js -> dist/renderer/index.html
    const rendererPath = path.join(__dirname, '../../renderer/index.html');
    console.log('Loading renderer from:', rendererPath);
    mainWindow.loadFile(rendererPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function handleOpenProject() {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Terraria Mod Project', extensions: ['tmodproj', 'json'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow?.webContents.send('project-opened', result.filePaths[0]);
  }
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: '关于 Terraria 物品属性生成器',
    message: 'Terraria 物品属性生成器',
    detail: '版本 1.4.4\nThe Ethereal Workbench\n\n用于创建 Terraria tModLoader 模组物品的桌面工具。'
  });
}

// IPC handlers
ipcMain.handle('get-store-value', (_event, key: string) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (_event, key: string, value: unknown) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('save-project', async (_event, projectData: unknown) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [{ name: 'Terraria Mod Project', extensions: ['tmodproj'] }]
  });

  if (!result.canceled && result.filePath) {
    const fs = require('fs');
    fs.writeFileSync(result.filePath, JSON.stringify(projectData, null, 2));
    return result.filePath;
  }
  return null;
});

ipcMain.handle('open-project', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Terraria Mod Project', extensions: ['tmodproj', 'json'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const fs = require('fs');
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    return { path: result.filePaths[0], data: JSON.parse(content) };
  }
  return null;
});

ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const fs = require('fs');
    const imagePath = result.filePaths[0];
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');
    const ext = path.extname(imagePath).slice(1);
    return `data:image/${ext};base64,${base64}`;
  }
  return null;
});

ipcMain.handle('open-folder', async (_event, folderPath: string) => {
  shell.openPath(folderPath);
});

ipcMain.handle('select-export-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: '选择导出文件夹'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('export-code', async (_event, folderPath: string, fileName: string, code: string) => {
  const fs = require('fs');
  const filePath = path.join(folderPath, fileName);
  try {
    fs.writeFileSync(filePath, code, 'utf-8');
    return { success: true, path: filePath };
  } catch (e) {
    console.error('Failed to export code:', e);
    return { success: false, error: String(e) };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
