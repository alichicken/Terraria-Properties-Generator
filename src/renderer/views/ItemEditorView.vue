<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectStore } from '../stores/project'
import { generateCSharpCode, getRarityColor } from '../utils/codeGenerator'

const { t } = useI18n()
const store = useProjectStore()

// Type selection
const selectedType = ref<'general' | 'weapon' | 'armor' | 'accessory'>('weapon')
const showAdvanced = ref(false)
const showCrafting = ref(true)

// === BASIC FIELDS ===
const itemName = ref('')
const rarity = ref('lime')
const expertMode = ref('Normal')

// Value (Gold / Silver / Copper)
const valueGold = ref(0)
const valueSilver = ref(0)
const valueCopper = ref(100)

// Dimensions
const itemWidth = ref(18)
const itemHeight = ref(18)
const maxStack = ref(1)

// Scale
const itemScale = ref(1)

// Weapon Combat
const damage = ref(0)
const damageType = ref<'Melee' | 'Ranged' | 'Magic' | 'Summon' | 'Thrown'>('Melee')
const knockback = ref(0)
const critChance = ref(0)
const useTime = ref(20)
const useAnimation = ref(20)
const useStyle = ref(1)
const manaCost = ref(0)

// Weapon Projectile
const shoot = ref(0)
const shootSpeed = ref(0)
const autoReuse = ref(false)
const noMelee = ref(false)

// Armor
const defense = ref(0)
const armorSlot = ref<'head' | 'body' | 'legs'>('body')
const vanity = ref(false)

// Movement Bonuses
const moveSpeed = ref(0)
const damagePercent = ref(0)

// Set Bonus
const setBonus = ref('')

// === ADVANCED FIELDS ===
// Consumable/Potion
const consumable = ref(false)
const potion = ref(false)
const healLife = ref(0)
const healMana = ref(0)
const buffType = ref(0)
const buffTime = ref(0)

// Tool/Mining
const axe = ref(0)
const pick = ref(0)
const hammer = ref(0)

// Advanced Combat
const useAmmo = ref(0)
const noUseGraphic = ref(false)
const holdStyle = ref(0)
const useTurn = ref(false)
const reuseDelay = ref(0)
const channel = ref(false)

// Ammo
const ammo = ref(0)
const notAmmo = ref(false)

// Crafting
const ingredients = ref<{ name: string; count: number }[]>([
  { name: '', count: 1 }
])
const craftingStation = ref('Iron Anvil')

// Watch for item changes
watch(() => store.currentItem, (newItem) => {
  if (newItem) {
    selectedType.value = newItem.type as any
    itemName.value = newItem.name
    rarity.value = newItem.rarity

    // Value
    const totalValue = newItem.value || 100
    valueGold.value = Math.floor(totalValue / 10000)
    valueSilver.value = Math.floor((totalValue % 10000) / 100)
    valueCopper.value = totalValue % 100

    // Dimensions & Stack
    itemWidth.value = newItem.width || 18
    itemHeight.value = newItem.height || 18
    maxStack.value = newItem.maxStack || 1
    itemScale.value = newItem.scale || 1

    // Weapon Combat
    damage.value = newItem.damage || 0
    damageType.value = (newItem.damageType as any) || 'Melee'
    knockback.value = newItem.knockback || 0
    critChance.value = newItem.crit || 0
    useTime.value = newItem.useTime || 20
    useAnimation.value = newItem.useAnimation || 20
    useStyle.value = newItem.useStyle || 1
    manaCost.value = newItem.mana || 0

    // Weapon Projectile
    shoot.value = newItem.shoot || 0
    shootSpeed.value = newItem.shootSpeed || 0
    autoReuse.value = newItem.autoReuse || false
    noMelee.value = newItem.noMelee || false

    // Armor
    defense.value = newItem.defense || 0
    armorSlot.value = newItem.armorSlot || 'body'
    vanity.value = newItem.vanity || false

    // Movement bonuses
    moveSpeed.value = newItem.moveSpeedPercent || 0
    damagePercent.value = newItem.damagePercent || 0

    // Set bonus
    setBonus.value = newItem.setBonus || ''

    // Advanced - Consumable
    consumable.value = newItem.consumable || false
    potion.value = newItem.potion || false
    healLife.value = newItem.healLife || 0
    healMana.value = newItem.healMana || 0
    buffType.value = newItem.buffType || 0
    buffTime.value = newItem.buffTime || 0

    // Advanced - Tool
    axe.value = newItem.axe || 0
    pick.value = newItem.pick || 0
    hammer.value = newItem.hammer || 0

    // Advanced - Combat
    useAmmo.value = newItem.useAmmo || 0
    noUseGraphic.value = newItem.noUseGraphic || false
    holdStyle.value = newItem.holdStyle || 0
    useTurn.value = newItem.useTurn || false
    reuseDelay.value = newItem.reuseDelay || 0
    channel.value = newItem.channel || false

    // Advanced - Ammo
    ammo.value = newItem.ammo || 0
    notAmmo.value = newItem.notAmmo || false
  }
}, { immediate: true })

// Computed
const generatedCode = computed(() => {
  const item = getCurrentItemData()
  return generateCSharpCode(item)
})

const rarityOptions = [
  { value: 'lime', label: 'lime' },
  { value: 'yellow', label: 'yellow' },
  { value: 'cyan', label: 'cyan' },
  { value: 'red', label: 'red' },
  { value: 'pink', label: 'pink' },
  { value: 'purple', label: 'purple' },
  { value: 'white', label: 'white' },
  { value: 'grey', label: 'grey' }
]

const damageTypeOptions = ['Melee', 'Ranged', 'Magic', 'Summon', 'Thrown']
const expertModeOptions = ['Normal', 'Expert Only', 'Master Only']
const craftingStationOptions = ['Iron Anvil', 'Mythril Anvil', 'Adamantite Forge', 'Ancient Manipulator', 'Work Bench', 'None (By Hand)']
const useStyleOptions = [
  { value: 1, label: 'Swing' },
  { value: 2, label: 'Drink' },
  { value: 3, label: 'HoldUp' },
  { value: 4, label: 'Eat' },
  { value: 5, label: 'Thrust' }
]

function getCurrentItemData() {
  const totalValue = valueGold.value * 10000 + valueSilver.value * 100 + valueCopper.value

  return {
    id: store.currentItem?.id || crypto.randomUUID(),
    name: itemName.value || 'NewItem',
    type: selectedType.value,
    rarity: rarity.value,
    expertOnly: expertMode.value === 'Expert Only',
    // Basic - Dimensions & Stack
    width: itemWidth.value,
    height: itemHeight.value,
    maxStack: maxStack.value,
    value: totalValue,
    scale: itemScale.value,
    // Basic - Weapon Combat
    damage: selectedType.value === 'weapon' ? damage.value : undefined,
    damageType: selectedType.value === 'weapon' ? damageType.value : undefined,
    knockback: knockback.value || undefined,
    crit: critChance.value || undefined,
    useTime: useTime.value || undefined,
    useAnimation: useAnimation.value || undefined,
    useStyle: useStyle.value || undefined,
    mana: manaCost.value || undefined,
    // Basic - Weapon Projectile
    shoot: shoot.value || undefined,
    shootSpeed: shootSpeed.value || undefined,
    autoReuse: autoReuse.value || undefined,
    noMelee: noMelee.value || undefined,
    // Basic - Armor
    defense: selectedType.value === 'armor' || selectedType.value === 'accessory' ? defense.value : undefined,
    armorSlot: selectedType.value === 'armor' ? armorSlot.value : undefined,
    vanity: vanity.value || undefined,
    // Basic - Movement Bonuses (armor and accessory)
    damagePercent: (selectedType.value === 'armor' || selectedType.value === 'accessory') && damagePercent.value ? damagePercent.value : undefined,
    critPercent: (selectedType.value === 'armor' || selectedType.value === 'accessory') && critChance.value ? critChance.value : undefined,
    moveSpeedPercent: (selectedType.value === 'armor' || selectedType.value === 'accessory') && moveSpeed.value ? moveSpeed.value : undefined,
    // Basic - Set Bonus (armor only)
    setBonus: selectedType.value === 'armor' && setBonus.value ? setBonus.value : undefined,
    // Advanced - Consumable/Potion
    consumable: consumable.value || undefined,
    potion: potion.value || undefined,
    healLife: healLife.value || undefined,
    healMana: healMana.value || undefined,
    buffType: buffType.value || undefined,
    buffTime: buffTime.value || undefined,
    // Advanced - Tool/Mining
    axe: axe.value || undefined,
    pick: pick.value || undefined,
    hammer: hammer.value || undefined,
    // Advanced - Combat
    useAmmo: useAmmo.value || undefined,
    noUseGraphic: noUseGraphic.value || undefined,
    holdStyle: holdStyle.value || undefined,
    useTurn: useTurn.value || undefined,
    reuseDelay: reuseDelay.value || undefined,
    channel: channel.value || undefined,
    // Advanced - Ammo
    ammo: ammo.value || undefined,
    notAmmo: notAmmo.value || undefined,
    // Crafting
    ingredients: ingredients.value.filter(i => i.name && i.count > 0),
    craftingStation: craftingStation.value || undefined,
    // Sprite & metadata
    sprite: store.currentItem?.sprite,
    createdAt: store.currentItem?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

function handleSave() {
  const itemData = getCurrentItemData()

  if (store.currentItem) {
    store.updateItem(store.currentItem.id, itemData)
  } else {
    store.addItem(itemData)
  }
}

function handleTypeChange(type: 'general' | 'weapon' | 'armor' | 'accessory') {
  selectedType.value = type
}

async function handleSelectImage() {
  if (window.electronAPI) {
    const imageData = await window.electronAPI.selectImage()
    if (imageData && store.currentItem) {
      store.updateItem(store.currentItem.id, { sprite: imageData })
    }
  }
}

function handleCopyCode() {
  navigator.clipboard.writeText(generatedCode.value)
}

async function handleExportCode() {
  if (!window.electronAPI) return

  // Select folder
  const folderPath = await window.electronAPI.selectExportFolder()
  if (!folderPath) return

  // Generate filename based on item name
  const itemName = store.currentItem?.name || 'Item'
  const fileName = `${itemName.replace(/\s+/g, '_')}.cs`

  // Get plain code without HTML
  const plainCode = generatedCode.value.replace(/<[^>]+>/g, '')

  const result = await window.electronAPI.exportCode(folderPath, fileName, plainCode)
  if (result.success) {
    alert(`代码已导出到: ${result.path}`)
  } else {
    alert(`导出失败: ${result.error}`)
  }
}

function addIngredient() {
  ingredients.value.push({ name: '', count: 1 })
}

function removeIngredient(index: number) {
  ingredients.value.splice(index, 1)
}

function getTypeIcon() {
  switch (selectedType.value) {
    case 'weapon': return 'swords'
    case 'armor': return 'shield'
    case 'accessory': return 'auto_awesome'
    default: return 'category'
  }
}

function getTypeLabel() {
  switch (selectedType.value) {
    case 'weapon': return 'Weapon'
    case 'armor': return 'Armor'
    case 'accessory': return 'Accessory'
    default: return 'General'
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex justify-between items-end">
      <div>
        <div class="flex items-center gap-3 text-on-surface-variant mb-1">
          <span class="text-[10px] font-medium tracking-widest uppercase">Project Asset Editor</span>
          <span class="h-px w-8 bg-outline-variant"></span>
        </div>
        <h1 class="text-4xl font-bold tracking-tighter text-on-surface">{{ itemName || 'New Item' }}</h1>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl text-on-surface font-semibold text-xs uppercase tracking-widest">Save Template</button>
        <button class="px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-semibold text-xs uppercase tracking-widest shadow-md" @click="handleSave">Export to Mod</button>
      </div>
    </div>

    <!-- Editor Grid -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Left Panel: Item Properties -->
      <section class="col-span-12 lg:col-span-5 flex flex-col gap-6">
        <!-- Type Selector -->
        <div class="bg-surface-container-lowest rounded-full p-1 flex shadow-sm">
          <button
            v-for="type in ['general', 'weapon', 'armor', 'accessory']"
            :key="type"
            @click="handleTypeChange(type as any)"
            class="flex-1 py-1.5 rounded-full text-[10px] font-bold uppercase transition-colors"
            :class="selectedType === type ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'"
          >
            {{ type === 'general' ? 'General' : type === 'weapon' ? 'Weapon' : type === 'armor' ? 'Armor' : 'Accessory' }}
          </button>
        </div>

        <!-- Item Properties Card -->
        <div class="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <h3 class="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">{{ getTypeIcon() }}</span>
            Item Properties
          </h3>

          <div class="space-y-6">
            <!-- Item Name -->
            <div>
              <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Item Name</label>
              <input
                v-model="itemName"
                class="w-full bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all rounded-lg p-3 text-sm font-medium"
                type="text"
              />
            </div>

            <!-- General Properties -->
            <div class="pt-4 mt-2 border-t border-outline-variant/10">
              <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">tune</span>
                General Properties
              </h4>
              <div class="space-y-4">
                <!-- Value (Gold / Silver / Copper) -->
                <div>
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Value (Gold / Silver / Copper)</label>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="relative">
                      <input
                        v-model.number="valueGold"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 pr-2 text-sm text-amber-500 font-bold text-center"
                        type="number"
                        min="0"
                      />
                      <span class="absolute bottom-0.5 right-1.5 text-[8px] opacity-40">G</span>
                    </div>
                    <div class="relative">
                      <input
                        v-model.number="valueSilver"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 pr-2 text-sm text-slate-400 font-bold text-center"
                        type="number"
                        min="0"
                        max="99"
                      />
                      <span class="absolute bottom-0.5 right-1.5 text-[8px] opacity-40">S</span>
                    </div>
                    <div class="relative">
                      <input
                        v-model.number="valueCopper"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 pr-2 text-sm text-orange-700 font-bold text-center"
                        type="number"
                        min="0"
                        max="99"
                      />
                      <span class="absolute bottom-0.5 right-1.5 text-[8px] opacity-40">C</span>
                    </div>
                  </div>
                </div>

                <!-- Rarity & Expert Mode -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Rarity</label>
                    <select
                      v-model="rarity"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-medium"
                      :class="getRarityColor(rarity)"
                    >
                      <option v-for="opt in rarityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Expert Mode</label>
                    <select
                      v-model="expertMode"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                    >
                      <option v-for="opt in expertModeOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>

                <!-- Size & Scale -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Size (Width x Height)</label>
                    <div class="grid grid-cols-2 gap-2">
                      <input
                        v-model.number="itemWidth"
                        class="bg-surface-container-low border-none rounded-lg p-3 text-sm text-center"
                        type="number"
                        min="1"
                      />
                      <input
                        v-model.number="itemHeight"
                        class="bg-surface-container-low border-none rounded-lg p-3 text-sm text-center"
                        type="number"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Scale</label>
                    <input
                      v-model.number="itemScale"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      type="number"
                      step="0.1"
                      min="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Weapon Properties -->
            <template v-if="selectedType === 'weapon'">
              <div class="pt-4 mt-2 border-t border-outline-variant/10">
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">bolt</span>
                  Weapon Properties
                </h4>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Damage</label>
                      <input
                        v-model.number="damage"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Damage Type</label>
                      <select
                        v-model="damageType"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      >
                        <option v-for="dt in damageTypeOptions" :key="dt" :value="dt">{{ dt }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Knockback</label>
                      <input
                        v-model.number="knockback"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                        type="number"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Crit %</label>
                      <input
                        v-model.number="critChance"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Use Time</label>
                      <input
                        v-model.number="useTime"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                        type="number"
                        min="1"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Use Animation</label>
                      <input
                        v-model.number="useAnimation"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                        type="number"
                        min="1"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Use Style</label>
                      <select
                        v-model.number="useStyle"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      >
                        <option v-for="opt in useStyleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Mana Cost</label>
                      <input
                        v-model.number="manaCost"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>

                  <!-- Toggles -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-center justify-between px-1">
                      <span class="text-[10px] font-bold text-on-surface-variant uppercase">Auto Reuse</span>
                      <button
                        class="w-9 h-5 bg-surface-container-high rounded-full relative cursor-pointer transition-colors"
                        :class="autoReuse ? 'bg-primary-container' : ''"
                        @click="autoReuse = !autoReuse"
                      >
                        <span
                          class="absolute top-[2px] w-4 h-4 bg-white rounded-full transition-transform"
                          :class="autoReuse ? 'left-[18px]' : 'left-[2px]'"
                        ></span>
                      </button>
                    </div>
                    <div class="flex items-center justify-between px-1">
                      <span class="text-[10px] font-bold text-on-surface-variant uppercase">No Melee</span>
                      <button
                        class="w-9 h-5 bg-surface-container-high rounded-full relative cursor-pointer transition-colors"
                        :class="noMelee ? 'bg-primary-container' : ''"
                        @click="noMelee = !noMelee"
                      >
                        <span
                          class="absolute top-[2px] w-4 h-4 bg-white rounded-full transition-transform"
                          :class="noMelee ? 'left-[18px]' : 'left-[2px]'"
                        ></span>
                      </button>
                    </div>
                  </div>

                  <!-- Projectile -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Shoot ID</label>
                      <input
                        v-model.number="shoot"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Shoot Speed</label>
                      <input
                        v-model.number="shootSpeed"
                        class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                        type="number"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Armor Properties -->
            <template v-if="selectedType === 'armor'">
              <div class="pt-4 mt-2 border-t border-outline-variant/10">
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">security</span>
                  Armor Properties
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Defense</label>
                    <input
                      v-model.number="defense"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      type="number"
                      min="0"
                    />
                  </div>
                  <div class="flex flex-col justify-center px-1">
                    <label class="flex items-center justify-between cursor-pointer">
                      <span class="text-[10px] font-bold text-on-surface-variant uppercase">Vanity Item</span>
                      <button
                        class="w-9 h-5 bg-surface-container-high rounded-full relative cursor-pointer transition-colors"
                        :class="vanity ? 'bg-primary-container' : ''"
                        @click="vanity = !vanity"
                      >
                        <span
                          class="absolute top-[2px] w-4 h-4 bg-white rounded-full transition-transform"
                          :class="vanity ? 'left-[18px]' : 'left-[2px]'"
                        ></span>
                      </button>
                    </label>
                  </div>
                  <div class="col-span-2">
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Armor Slot</label>
                    <select
                      v-model="armorSlot"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                    >
                      <option value="head">Head</option>
                      <option value="body">Body</option>
                      <option value="legs">Legs</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Armor Bonuses -->
              <div class="pt-4 mt-2 border-t border-outline-variant/10">
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">trending_up</span>
                  Armor Bonuses
                </h4>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Move Speed (%)</label>
                    <input
                      v-model.number="moveSpeed"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      type="number"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Damage (%)</label>
                    <input
                      v-model.number="damagePercent"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      type="number"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Crit (%)</label>
                    <input
                      v-model.number="critChance"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      type="number"
                    />
                  </div>
                </div>
              </div>

              <!-- Set Bonus -->
              <div class="pt-4 mt-2 border-t border-outline-variant/10">
                <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Set Bonus Description</label>
                <textarea
                  v-model="setBonus"
                  class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm resize-none"
                  rows="2"
                  placeholder="Enter set bonus description..."
                ></textarea>
              </div>
            </template>

            <!-- Accessory Properties -->
            <template v-if="selectedType === 'accessory'">
              <div class="pt-4 mt-2 border-t border-outline-variant/10">
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">auto_awesome</span>
                  Accessory Properties
                </h4>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Move Speed (%)</label>
                    <input
                      v-model.number="moveSpeed"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      type="number"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Damage (%)</label>
                    <input
                      v-model.number="damagePercent"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      type="number"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Crit (%)</label>
                    <input
                      v-model.number="critChance"
                      class="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </template>

            <!-- Advanced Properties Expander -->
            <div class="pt-4 mt-2 border-t border-outline-variant/10">
              <button
                class="w-full flex items-center justify-between text-on-surface font-bold text-sm mb-4"
                @click="showAdvanced = !showAdvanced"
              >
                <span>Advanced Properties</span>
                <span
                  class="material-symbols-outlined transition-transform"
                  :class="{ 'rotate-180': !showAdvanced }"
                >expand_less</span>
              </button>

              <div v-show="showAdvanced" class="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <!-- Consumable / Potion -->
                <div>
                  <h4 class="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Consumable / Potion</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-center gap-3">
                      <button
                        class="w-9 h-5 bg-surface-container-high rounded-full relative cursor-pointer transition-colors"
                        :class="consumable ? 'bg-primary-container' : ''"
                        @click="consumable = !consumable"
                      >
                        <span
                          class="absolute top-[2px] w-4 h-4 bg-white rounded-full transition-transform"
                          :class="consumable ? 'left-[18px]' : 'left-[2px]'"
                        ></span>
                      </button>
                      <span class="text-xs font-medium">Consumable</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <button
                        class="w-9 h-5 bg-surface-container-high rounded-full relative cursor-pointer transition-colors"
                        :class="potion ? 'bg-primary-container' : ''"
                        @click="potion = !potion"
                      >
                        <span
                          class="absolute top-[2px] w-4 h-4 bg-white rounded-full transition-transform"
                          :class="potion ? 'left-[18px]' : 'left-[2px]'"
                        ></span>
                      </button>
                      <span class="text-xs font-medium">Potion</span>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Heal Life</label>
                      <input
                        v-model.number="healLife"
                        class="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm"
                        type="number"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Heal Mana</label>
                      <input
                        v-model.number="healMana"
                        class="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm"
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                <!-- Ammo -->
                <div>
                  <h4 class="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Ammo</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Ammo Type</label>
                      <input
                        v-model.number="ammo"
                        class="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm"
                        type="number"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Use Ammo</label>
                      <input
                        v-model.number="useAmmo"
                        class="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm"
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                <!-- Tool / Mining -->
                <div>
                  <h4 class="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Tool / Mining</h4>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Axe Power</label>
                      <input
                        v-model.number="axe"
                        class="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm"
                        type="number"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Pick Power</label>
                      <input
                        v-model.number="pick"
                        class="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm"
                        type="number"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Hammer</label>
                      <input
                        v-model.number="hammer"
                        class="w-full bg-surface-container-low border-none rounded-lg p-2 text-sm"
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Crafting -->
            <div class="pt-4 mt-2 border-t border-outline-variant/10">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">handyman</span>
                  Crafting
                </h4>
                <button
                  class="text-[10px] text-primary font-bold flex items-center gap-1 hover:underline"
                  @click="addIngredient"
                >
                  <span class="material-symbols-outlined text-[14px]">add</span>
                  ADD INGREDIENT
                </button>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(ing, index) in ingredients"
                  :key="index"
                  class="grid grid-cols-12 gap-2 items-center"
                >
                  <div class="col-span-8">
                    <input
                      v-model="ing.name"
                      class="w-full bg-surface-container-low border-none rounded-lg p-2 text-xs"
                      placeholder="Ingredient name"
                      type="text"
                    />
                  </div>
                  <div class="col-span-3">
                    <input
                      v-model.number="ing.count"
                      class="w-full bg-surface-container-low border-none rounded-lg p-2 text-xs text-center"
                      placeholder="Qty"
                      type="number"
                      min="1"
                    />
                  </div>
                  <div class="col-span-1 flex justify-center">
                    <button
                      class="material-symbols-outlined text-on-surface-variant hover:text-error text-lg"
                      @click="removeIngredient(index)"
                    >close</button>
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase mb-1 px-1">Crafting Station</label>
                  <select
                    v-model="craftingStation"
                    class="w-full bg-surface-container-low border-none rounded-lg p-2.5 text-xs"
                  >
                    <option v-for="station in craftingStationOptions" :key="station" :value="station">{{ station }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Panel: Previews & Code -->
      <section class="col-span-12 lg:col-span-7 flex flex-col gap-6">
        <!-- Sprite Preview Card -->
        <div class="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-l-4 border-primary">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xs font-bold uppercase tracking-widest text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">visibility</span>
              Sprite Preview
            </h3>
            <div class="flex gap-2">
              <button class="material-symbols-outlined text-sm p-1.5 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">zoom_in</button>
              <button class="material-symbols-outlined text-sm p-1.5 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">grid_on</button>
            </div>
          </div>
          <div class="h-64 bg-surface-container-low rounded-xl flex items-center justify-center relative overflow-hidden">
            <div
              class="absolute inset-0 opacity-[0.03] pointer-events-none"
              style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 16px 16px;"
            ></div>
            <div class="z-10 bg-white p-4 rounded-xl shadow-inner border border-outline-variant/5">
              <img
                v-if="store.currentItem?.sprite"
                class="w-24 h-24 object-contain pixel-art rounded"
                :src="store.currentItem.sprite"
                alt="Item sprite"
              />
              <div v-else class="w-24 h-24 flex items-center justify-center text-outline-variant">
                <span class="material-symbols-outlined text-4xl">image</span>
              </div>
            </div>
            <div class="absolute bottom-3 right-3 text-[10px] font-mono text-on-surface-variant bg-surface-container-highest/50 px-2 py-1 rounded-md backdrop-blur-sm">
              {{ itemWidth }}x{{ itemHeight }} px | Scale: {{ (itemScale * 100).toFixed(0) }}%
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              class="bg-surface-container-highest hover:bg-surface-container-high transition-colors px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"
              @click="handleSelectImage"
            >
              <span class="material-symbols-outlined text-sm">upload</span>
              Replace Image
            </button>
          </div>
        </div>

        <!-- Code View Card -->
        <div class="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex-grow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xs font-bold uppercase tracking-widest text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">code</span>
              Mod Source (C#)
            </h3>
            <div class="flex items-center gap-4">
              <button
                class="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
                @click="handleExportCode"
              >
                <span class="material-symbols-outlined text-sm align-middle mr-1">download</span>
                Export to File
              </button>
              <button
                class="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
                @click="handleCopyCode"
              >Copy to Clipboard</button>
            </div>
          </div>
          <div class="bg-slate-900 rounded-xl p-5 h-full overflow-hidden relative min-h-[300px] flex flex-col">
            <div class="flex-1 overflow-auto">
              <pre class="code-font text-xs text-slate-300 leading-6"><code v-html="generatedCode"></code></pre>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>