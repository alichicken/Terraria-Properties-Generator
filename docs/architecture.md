# Terraria Properties Generator - 架构设计

## 1. 项目概述

**项目名称**: Terraria Properties Generator (The Ethereal Workbench)
**版本**: 1.4.4
**技术栈**: Electron 33.x + Vue 3.5.x + TypeScript + Tailwind CSS 3.x

**核心功能**: 用于创建 Terraria tModLoader 模组物品的桌面工具，可生成 tModLoader 兼容的 C# 代码。

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   窗口管理   │  │   菜单系统   │  │   IPC 处理器        │  │
│  │  - 创建窗口  │  │  - 文件菜单  │  │  - 数据存取        │  │
│  │  - 窗口事件  │  │  - 编辑菜单  │  │  - 文件读写        │  │
│  │  - 渲染加载  │  │  - 生成菜单  │  │  - 图片选择        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                      IPC 通信
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Electron Renderer Process                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │                      Vue 3 应用                          ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   ││
│  │  │  Views       │  │  Components  │  │   Stores     │   ││
│  │  │  - 工作区    │  │  - UI 组件   │  │  - Pinia    │   ││
│  │  │  - 物品编辑器│  │              │  │  - 项目状态  │   ││
│  │  │  - 设置页   │  │              │  │              │   ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘   ││
│  │  ┌──────────────┐  ┌──────────────┐                    ││
│  │  │   Utils      │  │    i18n      │                    ││
│  │  │  - 代码生成  │  │  - vue-i18n  │                    ││
│  │  │  - 工具函数  │  │              │                    ││
│  │  └──────────────┘  └──────────────┘                    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

```
Terraria_Properties_Generator/
├── src/
│   ├── main/                  # Electron 主进程
│   │   └── index.ts           # 应用入口、窗口管理、IPC处理
│   ├── preload/               # 预加载脚本
│   │   ├── preload.ts         # TypeScript 源码
│   │   └── preload.js         # 编译后文件
│   └── renderer/              # Vue 渲染进程
│       ├── main.ts            # Vue 应用入口
│       ├── App.vue            # 根组件
│       ├── style.css          # 全局样式 (Tailwind)
│       ├── index.html         # HTML 模板
│       ├── electron.d.ts      # 类型声明
│       ├── views/             # 页面视图
│       │   ├── WorkspaceView.vue     # 工作区/仪表盘
│       │   ├── ItemEditorView.vue    # 物品编辑器
│       │   └── SettingsView.vue      # 设置页
│       ├── stores/            # Pinia 状态管理
│       │   └── project.ts     # 项目数据 Store
│       ├── utils/             # 工具函数
│       │   └── codeGenerator.ts # C# 代码生成器
│       └── i18n/              # 国际化配置
├── resources/                 # 应用资源 (图标等)
├── dist/                      # 构建输出
├── stitch/                   # UI 设计参考
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 配置
├── tailwind.config.js         # Tailwind 配置
└── .gitignore                 # Git 忽略配置
```

---

## 4. 核心模块

### 4.1 主进程 (Main Process)

**文件**: `src/main/index.ts`

**职责**:
- 应用生命周期管理 (启动、退出)
- 窗口创建与管理
- 原生菜单栏构建
- IPC 通信处理
- 文件系统操作
- 应用配置持久化

**关键函数**:
| 函数 | 描述 |
|------|------|
| `createWindow()` | 创建主 BrowserWindow |
| `loadStore()` / `saveStore()` | 配置持久化 |
| `handleOpenProject()` | 打开项目文件对话框 |
| IPC handlers | 处理渲染进程请求 |

### 4.2 预加载脚本 (Preload)

**文件**: `src/preload/preload.ts`

**职责**:
- 暴露安全的 API 给渲染进程
- 隔离主进程与渲染进程

**暴露的 API**:
```typescript
window.electronAPI = {
  getStoreValue: (key: string) => Promise<any>,
  setStoreValue: (key: string, value: any) => Promise<boolean>,
  saveProject: (data: any) => Promise<string | null>,
  openProject: () => Promise<{ path: string, data: any } | null>,
  selectImage: () => Promise<string | null>,
  openFolder: (path: string) => Promise<void>
}
```

### 4.3 状态管理 (Pinia Store)

**文件**: `src/renderer/stores/project.ts`

**职责**:
- 项目数据管理 (ModProject)
- 物品数据管理 (ModItem)
- CRUD 操作

**核心数据结构**:
```typescript
interface ModItem {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'accessory' | 'general' | 'material' | 'consumable'
  rarity: string
  // ... 其他属性
}

interface ModProject {
  id: string
  name: string
  version: string
  items: ModItem[]
  // ... 统计信息
}
```

### 4.4 代码生成器

**文件**: `src/renderer/utils/codeGenerator.ts`

**职责**:
- 将 ModItem 数据转换为 tModLoader C# 代码
- 语法高亮处理

**核心函数**:
| 函数 | 描述 |
|------|------|
| `generateCSharpCode(item)` | 生成完整 C# 代码 |
| `generatePlainCode()` | 生成纯代码字符串 |
| `applySyntaxHighlighting()` | HTML 语法高亮 |
| `generateRecipe()` | 配方生成 |

---

## 5. 数据流

```
用户输入 → Vue 组件 → Pinia Store → 代码生成器 → 语法高亮 → 预览显示
                ↓
         Electron IPC → 主进程 → 文件系统 (保存)
```

---

## 6. 构建流程

```
开发模式:
  npm run dev:main  → 编译 TypeScript → 启动 Electron
  npm run dev:renderer → Vite 热更新开发服务器

生产构建:
  npm run build
    ├─ build:renderer (Vite)
    └─ build:main (TypeScript)

打包发布:
  npm run dist (electron-builder)
```

---

## 7. 依赖关系

```
dependencies:
  ├── electron-store      # 配置持久化
  ├── vue                 # UI 框架
  ├── vue-i18n            # 国际化
  └── pinia               # 状态管理

devDependencies:
  ├── electron            # 桌面应用框架
  ├── electron-builder    # 打包工具
  ├── vite                # 前端构建工具
  ├── typescript          # 语言
  ├── tailwindcss         # CSS 框架
  └── vue-tsc             # Vue 类型检查
```
