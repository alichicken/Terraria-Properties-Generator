<script setup lang="ts">
import { ref } from 'vue'

// Settings state
const tModLoaderPath = ref('C:\\Program Files (x86)\\Steam\\steamapps\\common\\tModLoader')
const modSourceFolder = ref('C:\\Users\\User\\Documents\\My Games\\Terraria\\tModLoader\\ModSources')
const defaultAuthor = ref('EtherealDev')

const appearanceMode = ref('light')
const accentColor = ref('#005faa')

const autoSaveInterval = ref(15)
const hotReloading = ref(true)

const accentColors = [
  { color: '#005faa', name: 'Blue' },
  { color: '#007b83', name: 'Teal' },
  { color: '#6a4ca5', name: 'Purple' },
  { color: '#bf5000', name: 'Orange' },
  { color: '#d02e3f', name: 'Red' }
]

function handleBrowseTModLoader() {
  // TODO: Implement folder browser
  console.log('Browse tModLoader path')
}

function handleBrowseModSource() {
  // TODO: Implement folder browser
  console.log('Browse mod source folder')
}

function handleSaveSettings() {
  // Save settings to electron store
  if (window.electronAPI) {
    window.electronAPI.setStoreValue('settings', {
      tModLoaderPath: tModLoaderPath.value,
      modSourceFolder: modSourceFolder.value,
      defaultAuthor: defaultAuthor.value,
      appearanceMode: appearanceMode.value,
      accentColor: accentColor.value,
      autoSaveInterval: autoSaveInterval.value,
      hotReloading: hotReloading.value
    })
  }
  alert('设置已保存')
}

function handleDiscardChanges() {
  // Reload settings from store
  if (window.electronAPI) {
    window.electronAPI.getStoreValue('settings').then((settings: any) => {
      if (settings) {
        tModLoaderPath.value = settings.tModLoaderPath || tModLoaderPath.value
        modSourceFolder.value = settings.modSourceFolder || modSourceFolder.value
        defaultAuthor.value = settings.defaultAuthor || defaultAuthor.value
        appearanceMode.value = settings.appearanceMode || 'light'
        accentColor.value = settings.accentColor || '#005faa'
        autoSaveInterval.value = settings.autoSaveInterval || 15
        hotReloading.value = settings.hotReloading ?? true
      }
    })
  }
}
</script>

<template>
  <div>
    <!-- Breadcrumbs -->
    <nav class="mb-6 flex items-center gap-2 text-on-surface-variant font-label text-sm">
      <span>The Ethereal Workbench</span>
      <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
      <span class="font-semibold text-on-surface">Settings</span>
    </nav>

    <header class="mb-10">
      <h1 class="text-4xl font-extrabold tracking-tight text-on-surface font-headline mb-2">Settings</h1>
      <p class="text-on-surface-variant font-body">Manage your modding environment and application preferences.</p>
    </header>

    <!-- Settings Grid -->
    <div class="max-w-4xl space-y-8">
      <!-- Category: Environment -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary">terminal</span>
          <h2 class="text-lg font-bold text-on-surface font-headline">Environment</h2>
        </div>
        <div class="bg-surface-container-low rounded-xl overflow-hidden">
          <!-- Setting Row: tModLoader Path -->
          <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
            <div>
              <label class="block font-semibold text-on-surface mb-1">tModLoader Path</label>
              <p class="text-sm text-on-surface-variant">The directory where tModLoader is installed.</p>
            </div>
            <div class="flex items-center gap-2 w-full md:w-2/3">
              <input
                v-model="tModLoaderPath"
                class="flex-1 bg-surface-container-highest border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2 text-sm text-on-surface transition-all"
                type="text"
              />
              <button
                class="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs rounded-lg transition-colors border border-outline-variant/20"
                @click="handleBrowseTModLoader"
              >
                <span class="material-symbols-outlined text-sm">folder_open</span>
                Browse
              </button>
            </div>
          </div>
          <!-- Setting Row: Mod Source Folder -->
          <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Mod Source Folder</label>
              <p class="text-sm text-on-surface-variant">Local directory for your active mod projects.</p>
            </div>
            <div class="flex items-center gap-2 w-full md:w-2/3">
              <input
                v-model="modSourceFolder"
                class="flex-1 bg-surface-container-highest border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2 text-sm text-on-surface transition-all"
                type="text"
              />
              <button
                class="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs rounded-lg transition-colors border border-outline-variant/20"
                @click="handleBrowseModSource"
              >
                <span class="material-symbols-outlined text-sm">folder_open</span>
                Browse
              </button>
            </div>
          </div>
          <!-- Setting Row: Default Author -->
          <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Default Author</label>
              <p class="text-sm text-on-surface-variant">Automatically fills author metadata for new mods.</p>
            </div>
            <div class="w-full md:w-2/3">
              <input
                v-model="defaultAuthor"
                class="w-full bg-surface-container-highest border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2 text-sm text-on-surface transition-all"
                type="text"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Category: Personalization -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary">palette</span>
          <h2 class="text-lg font-bold text-on-surface font-headline">Personalization</h2>
        </div>
        <div class="bg-surface-container-low rounded-xl overflow-hidden">
          <!-- Setting Row: Appearance -->
          <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Appearance Mode</label>
              <p class="text-sm text-on-surface-variant">Choose your preferred visual theme.</p>
            </div>
            <div class="flex bg-surface-container-highest p-1 rounded-lg">
              <button
                class="px-4 py-1.5 rounded-md transition-all text-xs font-semibold"
                :class="appearanceMode === 'light' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'"
                @click="appearanceMode = 'light'"
              >
                Light
              </button>
              <button
                class="px-4 py-1.5 rounded-md transition-all text-xs font-semibold"
                :class="appearanceMode === 'dark' ? 'bg-slate-800 shadow-sm text-blue-300' : 'text-on-surface-variant hover:bg-surface-container-high'"
                @click="appearanceMode = 'dark'"
              >
                Dark
              </button>
              <button
                class="px-4 py-1.5 rounded-md transition-all text-xs font-semibold"
                :class="appearanceMode === 'system' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'"
                @click="appearanceMode = 'system'"
              >
                System
              </button>
            </div>
          </div>
          <!-- Setting Row: Accent Color -->
          <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Accent Color</label>
              <p class="text-sm text-on-surface-variant">The primary color used for highlights and buttons.</p>
            </div>
            <div class="flex gap-2">
              <button
                v-for="c in accentColors"
                :key="c.color"
                class="w-8 h-8 rounded-full transition-transform hover:scale-110"
                :class="accentColor === c.color ? 'ring-2 ring-offset-2 ring-primary' : 'ring-1 ring-outline-variant/20'"
                :style="{ backgroundColor: c.color }"
                :title="c.name"
                @click="accentColor = c.color"
              ></button>
            </div>
          </div>
        </div>
      </section>

      <!-- Category: Editor Features -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary">auto_fix_high</span>
          <h2 class="text-lg font-bold text-on-surface font-headline">Editor Features</h2>
        </div>
        <div class="bg-surface-container-low rounded-xl overflow-hidden">
          <!-- Setting Row: Auto-save -->
          <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="md:w-1/3">
              <label class="block font-semibold text-on-surface mb-1">Auto-save interval</label>
              <p class="text-sm text-on-surface-variant">Frequency of automatic project backups.</p>
            </div>
            <div class="flex-1 flex items-center gap-4">
              <input
                v-model="autoSaveInterval"
                class="flex-1 h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                max="60"
                min="1"
                type="range"
              />
              <span class="bg-surface-container-highest px-3 py-1 rounded text-xs font-bold text-on-surface w-16 text-center">{{ autoSaveInterval }} min</span>
            </div>
          </div>
          <!-- Setting Row: Toggle Hot-reloading -->
          <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-outline-variant/10">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Real-time Asset Hot-reloading</label>
              <p class="text-sm text-on-surface-variant">Automatically refresh sprites in game when files are saved.</p>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="hotReloading ? 'bg-primary' : 'bg-surface-container-high'"
              @click="hotReloading = !hotReloading"
            >
              <span class="sr-only">Toggle hot-reloading</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="hotReloading ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
        </div>
      </section>

      <!-- Footer Actions -->
      <div class="flex items-center justify-end gap-3 pt-6">
        <button
          class="px-6 py-2.5 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors"
          @click="handleDiscardChanges"
        >
          Discard Changes
        </button>
        <button
          class="px-8 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all"
          @click="handleSaveSettings"
        >
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>
