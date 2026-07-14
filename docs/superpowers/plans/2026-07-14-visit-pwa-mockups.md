# 家訪 PWA 可點擊原型 Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依 backend spec 產出三個自包含、可點擊的暗色/大字/無障礙 PWA 原型(index + mobile + desktop admin),用 persona switcher 展示三層授權模型。

**Architecture:** Phase 0 先凍結共用基底(tokens/components CSS + persona/prototype/mock-data JS,以**全域命名空間**暴露介面);Phase 1 實作 mobile(拆 6a/6b/6c)、admin 非規劃桌、index;Phase 2 規劃桌 + 組織樹;Phase 3 impeccable 收視覺。純前端、無建置。

**Tech Stack:** Vanilla HTML/CSS + **傳統 `<script src>`(非 ES module)**、CSS custom properties、hashchange 路由、sessionStorage、`CustomEvent`。驗證用 Playwright(env 內建 Chromium)。

**執行模型:** subagent-driven,**序列**執行(每 task 一個 fresh subagent,review 後接下一個)。Phase 1 各 task 邏輯獨立、但**序列執行於同一 worktree**,不做平行 worktree(避免同檔衝突)。

## Global Constraints

- **交付與載入方式(Blocker 修正,務必遵守)**:**不得使用 ES module / `import` / `type="module"`**。所有共用 JS 以傳統 `<script src="assets/xxx.js"></script>` 依相依順序載入,各自掛到全域命名空間(`window.VisitMock` / `window.VisitPersona` / `window.VisitProto`)。理由:Chromium 對 `file://` 的 ES module import 施加 CORS(origin=null)會整個載入失敗;傳統 script 不受此限,才能達成「`file://` 離線開啟、零 console error」。
- **驗證方式**:Playwright 一律用**與交付相同的 `file://` 路徑**開啟頁面跑驗證(不得用 http server,否則測不到 file:// 的真實行為)。Phase 0 純 CSS/JS 用 Playwright `page.setContent()` 或寫在 **scratchpad** 的臨時 HTML(**不得 commit 進 `mockups/`**)。
- **無外部 CDN / 自包含**:所有 CSS/JS/字體/圖皆本地或 inline;不得有任何跨網域請求(含 Google Fonts)。
- **字體**:僅用 system font stack(內文 `-apple-system, "Segoe UI", "Noto Sans TC", sans-serif`;mono `ui-monospace, "SF Mono", Menlo, monospace`);不 base64 內嵌自訂字體。
- **暗色 token(精確值)**:`--bg:#0B0E14` `--surface:#141922` `--surface-raised:#1B2130` `--text:#F2F5FA` `--text-dim:#A7B0C0` `--accent:#4C9AFF`。
- **字級**:base 18px;內文 17–19px;行高 1.6;h1 36–40 / h2 28–30 / h3 22px。
- **密度變體**:`--control-h-touch:52px`(mobile,觸控 ≥48px)、`--control-h-dense:36px`(admin)。
- **無障礙**:`:focus-visible` 焦點環;狀態不只靠色(附文字/icon);ARIA landmark;主/次文字達 WCAG AAA、accent/語意色僅承諾 AA;尊重 `prefers-reduced-motion`。
- **批次上限**:push ≤500、upsert_many / import-from-addr ≤50 —— 標註於對應畫面,假資料不超限。
- **PII 三欄**:`idNumber`/`payeeIdNumber`/`internalNotes`,以「欄位是否存在」呈現(`"idNumber" in case`)。
- **admin 桌面 only**;mobile 響應式含 iPhone 外框。
- 提交訊息用繁中、清楚;每個 task 完成即 commit。

---

## File Structure

```
mockups/visit-pwa/
  index.html          # 啟動頁(Task 8)
  mobile.html         # 手機原型(Task 6a/6b/6c)
  admin.html          # 桌面 admin:非規劃桌(Task 7)+ 規劃桌(Task 9)+ 組織(Task 10)
  assets/
    tokens.css        # 設計 token + 密度變體(Task 1)
    components.css     # 共用元件(Task 5)
    mock-data.js       # 假資料 + field-catalog → window.VisitMock(Task 2)
    persona.js         # persona 狀態機 → window.VisitPersona(Task 3)
    prototype.js       # 路由 + 外框 + 轉場 → window.VisitProto(Task 4)
  README.md            # 使用說明 + 與後端差異註記(Task 8)
```

**載入順序(所有 HTML 一致)**:`tokens.css` → `components.css`(head);`mock-data.js` → `persona.js` → `prototype.js` → 頁面 inline `<script>`(body 末,非 module)。

---

## 共用介面契約(Phase 0 產出,後續消費 —— 唯一事實來源)

### `window.VisitMock`(mock-data.js)
```js
window.VisitMock = {
  FIELD_CATALOG,  // 見下方「Field Catalog(示意)」表,Array<{key,label,type,pii,group}>
  EVENTS,         // Array<{id,slug,name,status:'active'|'closing'|'closed',openSupport:boolean,county,driveConfigured:boolean}>
  EVENT_CONFIG,   // {slug:{enabledFields:string[],routes:[{id,label,color}],districts,teams:[{id,label,bypass}],options}}
  CASES,          // Array<{id,caseNo,eventSlug,route,...catalogFields(含PII值),lat,lng,geocodeSource:'auto'|'manual'|null,syncState:'synced'|'pending'|'rejected',rejectReason?}>
  PHOTOS,         // Array<{id,caseId,eventSlug,title,takenAt,uploadStatus:'pending'|'uploading'|'uploaded'}>
  MEMBERS,        // Array<{email,name,team,availableRoutes:string[],role:'member'|'viewer',isEventAdmin:boolean}>
  DIRECTORY,      // {volunteer:[],staff:[],advisor:[]}
  ADDR_POINTS,    // Array<{addrKey,district,village,neighborhood,displayAddress,lat,lng}>
  ADDR_REGIONS,   // 縣市→行政區→村里→鄰 階層樹
  ORG_TREE,       // {hexin:[{id,name,heqi:[{id,name}]}], depts:[{id,name}]}
  IMPORT_DRYRUN,  // {fileHash, rows:[{action:'insert'|'update'|'error',data,error?}]}
}
```

**Field Catalog(示意、非權威)**:真實權威在 backend `src/domain/field-catalog.ts`(不在本 repo),以下為涵蓋各 type + 三 PII 欄的**示意清單**,Task 2 據此建物件(pii=true 者為 PII 三欄)。分組:
- 基本:`route`(select)、`caseNo`(number,系統)、`visitDate`(date)、`visitor`(text)、`visitStatus`(select)
- 地址:`county`(text)、`district`(select)、`village`(select)、`neighborhood`(select)、`address`(text)、`lat`(number,系統)、`lng`(number,系統)
- 個案:`name`(text)、`gender`(select)、`birthYear`(number)、`phone`(text)、**`idNumber`(text,pii)**、`householdSize`(number)、`relationship`(text)
- 災損:`damageType`(select)、`damageLevel`(select)、`houseType`(select)、`damageDesc`(textarea)、`waterDepth`(number)
- 救助:`reliefType`(select)、`reliefAmount`(number)、`payeeName`(text)、**`payeeIdNumber`(text,pii)**、`bankName`(text)、`bankAccount`(text)、`paymentStatus`(select)
- 訪視:`needs`(textarea)、`followUp`(select)、`referral`(text)、**`internalNotes`(textarea,pii)**、`visitCount`(number)、`lastContact`(date)

(以上 37 欄;可依需要補 1 欄湊 38,或以「涵蓋所有 type + 三 PII 欄且 ≥30 欄」為驗收標準,不以數字硬卡。)

### `window.VisitPersona`(persona.js)
```js
window.VisitPersona = {
  PERSONAS,   // 見下方真值表,每筆 {id,label,bypass,role,revoked,team,availableRoutes,adminSignal:{isAdmin,eventAdminSlugs,hexinAdminOf,deptAdminOf},backendDivergence?}
  getPersona(),            // 讀 sessionStorage('visit-persona'),回 persona 物件(預設 office)
  setPersona(id),          // 寫 sessionStorage + dispatch window CustomEvent('personachange',{detail:{prev,next}})
  onPersonaChange(cb),     // 註冊監聽(cb 收 {prev,next}),回 unsubscribe
  canSeePII(p),            // return p.role!=='viewer' && !p.revoked   (viewer 拔 PII;其餘可見,含 #2 divergence)
  canSeePhotos(p),         // return p.role!=='viewer' && !p.revoked
  canPush(p),              // return p.role!=='viewer' && !p.revoked
  visibleCases(p,cases,slug), // p.revoked→[];p.bypass→全部;否則 route∈p.availableRoutes
  adminScope(p),           // 回真值表列(見下),{manageEvents,createEvent,manageMembers,planningDesk,org}
  stripPII(caseObj,p),     // canSeePII(p)===false 時回刪掉 idNumber/payeeIdNumber/internalNotes 的新物件
  mountPersonaSwitcher(el),// 掛浮動切換器(7 persona,鍵盤可操作,顯示 #2 divergence badge)
}
```

**PERSONAS 真值表(唯一事實來源):**

| id | label | bypass | role | revoked | team | availableRoutes | isAdmin | eventAdminSlugs | hexinAdminOf | deptAdminOf | backendDivergence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| office | 行政組 | T | member | F | office | [A,B,C,D] | F | [] | [] | [] | — |
| visitor | 訪視志工 | F | member | F | teamA | [A,B] | F | [] | [] | [] | **非bypass 但可見PII,現行後端做不到=後端缺口** |
| advisor | 指導師父 | F | viewer | F | teamA | [A,B] | F | [] | [] | [] | — |
| revoked | 被停權 | F | member | T | teamA | [A,B] | F | [] | [] | [] | — |
| orgAdmin | 合心/處室管理員 | F | member | F | teamB | [C] | F | [] | [10] | [3] | — |
| eventAdmin | 事件管理員 | T | member | F | office | [A,B,C,D] | F | ['flood-2026'] | [] | [] | — |
| sysAdmin | 系統管理員 | T | member | F | office | [A,B,C,D] | T | [] | [] | [] | — |

**adminScope 真值表({manageEvents,createEvent,manageMembers,planningDesk,org}):**

| id | manageEvents | createEvent | manageMembers | planningDesk | org |
|---|---|---|---|---|---|
| office/visitor/advisor/revoked | F | F | F | F | F |
| orgAdmin | F | T | F | F | T |
| eventAdmin | T(自己事件) | F | T(自己事件) | T(自己事件) | F |
| sysAdmin | T | T | T | T | T |

(admin.html 無 admin 權者—office/visitor/advisor/revoked—顯示「無管理權限」擋頁。)

### `window.VisitProto`(prototype.js)
```js
window.VisitProto = {
  initRouter(routes),   // routes:{'#/hash':(params)=>void};hashchange 分派;支援 #/case/:id 參數;無 match 導第一個
  navigate(hash),       // location.hash = hash
  mountPhoneFrame(el),  // 包 iPhone 外框
  mountBrowserFrame(el),// 包瀏覽器視窗 chrome
  registerTab(name,fn), // admin tab 註冊(Task 7 定義掛載點,Task 9/10 用此填 planning/org)
  screenTransition(fromEl,toEl), // 轉場,尊重 reduced-motion
}
```

---

## Phase 0 — 基底契約(序列,先行)

### Task 1: tokens.css
**Files:** Create `mockups/visit-pwa/assets/tokens.css`
**Interfaces:** Produces:全部 CSS custom properties(`:root`),密度變體 `[data-density="dense"]`。

- [ ] **Step 1:** `:root` 定義全部色彩/字級/間距/圓角/陰影/動效時長 token(數值取自 Global Constraints)。加 `--font-sans`/`--font-mono`。語意色 `--info/--success/--warning/--danger/--muted`(對 surface 對比 ≥4.5)。路線色票 `--route-a…e`(HSL 穩定色相);另定 `--route-hue-step` 供第 6+ 條循環用。
- [ ] **Step 2:** 密度:`:root{--control-h:var(--control-h-touch)}`;`[data-density="dense"]{--control-h:var(--control-h-dense)}`。
- [ ] **Step 3:** `@media (prefers-reduced-motion: reduce)` 關動畫;`:focus-visible` 全域焦點環。
- [ ] **Step 4(驗證):** Playwright `page.setContent('<div>')` + `addStyleTag({path:tokens.css})`,讀 `getComputedStyle(root).getPropertyValue('--bg')`===`#0B0E14`;設 `data-density=dense` 後 `--control-h`===`36px`。0 console error。
- [ ] **Step 5:** Commit `mockup: 加 tokens.css 設計 token 與密度變體`。

### Task 2: mock-data.js → window.VisitMock
**Files:** Create `mockups/visit-pwa/assets/mock-data.js`(傳統 script,結尾 `window.VisitMock={...}`)
**Interfaces:** Produces:`window.VisitMock` 全部欄位。

- [ ] **Step 1:** 依上方 Field Catalog 表建 `FIELD_CATALOG`(≥30 欄,含各 type + 三 PII 欄 `pii:true`)。
- [ ] **Step 2:** `EVENTS`(含 active/closing/closed + 一筆 openSupport + 一筆 driveConfigured:false)、`EVENT_CONFIG.flood-2026`(enabledFields 子集、routes A–D 帶 color、teams office(bypass)+teamA/teamB、districts)。
- [ ] **Step 3:** `CASES`(~24 筆跨 route A–D,PII 欄有值、geocodeSource 三態、syncState 三態含一筆 rejected+rejectReason)、`PHOTOS`(~6 筆各 uploadStatus)。
- [ ] **Step 4:** `MEMBERS`(~10 各 team/role)、`DIRECTORY`(三類各數筆)、`ADDR_POINTS`(某村里 2–3 鄰 × 每鄰 8–12 門牌,≥16 筆)、`ADDR_REGIONS` 樹、`ORG_TREE`(hexin id=10 含 heqi、depts id=3)、`IMPORT_DRYRUN`(insert/update/error 各數列)。掛 `window.VisitMock`。
- [ ] **Step 5(驗證):** Playwright file:// 開臨時頁(scratchpad)`<script src=mock-data.js>`,斷言 `VisitMock.FIELD_CATALOG.length>=30`、三 PII key 都在某 case、`VisitMock.ADDR_POINTS.length>=16`、`VisitMock.ORG_TREE.hexin.length>=1`。0 error。
- [ ] **Step 6:** Commit `mockup: 加 mock-data.js 假資料與 field-catalog`。

### Task 3: persona.js → window.VisitPersona
**Files:** Create `mockups/visit-pwa/assets/persona.js`
**Interfaces:** Consumes:無;Produces:`window.VisitPersona` 全部。

- [ ] **Step 1:** 依 PERSONAS 真值表建 7 persona(欄位齊全:bypass/role/revoked/team/availableRoutes/adminSignal/backendDivergence)。`getPersona/setPersona/onPersonaChange`(setPersona 讀舊值 → 寫 → dispatch `{prev,next}`)。
- [ ] **Step 2:** 依契約實作 `canSeePII/canSeePhotos/canPush/visibleCases/adminScope/stripPII`(邏輯逐字如契約,adminScope 回真值表列)。
- [ ] **Step 3:** `mountPersonaSwitcher(el)`:列 7 persona、點選 setPersona、顯目前 label + #2 divergence badge、鍵盤/ARIA。
- [ ] **Step 4(驗證):** Playwright:`setPersona('advisor')`→`canSeePII`(getPersona())false、`stripPII(case)` 無 idNumber;`setPersona('visitor')`→`visibleCases` 全部 route∈[A,B];`onPersonaChange` 收到 `{prev,next}`。
- [ ] **Step 5:** Commit `mockup: 加 persona.js 七身分狀態機與授權衍生`。

### Task 4: prototype.js → window.VisitProto
**Files:** Create `mockups/visit-pwa/assets/prototype.js`
**Interfaces:** Produces:`window.VisitProto` 全部(含 `registerTab`)。

- [ ] **Step 1:** `initRouter(routes)`(解析 hash + `#/case/:id` 參數,hashchange 分派,無 match 導首個)、`navigate`。
- [ ] **Step 2:** `mountPhoneFrame`/`mountBrowserFrame`(結構+class,樣式在 components.css)。`registerTab(name,fn)`:內部維護 tab 註冊表,供 admin 殼查詢與掛載。
- [ ] **Step 3:** `screenTransition`(reduced-motion 時直接切)。
- [ ] **Step 4(驗證):** Playwright file:// 臨時頁註冊兩 route,`navigate('#/b')` 顯示正確畫面;`#/case/7` 取得 id=7;`registerTab('planning',fn)` 後可取回。
- [ ] **Step 5:** Commit `mockup: 加 prototype.js 路由/外框/tab 註冊`。

### Task 5: components.css
**Files:** Create `mockups/visit-pwa/assets/components.css`
**Interfaces:** Consumes:tokens.css;Produces:class 契約 `.card .btn .btn-primary .btn:disabled .badge .badge--{info,success,warning,danger,muted} .field .route-chip .phone-frame .browser-frame .persona-switcher .sync-bar .banner .admin-tab`。

- [ ] **Step 1:** 卡片(surface-raised+border-gradient+shadow)、按鈕(高 `--control-h`,primary/ghost/disabled)、狀態徽章(語意色+文字 label)、表單控制項(高 `--control-h`)、route-chip(路線色票)。
- [ ] **Step 2:** `.phone-frame`/`.browser-frame`/`.persona-switcher`/`.sync-bar`/`.banner`/`.admin-tab`。
- [ ] **Step 3:** 玻璃邊緣(pseudo mask)、`.container-line` 點綴。
- [ ] **Step 4(驗證):** Playwright file:// 臨時頁含各元件,截圖目視;`.btn` 高 = computed `--control-h`;攔截 network,跨網域請求 0。
- [ ] **Step 5:** Commit `mockup: 加 components.css 共用元件`。

---

## Phase 1 — mobile / admin 非規劃桌 / index(序列執行)

### Task 6a: mobile.html 殼 + whoami + events + cases
**Files:** Create `mockups/visit-pwa/mobile.html`
**Interfaces:** Consumes:全部基底。

- [ ] **Step 1:** HTML 骨架(依載入順序引入 css + 三個 `<script src>` + inline script);`mountPhoneFrame`+`mountPersonaSwitcher`;定義各 `.screen` 容器 + `initRouter`。
- [ ] **Step 2:** `#/whoami`:email + 四維 admin 訊號矩陣(讀 persona.adminSignal 的 isAdmin/eventAdminSlugs/hexinAdminOf/deptAdminOf 四維,orgAdmin persona 讓 hexin+dept 兩維非空)。
- [ ] **Step 3:** `#/events`:`VisitMock.EVENTS` 卡(status 徽章、team、bypass、role、openSupport 標記)。
- [ ] **Step 4:** `#/cases`:頂 `.sync-bar`(載入第 N 頁/同步中/離線佇列 N/已同步);`visibleCases(getPersona(),CASES,slug)` 篩;案件卡(caseNo mono、route-chip、地址、定位態);佇列三態分區(synced/pending/rejected+reason)。監聽 `personachange` 重繪。
- [ ] **Step 5(驗證):** Playwright file://:navigate 三畫面截圖;切 visitor→cases 只剩 route A/B;切 sysAdmin→whoami isAdmin 維顯示;切 orgAdmin→hexin+dept 維非空。0 console error / 0 跨網域。
- [ ] **Step 6:** Commit `mockup: mobile 殼與 whoami/events/cases`。

### Task 6b: mobile.html case 詳情 + photo + map
**Files:** Modify `mockups/visit-pwa/mobile.html`(序列於 6a)
**Interfaces:** Consumes:6a 的殼與 route 定義。

- [ ] **Step 1:** `#/case/:id`:`FIELD_CATALOG`+enabledFields 動態生成表單;`stripPII` 依 persona 決定 PII 欄位出現與否(viewer 顯「欄位不可見」說明);地址欄含 lookup 預覽 + suggest 自動完成 + villages 下拉(靜態示意)。
- [ ] **Step 2:** manual 定位態顯「重新定位」按鈕,並示意 unfreeze 前後狀態(現況:手動釘選鎖住→按下→清空座標→重新供地址 geocode);逐欄 LWW 衝突示意區塊(同 case 兩欄不同人改,按到達序逐欄覆蓋);viewer 全欄 disabled + 儲存灰;member push 非自己路線 → 403 permission 提示。
- [ ] **Step 3:** `#/case/:id/photo`:兩段式說明(先 push metadata→POST)、上傳狀態機、driveConfigured:false 事件顯示 reactive 409 停用態、縮圖。`#/map`:CSS 假圖磚+門牌點+手動釘選+0-byte 503 產製中態。
- [ ] **Step 4(驗證):** Playwright file://:切 advisor→case 表單 PII 欄消失、儲存 disabled;切 office→PII 欄出現;photo/map 截圖。0 error。
- [ ] **Step 5:** Commit `mockup: mobile case 詳情/photo/map`。

### Task 6c: mobile.html 權限/同步狀態機
**Files:** Modify `mockups/visit-pwa/mobile.html`(序列於 6b)

- [ ] **Step 1:** viewer 唯讀橫幅(全 app 頂);revoked 全螢幕清空遮罩(破壞性,永久踢出文案)。
- [ ] **Step 2:** full_resync:監聽 `personachange`,若 `prev.team!==next.team || prev.availableRoutes 變` 則播「偵測成員資料變動→清空本地→cursor 歸零→resync=1 重拉」動效,明確與 revoked 區分(非破壞性復原)。
- [ ] **Step 3(驗證):** Playwright file://:切 revoked→遮罩;office→visitor(team 變)→full_resync 動效;advisor→唯讀橫幅。0 error。
- [ ] **Step 4:** Commit `mockup: mobile 唯讀/revoked/full_resync 狀態`。

### Task 7: admin.html 殼 + 事件 + 成員 + 匯入匯出
**Files:** Create `mockups/visit-pwa/admin.html`
**Interfaces:** Consumes:全部基底 + `VisitProto.registerTab`。Produces:admin 殼的 tab gating 與掛載點(Task 9/10 用 `registerTab('planning'|'org',fn)` 填入)。

- [ ] **Step 1:** 骨架:`mountBrowserFrame`+`data-density="dense"`+`mountPersonaSwitcher`;側/頂 tab;依 `adminScope(getPersona())` 分層 gating(無權擋頁、orgAdmin 只 createEvent+org、eventAdmin 自己事件、sysAdmin 全開);監聽 `personachange` 重算 gating。
- [ ] **Step 2:** 事件 tab:`EVENTS` 清單→點入顯 `EVENT_CONFIG`;建事件表單(owner_options 合心選單,依 adminScope.createEvent gating);status 控制只 sysAdmin 可見,按鈕依轉換規則(active→closing、closing→{closed,active})disable 非法項。
- [ ] **Step 3:** 成員 tab:`MEMBERS` dense 表格;挑人器 modal(`DIRECTORY` 三分頁);停權/復權(自己 disabled);批次新增標 ≤50。gating 用 adminScope.manageMembers。
- [ ] **Step 4:** 匯入匯出 tab:`IMPORT_DRYRUN` 預覽表(insert/update/error 分色+文字)→commit(fileHash 提示);範本下載;匯出標「PII 僅 bypass 可見」。
- [ ] **Step 5(驗證):** Playwright file:// 1440 寬:sysAdmin 四 tab 可達截圖;office→擋頁;orgAdmin→只事件(建事件)可用、成員/規劃桌不可達;status 非法轉換鈕 disabled。0 error / 0 跨網域。
- [ ] **Step 6:** Commit `mockup: admin 殼與事件/成員/匯入匯出`。

### Task 8: index.html + README
**Files:** Create `mockups/visit-pwa/index.html`、`mockups/visit-pwa/README.md`

- [ ] **Step 1:** index.html:hero + 三入口卡 + persona 機制說明 + 設計理念 + 三層授權平面圖示。
- [ ] **Step 2:** README.md:file:// 開啟說明、七 persona 對照表、**與現行 backend 差異註記**(訪視志工 PII 缺口)、畫面清單。
- [ ] **Step 3(驗證):** Playwright file:// 開 index,點三入口連結可達且**目的頁載入後 0 console error**(斷言目的頁 module/script 正常,非只驗跳轉)。0 跨網域。
- [ ] **Step 4:** Commit `mockup: index 啟動頁與 README`。

---

## Phase 2 — 規劃桌 + 組織(序列,最高風險)

### Task 9: admin.html 規劃桌(序列於 Task 7,同 worktree)
**Files:** Modify `mockups/visit-pwa/admin.html`(用 `VisitProto.registerTab('planning',fn)` 填入,不改 Task 7 既有結構)
**Interfaces:** Consumes:`ADDR_POINTS/ADDR_REGIONS/EVENT_CONFIG.routes/MEMBERS` + Task 7 的 registerTab 掛載點。

- [ ] **Step 1:** 三欄 layout(左 320/中 flex/右 360;1440 與 1280 皆不溢出);dense。
- [ ] **Step 2:** 左欄:`ADDR_REGIONS` 行政區/村里/鄰階層樹,縮排密度分級,節點多時容器內捲(不撐版)。
- [ ] **Step 3:** 中欄:CSS 假地圖+`ADDR_POINTS` 標記(route 色票),拖曳框選多點→顯「import-from-addr 批次建案 ≤50」動作列;單點顯手動釘選(`PATCH coords` 示意,設 manual)。
- [ ] **Step 4:** 右欄:批次改路線(`routes/assign`,route 下拉色票)+ 成員路線授權 + 新增路線輸入。
- [ ] **Step 5(驗證):** Playwright file:// 1440 與 1280 各截圖,三欄無水平溢出、階層樹可捲、框選出現批次列。0 error。
- [ ] **Step 6:** Commit `mockup: 規劃桌三欄工作區`。

### Task 10: admin.html 組織 tab(sysAdmin,序列於 Task 9)
**Files:** Modify `mockups/visit-pwa/admin.html`(`registerTab('org',fn)`)
**Interfaces:** Consumes:`ORG_TREE` + adminScope.org。

- [ ] **Step 1:** org 樹(合心/和氣兩層 + 處室字典)唯讀展示 + CRUD 動作示意(新增/改名/停用,使用中/同名 409 提示)。
- [ ] **Step 2:** 合心/處室管理員任免示意 + 系統管理員切換(`toggle-admin`:自己 disabled、至少留 1 個提示)。僅 sysAdmin 可見(adminScope.org)。
- [ ] **Step 3(驗證):** Playwright file://:sysAdmin→org tab 可達、樹渲染、toggle 自己 disabled;eventAdmin→org tab 不可達。0 error。
- [ ] **Step 4:** Commit `mockup: admin 組織樹與 toggle-admin`。

---

## Phase 3 — impeccable 視覺收斂

### Task 11: impeccable 收視覺
**Files:** Modify mobile.html / admin.html / index.html + css

- [ ] **Step 1:** 對 mobile、admin、index 各跑一次 impeccable,聚焦層次/字體節奏/有意義動效/路線色票一致/間距節奏;不得犧牲對比、大字、鍵盤操作、file:// 相容。
- [ ] **Step 2(驗證):** Playwright file:// 全畫面截圖回歸;重跑 6/7/9/10 的無障礙檢查(對比、focus 環、reduced-motion、0 跨網域、0 console error)確認未退步。
- [ ] **Step 3:** Commit `mockup: impeccable 視覺收斂`。

---

## Self-Review(對照 spec + review 修訂)

**Blocker/Major 修正確認:** file:// × ES module → 改傳統 script + 全域命名空間(Global Constraints + 契約)✓;驗證用同 file://(Global Constraints)✓;38 欄權威 → 寫入示意清單 + 內容驗證(Field Catalog 表 + Task 2 Step 5)✓;persona schema 補 revoked/role/team/availableRoutes、personachange 帶 {prev,next}、adminScope 真值表(契約)✓;admin.html 同檔 → registerTab 掛載 + Task 9/10 序列於 Task 7(Task 7/9/10)✓;org 樹/toggle-admin 補 Task 10 ✓;Task 6 拆 6a/6b/6c ✓;臨時驗證檔進 scratchpad 不 commit(Global Constraints)✓;deptAdminOf 由 orgAdmin persona 觸發(真值表)✓;route 色票循環規則(Task 1 Step 1)✓;index 驗證斷言目的頁 0 error(Task 8 Step 3)✓;unfreeze 前後狀態(Task 6b Step 2)✓;執行模型定序列(Tech Stack 下)✓。

**Spec coverage:** 7 persona ✓;三層授權(adminScope + org tab)✓;mobile 六畫面+狀態 ✓;full_resync 獨立 revoked ✓;push rejected/LWW ✓;admin 事件/成員/匯入匯出/規劃桌/組織 ✓;coords/import-from-addr ✓;38 欄動態 ✓;地址三 API ✓;密度變體 ✓;字體策略 ✓;WCAG accent AA ✓;批次上限 ✓;訪視志工缺口註記 ✓;無 CDN 自包含 ✓。

**Type consistency:** 契約集中定義;persona helper 判斷欄位(role/revoked/team/availableRoutes)已入 schema;`registerTab` 契約 Task 4 定義、Task 7 掛載點、Task 9/10 消費一致;`syncState`/`uploadStatus`/`geocodeSource` 命名 mock-data 與畫面一致。
