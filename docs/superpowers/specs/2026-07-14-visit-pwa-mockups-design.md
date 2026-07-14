# 家訪 PWA 可點擊原型 Mockup — 設計文件

日期:2026-07-14
分支:`claude/web-design-skill-mockups-80m3eg`
權威來源:`backendapispec.md`(家訪 PWA 後端架構與 API 規格,D1–D13 決策彙整)

---

## 0. 目標與範圍

依既有 backend spec,製作一組**可點擊的靜態原型(clickable prototype)**,用來驗證動線、展示三層授權模型,並定調暗色/大字/無障礙但**具設計感**的視覺語言。純前端、假資料、不接真 API。

**視覺約束**:暗色(dark mode)、大字(accessibility-first)、無障礙優先 —— 但「無障礙 ≠ 樸素」,要有明確層次、字體節奏、有意義的動效與講究的強調系統。

**產出定位**:這是 `@MengTo/Skills` repo 內展示 `web-design` 技能群的示範性 mockup,非 production 程式碼。

---

## 1. 檔案架構

```
mockups/visit-pwa/
  index.html          # 啟動頁:三個原型入口 + persona switcher 說明 + 設計理念
  mobile.html         # 手機原型(iPhone 外框、響應式、hash 路由)
  admin.html          # 桌面 admin 原型(瀏覽器視窗框、desktop only)
  assets/
    tokens.css        # 共用設計 token(色彩/字級/間距/陰影/動效)—— 三檔共用
    components.css     # 共用元件樣式(卡片、按鈕、狀態徽章、表單控制項、外框殼)
    persona.js        # persona 狀態機:切身分 → 廣播事件 → 畫面反應
    prototype.js      # hash 路由 + 點擊前進/返回 + 畫面轉場
    mock-data.js      # 假資料(事件、案件 38 欄、成員、門牌點、照片 metadata)
```

**分兩檔的理由**:admin 是桌面 only、規劃桌互動最複雜(三欄工作區),與手機的觸控單欄流程本質不同。分檔讓兩者各用最合適的外框,但共用 `tokens.css` + `components.css` 保持視覺一致 —— 對應使用者需求「不好做成手機+瀏覽器就分兩種」。

---

## 2. Persona 模型(跨原型核心機制)

浮動 persona switcher(mobile 與 admin 皆有),切換 6 種身分,畫面即時反應 spec §1 的三層授權平面。狀態存於 `sessionStorage`,切換時 `persona.js` 廣播 `personachange` 事件,各畫面監聽並重繪。

| Persona | bypass | role | PII 可見 | 照片 | Push | admin 入口 | 展示機制 |
|---|---|---|---|---|---|---|---|
| 行政組 office | ✅ | member | ✅ | ✅ | ✅ | ❌ | 完整權限基準線 |
| 訪視志工 A路線 | ✅ | member | ✅ | ✅ | ✅ | ❌ | **row 級路線篩選**(只看 route∈available_routes) |
| 指導師父 advisor | ❌ | viewer | ❌ 拔掉 | ❌ 拿不到 | ❌ 擋 | ❌ | **欄位級 PII 消失 + 唯讀橫幅** |
| 被停權 revoked | — | — | — | — | — | ❌ | **403 revoked → 清空本地資料流程** |
| 事件管理員 | ✅ | member | ✅ | ✅ | ✅ | ✅(該事件) | Admin 平面(D12 兩層) |
| 系統管理員 | ✅ | member | ✅ | ✅ | ✅ | ✅(全域) | 組織平面(合心/處室) |

**設計決策(與 spec 的已知落差,刻意記錄)**:spec §1.3 規定「非 bypass 隊伍完全看不到 PII」。依產品 owner 意圖,實際走訪者(訪視志工)填寫個資、必須看得到,因此在真實設定裡訪視隊伍應被設為 **bypass 隊伍**。本 mockup 忠實反映「訪視志工 = bypass、看得到 PII」此前提。PII 消失/無照片/唯讀三機制改由 **指導師父(viewer)** persona 完整展示(spec:viewer 永遠非 bypass、拿不到 photos、PII 被拔掉、push 回 `readonly:true`)。

**PII 三欄**:`id_number`、`payee_id_number`、`internal_notes`。實作以「欄位是否存在」呈現(對應 spec §2.2 前端須用 `"id_number" in case` 判斷),viewer persona 下這些欄位在表單中整組不出現,並顯示說明標籤。

---

## 3. 手機原型畫面(`mobile.html`)

iPhone 外框、hash 路由、可點擊前進。畫面清單:

| Hash | 畫面 | 對應 API | 展示重點 |
|---|---|---|---|
| `#/whoami` | 啟動/身分載入 | `GET /api/admin/whoami` | 顯示 email、是否有管理入口(依 persona) |
| `#/events` | 選事件 | `GET /api/sync/events` | 事件卡含 status 徽章(active/closing/closed)、team、bypass、role |
| `#/cases` | 案件清單 | `GET /api/sync/pull` | 依 persona 篩 route;頂部**同步狀態列**(同步中 / 離線佇列 N 筆 / 已同步);案件卡含 case_no、路線色票、地址、定位狀態 |
| `#/case/:id` | 案件詳情/表單 | pull + `POST /api/sync/push` | **38 欄動態產生**(依 field-catalog + enabled_fields);PII 欄位依 persona 出現/消失;地址欄含 geocode 預覽;手動釘選態顯示「重新定位」按鈕(解凍流程);儲存 → 進離線佇列動效 |
| `#/photo` | 拍照上傳 | push insert metadata → `POST /api/photos` | 上傳狀態機 pending→uploading→uploaded;drive 未設定 → 照片功能停用態(409);縮圖預覽 |
| `#/map` | 地圖 | `GET /api/tiles/[event]` | MapLibre 風格靜態圖(假 tiles);門牌點標記、手動釘選互動示意 |

**權限狀態畫面**(由 persona 觸發,非獨立 hash):
- viewer:全 app 頂部唯讀橫幅、表單欄位 disabled、儲存鍵灰掉、PII 欄位消失說明
- revoked:全螢幕遮罩「您已被移出此事件,本地資料將清除」+ 清空動作示意
- 離線:頂部離線 banner + 佇列計數;恢復連線 → 同步動效

---

## 4. 桌面 Admin 原型畫面(`admin.html`)

瀏覽器視窗框(桌面 only),頂部 tab 或側邊導覽切換四大區。persona 需為事件管理員/系統管理員才進得來(其他 persona 顯示「無管理權限」擋頁)。

| 區塊 | 對應 API | 展示重點 |
|---|---|---|
| **事件管理儀表板** | `GET/POST /api/admin/events` | 事件清單卡;點入看完整 `event_config`(enabledFields/routes/districts/teams/county/options);建事件表單示意 |
| **成員名冊** | `GET/POST /api/admin/members` + `directory` | 成員表格(隊伍/路線/role/是否事件管理員);挑人器 modal(volunteer/staff/advisor 分頁搜尋);停權/復權;批次新增 |
| **匯入/匯出** | `import/dry-run`→`commit`、`export` | dry-run 預覽表(新增/更新/錯誤列)→ commit;CSV 範本下載、匯出(PII 僅 bypass 可見標示) |
| **規劃桌(路線規劃)** | `admin/addr/points`、`addr/regions`、`routes/assign` | **三欄工作區**:左=行政區/村里/鄰階層樹;中=地圖門牌點(可框選);右=批次改路線 + 成員路線授權 + 新增路線面板。互動最重,是 admin 原型的重頭戲 |

系統管理員額外:組織樹(合心/和氣兩層 + 處室字典)、合心/處室管理員任免、系統管理員切換(`toggle-admin`)。

---

## 5. 設計語言 token(暗色 / 大字 / 無障礙 / 有設計感)

### 5.1 色彩(對比優先)
- 底層 `--bg: #0B0E14`;面板 `--surface: #141922`;浮卡 `--surface-raised: #1B2130`
- 主文字 `--text: #F2F5FA`(對比 ≥ 15:1);次文字 `--text-dim: #A7B0C0`(對比 ≥ 7:1)
- 強調藍 `--accent: #4C9AFF`;強調發光邊 border-gradient
- 語意色(對比 ≥ 4.5:1):同步中 `--info`、成功/已同步 `--success`、警告/離線 `--warning`、危險/revoked `--danger`、唯讀 `--muted`
- **路線色票系統**:每條 route 一個穩定色相(A/B/C…),案件卡、地圖點、規劃桌共用同一色票對應

### 5.2 字體節奏(大字但有階層)
- base **18px**;內文 17–19px;行高 1.6
- 標題階層:h1 36–40px / h2 28–30px / h3 22px,字重對比明確
- 數字/代碼/標籤用 **mono**(case_no、座標、序號、同步計數),與內文襯線/無襯線形成節奏
- 觸控目標 ≥ 48px;表單控制項高 ≥ 52px

### 5.3 深度與材質(避免純色平貼)
- 多層表面 + 克制霧面玻璃邊緣(pseudo-element mask,對應 `glass-dark-ui` 技巧)
- 細膩 border-gradient(對應 `css-border-gradient`);beautiful-shadows 式精確陰影
- 狀態徽章、容器引導線(對應 `container-lines`)點綴結構

### 5.4 動效(有意義且可關閉)
- 狀態轉換動效:同步中脈動、上傳進度、釘選落點、佇列數字滾動
- 畫面轉場:hash 切換的滑入/淡入
- 全面尊重 `prefers-reduced-motion: reduce`(關閉非必要動畫)

### 5.5 無障礙硬性要求
- 焦點可見環(`:focus-visible`);鍵盤可操作
- 狀態不只靠顏色 —— PII/唯讀/同步狀態一律附文字標籤或 icon
- ARIA landmark(header/main/nav)、按鈕/表單 label 完整
- 色彩對比全數達 WCAG AA(大字 3:1、內文 4.5:1),目標多數達 AAA

---

## 6. 技術做法

- **純 HTML/CSS/vanilla JS**,無建置步驟、無外部 CDN(自包含,可離線開啟)。
- Hash 路由:`prototype.js` 監聽 `hashchange`,切換 `.screen` 顯示。
- Persona:`persona.js` 存 `sessionStorage`,切換廣播 `CustomEvent('personachange')`,各畫面 `data-persona-*` 屬性或監聽器重繪(篩 route、藏 PII、切唯讀、顯示 admin 入口)。
- 假資料:`mock-data.js` 匯出事件/案件/成員/門牌點常數;38 欄依 spec §7 的 field-catalog 概念以資料驅動動態生成表單。
- 地圖:靜態圖片或 CSS 假圖磚 + 標記層,不引入真 MapLibre(mockup 不需真 tiles)。
- 裝置外框:CSS 畫 iPhone 殼 / 瀏覽器視窗 chrome,內容區用 iframe 或直接容器。

---

## 7. 實作編排(Opus 規劃 → Sonnet 實作 → impeccable 收斂)

1. **Opus(規劃)**:本 spec + 後續 implementation plan(拆任務、定介面、共用 token 契約)。
2. **Sonnet(實作)**:分頭平行實作 —— (a) 共用 `tokens.css`/`components.css`/`persona.js`/`prototype.js`/`mock-data.js` 基底先行;(b) mobile 原型;(c) admin 原型;(d) index 啟動頁。基底完成後 b/c/d 可平行。
3. **impeccable(收斂視覺)**:每個原型視覺定稿前過一次,確保層次、字體節奏、動效、強調系統到位,不流於樸素。

---

## 8. 驗收清單

- [ ] 三個 HTML 可直接以 `file://` 開啟、無 console error、無外部請求
- [ ] persona switcher 切 6 身分,mobile 各畫面正確反應(route 篩選、PII 消失、唯讀、revoked、admin 入口)
- [ ] mobile 五大畫面 + 權限狀態齊備,hash 路由可點擊前進/返回
- [ ] admin 四大區塊齊備,規劃桌三欄工作區可互動示意
- [ ] 38 欄表單資料驅動動態生成(非寫死)
- [ ] 色彩對比達 WCAG AA、`prefers-reduced-motion` 生效、鍵盤可操作
- [ ] mobile 與 admin 共用同一套 token,視覺一致
- [ ] 每個原型皆有設計感(層次/字體節奏/動效/強調系統),非樸素
