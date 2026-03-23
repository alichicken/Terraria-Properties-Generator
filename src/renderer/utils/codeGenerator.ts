import type { ModItem } from '../stores/project'

export function generateCSharpCode(item: ModItem): string {
  const className = toPascalCase(item.name.replace(/\s+/g, ''))

  // Generate plain code first, then apply syntax highlighting
  const plainCode = generatePlainCode(item, className)

  // Apply syntax highlighting
  return applySyntaxHighlighting(plainCode)
}

function generatePlainCode(item: ModItem, className: string): string {
  const lines: string[] = []

  // Using statements
  lines.push('using Terraria.ID;')
  lines.push('using Terraria.ModLoader;')
  lines.push('')

  // Namespace
  lines.push('namespace YourModName.Items')
  lines.push('{')

  // Class declaration with attribute
  const equipType = getEquipType(item)
  if (item.type === 'armor' && equipType) {
    lines.push(`    [AutoloadEquip(EquipType.${capitalizeFirst(equipType)})]`)
  }

  lines.push(`    public class ${className} : ModItem`)
  lines.push('    {')

  // SetDefaults method
  lines.push('        public override void SetDefaults() {')

  // === BASIC PROPERTIES ===

  // Dimensions
  lines.push(`            Item.width = ${item.width || 18};`)
  lines.push(`            Item.height = ${item.height || 18};`)

  // Max Stack
  if (item.maxStack && item.maxStack > 1) {
    lines.push(`            Item.maxStack = ${item.maxStack};`)
  }

  // Value
  lines.push(`            Item.value = Item.sellPrice(0, ${Math.floor((item.value || 100) / 10000)}, ${Math.floor(((item.value || 100) % 10000) / 100)}, ${(item.value || 100) % 100});`)

  // Rarity
  const rarityId = getRarityId(item.rarity)
  lines.push(`            Item.rare = ItemRarityID.${rarityId};`)

  // === WEAPON COMBAT ===
  if (item.damage) {
    lines.push(`            Item.damage = ${item.damage};`)
  }

  if (item.damageType) {
    lines.push(`            Item.DamageType = DamageClass${capitalizeFirst(item.damageType)};`)
  }

  if (item.knockback) {
    lines.push(`            Item.knockBack = ${item.knockback.toFixed(1)}f;`)
  }

  if (item.crit) {
    lines.push(`            Item.crit = ${item.crit};`)
  }

  if (item.useTime) {
    lines.push(`            Item.useTime = ${item.useTime};`)
  }

  if (item.useAnimation) {
    lines.push(`            Item.useAnimation = ${item.useAnimation};`)
  }

  if (item.useStyle) {
    lines.push(`            Item.useStyle = ${item.useStyle};`)
  }

  if (item.mana) {
    lines.push(`            Item.mana = ${item.mana};`)
  }

  if (item.scale && item.scale !== 1) {
    lines.push(`            Item.scale = ${item.scale.toFixed(2)}f;`)
  }

  // === WEAPON PROJECTILE ===
  if (item.shoot) {
    lines.push(`            Item.shoot = ProjectileID.${getProjectileName(item.shoot)};`)
  }

  if (item.shootSpeed) {
    lines.push(`            Item.shootSpeed = ${item.shootSpeed.toFixed(2)}f;`)
  }

  if (item.autoReuse) {
    lines.push(`            Item.autoReuse = true;`)
  }

  if (item.noMelee) {
    lines.push(`            Item.noMelee = true;`)
  }

  // === ARMOR ===
  if (item.type === 'armor' && item.defense) {
    lines.push(`            Item.defense = ${item.defense};`)
  }

  // === ADVANCED PROPERTIES ===

  // Consumable/Potion
  if (item.consumable) {
    lines.push(`            Item.consumable = true;`)
  }

  if (item.potion) {
    lines.push(`            Item.potion = true;`)
  }

  if (item.healLife) {
    lines.push(`            Item.healLife = ${item.healLife};`)
  }

  if (item.healMana) {
    lines.push(`            Item.healMana = ${item.healMana};`)
  }

  if (item.buffType) {
    lines.push(`            Item.buffType = ${item.buffType};`)
  }

  if (item.buffTime) {
    lines.push(`            Item.buffTime = ${item.buffTime};`)
  }

  // Tool/Mining
  if (item.axe) {
    lines.push(`            Item.axe = ${item.axe};`)
  }

  if (item.pick) {
    lines.push(`            Item.pick = ${item.pick};`)
  }

  if (item.hammer) {
    lines.push(`            Item.hammer = ${item.hammer};`)
  }

  // Advanced Combat
  if (item.useAmmo) {
    lines.push(`            Item.useAmmo = ${item.useAmmo};`)
  }

  if (item.noUseGraphic) {
    lines.push(`            Item.noUseGraphic = true;`)
  }

  if (item.holdStyle) {
    lines.push(`            Item.holdStyle = ${item.holdStyle};`)
  }

  if (item.useTurn) {
    lines.push(`            Item.useTurn = true;`)
  }

  if (item.reuseDelay) {
    lines.push(`            Item.reuseDelay = ${item.reuseDelay};`)
  }

  if (item.channel) {
    lines.push(`            Item.channel = true;`)
  }

  // Ammo
  if (item.ammo) {
    lines.push(`            Item.ammo = ${item.ammo};`)
  }

  if (item.notAmmo) {
    lines.push(`            Item.notAmmo = true;`)
  }

  // Material
  if (item.material) {
    lines.push(`            Item.material = true;`)
  }

  // Tile placement
  if (item.createTile) {
    lines.push(`            Item.createTile = ${item.createTile};`)
  }

  if (item.createWall) {
    lines.push(`            Item.createWall = ${item.createWall};`)
  }

  lines.push('        }')
  lines.push('')

  // UpdateEquip method for armor/accessory
  if ((item.type === 'armor' || item.type === 'accessory') && hasEquipBonus(item)) {
    lines.push('        public override void UpdateEquip(Player player) {')

    if (item.damagePercent) {
      lines.push(`            player.GetDamage(DamageClass.Generic) += ${(item.damagePercent / 100).toFixed(2)}f;`)
    }

    if (item.critPercent) {
      lines.push(`            player.GetCritChance(DamageClass.Generic) += ${item.critPercent};`)
    }

    if (item.moveSpeedPercent) {
      lines.push(`            player.moveSpeed += ${(item.moveSpeedPercent / 100).toFixed(2)}f;`)
    }

    if (item.lifeRegen) {
      lines.push(`            player.lifeRegen += ${item.lifeRegen};`)
    }

    lines.push('        }')
    lines.push('')
  }

  // SetBonus for armor
  if (item.type === 'armor' && item.setBonus) {
    lines.push('        public override void SetBonus() {')
    lines.push(`            Item.SetBonus("${item.setBonus}");`)
    lines.push('        }')
    lines.push('')
  }

  // Recipe
  const recipeLines = generateRecipe(item)
  lines.push(...recipeLines)

  // Close class and namespace
  lines.push('    }')
  lines.push('}')

  return lines.join('\n')
}

function generateRecipe(item: ModItem): string[] {
  const lines: string[] = []

  if (!item.ingredients || item.ingredients.length === 0) {
    return lines
  }

  lines.push('')
  lines.push('        public override void AddRecipes() {')

  lines.push('            CreateRecipe()')

  for (const ing of item.ingredients) {
    lines.push(`                .AddIngredient("${ing.name}", ${ing.count})`)
  }

  // Only add tile if not "None (By Hand)"
  if (item.craftingStation && item.craftingStation !== 'None (By Hand)') {
    let tileId = 16 // Default to Iron Anvil
    if (item.craftingStation === 'Mythril Anvil') tileId = 101
    else if (item.craftingStation === 'Adamantite Forge') tileId = 177
    else if (item.craftingStation === 'Ancient Manipulator') tileId = 412
    else if (item.craftingStation === 'Work Bench') tileId = 94
    lines.push(`                .AddTile(TileID.${tileId})`)
  }

  lines.push('                .Register();')
  lines.push('        }')

  return lines
}

function applySyntaxHighlighting(code: string): string {
  // FIRST: Apply syntax highlighting to plain text, using placeholders
  let highlighted = code

  // Keywords - use placeholder
  highlighted = highlighted.replace(
    /\b(using|namespace|public|class|override|void|return|private|protected|internal|static|const|new|if|else|for|while|foreach|this|base)\b/g,
    '___KW___$1___ENDKW___'
  )

  // Types - use placeholder
  highlighted = highlighted.replace(
    /\b(int|string|bool|float|double|var|Player|Item|Tile|NPC|Projectile|ModItem|ModTile|ModNPC|ModProjectile|DamageClass)\b/g,
    '___TYPE___$1___ENDTYPE___'
  )

  // Numbers - use placeholder
  highlighted = highlighted.replace(
    /\b(\d+\.?\d*f?)\b/g,
    '___NUM___$1___ENDNUM___'
  )

  // Strings (double quoted) - use placeholder
  highlighted = highlighted.replace(
    /"([^"]*)"/g,
    '___STR___"$1"___ENDSTR___'
  )

  // Comments - use placeholder
  highlighted = highlighted.replace(
    /(\/\/.*$)/gm,
    '___CMT___$1___ENDCMT___'
  )

  // NOW escape HTML (so our placeholders survive)
  highlighted = highlighted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Finally convert placeholders to actual spans
  highlighted = highlighted
    .replace(/___KW___/g, '<span class="text-indigo-400">')
    .replace(/___ENDKW___/g, '</span>')
    .replace(/___TYPE___/g, '<span class="text-cyan-400">')
    .replace(/___ENDTYPE___/g, '</span>')
    .replace(/___NUM___/g, '<span class="text-emerald-400">')
    .replace(/___ENDNUM___/g, '</span>')
    .replace(/___STR___/g, '<span class="text-orange-300">')
    .replace(/___ENDSTR___/g, '</span>')
    .replace(/___CMT___/g, '<span class="text-gray-500">')
    .replace(/___ENDCMT___/g, '</span>')

  return highlighted
}

function getEquipType(item: ModItem): string | null {
  if (item.type === 'armor') {
    switch (item.armorSlot) {
      case 'head':
        return 'Head'
      case 'body':
        return 'Body'
      case 'legs':
        return 'Legs'
      default:
        return 'Body'
    }
  }
  return null
}

function getProjectileName(id: number): string {
  // Common projectile IDs - could be extended
  const projectileMap: Record<number, string> = {
    1: 'Arrow',
    2: 'Fireball',
    3: 'Hook',
    4: 'Bullet',
    5: 'Shuriken',
    6: 'Bone',
    7: 'Hook',
    10: 'Flare',
    12: 'IceBolt',
    13: 'WoodenArrowFriendly',
    14: 'Fireball',
    20: 'HarpyFeather',
    24: 'Seed',
    25: 'StygianStylet',
    28: 'Marrow',
    30: 'Amanda',
    31: 'Stinger',
    33: 'FrostBlast',
    34: 'LifeDrain',
    35: 'Panda',
    36: 'BBB',
    37: 'ImpFireball',
    38: 'Sparks',
    39: 'Frostbolt',
    40: 'Saucer',
    41: 'SaucerLaser',
    42: 'SaucerMissile',
    44: 'VileSpit',
    45: 'ShadowBeam',
    46: 'SpiritSkull',
    47: 'Shark',
    48: 'Martian',
    49: 'MartianLaser',
    50: 'MartianMissile',
    52: 'Vortex',
    53: 'Rocket',
    55: 'MagnetSphere',
    56: 'Laser',
    57: 'LaserMachinegun',
    58: 'Electrosphere',
    59: 'ElectrosphereMissile',
    60: 'GlowStick',
    61: 'Seed',
    62: 'PoisonDart',
    63: 'Bone',
    64: 'GiantSkull',
    65: 'Skull',
    66: 'Snowball',
    67: 'Rocket',
    68: 'GreyRocket',
    69: 'Explosives',
    70: 'Sathel',
    71: 'SathelWeapon',
    72: 'Teleport',
    74: 'GemBolt',
    75: 'GemBolt',
    76: 'GemBolt',
    77: 'GemBolt',
    78: 'GemBolt',
    79: 'GemBolt',
    80: 'Meteor',
    81: 'Rain',
    82: 'PhasBolt',
    83: 'HeatRay',
    84: 'WaterStream',
    85: 'CursedFlame',
    86: 'Inferno',
    87: 'SpiritFlame',
    88: 'EtherMana',
    89: 'EtherMana',
    90: 'EtherFlame',
    91: 'HolyWater',
    92: 'HallowStar',
    93: 'MagicMissile',
    94: 'HolyFlames',
    95: 'Hydra',
    96: 'Havoc',
    97: 'Spectral'
  }
  return projectileMap[id] || 'Friendly'
}

function getRarityId(rarity: string): string {
  const rarityMap: Record<string, string> = {
    'lime': 'Lime',
    'yellow': 'Yellow',
    'cyan': 'Cyan',
    'red': 'Red',
    'pink': 'Pink',
    'purple': 'Purple',
    'white': 'White',
    'grey': 'Grey'
  }
  return rarityMap[rarity.toLowerCase()] || 'Blue'
}

function hasEquipBonus(item: ModItem): boolean {
  return !!(item.damagePercent || item.critPercent || item.moveSpeedPercent)
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase())
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function getItemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'weapon': '武器',
    'armor': '护甲',
    'accessory': '饰品',
    'general': '通用'
  }
  return labels[type] || type
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    'lime': 'text-lime-600',
    'yellow': 'text-yellow-500',
    'cyan': 'text-cyan-500',
    'red': 'text-red-500',
    'pink': 'text-pink-500',
    'purple': 'text-purple-500',
    'white': 'text-gray-200',
    'grey': 'text-gray-400'
  }
  return colors[rarity.toLowerCase()] || 'text-blue-500'
}
