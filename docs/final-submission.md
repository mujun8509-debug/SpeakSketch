# SpeakSketch 最终提交说明

## 项目概览

| 项目 | 说明 |
|------|------|
| 项目名称 | SpeakSketch |
| 项目定位 | 纯语音控制的结构化绘图工具 |

SpeakSketch 通过语音或文本指令驱动画布绘制，将自然语言转换为可编辑、可撤销、可重放的 Fabric.js 结构化对象。项目默认不要求配置真实云端 provider；未配置后端真实能力时，浏览器识别、调试输入和 Mock 模式仍可支撑核心演示路径。

## 核心链路

```text
语音输入
→ ASR / 浏览器识别
→ 中英文指令解析
→ DrawCommand
→ Fabric.js 结构化绘图
→ 撤销 / 重做 / 重放
→ 可选 AI 风格化
```

## 已完成功能

- 中文语音 / 文本指令
- 英文指令解析
- 基础图形
- 复杂对象
- 空间关系
- Demo 模式
- 撤销 / 重做 / 重放
- PNG 导出
- 讯飞 ASR 后端 provider 可选接入
- Seedream 5.0 图生图后端 provider 可选接入
- 后端代理骨架与 Mock 兜底

## 可选后端

后端位于 `server/` 目录，当前提供最小 Express 代理骨架：

- `GET /api/health`
- `POST /api/asr`
- `POST /api/style-image`

`/api/asr` 已支持可选讯飞实时语音听写后端 provider：配置有效 `XUNFEI_APP_ID`、`XUNFEI_API_KEY`、`XUNFEI_API_SECRET` 后由后端代理连接讯飞 WebSocket；未配置时返回 Mock 结果。`/api/style-image` 已支持可选 Seedream 5.0 图生图 provider：配置有效 `SEEDREAM_API_KEY` 时可由后端把当前画布图片作为输入传给 Seedream；未配置时返回 Mock 结果，生成失败时返回受控错误。默认未配置真实 provider 时，前端使用浏览器识别、调试输入或 Mock 模式保证基础流程可用。

## 安全说明

- 前端不保存任何 API Key
- 前端不保存或传递 `SEEDREAM_API_KEY`
- 真实密钥只允许放在 `server/.env`
- `.env` 不提交
- 前端 `.env` 只配置后端代理 URL

## 已知限制

- 真实讯飞 ASR 需要在 `server/.env` 配置有效讯飞密钥；未配置时使用 Mock 或浏览器识别兜底
- Seedream 图像风格化是可选后端增强，不影响结构化绘图主流程
- 真实图像生成需要在 `server/.env` 配置有效 `SEEDREAM_API_KEY`，并可能产生费用
- 当前本地测试已验证 Mock 和错误兜底路径；真实生成需使用者配置有效 Key 后测试
- 浏览器语音识别兼容性取决于浏览器，推荐使用 Chrome

## 运行方式

### 前端启动

```bash
npm install
npm run dev
```

前端默认访问：

```text
http://127.0.0.1:5173/
```

### 后端启动

```bash
cd server
npm install
npm run dev
```

后端默认访问：

```text
http://localhost:3001
```

### 前端可选环境变量

```env
VITE_ASR_API_URL=http://localhost:3001/api/asr
VITE_IMAGE_API_URL=http://localhost:3001/api/style-image
```

## 测试结果

| 测试项 | 结果 |
|--------|------|
| 前端 `npm run build` | 通过 |
| 前端 `npm run dev` | 通过 |
| 后端 `npm install` | 通过 |
| 后端 `npm run dev` | 通过 |
| `GET /api/health` | 通过 |
| `POST /api/asr` mock | 通过 |
| Xunfei ASR 后端 provider | 需配置有效讯飞密钥后测试；前端不保存任何讯飞密钥 |
| `POST /api/style-image` mock | 通过 |
| `/api/style-image` 错误兜底 | 通过 |
| Seedream 真实图生图风格化 | 需配置有效 `SEEDREAM_API_KEY` 后测试，当前不声称已完整验证 |

## 推荐评审路径

1. 启动前端并打开页面。
2. 点击一键演示，观察结构化绘图流程。
3. 使用调试输入测试中文、英文和空间关系指令。
4. 测试撤销、重做、重放和 PNG 导出。
5. 启动后端并访问 `/api/health`。
6. 查看 ASR 与 AI 风格化区域，确认未配置真实 provider 时仍有兜底路径。
