import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './style.css'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      app: {
        title: 'The Ethereal Workbench',
        version: 'v1.4.4-stable'
      },
      nav: {
        workspace: '工作区',
        items: '物品',
        crafting: '合成',
        sprites: '精灵',
        settings: '设置'
      },
      actions: {
        newAsset: '新建资产',
        saveTemplate: '保存模板',
        exportToMod: '导出到模组',
        compile: '编译模组',
        openOutput: '打开输出',
        manageSprites: '管理精灵',
        exportTmod: '导出 .tmod'
      },
      workspace: {
        title: '项目工作区',
        projectName: '项目名称',
        lastModified: '最后修改',
        projectProgress: '项目进度',
        readyToCompile: '准备编译',
        recentActivity: '最近活动',
        viewAllAssets: '查看全部资产',
        assetName: '资产名称',
        type: '类型',
        lastEdit: '最后编辑',
        actions: '操作'
      },
      itemEditor: {
        general: '常规',
        weapon: '武器',
        armor: '护甲',
        accessory: '饰品',
        itemProperties: '物品属性',
        itemName: '物品名称',
        defense: '防御力',
        armorSlot: '装备槽位',
        head: '头部',
        body: '身体',
        legs: '腿部',
        rarity: '稀有度',
        advancedProperties: '高级属性',
        expanded: '已展开',
        moveSpeed: '移动速度 (%)',
        damage: '伤害 (%)',
        crit: '暴击率 (%)',
        setBonusDescription: '套装奖励描述',
        spritePreview: '精灵预览',
        modSource: '模组源码 (C#)',
        copyToClipboard: '复制到剪贴板'
      },
      stats: {
        items: '物品',
        recipes: '配方',
        armorSets: '护甲套装',
        projectiles: '投射物'
      },
      status: {
        ready: '准备就绪',
        lastSaved: '最后保存',
        workspaceSynced: '工作区已同步',
        utf8: 'UTF-8',
        csharp: 'C# 10.0'
      },
      itemTypes: {
        weapon: '武器',
        armor: '护甲',
        accessory: '饰品',
        consumable: '消耗品'
      },
      rarity: {
        lime: '青绿',
        yellow: '黄色',
        cyan: '青色',
        red: '红色',
        pink: '粉色',
        purple: '紫色',
        white: '白色',
        grey: '灰色'
      }
    }
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(i18n)
app.mount('#app')
