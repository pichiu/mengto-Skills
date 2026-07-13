# Web Findings 線上搜尋摘要

專案規模小（151 檔案），依 Stage 1.5 準則採輕量搜尋（2 次），聚焦確認作者身份、專案定位與外部關注度，而非深挖技術規格。

## 1. 專案身份與作者

- **來源**：[GitHub - MengTo/Skills](https://github.com/MengTo/Skills)
- **維護者**：Meng To — Design+Code 創辦人、Aura Build 製作者
- **要點**：這是 Meng To 個人開源的 Agent Skills 函式庫，公開時聲稱「75 skills for Codex, Claude Code, Cursor」，聚焦 web design、landing page、motion、WebGL、UI 製作與素材管理
- ⚠️ 未驗證：公開發布時的技能數（75）與目前 repo 內實際資料夾數（約 99）不一致，推測是後續持續新增；不影響文件正確性，但代表這是**持續成長中的內容庫**，非一次性快照

## 2. 發布 Announcement

- **來源**：[Meng To on X](https://x.com/MengTo/status/2074511787073106194)
- **要點**：作者在 X（Twitter）上宣布開源此技能庫，列出幾個代表性技能（Video to Super Prompt、HTML to Interaction Prompts），呼應 `README.md` 開頭列出的「flagship web-design workflow」

## 3. 生態系關聯

- **來源**：[Aura Build](https://www.aura.build)、[Design+Code](https://designcode.io)
- **要點**：此技能庫與作者的商業產品 Aura Build（AI 網頁生成工具）、Design+Code（教學平台）為同一體系；`README.md` 中提到的 "Aura Build super prompt workflow" 即對應此生態
- 對讀者的意涵：部分技能（如 `html-to-interaction-prompts`）明確以 Aura Build 產出的 HTML 頁面為輸入情境，理解此脈絡有助於掌握技能設計初衷

## 4. 未深入搜尋的項目（因規模判定不需要）

- 各別第三方函式庫（GSAP、Three.js、Tailwind CSS 等）的官方文件——這些屬於個別 `SKILL.md`/`REFERENCES.md` 內部已附連結的範疇，非本次 repo 層級 trace 的重點
- Discord/Slack 社群頻道——未發現公開連結
- Issue/Discussion 中的 architecture 討論——repo 過小，未見相關 pinned 討論
