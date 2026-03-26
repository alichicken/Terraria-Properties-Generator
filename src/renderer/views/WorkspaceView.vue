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

// Open mod folder
async function handleOpenModFolder() {
  if (!window.electronAPI) return

  const result = await window.electronAPI.openModFolder()
  if (result && result.success && result.items) {
    store.setWorkspace(result.folderPath!, result.items)
    store.viewMode = 'workspace'
  }
}

// Parse CS file and load item
async function handleOpenCsFile(filePath: string) {
  if (!window.electronAPI) return

  const result = await window.electronAPI.readCsFile(filePath)
  if (!result.success || !result.content) {
    alert('无法读取文件')
    return
  }

  // Try to parse the CS file
  const parsed = parseCsFile(result.content)
  if (!parsed) {
    alert('文件不符合 Terraria 物品标准，无法解析')
    return
  }

  // Create or update item with parsed data
  store.addItem(parsed)
  emit('editItem')
}

// Parse CS file content to ModItem
function parseCsFile(content: string): Omit<import('../stores/project').ModItem, 'id' | 'createdAt' | 'updatedAt'> | null {
  // Check if it's a valid ModItem class
  const classMatch = content.match(/class\s+(\w+)\s*:\s*ModItem/)
  if (!classMatch) return null

  const name = classMatch[1]

  // Try to extract properties
  const type = content.includes('damage') ? 'weapon' :
               content.includes('defense') ? 'armor' :
               content.includes('accessory') ? 'accessory' : 'general'

  const item: Omit<import('../stores/project').ModItem, 'id' | 'createdAt' | 'updatedAt'> = {
    name,
    type: type as any,
    rarity: 'Common'
  }

  // Parse damage
  const damageMatch = content.match(/Item\.damage\s*=\s*(\d+)/)
  if (damageMatch) item.damage = parseInt(damageMatch[1])

  // Parse defense
  const defenseMatch = content.match(/Item\.defense\s*=\s*(\d+)/)
  if (defenseMatch) item.defense = parseInt(defenseMatch[1])

  // Parse useTime
  const useTimeMatch = content.match(/Item\.useTime\s*=\s*(\d+)/)
  if (useTimeMatch) item.useTime = parseInt(useTimeMatch[1])

  // Parse useAnimation
  const useAnimMatch = content.match(/Item\.useAnimation\s*=\s*(\d+)/)
  if (useAnimMatch) item.useAnimation = parseInt(useAnimMatch[1])

  // Parse knockback
  const knockbackMatch = content.match(/Item\.knockBack\s*=\s*([\d.]+)/)
  if (knockbackMatch) item.knockback = parseFloat(knockbackMatch[1])

  // Parse crit
  const critMatch = content.match(/Item\.crit\s*=\s*(-?\d+)/)
  if (critMatch) item.crit = parseInt(critMatch[1])

  // Parse value
  const valueMatch = content.match(/Item\.value\s*=\s*(\d+)/)
  if (valueMatch) item.value = parseInt(valueMatch[1])

  // Parse maxStack
  const maxStackMatch = content.match(/Item\.maxStack\s*=\s*(\d+)/)
  if (maxStackMatch) item.maxStack = parseInt(maxStackMatch[1])

  // Parse shoot
  const shootMatch = content.match(/Item\.shoot\s*=\s*ProjectileID\.(\w+)/)
  if (shootMatch) item.shoot = getProjectileId(shootMatch[1])

  // Parse shootSpeed
  const shootSpeedMatch = content.match(/Item\.shootSpeed\s*=\s*([\d.]+)/)
  if (shootSpeedMatch) item.shootSpeed = parseFloat(shootSpeedMatch[1])

  // Parse ammo
  const ammoMatch = content.match(/Item\.useAmmo\s*=\s*AmmoID\.(\w+)/)
  if (ammoMatch) item.useAmmo = getAmmoId(ammoMatch[1])

  // Parse consumable
  if (content.includes('Item.consumable = true')) item.consumable = true

  // Parse potion
  if (content.includes('Item.potion = true')) {
    item.potion = true
    item.consumable = true
  }

  // Parse healLife
  const healLifeMatch = content.match(/Item\.healLife\s*=\s*(\d+)/)
  if (healLifeMatch) item.healLife = parseInt(healLifeMatch[1])

  // Parse healMana
  const healManaMatch = content.match(/Item\.healMana\s*=\s*(\d+)/)
  if (healManaMatch) item.healMana = parseInt(healManaMatch[1])

  // Parse buffType
  const buffTypeMatch = content.match(/Item\.buffType\s*=\s*BuffID\.(\w+)/)
  if (buffTypeMatch) item.buffType = getBuffId(buffTypeMatch[1])

  // Parse buffTime
  const buffTimeMatch = content.match(/Item\.buffTime\s*=\s*(\d+)/)
  if (buffTimeMatch) item.buffTime = parseInt(buffTimeMatch[1])

  // Parse axe/pick/hammer
  const axeMatch = content.match(/Item\.axe\s*=\s*(\d+)/)
  if (axeMatch) item.axe = parseInt(axeMatch[1])

  const pickMatch = content.match(/Item\.pick\s*=\s*(\d+)/)
  if (pickMatch) item.pick = parseInt(pickMatch[1])

  const hammerMatch = content.match(/Item\.hammer\s*=\s*(\d+)/)
  if (hammerMatch) item.hammer = parseInt(hammerMatch[1])

  // Parse rare (rarity)
  const rareMatch = content.match(/Item\.rare\s*=\s*(\d+)/)
  if (rareMatch) {
    const rare = parseInt(rareMatch[1])
    item.rarity = getRarityLabel(rare)
  }

  return item
}

function getProjectileId(name: string): number {
  const map: Record<string, number> = {
    'Arrow': 1, 'Fireball': 2, 'Shuriken': 3, 'IceBolt': 4,
    'EnchantedBeam': 5, 'HolyWater': 6, 'UnholyWater': 7,
    'CursedFlame': 8, 'GoldenArrow': 9
  }
  return map[name] || 0
}

function getAmmoId(name: string): number {
  const map: Record<string, number> = {
    'Arrow': 1, 'Bullet': 2, 'Dart': 3, 'Gel': 4,
    'Rocket': 5, 'Solution': 6, 'Flare': 7
  }
  return map[name] || 0
}

function getBuffId(name: string): number {
  const map: Record<string, number> = {
    'OnFire': 1, 'Poisoned': 2, 'PotionSickness': 3,
    'WellFed': 4, 'Darkness': 5, 'Cursed': 6
  }
  return map[name] || 0
}

function getRarityLabel(rare: number): string {
  const labels: Record<number, string> = {
    [-1]: 'Grey', 0: 'Common', 1: 'Blue', 2: 'Green',
    3: 'Orange', 4: 'Red', 5: 'Light Red', 6: 'Pink',
    7: 'Purple', 8: 'Lime', 9: 'Yellow', 10: 'Cyan'
  }
  return labels[rare] || 'Common'
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
          <button class="flex flex-col items-start gap-3 p-4 bg-surface-container-lowest rounded-xl hover:bg-primary-container hover:text-white transition-all group active:scale-95" @click="handleOpenModFolder">
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
          <h2 class="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
            {{ store.viewMode === 'recent' ? t('workspace.recentActivity') : '工作区文件' }}
          </h2>
          <div class="flex items-center gap-3">
            <!-- Toggle Button -->
            <div class="flex bg-surface-container-low rounded-lg p-1">
              <button
                class="px-3 py-1 text-[10px] font-bold rounded-md transition-all"
                :class="store.viewMode === 'recent' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'"
                @click="store.viewMode = 'recent'"
              >最近活动</button>
              <button
                class="px-3 py-1 text-[10px] font-bold rounded-md transition-all"
                :class="store.viewMode === 'workspace' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'"
                @click="store.viewMode = 'workspace'"
              >工作区</button>
            </div>
            <button class="text-[11px] font-bold text-primary hover:underline" @click="emit('editItem')">{{ t('workspace.viewAllAssets') }}</button>
          </div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl shadow-sm">
          <!-- Recent Items View -->
          <table v-if="store.viewMode === 'recent'" class="w-full text-left">
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
          <!-- Workspace Files View -->
          <table v-else-if="store.viewMode === 'workspace'" class="w-full text-left">
            <thead>
              <tr class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                <th class="px-6 py-4 font-semibold">文件名</th>
                <th class="px-6 py-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/5">
              <tr v-if="store.workspaceFiles.length === 0">
                <td colspan="2" class="px-6 py-8 text-center text-on-surface-variant text-sm">
                  暂无工作区文件，请点击"打开工作区"选择一个 Mod 文件夹
                </td>
              </tr>
              <tr
                v-for="file in store.workspaceFiles"
                :key="file.path"
                class="hover:bg-surface-container-low transition-colors group cursor-pointer"
                @click="handleOpenCsFile(file.path)"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-surface-container-high rounded flex items-center justify-center p-1.5">
                      <span class="material-symbols-outlined text-sm text-primary">code</span>
                    </div>
                    <span class="text-sm font-semibold">{{ file.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="p-1 hover:text-primary transition-colors rounded hover:bg-surface-container-high"
                    @click.stop="handleOpenCsFile(file.path)"
                  >
                    <span class="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
