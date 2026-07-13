# 外部整合

大多數技能（純 Markdown 方法論類）沒有外部整合，僅是知識/指令。少數技能明確與外部服務 / SDK / CLI 整合，彙整如下。

## 呼叫外部服務的技能

| 技能 | 外部服務/工具 | 認證方式 | 失敗處理 |
|------|---------------|---------|---------|
| `agent-skills/codex/netlify-deploy/` | Netlify CLI (`npx netlify`) | 依賴使用者已登入的 CLI session（`netlify status` 檢查） | `SKILL.md:17` 提及 sandbox 阻擋網路時的因應（改用 network-enabled shell）；無 retry/circuit breaker，屬人工介入型錯誤處理 |
| `agent-skills/codex/elevenlabs-tts/` | ElevenLabs TTS API | 環境變數 `ELEVENLABS_API_KEY` 或最近的 `.env`（`SKILL.md:9`） | ⚠️ 未驗證——`scripts/generate_voice.py` 內部錯誤處理細節未在 SKILL.md 中說明，需讀腳本原始碼確認 |
| `agent-skills/codex/playwright/`、`agent-skills/codex/playwright-interactive/` | Playwright（瀏覽器自動化） | 本地安裝，無外部帳號 | 標準 Playwright 逾時/重試由使用情境決定，非技能內建邏輯 |
| `agent-skills/media/unsplash-asset-images/` | Unsplash（唯讀，僅回傳網頁 URL，非 API 呼叫） | 無需認證——技能只產出 Unsplash 頁面連結供人工下載 | 不適用（無程式化呼叫，故無失敗處理） |
| `agent-skills/media/aura-asset-images/` | Aura Build Assets（`aura.build/assets`，唯讀查詢） | 無需認證，走公開搜尋 URL query | 不適用 |
| `agent-skills/codex/screenshot/` | macOS/Windows 系統層級 API（螢幕擷取、視窗資訊） | 系統權限（`ensure_macos_permissions.sh` 負責確保） | 權限缺失時腳本會提示使用者手動授權，而非靜默失敗 |
| `agent-skills/codex/x-bookmark-quote-posts/` | X (Twitter) | ⚠️ 未驗證——需讀該技能原始碼確認是否為 API 呼叫或純瀏覽器操作 |

## 設計原則：不存放密鑰 / 個人化資訊

`agent-skills/codex/elevenlabs-tts/SKILL.md:5-8` 明確示範本 repo 對外部整合的治理原則，與 `CLAUDE.md` 的「Safety」守則（`CLAUDE.md:26-28`：Don't include secrets/API keys/tokens）一致：

> Do not store API keys, voice names, voice ids, emails, account names, customer names, or personal defaults in the skill.
> Read `ELEVENLABS_API_KEY` from the process environment or the nearest `.env`.
> Read account-specific voice profiles from local JSON config outside this skill.

這代表所有需要憑證的整合都採**外部化設定**模式——技能本身只描述「怎麼呼叫」，不帶入任何機密或帳號特定資料，讓 repo 保持「可攜式、可公開分享」的性質（呼應 `README.md:24`："Portable by default"）。

## 沒有外部整合的技能（多數）

`agent-skills/ui/*`、`agent-skills/web-design/*` 中，除了少數含 `scripts/` 的技能外，絕大多數都是純 Markdown 指導方針，不呼叫任何外部服務——它們的「整合」是與**下游 agent 使用的技術棧**（React、GSAP、Three.js 等）的知識層面整合，而非執行期的服務呼叫。
