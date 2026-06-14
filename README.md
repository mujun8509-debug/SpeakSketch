# SpeakSketch - 语音控制绘图工具

SpeakSketch 是一个纯语音控制的结构化绘图工具，用户通过自然语言指令在画布上绘制图形，无需手动操作。

## 🎬 演示视频

<iframe width="800" height="450" src="https://player.bilibili.com/player.html?bvid=BV1LgJK6bE8E&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

## 🎯 项目特点

- **语音驱动**: 完全通过语音指令控制绘图，支持中文和英文自然语言
- **结构化绘制**: 所有图形均为可编辑的 Fabric.js 对象，支持移动、改色、缩放、删除
- **智能解析**: 支持简单图形、复杂对象、复杂场景、空间关系等多种指令类型
- **双语支持**: 支持中文和英文指令解析
- **历史管理**: 完整的撤销/重做/重放功能
- **实时反馈**: 语音识别结果实时显示，执行状态可视化

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vite** | 5.x | 构建工具 |
| **React** | 18.x | 前端框架 |
| **TypeScript** | 5.x | 类型安全 |
| **Fabric.js** | 6.x | Canvas 绘图库 |
| **Zustand** | 4.x | 状态管理 |
| **Web Speech API** | - | 语音识别与合成 |

## 📦 安装与运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 🧩 后端代理说明

仓库新增 `server/` 目录作为最小后端代理骨架，用于安全接入讯飞 ASR 和 Seedream 5.0 图生图风格化能力。当前后端不连接真实讯飞 WebSocket；Seedream 图像风格化是可选后端增强，结构化绘图主流程不依赖该能力。未配置后端 Key 时，系统使用 Mock 模式。

后端本地启动：

```bash
cd server
npm install
npm run dev
```

前端 `.env` 只需要配置后端代理地址：

```env
VITE_ASR_API_URL=http://localhost:3001/api/asr
VITE_IMAGE_API_URL=http://localhost:3001/api/style-image
```

安全说明：
- 讯飞 APPID、APIKey、APISecret 只允许放在后端 `.env` 中
- Seedream API Key 只允许放在后端 `.env` 中
- 不要提交真实 `.env`
- 未配置 `SEEDREAM_API_KEY` 时 `/api/style-image` 使用 Mock 模式
- 本地测试已验证 Mock 与错误兜底路径；真实 Seedream 生成需在 `server/.env` 配置有效 Key 后由使用者自行测试

## 最终提交说明

- [最终提交说明](./docs/final-submission.md)
- [演示脚本](./docs/demo-script.md)
- [测试清单](./docs/test-checklist.md)

## 🎨 支持的指令类型

### 基础图形
- `画一个红色圆形`
- `画一个蓝色矩形`
- `画一个三角形`
- `画一个太阳`
- `画三朵云`
- `画一棵树`
- `写上"人工智能绘图"`

### 复杂对象
- `画一个男人` / `画一个女人` / `画一个学生`
- `画一只猫` / `画一只狗`
- `画一辆红色汽车`
- `画一朵花`
- `画一座山` / `画一条河`
- `画一艘船` / `画一片草地` / `画几只鸟`

### 复杂场景
- `画一个公园，有人、树、花、草地和小鸟`
- `画一个海边，有太阳、云、船、海平线和飞鸟`
- `画一个校园，有教学楼、树、草地和学生`
- `画一个房子，红色屋顶，黄色墙壁`

### 空间关系
- `画一个男人站在树旁边`
- `画一只猫在汽车旁边`
- `画一艘船在河上`
- `画几只鸟在天空中`
- `画一个学生站在教学楼旁边`

### 编辑指令
- `把刚才那个图形改成蓝色`
- `把最大的图形放大一点`
- `删除最左边的图形`
- `把刚才那个图形往右移动一点`

### 系统指令
- `撤销` / `重做`
- `清空画布`
- `导出图片`
- `重放全部`

## 🏗 项目结构

```
src/
├── components/          # UI 组件
│   ├── CanvasBoard.tsx  # 画布组件
│   ├── VoicePanel.tsx   # 语音控制面板
│   ├── ExampleCommands.tsx # 示例指令
│   ├── CommandLog.tsx   # 指令日志
│   ├── ReplayPanel.tsx  # 重放面板
│   ├── Toolbar.tsx      # 工具栏
│   └── ASRSettingsPanel.tsx # ASR 设置面板
├── core/                # 核心逻辑
│   ├── localParser.ts   # 中文指令解析器
│   ├── englishCommandParser.ts # 英文指令解析器
│   ├── bilingualParser.ts # 双语解析统一入口
│   ├── languageNormalizer.ts # 词汇归一化模块
│   ├── relationParser.ts # 空间关系解析
│   ├── commandExecutor.ts # 指令执行器
│   ├── shapeFactory.ts  # 图形工厂
│   ├── historyManager.ts # 历史管理
│   ├── objectVocabulary.ts # 对象词汇库
│   ├── asrService.ts    # ASR 服务层
│   └── commandTypes.ts  # 类型定义
├── hooks/               # React Hooks
│   ├── useSpeechRecognition.ts # 语音识别
│   ├── useSpeechSynthesis.ts   # 语音合成
│   └── useAudioRecorder.ts     # 音频录制
├── store/               # 状态管理
│   └── useAppStore.ts   # Zustand Store
└── utils/               # 工具函数
    ├── id.ts            # ID 生成
    └── logger.ts        # 日志工具
```

## 🎯 演示能力概览

| 功能模块 | 状态 | 说明 |
|----------|------|------|
| 基础绘图 | 核心演示路径已完成 | 圆形、矩形、三角形、直线、文本 |
| 组合图形 | 基础功能经手动测试通过 | 太阳、云、树、房子 |
| 复杂对象 | 基础功能经手动测试通过 | 人物、猫、狗、汽车、花、山、河、船、草地、鸟 |
| 复杂场景 | 基础功能经手动测试通过 | 公园、海边、校园、风景 |
| 空间关系 | 基础功能经手动测试通过 | 旁边、左边、右边、上方、下方、天空、地面、河上 |
| 编辑操作 | 基础功能经手动测试通过 | 移动、改色、缩放、删除 |
| 历史管理 | 基础功能经手动测试通过 | 撤销、重做、重放 |
| 语音识别 | 云端能力为可选接口预留 | 默认使用 Web Speech API；配置后端后可使用云端 ASR |
| AI 风格化 | 云端能力为可选接口预留 | 结构化绘图主流程不依赖该能力；配置 `VITE_IMAGE_API_URL` 后调用后端代理，后端未配置 `SEEDREAM_API_KEY` 时使用 Mock 模式 |

## 📝 开发日志

### 第一轮：基础架构
- 创建 Vite + React + TypeScript + Fabric.js + Zustand 项目
- 实现基础绘图指令（圆形、矩形、文本、直线）
- 实现语音识别和语音反馈
- 实现指令日志显示

### 第二轮：功能扩展
- 新增三角形、太阳、云、树、房子等组合图形
- 支持位置表达（左上角、右下角等）
- 支持上下文引用（刚才那个、最大的、最左边的）
- 实现编辑指令（改色、移动、放大、删除）

### 第三轮：稳定性修复
- 修复语音识别结束后不自动执行的问题
- 修复组合图形改色无效问题
- 让编辑操作进入历史记录
- 修复 replay 重放逻辑
- 优化日志显示

### 第四轮：复杂对象支持
- 新增人物、猫、狗、汽车、花、山、河、船、草地、鸟
- 支持复杂场景绘制（公园、海边、校园）
- 新增对象词汇库 objectVocabulary.ts

### 第五轮：空间关系解析
- 新增 relationParser.ts 空间关系解析器
- 支持"旁边"、"左边"、"右边"、"上方"、"下方"、"天空中"、"河上"等关系
- 调整解析顺序，空间关系优先识别
- 增强日志显示空间关系类型

## 🔗 相关链接

- **GitHub**: https://github.com/mujun8509-debug/SpeakSketch
- **技术栈**: Vite + React + TypeScript + Fabric.js + Zustand

## ⚠️ 注意事项

1. **语音识别**: 需要使用 Chrome 浏览器，Web Speech API 在不同浏览器中兼容性不同
2. **简笔画风格**: 复杂对象采用简笔画风格，可编辑但非写实

## 🎨 AI 风格化成品

本项目提供可选 AI 图像风格化后端代理能力，可在 `server/.env` 配置 `SEEDREAM_API_KEY` 后调用 Seedream 5.0 图生图接口，将语音绘制的结构化草图作为输入图片转化为风格化成品图。结构化绘图主流程不依赖该能力；未配置后端 Key 时，系统使用 Mock 模式。本地测试已验证 Mock 与错误兜底路径，真实生成需使用者自行配置有效 Key 后测试，且可能产生 API 费用。

### 功能定位

AI 风格化是后处理增强功能，不替代结构化绘图：

- 用户先完成结构化绘图，再主动触发 AI 风格化
- 原始 Fabric 画布不被覆盖，可继续编辑
- 保持撤销、重做、重放等基础流程不被替代

### 风格选择

| 风格 | 说明 |
|------|------|
| 动漫化 | 日式动漫插画风格 |
| 电影化 | 电影级视觉效果 |
| 赛博朋克 | 未来科技城市 |
| 水彩画 | 柔和水彩艺术 |
| 油画 | 古典油画质感 |
| 像素风 | 复古像素游戏风 |
| 国风插画 | 中国传统艺术 |
| 儿童绘本 | 温馨童趣插画 |

### 氛围选择

清新校园 | 热血冒险 | 治愈系 | 未来都市 | 奇幻森林 | 赛博朋克夜景 | 温暖日落 | 黑色电影 | 科幻未来 | 梦幻 | 神秘 | 高对比 | 柔和

### 后端接口约定

```
POST VITE_IMAGE_API_URL
Content-Type: application/json

请求体:
{
  "imageDataUrl": "data:image/png;base64,...",
  "style": "动漫化",
  "mood": "清新校园",
  "prompt": "..."
}

未配置 `SEEDREAM_API_KEY` 时返回:
{
  "imageDataUrl": "data:image/png;base64,...",
  "isMock": true,
  "provider": "mock",
  "message": "SEEDREAM_API_KEY is not configured. Using mock mode."
}

配置有效 `SEEDREAM_API_KEY` 且生成成功时返回:
{
  "imageDataUrl": "data:image/png;base64,...",
  "isMock": false,
  "provider": "seedream"
}

生成失败时返回受控错误:
{
  "error": "Seedream image generation failed",
  "isMock": false
}
```

### 配置方法

前端 `.env` 只配置后端代理地址：

```
VITE_IMAGE_API_URL=http://localhost:3001/api/style-image
```

真实 Seedream 图像生成只在后端启用，需要在 `server/.env` 中配置：

```env
SEEDREAM_API_KEY=你的有效后端密钥
SEEDREAM_API_URL=
SEEDREAM_MODEL=seedream-5.0
```

不要把 `SEEDREAM_API_KEY` 写入前端 `.env`，也不要提交真实 `.env`。

### Mock 模式

未配置 `VITE_IMAGE_API_URL` 时，前端使用本地 Mock；配置了后端 URL 但 `server/.env` 未设置有效 `SEEDREAM_API_KEY` 时，`/api/style-image` 返回 Mock 结果。若真实 provider 调用失败，后端返回受控错误，前端结构化绘图主流程和原始 Fabric 画布不受影响。

### 密钥安全

- 前端不保存 Seedream API Key
- 前端不直接调用 Seedream API
- 前端只通过 `VITE_IMAGE_API_URL` 调用后端接口
- 后端从 `server/.env` 读取 `SEEDREAM_API_KEY`
- 未配置 `SEEDREAM_API_KEY` 时，后端返回 Mock 结果

## 🎤 讯飞 ASR 接入说明

本项目预留讯飞实时语音听写的后端代理接口作为可选语音识别方案。当前 `server/` 骨架先返回 Mock 结果，不连接真实讯飞 WebSocket。

### 接入方式

- **讯飞实时语音听写**: 后续接入后用于短语音指令识别
- **前端不保存密钥**: 讯飞 APPID、APIKey、APISecret 仅在后端使用，前端不接触
- **需要后端代理**: 前端通过自有后端接口代理讯飞 WebSocket 连接
- **前端调用方式**: 通过环境变量 `VITE_ASR_API_URL` 调用后端接口

### 后端接口约定

```
POST VITE_ASR_API_URL
Content-Type: multipart/form-data

请求参数:
- audio: 音频文件 (WebM/Opus 格式)
- languageMode: 语言模式 ("auto" | "zh" | "en")

返回格式:
{
  "text": "画一个红色圆形",
  "language": "zh",
  "confidence": 0.95
}
```

### 配置方法

在项目根目录创建 `.env` 文件：

```
VITE_ASR_API_URL=http://localhost:3001/api/asr
```

### 识别模式

- **浏览器识别**: 使用 Web Speech API，无需配置，兼容性依赖浏览器
- **云端识别**: 通过后端代理接口调用；当前骨架返回 Mock，真实讯飞将在后续 PR 接入
- **自动模式**: 优先使用云端识别，失败时回退到浏览器识别

### 语言模式

- **自动**: 自动检测语言（推荐）
- **中文**: 强制中文识别
- **English**: 强制英文识别

### 兜底方案

未配置云端 ASR 时：
- 浏览器识别仍可正常使用
- 调试输入框始终可用
- 不会影响项目正常运行

## 🚀 未来规划

- [ ] 更多空间关系支持（嵌套关系、精确坐标）
- [ ] 图层管理功能
- [ ] 更多复杂对象类型
- [ ] 手绘模式支持
- [ ] 导出 SVG 格式

## 💡 原创功能说明

以下功能模块为本项目原创设计和实现：

### 核心解析模块

- **localParser.ts**: 中文自然语言指令解析器，将中文指令转换为结构化的绘图动作序列
- **englishCommandParser.ts**: 英文自然语言指令解析器，支持英文绘图指令
- **bilingualParser.ts**: 双语解析统一入口，自动检测语言并调用对应解析器
- **languageNormalizer.ts**: 词汇归一化模块，维护中英文颜色、对象、位置、动作的映射关系
- **objectVocabulary.ts**: 对象词汇映射库，维护中文词汇到绘图动作类型的语义映射关系
- **relationParser.ts**: 空间关系模板解析器，识别并解析"旁边"、"左边"、"天空中"、"东方"、"远处"等空间关系表达

### 绘图执行模块

- **DrawCommand 协议**: 结构化绘图动作协议设计，定义 action 类型、payload 结构和执行流程
- **shapeFactory.ts**: 复杂对象组合绘制工厂，实现人物、猫、狗、汽车等简笔画风格的组合图形
- **commandExecutor.ts**: 指令执行器，协调解析结果与绘图动作的执行流程

### 历史管理模块

- **historyManager.ts**: 撤销、重做、重放功能实现，支持 add/remove/clear/modify 四种历史记录类型

### 演示模块

- **Demo 模式**: 一键演示功能，自动执行预设指令序列展示完整功能流程
- **演示路径**: 针对演示场景设计的指令序列和 UI 布局

## 🤖 AI 工具辅助说明

本项目开发过程中使用了 AI 工具辅助：

- **设计阶段**: 使用 GPT 和 Trae AI 工具辅助进行功能设计讨论和技术方案探讨
- **代码阶段**: AI 工具提供代码建议、错误排查和最佳实践参考
- **文档阶段**: AI 工具辅助整理 README 文档和代码注释

**声明**: AI 工具仅作为辅助手段，项目的整体架构设计、功能集成、代码调试、测试验证、Git 提交和最终交付均由开发者本人完成。项目核心逻辑（指令解析、绘图执行、历史管理等）均为原创实现。

## 📅 开发周期说明

本项目在以下时间周期内持续开发：

- **开始时间**: 2026 年 6 月 12 日 00:00
- **结束时间**: 2026 年 6 月 14 日 23:59
- **开发模式**: 持续交付，遵循增量开发原则

开发过程中采用模块化增量开发思路。当前仓库已提交基础可运行版本，后续优化阶段通过独立分支和 Pull Request 持续完善文档、语音识别、空间关系、AI 风格化和演示材料。

## 📋 合规认证

本项目已整理以下合规检查信息：

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 原创性声明 | ✅ 通过 | 核心解析逻辑均为原创实现 |
| AI辅助说明 | ✅ 通过 | 明确说明AI工具的使用范围 |
| 开源许可 | 已说明 | License: 未指定 |
| 技术栈说明 | ✅ 通过 | 主要依赖清晰标注 |
| 功能完整性 | 已说明 | 核心演示路径已完成，基础功能经手动测试通过 |
| 云端能力 | 已说明 | 云端能力为可选接口预留，未配置后端时使用 Mock 或兜底模式 |
| 代码可运行 | ✅ 通过 | npm run build 通过 |
| Git历史 | ✅ 通过 | 多个独立PR记录 |

---

**开发时间**: 2026年6月12日-14日
**最后更新**: 2026-06-13
