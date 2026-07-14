# 家訪 PWA 可點擊原型 Mockup — 設計文件

日期:2026-07-14(v2,已納入 Opus 對抗式 review 修訂)
分支:`claude/web-design-skill-mockups-80m3eg`
權威來源:`backendapispec.md`(家訪 PWA 後端架構與 API 規格,D1–D13 決策彙整)。註:被引用的 `2026-07-04-visit-app-design.md`(D1–D13 原文)不在本 repo,以 backend spec 彙整為準。

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
    tokens.css        # 共用設計 token(色彩/字級/間距/陰影/動效 + mobile↔admin 密度變體)
    components.css     # 共用元件樣式(卡片、按鈕、狀態徽章、表單控制項、外框殼)
    persona.js        # persona 狀態機:切身分 → 廣播事件 → 畫面反應
    prototype.js      # hash 路由 + 點擊前進/返回 + 畫面轉場
    mock-data.js      # 假資料(事件/案件38欄/成員/門牌點/組織樹/匯入列)—— 基底階段一次定義齊全
```

**分兩檔的理由**:admin 是桌面 only、規劃桌互動最複雜(三欄工作區),與手機的觸控單欄流程本質不同。分檔讓兩者各用最合適的外框,但共用 `tokens.css` + `components.css` 保持視覺一致 —— 對應使用者需求「不好做成手機+瀏覽器就分兩種」。

---

## 2. Persona 模型(跨原型核心機制)

浮動 persona switcher(mobile 與 admin 皆有),切換 **7 種**身分,畫面即時反應 spec §1 三層授權平面。狀態存 `sessionStorage`,切換時 `persona.js` 廣播 `personachange` 事件,各畫面監聽重繪。

| # | Persona | bypass | role | admin 訊號 | PII 可見 | 照片 | Push | 展示的授權機制 |
|---|---|---|---|---|---|---|---|---|
| 1 | 行政組 office | ✅ | member | — | ✅ | ✅ | ✅ | **bypass 基準線**:看全事件所有案 + 讀寫 PII |
| 2 | 訪視志工 A/B線 | ❌ | member | — | ✅※ | ✅ | ✅(僅自己路線) | **row 級路線篩選**(只看 route∈[A,B])+ push 到非自己路線 case → 403 `permission` |
| 3 | 指導師父 advisor | ❌ | viewer | — | ❌ 拔掉 | ❌ 拿不到 | ❌ 全擋 | **欄位級 PII 消失(key 不存在)+ 無照片 + 唯讀** `readonly:true` |
| 4 | 被停權 revoked | — | — | — | — | — | — | **403 `revoked` → 永久清空本地資料**(破壞性) |
| 5 | 合心管理員 | ❌ | member | `hexinAdminOf[]` | ✅ | ✅ | ✅ | **組織平面(D13)**:能建事件、選 owner 合心、管自己合心名冊;進不去別事件規劃桌 |
| 6 | 事件管理員 | ✅ | member | `eventAdminSlugs[]` | ✅ | ✅ | ✅ | **Admin 平面(D12)**:僅對被指派事件有管理權 |
| 7 | 系統管理員 | ✅ | member | `isAdmin` | ✅ | ✅ | ✅ | 全域 superset + 組織樹/合心處室任免 |

**※ 關鍵設計決策(刻意與現行 backend 不同,務必醒目標註):**
backend spec §1.3/§2.2 把 `bypass` 一個旗標耦合了兩件事:「看得到 PII」**必然**附帶「看得到全事件所有案件」;非 bypass 則「只看自己路線」**且** PII 三欄整組從 wire 消失。依產品 owner 決策,訪視志工應該是「**只看自己路線,但看得到自己填的 PII**」—— 這在現行後端**不存在**(非 bypass 必拔 PII)。因此 persona #2 呈現的是**預期產品行為**,代表一個**後端能力缺口**:需要「非 bypass member 對自己路線案件可見 PII」的新能力。mockup 與 spec 皆須明確標註此 persona 與現行 backend §1.3 不同,避免後端串接者誤解耦合關係。「非 bypass = PII 被拔掉」這個現行後端機制,仍由 persona #3 viewer 忠實展示。

**PII 三欄**:`id_number`、`payee_id_number`、`internal_notes`。以「欄位是否存在」呈現(對應 spec §2.2 前端須用 `"id_number" in case` 判斷,而非 `== null`);viewer persona 下這些欄位在表單中整組不出現並顯示說明標籤。

**授權平面涵蓋度**:三層平面(資料/Admin/組織)皆有 persona 觸及 —— 資料平面(#1–3 的 bypass/route/viewer)、Admin 平面(#6 事件管理員、#7 系統管理員,D12 兩層)、組織平面(#5 合心管理員、#7 系統管理員,D13)。whoami 畫面以四維訊號矩陣(`isAdmin`/`eventAdminSlugs`/`hexinAdminOf`/`deptAdminOf`)呈現「三層獨立、疊加、非上下屬」關係,而非壓成單一布林。`available_routes` 用複數(A、B 兩線)展示其為 `string[]`。

---

## 3. 手機原型畫面(`mobile.html`)

iPhone 外框、hash 路由、可點擊前進。畫面清單:

| Hash | 畫面 | 對應 API | 展示重點 |
|---|---|---|---|
| `#/whoami` | 啟動/身分載入 | `GET /api/admin/whoami` | email + **四維 admin 訊號矩陣**;依 persona 決定是否顯示管理入口 |
| `#/events` | 選事件 | `GET /api/sync/events` | 事件卡含 status 徽章(active/closing/closed)、team、bypass、role;`open_support` 跨合心支援事件以標記區分 |
| `#/cases` | 案件清單 | `GET /api/sync/pull` | 依 persona 篩 route;頂部**同步狀態列**(載入第 N 頁 / 同步中 / 離線佇列 N 筆 / 已同步);**佇列三態:已同步 / 待送 / 被拒(reason)**;案件卡含 case_no、路線色票、地址、定位狀態 |
| `#/case/:id` | 案件詳情/表單 | pull + `POST /api/sync/push` | **38 欄動態產生**(依 field-catalog + enabled_fields);PII 欄位依 persona 出現/消失;地址欄含 geocode 預覽(`addr/lookup`)+ 自動完成(`addr/suggest`)+ 村里/鄰下拉(`addr/villages`);手動釘選態顯示「重新定位」按鈕(解凍流程);儲存 → 進離線佇列動效;**逐欄 LWW 衝突示意**(同 case 兩欄被不同人改,按到達序逐欄覆蓋);member push 到非自己路線 → 403 `permission` 回饋 |
| `#/case/:id/photo` | 拍照上傳(掛在 case 底下) | push insert metadata(帶 `case_id`)→ `POST /api/photos` | 兩段式流程明示;上傳狀態機 pending→uploading→uploaded;**drive 未設定 → 照片停用(reactive:收到 409 `drive_not_configured` 才知,非 proactive,因 `drive_folder_id` 已從 ClientEventConfig 濾掉、wire 上拿不到)**;縮圖預覽 |
| `#/map` | 地圖 | `GET /api/tiles/[event]` | MapLibre 風格靜態圖(假 tiles);門牌點標記、手動釘選互動示意;**圖磚產製中(0-byte 503)**暫態 |

**權限/同步狀態畫面**(由 persona 或同步事件觸發):
- **viewer**:全 app 頂部唯讀橫幅、表單欄位 disabled、儲存鍵灰掉、PII 欄位消失說明。
- **revoked(破壞性)**:全螢幕遮罩「您已被移出此事件,本地資料將清除」+ 清空動作;**永久踢出**。
- **full_resync(D8,非破壞性,與 revoked 明確區分)**:切 persona = 改 team/route → 觸發「偵測到成員資料變動 → 清空本地 → cursor 歸零 → `resync=1` 重新從頭 pull」動效。此機制與 persona switcher 天生契合(切身分正是現實中觸發 full_resync 的動作)。
- **離線**:頂部離線 banner + 佇列計數;恢復連線 → 同步動效 + 佇列消化。

---

## 4. 桌面 Admin 原型畫面(`admin.html`)

瀏覽器視窗框(桌面 only),頂部/側邊導覽切換各區。進入權限依 whoami 四維訊號**分層**判斷(非單一布林):

- 系統管理員(#7):全部區塊。
- 事件管理員(#6):僅被指派事件的管理區(不含系統管理員專屬的組織樹/toggle-admin)。
- 合心管理員(#5):**能進**建事件 + owner_options 合心清單 + 自己合心的名冊(directory 依組織範圍過濾);**進不去**別事件的規劃桌/成員管理。
- 其他 persona(#1–4):顯示「無管理權限」擋頁。

| 區塊 | 對應 API | 展示重點 |
|---|---|---|
| **事件管理儀表板** | `GET/POST /api/admin/events` | 事件清單卡;點入看完整 `event_config`;建事件表單(含 `owner_options` 合心選單);**status 轉換規則**:只允許 `active→closing`、`closing→{closed,active}`(closed 為終態),不合法轉換按鈕 disable,且**僅系統管理員**可切、事件管理員看不到 status 控制 |
| **成員名冊** | `GET/POST /api/admin/members` + `directory` | 成員表格(隊伍/路線/role/是否事件管理員);挑人器 modal(volunteer/staff/advisor 分頁搜尋,依組織範圍過濾);停權/復權(不能停自己);批次新增(`upsert_many` **≤50**) |
| **匯入/匯出** | `import/dry-run`→`commit`、`export`、`template` | dry-run 預覽表(新增/更新/**錯誤**列)→ commit(fileHash 一致否則 409);CSV 範本下載;匯出(PII 欄位僅 bypass 權限者可見標示) |
| **規劃桌(路線規劃,獨立 phase、風險最高)** | `admin/addr/points`、`addr/regions`、`routes/assign`、**`cases/[id]/coords`**、**`cases/import-from-addr`** | **三欄工作區**:左=行政區/村里/**鄰**階層樹(密度分級/虛擬滾動,防大字撐爆);中=地圖門牌點(可框選)→ **框選後 `import-from-addr` 批次建案(≤50)**;右=批次改路線(`routes/assign`)+ 成員路線授權 + 新增路線面板。手動釘選座標走 **`PATCH cases/[id]/coords`**(`geocode_source='manual'`) |

系統管理員額外:組織樹(合心/和氣兩層 + 處室字典 CRUD、使用中/同名衝突 409)、合心/處室管理員任免、系統管理員切換(`toggle-admin`,不能解除自己、至少留 1 個)。

---

## 5. 設計語言 token(暗色 / 大字 / 無障礙 / 有設計感)

### 5.1 色彩(對比優先,實測值)
- 底層 `--bg: #0B0E14`;面板 `--surface: #141922`;浮卡 `--surface-raised: #1B2130`
- 主文字 `--text: #F2F5FA`(對 bg ≈ 17:1,AAA);次文字 `--text-dim: #A7B0C0`(對 surface-raised ≈ 7.3:1,AAA 邊界)
- 強調藍 `--accent: #4C9AFF`(對 bg ≈ 6.8:1,**AA 內文、未達 AAA**)
- 語意色(對比 ≥ 4.5:1):同步中 `--info`、成功/已同步 `--success`、警告/離線 `--warning`、危險/revoked `--danger`、唯讀 `--muted`
- **路線色票系統**:每條 route 一個穩定色相(A/B/C…),案件卡、地圖點、規劃桌共用同一對應
- **WCAG 承諾範圍**:主/次文字達 **AAA**;`--accent` 與語意色作文字用時僅保證 **AA**(不對全域承諾 AAA)

### 5.2 字體節奏(大字但有階層)
- base **18px**;內文 17–19px;行高 1.6
- 標題階層:h1 36–40px / h2 28–30px / h3 22px,字重對比明確
- 數字/代碼/標籤用 **mono**(case_no、座標、序號、同步計數),與內文形成節奏
- **字體策略(因 §6 禁 CDN、須 file:// 自包含)**:內文與標題用經整理的 **system font stack**(`-apple-system`/`Segoe UI`/`Noto Sans TC` 等,涵蓋繁中);mono 用 system mono stack(`ui-monospace`/`SF Mono`/`Menlo`)。**不 base64 內嵌自訂字體**(避免檔案膨脹);「字體節奏」靠字重/字距/大小寫/mono 對比達成,而非靠特殊字型,實作不得默默退回單一系統字。

### 5.3 深度與材質(避免純色平貼)
- 多層表面 + 克制霧面玻璃邊緣(pseudo-element mask,對應 `glass-dark-ui`)
- 細膩 border-gradient(`css-border-gradient`);beautiful-shadows 式精確陰影
- 狀態徽章、容器引導線(`container-lines`)點綴結構

### 5.4 動效(有意義且可關閉)
- 狀態轉換:同步中脈動、上傳進度、釘選落點、佇列數字滾動、full_resync 清空重載
- 畫面轉場:hash 切換滑入/淡入
- 全面尊重 `prefers-reduced-motion: reduce`

### 5.5 密度變體(解決大字 token 與 admin 高密度的衝突)
- tokens.css 分兩組控制項尺寸:`--control-h-touch: 52px`(mobile,觸控目標 ≥48px)、`--control-h-dense: 36px`(admin desktop 表格/面板)。
- 規劃桌階層樹:縮排密度分級 + 必要時虛擬滾動;成員名冊/匯入 dry-run 表用 dense 變體。
- **驗收前置**:規劃桌三欄須用**真實節點數**(某村里數十鄰 × 每鄰數十門牌)在 1440 / 1280 寬下驗證可讀性再定稿,確認三欄(各約 ≤450px)塞得下。

### 5.6 無障礙硬性要求
- 焦點可見環(`:focus-visible`);鍵盤可操作;ARIA landmark(header/main/nav);按鈕/表單 label 完整。
- 狀態不只靠顏色 —— PII/唯讀/同步/被拒狀態一律附文字標籤或 icon。
- 色彩對比全數達 WCAG AA(大字 3:1、內文 4.5:1),主/次文字達 AAA。

---

## 6. 技術做法

- **純 HTML/CSS/vanilla JS**,無建置步驟、**無外部 CDN**(自包含,可 `file://` 離線開啟)。字體策略見 §5.2。
- Hash 路由:`prototype.js` 監聽 `hashchange`,切換 `.screen` 顯示,支援前進/返回。
- Persona:`persona.js` 存 `sessionStorage`,切換廣播 `CustomEvent('personachange')`,各畫面 `data-persona-*` 屬性或監聽器重繪(篩 route、藏 PII、切唯讀、顯示 admin 入口、觸發 full_resync 示意)。
- 假資料:`mock-data.js` 匯出事件/案件/成員/門牌點/組織樹/匯入列常數;38 欄依 spec §7 field-catalog 概念資料驅動動態生成(非寫死)。**批次上限標註**:push ≤500、upsert_many/import-from-addr ≤50,假資料不得超限。
- 地圖:靜態圖片或 CSS 假圖磚 + 標記層,不引入真 MapLibre。
- 裝置外框:CSS 畫 iPhone 殼 / 瀏覽器視窗 chrome。

---

## 7. 實作編排(Opus 規劃 → Sonnet 實作 → impeccable 收斂)

**Phase 0 — 基底契約凍結(序列,先行)**:定齊 `tokens.css`(含密度變體)、`components.css` 介面契約、`persona.js`/`prototype.js` API,以及 `mock-data.js`**完整**資料(mobile + admin 所需一次到位,含 org 樹/directory/addr points/import 列)。此階段完成 = 共用可變檔凍結,避免後續平行軌互相踩踏。

**Phase 1 — 平行實作(基底凍結後)**:
- (a) mobile 原型(六畫面 + 權限/同步狀態)
- (b) admin 非規劃桌區(事件儀表板 + 名冊 + 匯入匯出)
- (c) index 啟動頁

**Phase 2 — 規劃桌(獨立、風險最高,單獨排在其後或並行但獨立軌)**:三欄工作區、框選 → 批次建案、批次改路線/授權、密度驗證。因涉框選 + 批次 + 大字密度,是全案最大實作風險,不與 index 平級。

**每階段結束**:impeccable 收斂視覺(層次、字體節奏、動效、強調系統),確保不流於樸素。

---

## 8. 驗收清單

- [ ] 三個 HTML 可直接 `file://` 開啟、無 console error、**無外部請求**(含字體)
- [ ] persona switcher 切 **7 身分**,mobile 各畫面正確反應(route 篩選、PII 出現/消失、viewer 唯讀、revoked 清空、full_resync 非破壞重拉、admin 入口分層)
- [ ] 訪視志工(#2)明確標註「只看自己路線 + 可見 PII」為**與現行 backend 不同的預期行為/後端缺口**
- [ ] 三層授權平面(資料/Admin/組織)皆有 persona 觸及;whoami 呈現四維訊號矩陣
- [ ] mobile 六畫面 + 權限/同步狀態齊備;photo 掛在 `#/case/:id/photo` 有 case 脈絡;佇列三態 + 逐欄 LWW 衝突 + rejected reason 有呈現
- [ ] admin 四大區塊齊備;事件 status 轉換規則正確 disable;規劃桌三欄可互動,框選 → 批次建案、手動釘選(coords)、批次改路線齊備
- [ ] 38 欄表單資料驅動動態生成(非寫死);地址三支 API(lookup/suggest/villages)體現
- [ ] 密度變體生效:mobile 觸控 ≥48px、admin dense;規劃桌三欄在 1440/1280 用真實節點數驗證可讀
- [ ] 色彩對比達 WCAG AA、主/次文字 AAA、accent 僅承諾 AA;`prefers-reduced-motion` 生效;鍵盤可操作
- [ ] mobile 與 admin 共用同一套 token,視覺一致;每個原型皆有設計感(層次/字體節奏/動效/強調系統)
- [ ] 批次上限(push≤500、≤50)在對應畫面標註,假資料不超限
