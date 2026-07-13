# 核心邏輯（置換版：內容庫的「心臟」）

## 這個 repo 的「心臟」是什麼？

不是程式碼，而是 **`agent-skills/ui/` 與 `agent-skills/web-design/` 中，把「設計品味」轉譯為「可執行的、有具體數值約束的指令」的方法論**。這是整個 repo 最非平凡（non-trivial）的部分，也是與一般「prompt 收藏集」的本質差異所在。

## 核心抽象：Directive-as-Config

以 `agent-skills/ui/design-taste-frontend/SKILL.md:5-8` 為代表模式：

```
* DESIGN_VARIANCE: 8 (1=Perfect Symmetry, 10=Artsy Chaos)
* MOTION_INTENSITY: 6 (1=Static/No movement, 10=Cinematic/Magic Physics)
* VISUAL_DENSITY: 4 (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)
```

技能把主觀的「設計品味」量化成 1-10 的旋鈕（knob），並明訂預設值與語意錨點（1 = 什麼、10 = 什麼）。這解決了 LLM 生成 UI 時常見的「風格漂移」問題：不給 agent 自由發揮的模糊指示，而是給它可調參數 + 強制規則。

## Bias-Correction Pattern（偏誤修正模式）

多個技能明確針對「LLM 生成 UI 的已知統計偏誤」寫死反制規則，而非單純鼓勵「做得更好」。例如：
- `agent-skills/ui/design-taste-frontend/SKILL.md:29-32`：「Rule 1: Deterministic Typography」強制指定字體白名單（`Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`），明確禁用 LLM 預設偏好的 `Inter`
- `agent-skills/ui/design-taste-frontend/SKILL.md:22`：「ANTI-EMOJI POLICY [CRITICAL]」全面禁用 emoji
- `agent-skills/ui/frontend-design/SKILL.md:9-13`：要求在寫程式碼前先「commit to a BOLD aesthetic direction」，並列舉一組風格光譜（brutally minimal / maximalist chaos / retro-futuristic...）強迫 agent 選邊站，避免生成「AI slop」（千篇一律的中庸風格）

這是一種 **Strategy Pattern 的內容庫版本**：`agent-skills/web-design/` 下 60+ 個以視覺風格命名的資料夾（`dark-glass-clean-layout/`、`solar-duotone-bold/`、`industrial-brutalist-ui/` 等）本質上就是同一個「生成網頁 UI」任務的不同 strategy 實作，各自鎖定一種明確的美學方向 + 對應的技術實作細節（CSS 技巧、動效庫選擇）。

## 強制驗證步驟（Fail-safe 設計）

`agent-skills/ui/design-taste-frontend/SKILL.md:15`：
> **DEPENDENCY VERIFICATION [MANDATORY]:** Before importing ANY 3rd party library... you MUST check `package.json`. If the package is missing, you MUST output the installation command... **Never** assume a library exists.

這類「MANDATORY / CRITICAL」標記的檢查步驟，是技能作者用文字達成類似程式碼中 assertion / guard clause 的效果——在無法真正執行測試的 prompt 情境中，用強制性語言逼迫 agent 在生成前自我驗證。

## 與其他分類的關係

- `agent-skills/ui/` = 通用的、跨技術棧的設計方法論（品味、架構慣例）
- `agent-skills/web-design/` = 高度具體的、單一視覺效果或風格系統的實作食譜（大多附 `REFERENCES.md` 指向官方文件，如 GSAP、Three.js）
- `agent-skills/codex/` = 流程/工具類技能（截圖、部署、影片轉 prompt），較少涉及美學判斷，更接近傳統自動化腳本 + 使用說明
- `agent-skills/media/` = 素材檢索類技能（Unsplash、Aura Assets），核心邏輯是「如何用查詢詞找到對的圖」而非設計判斷
