<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectStore } from '../stores/project'
import { getItemTypeLabel } from '../utils/codeGenerator'

const { t } = useI18n()
const store = useProjectStore()

const emit = defineEmits<{
  editItem: []
}>()

const projectName = computed(() => store.currentProject?.name || 'MyModName')
const projectVersion = computed(() => store.currentProject?.version || '1.0.0')

// 菜单状态
const openMenuId = ref<string | null>(null)

// 切换菜单
function toggleMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? null : id
}

// 关闭菜单
function closeMenu() {
  openMenuId.value = null
}

// 编辑物品
function handleEditItem(id: string) {
  store.selectItem(id)
  emit('editItem')
  closeMenu()
}

// 删除物品
function handleDeleteItem(id: string, event: Event) {
  event.stopPropagation()
  if (confirm('确定要删除这个物品吗？')) {
    store.deleteItem(id)
  }
  closeMenu()
}

// 复制物品
function handleDuplicateItem(id: string, event: Event) {
  event.stopPropagation()
  const item = store.items.find(i => i.id === id)
  if (item) {
    store.addItem({
      ...item,
      name: item.name + ' (Copy)'
    })
  }
  closeMenu()
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`

  const days = Math.floor(hours / 24)
  if (days === 1) return '昨天'
  return `${days} 天前`
}

// 点击外部关闭菜单
function handleGlobalClick() {
  closeMenu()
}
</script>

<template>
  <div @click="handleGlobalClick">
    <!-- Breadcrumbs -->
    <div class="flex items-center gap-2 text-on-surface-variant mb-6">
      <span class="text-[11px] font-medium uppercase tracking-widest opacity-60">Home</span>
      <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
      <span class="text-[11px] font-medium uppercase tracking-widest text-primary">{{ t('workspace.title') }}</span>
    </div>

    <div class="grid grid-cols-12 gap-8">
      <!-- Project Hero Card -->
      <section class="col-span-12 lg:col-span-8">
        <div class="relative overflow-hidden bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 items-center group">
          <div class="absolute top-0 right-0 w-64 h-64 signature-gradient opacity-[0.03] -mr-32 -mt-32 rounded-full blur-3xl group-hover:opacity-[0.07] transition-opacity"></div>
          <div class="relative w-32 h-32 flex-shrink-0 bg-surface-container-low rounded-xl flex items-center justify-center p-4">
            <div class="w-20 h-20 bg-primary-container/20 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-primary">terrain</span>
            </div>
            <div class="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-lg shadow-lg">
              <span class="material-symbols-outlined text-xs">edit</span>
            </div>
          </div>
          <div class="flex-grow space-y-4">
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-3xl font-extrabold text-on-surface tracking-tight">{{ projectName }}</h1>
                <span class="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-md uppercase tracking-wider">v{{ projectVersion }}</span>
              </div>
              <p class="text-on-surface-variant text-sm mt-1 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">schedule</span>
                {{ t('workspace.lastModified') }}: {{ store.currentProject ? formatTime(store.currentProject.updatedAt) : '刚刚' }}
              </p>
            </div>
            <div class="flex flex-wrap gap-4 items-center pt-2">
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>{{ t('workspace.projectProgress') }}</span>
                  <span class="text-primary">{{ t('workspace.readyToCompile') }}</span>
                </div>
                <div class="w-64 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div class="h-full signature-gradient w-[100%] rounded-full"></div>
                </div>
              </div>
              <div class="h-8 w-px bg-outline-variant opacity-20 hidden md:block"></div>
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-surface-container-low text-on-surface-variant text-[11px] font-semibold rounded-full">C# 10.0</span>
                <span class="px-3 py-1 bg-surface-container-low text-on-surface-variant text-[11px] font-semibold rounded-full">tModLoader 2023.6</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions Panel -->
      <section class="col-span-12 lg:col-span-4 space-y-4">
        <h2 class="text-sm font-bold text-on-surface-variant uppercase tracking-widest pl-1">{{ t('workspace.actions') }}</h2>
        <div class="grid grid-cols-2 gap-3">
          <button class="flex flex-col items-start gap-3 p-4 bg-surface-container-lowest rounded-xl hover:bg-primary-container hover:text-white transition-all group active:scale-95">
            <span class="material-symbols-outlined text-primary group-hover:text-white">folder_open</span>
            <span class="text-[11px] font-bold uppercase tracking-wider">打开工作区</span>
          </button>
          <button class="flex flex-col items-start gap-3 p-4 bg-surface-container-lowest rounded-xl hover:bg-primary-container hover:text-white transition-all group active:scale-95">
            <span class="material-symbols-outlined text-primary group-hover:text-white">terminal</span>
            <span class="text-[11px] font-bold uppercase tracking-wider">{{ t('actions.openOutput') }}</span>
          </button>
          <button class="flex flex-col items-start gap-3 p-4 bg-surface-container-lowest rounded-xl hover:bg-primary-container hover:text-white transition-all group active:scale-95">
            <span class="material-symbols-outlined text-primary group-hover:text-white">brush</span>
            <span class="text-[11px] font-bold uppercase tracking-wider">{{ t('actions.manageSprites') }}</span>
          </button>
          <button class="flex flex-col items-start gap-3 p-4 bg-surface-container-lowest rounded-xl hover:bg-primary-container hover:text-white transition-all group active:scale-95">
            <span class="material-symbols-outlined text-primary group-hover:text-white">unarchive</span>
            <span class="text-[11px] font-bold uppercase tracking-wider">{{ t('actions.exportTmod') }}</span>
          </button>
        </div>
      </section>

      <!-- Statistics Grid -->
      <section class="col-span-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-surface-container-low p-6 rounded-xl space-y-2 border-b-2 border-transparent hover:border-primary transition-all cursor-pointer">
            <span class="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{{ t('stats.items') }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-on-surface">{{ store.stats.items }}</span>
              <span class="material-symbols-outlined text-primary text-lg">inventory_2</span>
            </div>
          </div>
          <div class="bg-surface-container-low p-6 rounded-xl space-y-2 border-b-2 border-transparent hover:border-primary transition-all cursor-pointer">
            <span class="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{{ t('stats.recipes') }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-on-surface">{{ store.stats.recipes }}</span>
              <span class="material-symbols-outlined text-primary text-lg">reorder</span>
            </div>
          </div>
          <div class="bg-surface-container-low p-6 rounded-xl space-y-2 border-b-2 border-transparent hover:border-primary transition-all cursor-pointer">
            <span class="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{{ t('stats.armorSets') }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-on-surface">{{ store.stats.armorSets }}</span>
              <span class="material-symbols-outlined text-primary text-lg">shield</span>
            </div>
          </div>
          <div class="bg-surface-container-low p-6 rounded-xl space-y-2 border-b-2 border-transparent hover:border-primary transition-all cursor-pointer">
            <span class="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{{ t('stats.projectiles') }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-extrabold text-on-surface">{{ store.stats.projectiles }}</span>
              <span class="material-symbols-outlined text-primary text-lg">rocket_launch</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activity / Assets -->
      <section class="col-span-12">
        <div class="flex justify-between items-end mb-4 px-1">
          <h2 class="text-sm font-bold text-on-surface-variant uppercase tracking-widest">{{ t('workspace.recentActivity') }}</h2>
          <button class="text-[11px] font-bold text-primary hover:underline" @click="emit('editItem')">{{ t('workspace.viewAllAssets') }}</button>
        </div>
        <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                <th class="px-6 py-4 font-semibold">物品名称</th>
                <th class="px-6 py-4 font-semibold">{{ t('workspace.type') }}</th>
                <th class="px-6 py-4 font-semibold">{{ t('workspace.lastEdit') }}</th>
                <th class="px-6 py-4 font-semibold text-right">{{ t('workspace.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/5">
              <tr v-if="store.recentItems.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-on-surface-variant text-sm">
                  暂无物品，点击上方"新建资产"创建第一个物品
                </td>
              </tr>
              <tr
                v-for="item in store.recentItems"
                :key="item.id"
                class="hover:bg-surface-container-low transition-colors group cursor-pointer"
                @click="handleEditItem(item.id)"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-surface-container-high rounded flex items-center justify-center p-1.5">
                      <span class="material-symbols-outlined text-sm text-primary">{{ item.type === 'armor' ? 'shield' : item.type === 'weapon' ? 'gavel' : 'category' }}</span>
                    </div>
                    <span class="text-sm font-semibold">{{ item.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-on-surface-variant">{{ getItemTypeLabel(item.type) }}</td>
                <td class="px-6 py-4 text-sm text-on-surface-variant">{{ formatTime(item.updatedAt) }}</td>
                <td class="px-6 py-4 text-right relative">
                  <button
                    class="p-1 hover:text-primary transition-colors rounded hover:bg-surface-container-high"
                    @click.stop="toggleMenu(item.id)"
                  >
                    <span class="material-symbols-outlined text-sm">more_vert</span>
                  </button>
                  <!-- Dropdown Menu -->
                  <div
                    v-if="openMenuId === item.id"
                    class="absolute right-4 top-10 bg-surface-container-lowest shadow-lg rounded-lg py-1 z-10 min-w-[120px] border border-outline-variant/20"
                    @click.stop
                  >
                    <button
                      class="w-full px-4 py-2 text-left text-sm hover:bg-surface-container-low flex items-center gap-2"
                      @click="handleEditItem(item.id)"
                    >
                      <span class="material-symbols-outlined text-sm">edit</span>
                      编辑
                    </button>
                    <button
                      class="w-full px-4 py-2 text-left text-sm hover:bg-surface-container-low flex items-center gap-2"
                      @click="handleDuplicateItem(item.id, $event)"
                    >
                      <span class="material-symbols-outlined text-sm">content_copy</span>
                      复制
                    </button>
                    <button
                      class="w-full px-4 py-2 text-left text-sm hover:bg-surface-container-low flex items-center gap-2 text-error"
                      @click="handleDeleteItem(item.id, $event)"
                    >
                      <span class="material-symbols-outlined text-sm">delete</span>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
