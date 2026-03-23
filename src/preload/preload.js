"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Store operations
    getStoreValue: (key) => electron_1.ipcRenderer.invoke('get-store-value', key),
    setStoreValue: (key, value) => electron_1.ipcRenderer.invoke('set-store-value', key, value),
    // Project operations
    saveProject: (projectData) => electron_1.ipcRenderer.invoke('save-project', projectData),
    openProject: () => electron_1.ipcRenderer.invoke('open-project'),
    // Image operations
    selectImage: () => electron_1.ipcRenderer.invoke('select-image'),
    // Shell operations
    openFolder: (folderPath) => electron_1.ipcRenderer.invoke('open-folder', folderPath),
    // Menu event listeners
    onMenuNewProject: (callback) => {
        electron_1.ipcRenderer.on('menu-new-project', callback);
        return () => electron_1.ipcRenderer.removeListener('menu-new-project', callback);
    },
    onMenuSave: (callback) => {
        electron_1.ipcRenderer.on('menu-save', callback);
        return () => electron_1.ipcRenderer.removeListener('menu-save', callback);
    },
    onMenuGenerateCode: (callback) => {
        electron_1.ipcRenderer.on('menu-generate-code', callback);
        return () => electron_1.ipcRenderer.removeListener('menu-generate-code', callback);
    },
    onMenuCopyCode: (callback) => {
        electron_1.ipcRenderer.on('menu-copy-code', callback);
        return () => electron_1.ipcRenderer.removeListener('menu-copy-code', callback);
    },
    onProjectOpened: (callback) => {
        electron_1.ipcRenderer.on('project-opened', (_event, path) => callback(path));
        return () => electron_1.ipcRenderer.removeListener('project-opened', () => { });
    }
});
