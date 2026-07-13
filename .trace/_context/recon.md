# Recon 偵察筆記

## 專案本質

這**不是一個傳統軟體專案**，而是一個 **AgentSkills 內容庫**：一組給 Codex / Claude / Cursor 等 AI coding agent 使用的可攜式「技能」playbook，格式為 Markdown 資料夾。repo 內幾乎沒有應用程式邏輯、沒有 server、沒有資料庫、沒有 API。因此本次 trace 的文件套用「Pure library / content repo」路徑，`DATA_MODEL.md`、`API_SURFACE.md`、傳統的 request/data flow 章節皆置換為與內容庫性質相符的文件（詳見 Stage 1.5 決策）。

## 頂層檔案

| 檔案 | 用途 |
|------|------|
| `README.md` | 專案總說明：目的、使用方式、各 agent（Codex/Claude/Cursor）的整合方式、哲學（"Prompts are assets"） |
| `CLAUDE.md` | 給 Claude Code 的 repo 專屬指令：資料夾契約、風格守則、安全守則、建議工作流程 |
| `LICENSE` | 授權條款 |
| `.gitignore` | 極簡（1 行） |
| `assets/` | repo 層級的展示素材（如 README 用的 gif） |

無 `package.json` / `pyproject.toml` / `Cargo.toml` 等套件管理檔，無 Dockerfile，無 CI/CD workflow（`.github/workflows/` 不存在），無 `.env.example`。這確認了「純內容庫」的定位——沒有可執行的應用程式需要建置或部署。

## 既有文件掃描

- `README.md`：權威來源，說明整體目的、agent 整合方式、哲學、資料夾慣例
- `CLAUDE.md`：權威來源，定義資料夾契約（`SKILL.md` 必要、`REFERENCES.md`/`ARTICLE.md`/`assets/`/`scripts/` 可選）與風格守則
- `agent-skills/web-design/README.md`：說明 `web-design/` 子集是「draft AgentSkills」，待完成
- `agent-skills/web-design/WEB-DESIGN-SKILLS.md`：`web-design/` 子集的技能清單摘要（⚠️ 內容與實際目錄數量有落差，見 `DISCOVERY_LOG.md`）

未發現落差需要標注在程式碼行號層級（因為本 repo 無「程式碼執行邏輯」），落差改記錄為「文件描述 vs 實際目錄內容」的差異，見 `DISCOVERY_LOG.md`。

## 目錄結構快照（3 層深）

```
.
├── CLAUDE.md
├── README.md
├── LICENSE
├── assets/                          # repo 展示素材
└── agent-skills/                    # 所有技能的根目錄
    ├── codex/                       # 19 個技能，多數含 agents/openai.yaml
    │   ├── audit-verify-explain-grade-5/
    │   ├── copywriting/
    │   ├── elevenlabs-tts/          # 含 scripts/generate_voice.py
    │   ├── screenshot/              # 含 scripts/*.swift, *.py, *.ps1, *.sh
    │   ├── playwright/              # 含 scripts/playwright_cli.sh
    │   ├── stitched-full-page-capture/  # 含 scripts/*.mjs
    │   └── ...（其餘為純 Markdown 技能）
    ├── media/                       # 3 個技能（圖片素材類）
    │   ├── aura-asset-images/
    │   └── unsplash-asset-images/
    ├── ui/                          # 14 個技能（UI/前端設計方法論）
    │   ├── design-taste-frontend/
    │   ├── frontend-design/
    │   ├── high-end-visual-design/
    │   ├── minimalist-ui/
    │   └── ...
    └── web-design/                  # 63 個技能（最大子集，網頁視覺/動效/3D）
        ├── README.md
        ├── WEB-DESIGN-SKILLS.md
        ├── gsap/
        ├── tailwindcss/
        ├── globe-gl/
        └── ...（大量風格系統與效果技能）
```

**架構模式**：這是一個 **plugin-based / registry 式的內容庫**——每個技能資料夾是一個自我完備的「plugin」，透過統一的資料夾契約（`SKILL.md` 必要）被上層 agent（Codex/Claude/Cursor）動態載入。沒有中央 dispatcher 程式碼；「路由」是靠 agent 自己根據 `SKILL.md` 的 `description` frontmatter 做語意比對後決定載入哪個技能（類似 RAG-lite 的 self-selection）。

## 技術棧識別

| 類別 | 技術/格式 | 用途 |
|------|----------|------|
| 內容格式 | Markdown (`SKILL.md`, `REFERENCES.md`, `ARTICLE.md`) | 技能的主要載體 |
| Frontmatter | YAML（嵌在 `SKILL.md` 開頭） | `name` + `description`，供 agent 做語意比對選擇技能 |
| 腳本語言（少數技能） | Python、Swift、Bash、PowerShell、Node.js (`.mjs`) | 少數 `codex/` 技能提供可執行輔助腳本（截圖、TTS、頁面拼接） |
| Agent 設定 | `agents/openai.yaml`（多數為空檔或極簡） | Codex 專屬技能的 agent 綁定設定 |
| 版控 | Git | 唯一的「基礎設施」 |
| CI/CD | 無 | 未發現任何 workflow 檔案 |
| 套件管理 | 無 | 無單一語言的依賴管理系統 |

## 規模統計（Stage 1.5 依據）

- 總檔案數：151（不含 `.git/`）
- Markdown 檔案數：120
- 非 Markdown「程式碼」檔案：約 18（scripts + yaml），集中在 `agent-skills/codex/` 少數技能
- 技能資料夾數：約 99 個（codex 19 + media 3 + ui 14 + web-design 63）

**結論：檔案數 151 < 500，不需要縮限 trace 範圍。**

**專案類型判定：Pure content library（近似 "Pure library"）。**
依 Stage 1.5 對照表，「Pure library」可跳過 2.2 Request/Data Flow 與 2.6 設定與環境；但因使用者選擇「調整套用」，本次改以下列置換：
- 2.2 → 改為「技能載入與消費流程」（agent 如何發現、選擇、套用一個技能）
- 2.6 → 改為「技能撰寫與資料夾契約規範」（`SKILL.md` frontmatter 規則、`CLAUDE.md` 守則）
- Data Model → 改為 `SKILL_TAXONOMY.md`（技能分類體系）
- API Surface → 改為 `SKILL_CATALOG.md`（技能目錄索引，含每個技能的一句話描述、觸發時機）
