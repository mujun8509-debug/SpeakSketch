# SpeakSketch Compliance Report

## Project Information

| Item | Value |
|------|-------|
| Project Name | SpeakSketch |
| Repository | https://github.com/mujun8509-debug/SpeakSketch |
| Development Period | 2026-06-12 to 2026-06-14 |
| License | 未指定（repository does not contain a LICENSE file） |

## Originality Statement

All core logic in this project is original implementation:

### Core Parsing Modules
- **localParser.ts**: Chinese natural language instruction parser
- **englishCommandParser.ts**: English natural language instruction parser
- **bilingualParser.ts**: Bilingual parsing unified entry point
- **languageNormalizer.ts**: Word normalization module
- **relationParser.ts**: Spatial relationship template parser

### Drawing Execution Modules
- **DrawCommand Protocol**: Structured drawing action protocol
- **shapeFactory.ts**: Complex object composite drawing factory
- **commandExecutor.ts**: Instruction executor

### History Management Modules
- **historyManager.ts**: Undo/redo/replay functionality

## AI Tools Usage Disclosure

AI tools used during development:

| Stage | Tool | Purpose |
|-------|------|---------|
| Design | GPT, Trae AI | Feature design and technical discussion |
| Code | AI assistants | Code suggestions, error fixing, best practices |
| Documentation | AI assistants | README and code comments |

**Statement**: AI tools were used only as assistance. The core architecture design, function integration, code debugging, testing, Git commits, and delivery checks were completed by the developer personally. Core logic such as instruction parsing, drawing execution, and history management are original implementations.

## Technical Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vite | 5.x | Build tool |
| React | 18.x | Frontend framework |
| TypeScript | 5.x | Type safety |
| Fabric.js | 6.x | Canvas drawing library |
| Zustand | 4.x | State management |
| Web Speech API | - | Speech recognition and synthesis |

## Dependencies

All dependencies are from the official npm registry. This documentation-only update does not add third-party dependencies.

## External APIs and Optional Backends

项目默认状态下不直接调用外部大模型或云端服务。云端 ASR 与 Seedream 图生图风格化均为可选后端代理能力，前端不保存任何 API Key。未配置后端接口时，系统通过浏览器 Web Speech API、调试输入框或 Mock 模式保证基础功能可用。

| Capability | Configuration | Notes |
|------------|---------------|-------|
| Browser speech recognition | Built-in Web Speech API | Default browser-side fallback |
| Cloud ASR proxy | `VITE_ASR_API_URL` | Optional backend endpoint for Xunfei ASR proxy |
| Seedream image-to-image proxy | `VITE_IMAGE_API_URL` | Optional backend endpoint for Seedream image stylization |

Security notes:
- Xunfei APPID, APIKey, and APISecret must remain on the backend.
- Seedream API Key must remain on the backend.
- The frontend only calls configured backend URLs and does not store provider credentials.

## Build Verification

```bash
npm install
npm run build
```

Current verification status: core demo path is available, and the production build passes in the current repository state.

## Pull Request History

| PR | Title |
|----|-------|
| PR #1 | feat: add bilingual command parser |
| PR #2 | docs: add design document and demo script |
| PR #3 | feat: enhance spatial relation parsing with 8-direction and distance relations |
| PR #4 | docs: add compliance report documentation |
| PR #5 | demo stability polish |
| PR #6 | feat: add Xunfei ASR integration layer |
| PR #7 | feat: add GPT image style generation |
| PR #8 | docs: fix README delivery wording |

## Development Methodology

- Modular incremental development approach
- Multiple independent Pull Request records
- Core demo path completed
- Basic functionality manually tested
- Cloud capabilities are optional backend proxy interfaces
- When backend URLs are not configured, Mock or fallback modes keep the base experience usable

---

**Report Generated**: 2026-06-13
**Developer**: mujun8509-debug
