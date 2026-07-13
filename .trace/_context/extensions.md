# Extension Points（如何新增一個技能而不動到既有內容）

## 資料夾契約即 Extension 機制

`CLAUDE.md:12-20`（根目錄）定義了唯一的擴充介面——**資料夾契約**：

```
agent-skills/<category>/<skill-name>/
  SKILL.md            # required (frontmatter + steps)
  REFERENCES.md       # optional (links only)
  ARTICLE.md          # optional (long-form)
  assets/             # optional
  scripts/            # optional
```

新增一個技能 = 在對應分類（`codex/` / `media/` / `ui/` / `web-design/`）下建立一個新資料夾，寫一個符合 frontmatter 規範的 `SKILL.md`。**不需要修改任何既有檔案、不需要註冊到中央清單**（`README.md` 的清單是手動維護的精選項，非強制索引）。這使新增技能是完全隔離、零副作用的操作——符合 `CLAUDE.md` 中「Keep changes small」的守則。

## 四個「掛載點」（分類）

| 分類目錄 | 收納的技能性質 | 目前規模 |
|---------|---------------|---------|
| `agent-skills/codex/` | 流程自動化、工具整合（含可執行腳本） | 19 |
| `agent-skills/media/` | 素材/圖片檢索 | 3 |
| `agent-skills/ui/` | 通用 UI/前端設計方法論 | 14 |
| `agent-skills/web-design/` | 具體視覺風格/動效系統實作食譜 | 63 |

新增分類本身也是可能的擴充（例如未來的 `agent-skills/backend/`），但目前無明文治理規則規定「何時該開新分類 vs 塞進既有分類」——⚠️ 未驗證，屬於慣例而非強制規範。

## 技能內部的次要擴充點

- **`REFERENCES.md`**：純連結清單，可隨時增補外部文件連結，不影響 `SKILL.md` 主體（見 `CLAUDE.md:22`："REFERENCES.md should be links only"）
- **`scripts/`**：技能可選擇性附帶可執行輔助腳本（Python/Swift/Bash/Node.js），供技能執行時呼叫。例如 `agent-skills/codex/screenshot/scripts/` 內有 5 個平台特定腳本（macOS/Windows），示範同一技能可用「多個平台變體腳本」擴充而不需拆成多個技能
- **`agents/openai.yaml`**：Codex 專屬技能可附加此設定檔做 agent 綁定（目前多數為空或極簡內容，⚠️ 未驗證其實際 schema 規格，repo 內未見官方說明文件）

## Plugin-Chain 的示範案例：技能組合使用

`README.md:9-19` 展示的 4 步驟「flagship workflow」（`video-to-superprompt` → `html-to-interaction-prompts` → `stitched-full-page-capture` → `daily-ui-inspiration-capture`）說明技能之間可以鏈式組合，形成更高階的工作流，而不需要建立新的「複合技能」——這是內容庫層級的 pipeline 組合模式，取代傳統系統中的 middleware chain / event pipeline。
