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
      onMenuNewProject: (callback: () => void) => () => void
      onMenuSave: (callback: () => void) => () => void
      onMenuGenerateCode: (callback: () => void) => () => void
      onMenuCopyCode: (callback: () => void) => () => void
      onProjectOpened: (callback: (path: string) => void) => () => void
    }
  }
}
