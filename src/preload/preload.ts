import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Store operations
  getStoreValue: (key: string) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key: string, value: unknown) => ipcRenderer.invoke('set-store-value', key, value),

  // Project operations
  saveProject: (projectData: unknown) => ipcRenderer.invoke('save-project', projectData),
  openProject: () => ipcRenderer.invoke('open-project'),

  // Image operations
  selectImage: () => ipcRenderer.invoke('select-image'),

  // Shell operations
  openFolder: (folderPath: string) => ipcRenderer.invoke('open-folder', folderPath),

  // Export operations
  selectExportFolder: () => ipcRenderer.invoke('select-export-folder'),
  exportCode: (folderPath: string, fileName: string, code: string) =>
    ipcRenderer.invoke('export-code', folderPath, fileName, code),

  // Menu event listeners
  onMenuNewProject: (callback: () => void) => {
    ipcRenderer.on('menu-new-project', callback);
    return () => ipcRenderer.removeListener('menu-new-project', callback);
  },
  onMenuSave: (callback: () => void) => {
    ipcRenderer.on('menu-save', callback);
    return () => ipcRenderer.removeListener('menu-save', callback);
  },
  onMenuGenerateCode: (callback: () => void) => {
    ipcRenderer.on('menu-generate-code', callback);
    return () => ipcRenderer.removeListener('menu-generate-code', callback);
  },
  onMenuCopyCode: (callback: () => void) => {
    ipcRenderer.on('menu-copy-code', callback);
    return () => ipcRenderer.removeListener('menu-copy-code', callback);
  },
  onProjectOpened: (callback: (path: string) => void) => {
    ipcRenderer.on('project-opened', (_event, path) => callback(path));
    return () => ipcRenderer.removeListener('project-opened', () => {});
  }
});
