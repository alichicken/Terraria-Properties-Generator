# Terraria Properties Generator - 代码规范

## 1. 概述

本文档定义了项目的代码编写规范，确保代码风格一致性和可维护性。

---

## 2. 语言规范

### 2.1 TypeScript

- **严格模式**: 启用 `strict: true`
- **类型声明**: 优先使用显式类型，避免 `any`
- **接口 vs 类型**: 使用 `interface` 定义对象结构，使用 `type` 定义联合类型/别名

### 2.2 Vue SFC

- **Script Setup**: 使用 `<script setup lang="ts">` 语法
- **组件命名**: 使用 PascalCase (如 `ItemEditorView`)
- **Props**: 使用 `defineProps` 配合类型声明

---

## 3. 命名规范

| 类型 | 命名方式 | 示例 |
|------|----------|------|
| 文件名 | kebab-case | `code-generator.ts` |
| 组件名 | PascalCase | `WorkspaceView.vue` |
| 函数名 | camelCase | `generateCSharpCode()` |
| 变量名 | camelCase | `currentProject` |
| 常量名 | camelCase | `maxStackValue` |
| 接口名 | PascalCase | `ModItem` |
| 枚举名 | PascalCase | `ItemType` |
| CSS 类名 | kebab-case | `text-primary` (Tailwind) |

---

## 4. 代码格式

### 4.1 缩进与空格

- **缩进**: 2 空格
- **行尾**: 不强制 CRLF/LF (Git 自动转换)
- **最大行宽**: 120 字符
- **语句结尾**: 不需要分号 (TypeScript/ESLint 自动处理)

### 4.2 引号

- **字符串**: 优先使用单引号 `'`
- **JSX/HTML**: 使用双引号 `"`
- **无内容**: 空字符串 `''`

### 4.3 括号

```typescript
// if 语句 - 始终使用大括号
if (condition) {
  doSomething()
}

// 函数定义
function createWindow() {
  // ...
}

// 箭头函数 - 省略 return (单表达式)
const formatTime = (date: string) => date.toISOString()
```

---

## 5. Vue 组件规范

### 5.1 Script Setup

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import type { ModItem } from '../stores/project'

// Props
const props = defineProps<{
  editable: boolean
}>()

// Emits
const emit = defineEmits<{
  save: [data: ModItem]
  cancel: []
}>()

// Store
const store = useProjectStore()

// Refs
const inputRef = ref<HTMLInputElement | null>(null)

// Computed
const isValid = computed(() => props.editable && store.currentItem !== null)

// Methods
function handleSave() {
  emit('save', store.currentItem!)
}
</script>
```

### 5.2 Template

```vue
<template>
  <div class="container">
    <!-- 使用 v-if/v-show 条件渲染 -->
    <div v-if="isValid">
      {{ store.currentItem?.name }}
    </div>

    <!-- 事件处理 -->
    <button @click="handleSave">保存</button>

    <!-- 使用 computed -->
    <span :class="itemColor">{{ label }}</span>
  </div>
</template>
```

### 5.3 Style

```vue
<style scoped>
/* 使用 Tailwind 类名 */
.button-primary {
  @apply bg-primary text-white px-4 py-2 rounded-lg;
}
</style>
```

---

## 6. TypeScript 规范

### 6.1 类型定义

```typescript
// ✅ 推荐: 显式类型
const items: ModItem[] = []
function getItem(id: string): ModItem | undefined

// ❌ 避免: any
const items: any = []
function getItem(id: string): any
```

### 6.2 接口定义

```typescript
// ✅ 推荐: 使用 interface
interface ModItem {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'accessory'
}

// ✅ 推荐: 使用 type 联合类型
type ItemType = 'weapon' | 'armor' | 'accessory' | 'general'
```

### 6.3 可选属性

```typescript
interface ModItem {
  name: string
  damage?: number    // 可选属性
  defense?: number
}
```

---

## 7. 状态管理 (Pinia)

### 7.1 Store 定义

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProjectStore = defineStore('project', () => {
  // State
  const items = ref<ModItem[]>([])

  // Getters (Computed)
  const itemCount = computed(() => items.value.length)

  // Actions
  function addItem(item: Omit<ModItem, 'id'>) {
    items.value.push({
      ...item,
      id: crypto.randomUUID()
    })
  }

  return {
    items,
    itemCount,
    addItem
  }
})
```

---

## 8. 代码生成器规范

### 8.1 函数设计

```typescript
// ✅ 推荐: 单一职责函数
function generatePlainCode(item: ModItem, className: string): string
function applySyntaxHighlighting(code: string): string

// ✅ 推荐: 使用 const 声明辅助函数
const getProjectileName = (id: number): string => {
  const map: Record<number, string> = { 1: 'Arrow', 2: 'Fireball' }
  return map[id] || 'Friendly'
}
```

### 8.2 占位符语法高亮

```typescript
// 使用占位符避免 HTML 转义问题
function applySyntaxHighlighting(code: string): string {
  let result = code

  // Step 1: 应用语法高亮，使用占位符
  result = result.replace(/keyword/g, '___KW___keyword___ENDKW___')

  // Step 2: HTML 转义
  result = result.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Step 3: 替换占位符为实际标签
  result = result.replace(/___KW___/g, '<span class="keyword">')
}
```

---

## 9. Git 提交规范

### 9.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 9.2 Type 前缀

| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 样式调整 |
| `refactor` | 代码重构 |
| `build` | 构建相关 |

### 9.3 示例

```
feat(code-generator): 添加配方生成功能

- 添加 AddRecipes() 方法生成
- 支持自定义合成台
- 修复语法高亮问题

Closes #12
```

---

## 10. 注释规范

### 10.1 文件头注释

```typescript
/**
 * Terraria Properties Generator
 * C# 代码生成工具
 * @author Your Name
 * @version 1.4.4
 */
```

### 10.2 函数注释

```typescript
/**
 * 生成 tModLoader 兼容的 C# 代码
 * @param item - 物品数据
 * @returns 带语法高亮的 HTML 字符串
 */
function generateCSharpCode(item: ModItem): string
```

### 10.3 行内注释

```typescript
// 单一语句注释
const maxStack = 999 // 最大堆叠数量
```

---

## 11. 错误处理

```typescript
// ✅ 推荐: 使用 try-catch
try {
  const data = JSON.parse(content)
} catch (e) {
  console.error('Failed to parse:', e)
  return null
}

// ✅ 推荐: 返回 null/undefined 表示失败
function findItem(id: string): ModItem | undefined {
  return items.find(item => item.id === id)
}
```

---

## 12. 性能考虑

- **避免不必要的计算**: 使用 `computed` 缓存
- **避免直接操作 DOM**: 使用 Vue 响应式系统
- **大列表渲染**: 考虑虚拟滚动 (如需要)
- **代码分割**: 使用动态 `import()`
