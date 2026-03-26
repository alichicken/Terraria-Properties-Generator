export {}

declare global {
  interface Window {
    electronAPI: {
      getStoreValue: (key: string) => Promise<unknown>
      setStoreValue: (key: string, value: unknown) => Promise<boolean>
      saveProject: (projectData: unknown) => Promise<string | null>
      openProject: () => Promise<{ path: string; data: unknown } | null>
      selectImage: () => Promise<string | null>
      openFolder: (folderPath: string) => Promise<void>
      selectExportFolder: () => Promise<string | null>
      exportCode: (folderPath: string, fileName: string, code: string) => Promise<{ success: boolean; path?: string; error?: string }>
      openModFolder: () => Promise<{ success: boolean; folderPath?: string; items?: { name: string; path: string }[]; error?: string } | null>
      readCsFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
      onMenuNewProject: (callback: () => void) => () => void
      onMenuSave: (callback: () => void) => () => void
      onMenuGenerateCode: (callback: () => void) => () => void
      onMenuCopyCode: (callback: () => void) => () => void
      onProjectOpened: (callback: (path: string) => void) => () => void
    }
  }
}
