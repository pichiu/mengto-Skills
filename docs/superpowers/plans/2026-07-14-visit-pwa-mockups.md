# 家訪 PWA 可點擊原型 Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依 backend spec 產出三個自包含、可點擊的暗色/大字/無障礙 PWA 原型(index + mobile + desktop admin),用 persona switcher 展示三層授權模型。

**Architecture:** Phase 0 先凍結共用基底(tokens/components CSS + persona/prototype/mock-data JS 的介面契約);Phase 1 平行實作 mobile、admin 非規劃桌、index;Phase 2 實作最高風險的規劃桌;每 Phase 結束由 impeccable 收視覺。純前端、無建置、無 CDN。

**Tech Stack:** Vanilla HTML/CSS/ES modules(`<script type="module">`)、CSS custom properties、hashchange 路由、sessionStorage、`CustomEvent`。驗證用 Playwright(env 內建 Chromium,`/opt/pw-browsers/chromium`)做「無 console error / 無外部請求」自動檢查 + 人工目視。

## Global Constraints

- **無外部 CDN / 自包含**:所有 CSS/JS/字體/圖皆本地或 inline;可 `file://` 離線開啟;不得有任何跨網域請求(含 Google Fonts)。
- **字體**:僅用 system font stack(內文 `-apple-system, "Segoe UI", "Noto Sans TC", sans-serif`;mono `ui-monospace, "SF Mono", Menlo, monospace`);不 base64 內嵌自訂字體。
- **暗色 token(精確值)**:`--bg:#0B0E14` `--surface:#141922` `--surface-raised:#1B2130` `--text:#F2F5FA` `--text-dim:#A7B0C0` `--accent:#4C9AFF`。
- **字級**:base 18px;內文 17–19px;行高 1.6;h1 36–40 / h2 28–30 / h3 22px。
- **密度變體**:`--control-h-touch:52px`(mobile,觸控 ≥48px)、`--control-h-dense:36px`(admin)。
- **無障礙**:`:focus-visible` 焦點環;狀態不只靠色(附文字/icon);ARIA landmark;主/次文字達 WCAG AAA、accent/語意色僅承諾 AA;尊重 `prefers-reduced-motion`。
- **批次上限**:push ≤500、upsert_many / import-from-addr ≤50 —— 標註於對應畫面,假資料不超限。
- **PII 三欄**:`id_number`/`payee_id_number`/`internal_notes`,以「欄位是否存在」呈現(`"id_number" in case`)。
- **admin 桌面 only**;mobile 響應式含 iPhone 外框。
- 提交訊息用繁中、清楚;每個 task 完成即 commit。

---

## File Structure

```
mockups/visit-pwa/
  index.html          # 啟動頁(Task 8)
  mobile.html         # 手機原型(Task 6)
  admin.html          # 桌面 admin:非規劃桌(Task 7)+ 規劃桌(Task 9)
  assets/
    tokens.css        # 設計 token + 密度變體(Task 1)
    components.css     # 共用元件(Task 5)
    mock-data.js       # 假資料 + field-catalog(Task 2)
    persona.js         # persona 狀態機(Task 3)
    prototype.js       # hash 路由 + 外框 + 轉場(Task 4)
  README.md            # 使用說明 + 與後端差異註記(Task 8 併入)
```

**共用可變檔(mock-data.js / components.css / tokens.css)在 Phase 0 一次定義齊全並凍結介面契約**,Phase 1 三軌才不會互相踩踏(對抗 review Major-6)。

---

## 共用介面契約(Phase 0 產出,Phase 1+ 消費 —— 所有 task 以此為準)

**`mock-data.js`(ES module)export:**
```js
export const FIELD_CATALOG;   // Array<{key,label,type,pii?:boolean,group}> 共 38 欄
export const EVENTS;          // Array<{id,slug,name,status:'active'|'closing'|'closed',openSupport:boolean,county,driveConfigured:boolean}>
export const EVENT_CONFIG;    // {slug: {enabledFields:string[], routes:[{id,label,color}], districts, teams:[{id,label,bypass}], options}}
export const CASES;           // Array<{id,caseNo,eventSlug,route,district,village,neighborhood,address,name,lat,lng,geocodeSource:'auto'|'manual'|null,syncState:'synced'|'pending'|'rejected',rejectReason?:string, ...catalogFields}> (PII 欄位一律存在於資料源,由 persona 層決定是否露出)
export const PHOTOS;          // Array<{id,caseId,eventSlug,title,takenAt,uploadStatus:'pending'|'uploading'|'uploaded'}>
export const MEMBERS;         // Array<{email,name,team,availableRoutes:string[],role:'member'|'viewer',isEventAdmin:boolean}>
export const DIRECTORY;       // {volunteer:[],staff:[],advisor:[]} 挑人器分頁名冊
export const ADDR_POINTS;     // Array<{addrKey,district,village,neighborhood,displayAddress,lat,lng}> 規劃桌門牌點
export const ADDR_REGIONS;    // 縣市→行政區→村里→鄰 階層樹
export const ORG_TREE;        // 合心/和氣兩層樹 + staff_depts 字典
export const IMPORT_DRYRUN;   // {fileHash, rows:[{action:'insert'|'update'|'error', data, error?}]}
```

**`persona.js`(ES module)export:**
```js
export const PERSONAS;        // Array<{id,label,bypass,role,adminSignal:{isAdmin,eventAdminSlugs,hexinAdminOf,deptAdminOf},backendDivergence?:string}> 共 7 個
export function getPersona();  // 讀 sessionStorage,回目前 persona 物件(預設第 1 個)
export function setPersona(id);// 寫 sessionStorage + dispatch window CustomEvent('personachange',{detail:persona})
export function onPersonaChange(cb); // 註冊監聽,回 unsubscribe
// 能力衍生 helper(畫面用,集中授權邏輯):
export function canSeePII(persona);        // #1,#2(標 divergence),#5,#6,#7 => true;#3 viewer => false
export function canSeePhotos(persona);     // viewer => false;其餘 true
export function canPush(persona);          // viewer => false(readonly);revoked => false
export function visibleCases(persona, cases, eventSlug); // 依 bypass/route 篩;#2 非bypass 只留 route∈availableRoutes
export function adminScope(persona);       // 回 {events:boolean, planningDesk:boolean, org:boolean, createEvent:boolean} 分層
export function stripPII(caseObj, persona);// canSeePII=false 時 delete 三個 PII key(回新物件,模擬 wire 上 key 不存在)
export function mountPersonaSwitcher(el);  // 在指定容器掛浮動切換器 UI
```

**`prototype.js`(ES module)export:**
```js
export function initRouter(routes); // routes: {'#/hash': (params)=>void};監聽 hashchange;預設導到第一個
export function navigate(hash);      // 程式化跳轉
export function mountPhoneFrame(el); // 包 iPhone 外框(mobile.html 用)
export function mountBrowserFrame(el);// 包瀏覽器視窗 chrome(admin.html 用)
export function screenTransition(fromEl, toEl); // 滑入/淡入(尊重 reduced-motion)
```

**PERSONAS 明細(id / bypass / role / adminSignal / divergence):**
1. `office` bypass=T role=member — 全 false admin — 基準線
2. `visitor` bypass=F role=member availableRoutes=['A','B'] — **backendDivergence:'非bypass 但可見PII,現行後端做不到,代表後端缺口'**
3. `advisor` bypass=F role=viewer — PII 拔除 + 無照片 + readonly
4. `revoked` — 403 revoked 清空
5. `hexin` bypass=F role=member adminSignal.hexinAdminOf=[10] — 組織平面
6. `eventAdmin` bypass=T role=member adminSignal.eventAdminSlugs=['flood-2026'] — Admin 平面
7. `sysAdmin` bypass=T role=member adminSignal.isAdmin=true — 全域 + 組織

---

## Phase 0 — 基底契約(序列,先行)

### Task 1: tokens.css — 設計 token + 密度變體

**Files:** Create `mockups/visit-pwa/assets/tokens.css`

**Interfaces:** Produces:所有 CSS custom properties(見 Global Constraints);selectors 掛在 `:root`,密度變體用 `[data-density="dense"]` override。

- [ ] **Step 1:** 建 `:root` 定義全部色彩/字級/間距/圓角/陰影/動效時長 token,數值取自 Global Constraints。加 `--font-sans` `--font-mono` stack。加語意色 `--info/--success/--warning/--danger/--muted`(挑對 surface 對比 ≥4.5 的色)。加路線色票 `--route-a`…`--route-e`(HSL 穩定色相)。
- [ ] **Step 2:** 加密度變體:`--control-h:var(--control-h-touch)` 於 `:root`;`[data-density="dense"]{--control-h:var(--control-h-dense)}`。
- [ ] **Step 3:** 加 `@media (prefers-reduced-motion: reduce){ *{animation-duration:.01ms!important;transition-duration:.01ms!important} }`。加 `:focus-visible` 全域焦點環樣式。
- [ ] **Step 4(驗證):** 開一個臨時 HTML 引入 tokens.css,用 Playwright 讀 `getComputedStyle(document.documentElement).getPropertyValue('--bg')` 應為 `#0B0E14`;切 `data-density="dense"` 後 `--control-h` 應為 36px。無 console error。
- [ ] **Step 5:** Commit `mockup: 加 tokens.css 設計 token 與密度變體`。

### Task 2: mock-data.js — 完整假資料

**Files:** Create `mockups/visit-pwa/assets/mock-data.js`

**Interfaces:** Produces:契約中所有 export。

- [ ] **Step 1:** 定義 `FIELD_CATALOG` 38 欄(依 backend spec §7:route/district/village/neighborhood/address/name/visitDate/damage/relief/idNumber/payeeIdNumber/internalNotes… 補足到 38),每欄 `{key,label,type:'text'|'number'|'date'|'select'|'textarea',pii:boolean,group}`,PII 三欄 `pii:true`。
- [ ] **Step 2:** 定義 `EVENTS`(3–4 筆,含 active/closing/closed 與一筆 `openSupport:true`、一筆 `driveConfigured:false`)、`EVENT_CONFIG`(至少 `flood-2026`:enabledFields 取 catalog 子集、routes A–D 帶 color、teams 含 office bypass + 兩訪視隊、districts)。
- [ ] **Step 3:** 定義 `CASES`(~24 筆跨 route A–D,含 PII 欄位值、`geocodeSource` 三態、`syncState` 三態含一筆 rejected+reason)、`PHOTOS`(~6 筆 uploadStatus 各態)。
- [ ] **Step 4:** 定義 `MEMBERS`(~10 筆各 team/role)、`DIRECTORY`(三類各數筆)、`ADDR_POINTS`(某村里 2–3 鄰 × 每鄰 8–12 門牌,足以驗規劃桌密度)、`ADDR_REGIONS` 樹、`ORG_TREE`、`IMPORT_DRYRUN`(insert/update/error 各數列)。
- [ ] **Step 5(驗證):** Playwright `import` 此 module,`assert FIELD_CATALOG.length===38`、`CASES.every(c=>'idNumber' in c)`、`ADDR_POINTS.length>=16`。無錯。
- [ ] **Step 6:** Commit `mockup: 加 mock-data.js 完整假資料與 field-catalog`。

### Task 3: persona.js — 7 persona 狀態機 + 能力衍生

**Files:** Create `mockups/visit-pwa/assets/persona.js`

**Interfaces:** Consumes:無(純邏輯 + DOM);Produces:契約中 persona.js 全部 export。

- [ ] **Step 1:** 定義 `PERSONAS` 7 筆(明細如上,#2 帶 `backendDivergence` 字串)。實作 `getPersona/setPersona/onPersonaChange`(sessionStorage key `visit-persona`,`setPersona` dispatch `personachange`)。
- [ ] **Step 2:** 實作能力衍生:`canSeePII`(#3 false,其餘 true)、`canSeePhotos`(viewer false)、`canPush`(viewer/revoked false)、`stripPII`(false 時 `delete` 三 key 回新物件)、`visibleCases`(bypass→全部;非bypass member→route∈availableRoutes;viewer→比照 member 篩但由畫面另擋 photo)、`adminScope`(sysAdmin 全 true;eventAdmin events+planningDesk+createEvent(限自己事件);hexin createEvent+org(自己合心)但 planningDesk false;其餘全 false)。
- [ ] **Step 3:** 實作 `mountPersonaSwitcher(el)`:浮動控制,列 7 persona,點選 `setPersona`,顯示目前 persona 標籤 + #2 的 divergence 註記 badge。鍵盤可操作、ARIA。
- [ ] **Step 4(驗證):** Playwright:`setPersona('advisor')` 後 `canSeePII` 回 false、`stripPII(case)` 結果 `!('idNumber' in r)`;`setPersona('visitor')` 後 `visibleCases` 只含 route A/B。監聽器收到事件。
- [ ] **Step 5:** Commit `mockup: 加 persona.js 七身分狀態機與授權衍生`。

### Task 4: prototype.js — 路由 + 外框 + 轉場

**Files:** Create `mockups/visit-pwa/assets/prototype.js`

**Interfaces:** Produces:契約中 prototype.js 全部 export。

- [ ] **Step 1:** 實作 `initRouter(routes)`:解析 `location.hash`(支援 `#/case/:id` 參數擷取),`hashchange` 時找對應 handler 呼叫;無 match 導第一個。`navigate(hash)` 設 `location.hash`。
- [ ] **Step 2:** 實作 `mountPhoneFrame(el)`(CSS iPhone 殼:圓角、瀏海、狀態列)、`mountBrowserFrame(el)`(視窗 chrome:紅黃綠燈、網址列),純結構 + class,樣式進 components.css。
- [ ] **Step 3:** 實作 `screenTransition(fromEl,toEl)`:淡入/滑入,讀 `matchMedia('(prefers-reduced-motion: reduce)')` 時直接切換無動畫。
- [ ] **Step 4(驗證):** Playwright:載入含兩個 route 的臨時頁,`navigate('#/b')` 後正確畫面顯示;參數路由 `#/case/7` 取到 id=7。
- [ ] **Step 5:** Commit `mockup: 加 prototype.js 路由與裝置外框`。

### Task 5: components.css — 共用元件

**Files:** Create `mockups/visit-pwa/assets/components.css`

**Interfaces:** Consumes:tokens.css 變數;Produces:class 契約 `.card .btn .btn-primary .badge .badge--{info,success,warning,danger,muted} .field .route-chip .phone-frame .browser-frame .persona-switcher .sync-bar .banner`。

- [ ] **Step 1:** 實作卡片(surface-raised + border-gradient + beautiful-shadow)、按鈕(primary/ghost,高 `--control-h`,disabled 態)、狀態徽章(語意色 + 文字 label)、表單控制項(label + input,高 `--control-h`)、route-chip(路線色票)。
- [ ] **Step 2:** 實作 `.phone-frame`/`.browser-frame` 外框樣式、`.persona-switcher` 浮動樣式、`.sync-bar`/`.banner`(離線/唯讀/revoked)。
- [ ] **Step 3:** 實作玻璃邊緣(pseudo-element mask)、`.container-line` 引導線點綴。
- [ ] **Step 4(驗證):** Playwright 開含各元件的臨時頁,截圖目視;檢查 `.btn` 高度 = computed `--control-h`;無外部請求(攔截 network,應為 0 跨網域)。
- [ ] **Step 5:** Commit `mockup: 加 components.css 共用元件樣式`。

---

## Phase 1 — 平行實作(Phase 0 凍結後,三軌可平行)

### Task 6: mobile.html — 手機原型六畫面 + 狀態

**Files:** Create `mockups/visit-pwa/mobile.html`

**Interfaces:** Consumes:全部基底 export。

- [ ] **Step 1:** HTML 骨架:引入 tokens/components css + module script;`mountPhoneFrame` + `mountPersonaSwitcher`;定義六個 `.screen` 容器與 `initRouter` 對應。
- [ ] **Step 2:** `#/whoami`:email + 四維 admin 訊號矩陣(依 `adminScope`/persona.adminSignal 顯示);`#/events`:`EVENTS` 卡含 status 徽章、team、bypass、role、openSupport 標記。
- [ ] **Step 3:** `#/cases`:頂 `.sync-bar`(載入第 N 頁 / 同步中 / 離線佇列 N / 已同步);用 `visibleCases(persona,CASES,slug)` 篩;案件卡含 caseNo(mono)、route-chip、地址、定位態;佇列三態(synced/pending/rejected+reason)分區。
- [ ] **Step 4:** `#/case/:id`:用 `FIELD_CATALOG`+enabledFields 動態生成表單;`stripPII` 依 persona 決定 PII 欄位出現與否(viewer 顯示「欄位不可見」說明);地址欄含 lookup 預覽 + suggest 自動完成 + villages 下拉(靜態示意);manual 定位態顯「重新定位」;viewer 全欄 disabled + 儲存灰;含逐欄 LWW 衝突示意區塊 + member push 非自己路線→403 permission 提示。
- [ ] **Step 5:** `#/case/:id/photo`:兩段式流程說明(先 push metadata→POST)、上傳狀態機、`driveConfigured:false` 事件顯示 reactive 409 停用態、縮圖預覽。`#/map`:CSS 假圖磚 + 門牌點 + 手動釘選示意 + 0-byte 503 產製中態。
- [ ] **Step 6:** 狀態:viewer 唯讀橫幅;revoked 全螢幕清空遮罩;full_resync —— 監聽 `personachange`,若新舊 persona 的 team/route 不同則播「偵測變動→清空→cursor 歸零→resync=1 重拉」動效(與 revoked 區分)。
- [ ] **Step 7(驗證):** Playwright:逐一 `navigate` 六畫面截圖;切 advisor→PII 欄位消失、儲存 disabled;切 visitor→cases 只剩 route A/B;切 revoked→遮罩出現;全程 0 console error、0 跨網域請求。
- [ ] **Step 8:** Commit `mockup: 加 mobile.html 手機原型六畫面與權限同步狀態`。

### Task 7: admin.html(非規劃桌)— 儀表板 + 名冊 + 匯入匯出

**Files:** Create `mockups/visit-pwa/admin.html`

**Interfaces:** Consumes:全部基底 export。Produces:`admin.html` 需預留規劃桌 tab 掛載點(Task 9 填入),導覽契約 `data-admin-tab="{events|members|import|planning}"`。

- [ ] **Step 1:** HTML 骨架:`mountBrowserFrame` + `data-density="dense"` + `mountPersonaSwitcher`;側邊/頂部四 tab;依 `adminScope(persona)` 分層:無權 persona 顯「無管理權限」擋頁,hexin 只開 events(建事件)、eventAdmin 開 events+planning(限自己事件)、sysAdmin 全開。
- [ ] **Step 2:** 事件管理 tab:`EVENTS` 清單卡;點入顯 `EVENT_CONFIG` 完整;建事件表單(owner_options 合心選單);status 控制:只 sysAdmin 可見,按鈕依轉換規則(active→closing、closing→{closed,active})disable 非法項。
- [ ] **Step 3:** 成員 tab:`MEMBERS` dense 表格(隊伍/路線/role/事件管理員);挑人器 modal(`DIRECTORY` volunteer/staff/advisor 分頁);停權/復權(自己 disabled);批次新增標 ≤50。
- [ ] **Step 4:** 匯入匯出 tab:`IMPORT_DRYRUN` 預覽表(insert/update/error 分色 + 文字)→ commit(fileHash 一致提示);範本下載鈕;匯出鈕標「PII 僅 bypass 可見」。
- [ ] **Step 5(驗證):** Playwright(桌面 1440 寬):切 sysAdmin 四 tab 皆可達並截圖;切 office→擋頁;切 hexin→只 events tab 可用;status 非法轉換鈕為 disabled;0 console error / 0 跨網域。
- [ ] **Step 6:** Commit `mockup: 加 admin.html 事件/成員/匯入匯出三區`。

### Task 8: index.html + README — 啟動頁與說明

**Files:** Create `mockups/visit-pwa/index.html`、`mockups/visit-pwa/README.md`

**Interfaces:** Consumes:tokens/components css;連結 mobile.html / admin.html。

- [ ] **Step 1:** index.html:hero + 三入口卡(index 說明、mobile、admin)、persona 機制說明、設計理念(暗色大字無障礙 + 有設計感)、三層授權平面圖示。
- [ ] **Step 2:** README.md:如何開啟(file://)、七 persona 對照表、**與現行 backend 的差異註記**(訪視志工 PII 缺口)、畫面清單、驗收清單連結。
- [ ] **Step 3(驗證):** Playwright 開 index,點三入口連結可達;0 console error / 0 跨網域。
- [ ] **Step 4:** Commit `mockup: 加 index.html 啟動頁與 README`。

---

## Phase 2 — 規劃桌(最高風險,獨立)

### Task 9: admin.html 規劃桌 tab — 三欄工作區

**Files:** Modify `mockups/visit-pwa/admin.html`(填入 planning tab)

**Interfaces:** Consumes:`ADDR_POINTS/ADDR_REGIONS/EVENT_CONFIG.routes/MEMBERS`;掛在 Task 7 的 `data-admin-tab="planning"`。

- [ ] **Step 1:** 三欄 layout(左 320 / 中 flex / 右 360,1440 及 1280 皆須不溢出);dense 密度。
- [ ] **Step 2:** 左欄:`ADDR_REGIONS` 行政區/村里/鄰階層樹,縮排密度分級,節點多時容器內捲(虛擬滾動可後補,先確保捲動不撐版)。
- [ ] **Step 3:** 中欄:CSS 假地圖 + `ADDR_POINTS` 標記(route 色票),可框選(拖曳矩形選多點),框選後顯「import-from-addr 批次建案(≤50)」動作列;點單點顯手動釘選(`PATCH coords` 示意,設 manual)。
- [ ] **Step 4:** 右欄:選取案件的批次改路線(`routes/assign`,route 下拉用色票)+ 成員路線授權(memberRouteGrants)+ 新增路線輸入。
- [ ] **Step 5(驗證):** Playwright 1440 與 1280 寬各截圖,確認三欄無水平溢出、階層樹可捲、框選出現批次列;0 console error。
- [ ] **Step 6:** Commit `mockup: 加規劃桌三欄工作區(框選批次建案+改路線授權)`。

---

## Phase 3 — impeccable 視覺收斂(每原型一次)

### Task 10: impeccable 收視覺

**Files:** Modify mobile.html / admin.html / index.html + css

- [ ] **Step 1:** 對 mobile、admin、index 各跑一次 impeccable,聚焦:層次(表面/浮卡/玻璃邊)、字體節奏(mono vs 內文、標題字重)、有意義動效、路線色票一致性、間距節奏。不得犧牲對比/大字/可鍵盤操作。
- [ ] **Step 2(驗證):** Playwright 全畫面截圖回歸目視;重跑 Task 6/7/9 的無障礙檢查確認未退步(對比、focus 環、reduced-motion、0 跨網域)。
- [ ] **Step 3:** Commit `mockup: impeccable 視覺收斂`。

---

## Self-Review(對照 spec)

**Spec coverage:** 7 persona(Task 3)✓;三層授權(Task 3 adminScope + Task 6/7)✓;mobile 六畫面 + 狀態(Task 6)✓;full_resync 獨立 revoked(Task 6 Step 6)✓;push rejected/LWW(Task 6 Step 3/4)✓;admin 四區(Task 7+9)✓;規劃桌 coords/import-from-addr(Task 9)✓;38 欄動態(Task 6 Step 4 + Task 2)✓;地址三 API(Task 6 Step 4)✓;密度變體(Task 1 + Task 7/9)✓;字體策略(Global Constraints + Task 1)✓;WCAG accent AA(Task 1 + Global)✓;批次上限(Task 2/6/7)✓;訪視志工後端缺口註記(Task 3 + Task 8 README)✓;無 CDN 自包含(每 task 驗證步驟)✓。

**Placeholder scan:** 無 TBD;每 task 有具體檔案/export/驗證。虛擬滾動標為「可後補」但先確保捲動不撐版 —— 為明確降級決策,非 placeholder。

**Type consistency:** 介面契約集中定義,persona.js 的 `visibleCases/stripPII/adminScope` 與 Task 6/7 用法一致;`data-admin-tab` 契約 Task 7 定義、Task 9 消費一致;`syncState` 三態命名 mock-data 與 mobile 一致。
