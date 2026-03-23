import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ModItem {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'accessory' | 'general' | 'material' | 'consumable'
  rarity: string

  // === BASIC PROPERTIES ===
  // Dimensions & Stack
  width?: number
  height?: number
  maxStack?: number
  value?: number  // copper coins, use sellPrice() in generation

  // Weapon Combat
  damage?: number
  damageType?: 'Melee' | 'Ranged' | 'Magic' | 'Summon' | 'Thrown'
  knockback?: number
  crit?: number
  useTime?: number
  useAnimation?: number
  useStyle?: number  // 1=swing, 2=drink, 3=shortsword, 4=life crystal, 5=staff/gun
  mana?: number

  // Weapon Projectile
  shoot?: number  // ProjectileID
  shootSpeed?: number
  autoReuse?: boolean
  noMelee?: boolean

  // Armor
  defense?: number
  armorSlot?: 'head' | 'body' | 'legs'

  // Accessory
  accessorySlot?: string
  accessory?: boolean

  // Movement/Armor Bonuses (in UpdateEquip)
  damagePercent?: number
  critPercent?: number
  moveSpeedPercent?: number
  lifeRegen?: number

  // Set Bonus
  setBonus?: string

  // === ADVANCED PROPERTIES ===
  // Consumable/Potion
  consumable?: boolean
  potion?: boolean
  healLife?: number
  healMana?: number
  buffType?: number
  buffTime?: number

  // Tool/Mining
  axe?: number
  pick?: number
  hammer?: number

  // Advanced Combat
  useAmmo?: number  // AmmoID
  noUseGraphic?: boolean
  holdStyle?: number
  useTurn?: boolean
  reuseDelay?: number
  channel?: boolean

  // Ammo
  ammo?: number
  notAmmo?: boolean

  // Fishing
  bait?: number
  fishingPole?: number

  // Special
  mountType?: number
  vanity?: boolean
  expertOnly?: boolean
  questItem?: boolean
  mech?: boolean
  material?: boolean
  createTile?: number
  createWall?: number
  tileBoost?: number
  tileWand?: number
  DD2Summon?: boolean

  // Visual
  glowMask?: number
  color?: string  // hex color

  // Metadata
  sprite?: string

  // Crafting
  ingredients?: { name: string; count: number }[]
  craftingStation?: string
  craftingTiles?: number[]

  createdAt: string
  updatedAt: string
}

export interface ModProject {
  id: string
  name: string
  version: string
  items: ModItem[]
  recipes: number
  armorSets: number
  projectiles: number
  createdAt: string
  updatedAt: string
}

export const useProjectStore = defineStore('project', () => {
  const currentProject = ref<ModProject | null>(null)
  const currentItem = ref<ModItem | null>(null)
  const items = ref<ModItem[]>([])
  const recentItems = computed(() => {
    return [...items.value].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5)
  })

  const stats = computed(() => ({
    items: items.value.length,
    recipes: currentProject.value?.recipes || 0,
    armorSets: currentProject.value?.armorSets || 0,
    projectiles: currentProject.value?.projectiles || 0
  }))

  function createNewProject(name: string = 'MyModName') {
    currentProject.value = {
      id: crypto.randomUUID(),
      name,
      version: '1.0.0',
      items: [],
      recipes: 0,
      armorSets: 0,
      projectiles: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    items.value = []
    currentItem.value = null
  }

  function addItem(item: Omit<ModItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const newItem: ModItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    items.value.push(newItem)
    currentItem.value = newItem

    if (currentProject.value) {
      currentProject.value.updatedAt = new Date().toISOString()
    }

    return newItem
  }

  function updateItem(id: string, updates: Partial<ModItem>) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = {
        ...items.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      if (currentItem.value?.id === id) {
        currentItem.value = items.value[index]
      }

      if (currentProject.value) {
        currentProject.value.updatedAt = new Date().toISOString()
      }
    }
  }

  function deleteItem(id: string) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
      if (currentItem.value?.id === id) {
        currentItem.value = null
      }
    }
  }

  function selectItem(id: string) {
    currentItem.value = items.value.find(item => item.id === id) || null
  }

  function loadProject(project: ModProject) {
    currentProject.value = project
    items.value = project.items
    currentItem.value = null
  }

  function getProjectData(): ModProject | null {
    if (!currentProject.value) return null

    return {
      ...currentProject.value,
      items: items.value,
      updatedAt: new Date().toISOString()
    }
  }

  return {
    currentProject,
    currentItem,
    items,
    recentItems,
    stats,
    createNewProject,
    addItem,
    updateItem,
    deleteItem,
    selectItem,
    loadProject,
    getProjectData
  }
})
