# INDEX — 專案總覽與速查

> ⚠️ 本文件為 trace 產出，適用於 `.trace/TRACE_META.md` 記錄的 base commit。內容庫持續成長中，實際技能數可能已與本文件不同，請以 repo 現況為準。

## 一段話總結

**MengTo/Skills** 是設計師與開發者（builder）用的 **AgentSkills 內容庫**：一組可攜式的 Markdown 技能檔案（`SKILL.md` + 可選的 `REFERENCES.md`/`ARTICLE.md`/`assets/`/`scripts/`），提供給 Codex、Claude Code、Cursor 等 AI coding agent 載入使用，目的是把「重複出現的高品質設計判斷、prompt、工作流程」變成可版控、可重用的檔案，取代每次都要重新輸入同樣提示的低效率。作者為 Meng To（Design+Code 創辦人、Aura Build 製作者）。

## 技術棧總覽

| 類別 | 技術/格式 | 用途 |
|------|----------|------|
| 內容格式 | Markdown | 所有技能的主要載體（`SKILL.md` 必要） |
| Metadata | YAML frontmatter | `name` + `description`，供 agent 語意比對選擇技能 |
| 輔助腳本（少數技能） | Python、Swift、Bash、PowerShell、Node.js (`.mjs`) | 截圖、TTS、頁面拼接等自動化任務 |
| 版控 | Git / GitHub | 唯一的基礎設施；無 CI/CD、無套件管理器 |
| 目標 agent | Codex、Claude Code、Cursor 及其他 coding agent | 消費本 repo 內容的執行端 |

## 關鍵指令速查

本 repo 無 build/test/run/deploy 步驟（純內容庫）。唯一的「操作」：

```bash
git clone https://github.com/pichiu/mengto-skills.git   # 或對應的來源 repo
# 新增技能：在 agent-skills/<category>/<skill-name>/ 建立 SKILL.md
```

少數技能內含輔助腳本，各自有獨立執行方式，見 `.trace/DEV_GUIDE.md`「相依性管理」章節。

## 文件地圖

| 文件 | 內容 |
|------|------|
| [`INDEX.md`](./INDEX.md) | 本文件——總覽與速查 |
| [`CODEBASE_MAP.md`](./CODEBASE_MAP.md) | 目錄地圖、「我想改 X 要看哪裡」速查表、模組依賴圖 |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 內容庫架構：技能發現/載入機制、分類邊界、設計決策 |
| [`SKILL_TAXONOMY.md`](./SKILL_TAXONOMY.md) | 技能分類體系（置換原 DATA_MODEL.md）：entity 關聯、frontmatter schema、生命週期 |
| [`SKILL_CATALOG.md`](./SKILL_CATALOG.md) | 完整技能目錄（置換原 API_SURFACE.md）：全部技能的觸發時機與用途 |
| [`DEV_GUIDE.md`](./DEV_GUIDE.md) | 貢獻新技能的上手指南 |
| [`DISCOVERY_LOG.md`](./DISCOVERY_LOG.md) | 探索紀錄、文件落差、待解問題 |
| [`TRACE_META.md`](./TRACE_META.md) | Trace metadata，供未來增量更新使用 |

## 專案專屬術語表

| 術語 | 定義 |
|------|------|
| **Skill / 技能** | `agent-skills/<category>/<skill-name>/` 下的一個資料夾，代表一個可被 agent 載入的獨立能力單元，核心是 `SKILL.md` |
| **Frontmatter** | `SKILL.md` 開頭以 `---` 包夾的 YAML 區塊，含 `name` 與 `description` 兩個必要欄位 |
| **資料夾契約（Folder Contract）** | `CLAUDE.md` 定義的技能資料夾結構規範：`SKILL.md` 必要，`REFERENCES.md`/`ARTICLE.md`/`assets/`/`scripts/` 可選 |
| **語意路由（Semantic Routing）** | Agent 依 `description` frontmatter 與使用者意圖做語意比對，決定載入哪個技能的機制；無中央 index，屬隱式路由 |
| **Flagship workflow** | `README.md` 列出的代表性技能組合（video-to-superprompt → html-to-interaction-prompts → stitched-full-page-capture → daily-ui-inspiration-capture） |
| **AgentSkills** | 本 repo 採用的通用格式命名，泛指「給 AI agent 使用的可攜式技能檔案」這一類產物，非單一廠商專屬規格 |
