# Entry Points（置換版：技能發現入口）

⚠️ 本 repo 無「程式啟動」（無 main function / server bootstrap）。取而代之，「entry point」的等價概念是：**agent 如何找到並開始使用某個技能**。共有三種入口路徑。

## 1. 明文引用入口（Claude Code / CLAUDE.md）

`CLAUDE.md:20-24`（本 repo 根目錄）本身即示範此模式：

```
## Suggested workflow (for Claude)
1) Identify the most specific skill folder.
2) Update `SKILL.md` first.
```

使用此技能庫的下游專案，慣例是在自己的 `CLAUDE.md` 中明文引用某個 `SKILL.md` 路徑（例如 `agent-skills/ui/frontend-design/SKILL.md`），Claude Code 啟動時讀取該路徑作為 working context。這是**最明確**的入口——路徑寫死，無需語意搜尋。

## 2. Frontmatter 語意比對入口（Codex / 一般 agent）

每個 `SKILL.md` 開頭都有 YAML frontmatter（95/95 個檔案皆有，見 `agent-skills/ui/full-output-enforcement/SKILL.md:1-4` 為例）：

```yaml
---
name: full-output-enforcement
description: Overrides default LLM truncation behavior. Enforces complete code generation...
---
```

`description` 欄位刻意寫成「使用時機」的形式（常見句型："Use when the user asks for X, Y, Z"），例如：
- `agent-skills/codex/elevenlabs-tts/SKILL.md:3`："Use when the user asks for ElevenLabs, text-to-speech, TTS, narration..."
- `agent-skills/media/unsplash-asset-images/SKILL.md:3`："Use when you need to pick high-quality Unsplash images..."

Agent（尤其 Codex）在執行任務前，會將使用者請求與所有可及技能的 `description` 做語意比對，決定載入哪一個。這是**隱式路由**——沒有中央 index 檔案列出所有技能供程式化查詢（`README.md` 只手動列出少數 flagship 技能），比對邏輯完全依賴 agent 自身的語言理解能力。

## 3. 分類瀏覽入口（人類使用者）

`README.md:9-20` 列出 4 個「flagship」技能作為新手起點；`agent-skills/web-design/WEB-DESIGN-SKILLS.md` 則是 `web-design/` 子集的清單式索引，供人類手動瀏覽選擇。這類文件是**輔助入口**，非 agent 執行時的必要路徑。

## Initialization（技能載入後的準備動作）

技能本身無「初始化」步驟，但部分技能要求載入前先確認環境準備（等價於 DI container / connection pool 的角色）：
- `agent-skills/codex/netlify-deploy/SKILL.md:14-18` 要求先確認 Netlify CLI 已認證（`npx netlify status`）
- `agent-skills/codex/elevenlabs-tts/SKILL.md:9` 要求從環境變數或 `.env` 讀取 `ELEVENLABS_API_KEY`
- `agent-skills/codex/screenshot/scripts/ensure_macos_permissions.sh` 是一個獨立腳本，用於在執行截圖技能前確保 macOS 權限就緒

這些屬於**技能層級**的前置檢查，而非整個 repo 層級的啟動流程。
