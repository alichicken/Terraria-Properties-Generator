<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectStore } from './stores/project'
import WorkspaceView from './views/WorkspaceView.vue'
import ItemEditorView from './views/ItemEditorView.vue'
import SettingsView from './views/SettingsView.vue'

const { t } = useI18n()
const store = useProjectStore()

const currentView = ref<'workspace' | 'items' | 'settings'>('workspace')

// Menu event handlers
let cleanupFns: (() => void)[] = []

onMounted(() => {
  // Initialize with a default project
  store.createNewProject('MyModName')

  // Set up menu event listeners
  if (window.electronAPI) {
    cleanupFns.push(
      window.electronAPI.onMenuNewProject(() => {
        store.createNewProject('NewMod')
        currentView.value = 'workspace'
      }),
      window.electronAPI.onMenuSave(async () => {
        const data = store.getProjectData()
        if (data) {
          await window.electronAPI.saveProject(data)
        }
      }),
      window.electronAPI.onMenuGenerateCode(() => {
        if (store.currentItem) {
          currentView.value = 'items'
        }
      }),
      window.electronAPI.onMenuCopyCode(() => {
        // Handled in ItemEditorView
      }),
      window.electronAPI.onProjectOpened(async () => {
        const result = await window.electronAPI.openProject()
        if (result) {
          store.loadProject(result.data as any)
          currentView.value = 'workspace'
        }
      })
    )
  }
})

onUnmounted(() => {
  cleanupFns.forEach(fn => fn())
})

function handleNewAsset() {
  store.addItem({
    name: 'New Item',
    type: 'general',
    rarity: 'blue'
  })
  currentView.value = 'items'
}

function handleViewChange(view: 'workspace' | 'items' | 'settings') {
  currentView.value = view
}
</script>

<template>
  <div class="h-screen flex flex-col bg-surface overflow-hidden">
    <!-- Top Navigation Bar -->
    <header class="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 flex justify-between items-center h-12 px-4 shrink-0">
      <div class="flex items-center gap-6">
        <span class="text-lg font-semibold tracking-tight text-slate-900">{{ t('app.title') }}</span>
        <nav class="hidden md:flex gap-4">
          <button
            @click="handleViewChange('workspace')"
            class="px-3 py-1.5 rounded text-sm transition-colors"
            :class="currentView === 'workspace' ? 'bg-surface-container-highest text-primary' : 'text-slate-600 hover:bg-slate-200/50'"
          >
            {{ t('nav.workspace') }}
          </button>
          <button
            @click="handleViewChange('items')"
            class="px-3 py-1.5 rounded text-sm transition-colors"
            :class="currentView === 'items' ? 'bg-surface-container-highest text-primary' : 'text-slate-600 hover:bg-slate-200/50'"
          >
            {{ t('nav.items') }}
          </button>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative mr-2">
          <span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            class="bg-surface-container-high rounded-lg pl-8 pr-4 py-1 border-none text-xs focus:ring-1 focus:ring-primary w-48"
            :placeholder="t('nav.workspace') + '...'"
            type="text"
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-20 md:w-64 bg-surface-container-low/50 flex flex-col p-3 gap-2 shrink-0 border-r border-outline-variant/10">
        <div class="px-2 py-4 flex flex-col items-center md:items-start gap-1 mb-2">
          <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-md">
            <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">grid_view</span>
          </div>
          <div class="hidden md:block">
            <h2 class="text-on-surface font-bold text-sm">Terraria Mod</h2>
            <p class="text-on-surface-variant text-[10px]">{{ t('app.version') }}</p>
          </div>
        </div>

        <button
          @click="handleNewAsset"
          class="signature-gradient text-white py-2 px-4 rounded-xl font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 mb-4"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          <span class="hidden md:inline">{{ t('actions.newAsset') }}</span>
        </button>

        <nav class="flex flex-col gap-1 flex-grow">
          <button
            @click="handleViewChange('workspace')"
            class="flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 text-left"
            :class="currentView === 'workspace' ? 'bg-white/80 shadow-sm text-primary' : 'text-slate-600 hover:bg-slate-200/50'"
          >
            <span class="material-symbols-outlined" :style="currentView === 'workspace' ? 'font-variation-settings: FILL 1' : ''">dashboard</span>
            <span class="hidden md:inline text-sm font-medium">{{ t('nav.workspace') }}</span>
          </button>
          <button
            @click="handleViewChange('items')"
            class="flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 text-left"
            :class="currentView === 'items' ? 'bg-white/80 shadow-sm text-primary' : 'text-slate-600 hover:bg-slate-200/50'"
          >
            <span class="material-symbols-outlined" :style="currentView === 'items' ? 'font-variation-settings: FILL 1' : ''">inventory_2</span>
            <span class="hidden md:inline text-sm font-medium">{{ t('nav.items') }}</span>
          </button>
          <button class="flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 text-left text-slate-600 hover:bg-slate-200/50">
            <span class="material-symbols-outlined">reorder</span>
            <span class="hidden md:inline text-sm font-medium">{{ t('nav.crafting') }}</span>
          </button>
          <button class="flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 text-left text-slate-600 hover:bg-slate-200/50">
            <span class="material-symbols-outlined">image</span>
            <span class="hidden md:inline text-sm font-medium">{{ t('nav.sprites') }}</span>
          </button>
          <button
            @click="handleViewChange('settings')"
            class="flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 text-left"
            :class="currentView === 'settings' ? 'bg-white/80 shadow-sm text-primary' : 'text-slate-600 hover:bg-slate-200/50'"
          >
            <span class="material-symbols-outlined" :style="currentView === 'settings' ? 'font-variation-settings: FILL 1' : ''">settings</span>
            <span class="hidden md:inline text-sm font-medium">{{ t('nav.settings') }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main Workspace -->
      <main class="flex-1 overflow-y-auto mica-effect bg-surface/30 p-6 md:p-8">
        <div class="max-w-7xl mx-auto">
          <WorkspaceView v-if="currentView === 'workspace'" @edit-item="handleViewChange('items')" />
          <ItemEditorView v-else-if="currentView === 'items'" />
          <SettingsView v-else-if="currentView === 'settings'" />
        </div>
      </main>
    </div>

    <!-- Status Bar -->
    <footer class="h-6 bg-surface-container-highest border-t border-outline-variant/10 px-4 flex items-center justify-between text-[10px] font-medium text-on-surface-variant shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{{ t('status.ready') }}</span>
        </div>
        <span class="h-3 w-px bg-outline-variant/30"></span>
        <span>{{ t('status.utf8') }}</span>
        <span class="h-3 w-px bg-outline-variant/30"></span>
        <span>{{ t('status.csharp') }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">sync</span>
          {{ t('status.workspaceSynced') }}
        </span>
      </div>
    </footer>
  </div>
</template>
