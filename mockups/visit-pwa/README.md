# 家訪 PWA 原型(visit-pwa）

依 backend API spec 製作的**可點擊原型 mockup**,情境為台灣慈善團體「花蓮光復堰塞湖溢流」風災後家訪
（主事件 slug：`flood-2026`）。目的是讓設計與工程團隊在寫真正的後端 / 前端之前，先用假資料走查
每個角色（persona）實際會看到的畫面差異，並標記出目前後端做不到、需要另外評估的能力缺口。

## 這是什麼

- 純前端、無 build、無 CDN 的靜態原型，全部用傳統 `<script>`（非 ES module）載入。
- 三層授權模型的可視化 + 可互動走查：資料平面（bypass / route / viewer）、Admin 平面（D12 事件管理員 vs 系統管理員）、組織平面（D13 合心 / 處室管理員）。
- 暗色、大字、無障礙的視覺基線（見 `assets/tokens.css`、`assets/components.css`）。
- 假資料由 `assets/mock-data.js` 決定性產生（固定亂數種子），每次開啟畫面內容一致，方便截圖比對。

## 如何開啟

直接用瀏覽器開啟 `index.html` 即可，`file://` 協議也能正常運作，**不需要啟動任何 server**。
因為所有 JS 都用傳統 `<script src="...">` 載入（不是 `type="module"`），瀏覽器不會套用 module 的
same-origin / CORS 限制，`file://` 下也能正常讀取 `assets/*.js`。

```
open mockups/visit-pwa/index.html        # macOS
xdg-open mockups/visit-pwa/index.html    # Linux
```

從啟動頁可以連到：

- `index.html` —— 本頁，說明 + persona 對照 + 三層授權平面圖
- `mobile.html` —— 手機端原型
- `admin.html` —— 桌面 Admin 原型（桌面 only）

## 七 Persona 對照表

| id | 中文 | bypass | role | 看得到什麼 | 展示的機制 |
|---|---|---|---|---|---|
| `office` | 行政組 | ✅ | member | 整個活動（A–D 全路線）的所有案件，含 PII | bypass 略過路線限制 |
| `visitor` | 訪視志工 | ❌ | member | 只看自己路線（A、B），但**可見 PII** | ⚠️ 與現行後端不同的預期行為，見下方差異註記 |
| `advisor` | 指導師父 | ❌ | viewer | 只看自己路線（A、B），PII 被拔除 | role = viewer 一律拔除 PII（現行後端行為） |
| `revoked` | 被停權 | ❌ | member（已停權） | 看不到任何案件 | 帳號停權後資料平面歸零 |
| `orgAdmin` | 合心/處室管理員 | ❌ | member | 自己路線（C），另有組織平面權限 | D13 組織平面：hexinAdminOf / deptAdminOf，可建立新事件 |
| `eventAdmin` | 事件管理員 | ✅ | member | 整個活動，另有單一事件的 Admin 權限 | D12 Admin 平面：eventAdminSlugs 指定事件的成員 / 匯入匯出 / 規劃桌 |
| `sysAdmin` | 系統管理員 | ✅ | member | 整個活動，另有全站 Admin + 組織權限 | D12 Admin 平面：isAdmin = true，所有事件與組織都能管 |

Persona 可在 `mobile.html` / `admin.html` 右下角的 persona 切換器即時切換（存在 `sessionStorage`），
單一事實來源在 `assets/persona.js` 的 `PERSONAS` 陣列。

## 與現行 backend 的差異註記

訪視志工（`visitor`）在此原型中是「**只看自己路線 + 可見 PII**」——路線受資料平面限制，
但完整個案資料（含身分證字號等 PII 欄位）仍可見。

**這在現行後端做不到**：現行後端的規則是「非 bypass 身分一律拔除 PII」，路線限制與 PII
拔除是綁在一起的、不能分開設定。此原型刻意呈現這個落差，代表一個**後端能力缺口**——
如果產品需求真的是「訪視員只能看自己負責的案件，但看得到完整資料以便執行家訪」，
現行後端需要新增一種「路線受限但不拔 PII」的授權組合。

現行後端「PII 被拔除」的既有行為，由 `advisor`（viewer）persona 對照展示：同樣只看自己路線，
但 PII 欄位（`idNumber`、`payeeIdNumber`、`internalNotes`）會被移除。

## 畫面清單

**mobile.html**（手機原型）
- whoami（目前身分 / 團隊 / 可見路線）
- events（事件列表）
- cases（個案列表，依路線與可見性過濾）
- case 詳情（欄位依 persona 顯示 / 隱藏 PII）
- photo（照片上傳，含 uploaded / pending / uploading 三態）
- map（規劃桌地圖檢視）
- 狀態展示：viewer、revoked、full_resync 等同步 / 權限狀態

**admin.html**（桌面 Admin 原型，桌面 only）
- 事件管理
- 成員管理
- 匯入匯出（含 dry-run 的 insert / update / error 結果）
- 規劃桌
- 組織管理（合心 / 互愛 / 處室）

## 視覺與技術基線

暗色、大字、無障礙是視覺基準；純前端、無 build、無 CDN；所有內容皆為假資料，不含任何真實個資。
