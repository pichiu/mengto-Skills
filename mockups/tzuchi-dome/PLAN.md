# 慈濟大巨蛋演繹管理系統 — Mockup 完整規格(Opus 規劃)

> 依 `backend-guide-for-frontend.md` + `domain-model.md` 製作的高保真 mockup 最終規格。
> 一份**響應式 PWA**同時涵蓋手機與瀏覽器(手機優先、桌面漸進增強),含**角色/權限分流**。
> 本檔為結論規格(非流變紀錄)。

---

## 1. 產品定位 & 使用者

- 幕僚/志工用的**營運工具**(product register,非 landing)。工具要「消失在任務裡」。
- 使用者多為**年長志工(菩薩)**——年齡規則(男<60 / 女<50)透露族群偏長者。
- 所以 **深色 + 大字 + 大點擊區** 不是風格,而是無障礙需求。
- 規模:**4 場次**、**19 和氣**、每場 **648 名額** → 總報名 **2,592 人次**、不重複 **1,187 人**(一人可報 1–4 場)。
- 4 場次:`11/12(四) 全區共同場`、`11/13(五) 安平聯區+大橋`、`11/14(六) 佳里聯區`、`11/15(日) 仁德聯區`。

---

## 2. 品牌與色彩(慈濟藍 · 深色)

用 OKLCH。**慈濟藍**是識別核心,不可換成通用科技綠/紫。藍是**訊號色**(主要動作、目前選取、狀態),不做整片裝飾(Restrained / 局部 Committed)。

```css
:root{
  /* 底層:近黑、極淡藍調(hue 255,無純黑純灰) */
  --bg:         oklch(0.17 0.014 255);
  --surface:    oklch(0.213 0.016 255);   /* 面板/卡片 */
  --surface-2:  oklch(0.255 0.018 255);   /* 次按鈕/chip/抬升 */
  --surface-3:  oklch(0.30 0.02 255);     /* hover 抬升/進度軌 */
  --line:       oklch(0.34 0.018 255);    /* 不透明控制邊框 */
  --line-soft:  oklch(1 0 0 / 0.08);      /* 分隔線/卡片邊 */

  /* 文字(高對比,長者可讀,body ≥4.5:1) */
  --ink:   oklch(0.97 0.004 255);   /* 主文字(~17:1) */
  --ink-2: oklch(0.82 0.010 255);   /* 次要 */
  --ink-3: oklch(0.70 0.012 255);   /* 僅 metadata,不做 body */

  /* 慈濟藍 主訊號色 */
  --brand:      oklch(0.68 0.115 245);
  --brand-2:    oklch(0.60 0.12 248);      /* primary hover/pressed */
  --brand-ink:  oklch(0.16 0.02 255);      /* 藍底上的字 */
  --brand-soft: oklch(0.68 0.115 245 / 0.14);
  --focus:      oklch(0.78 0.11 240);      /* :focus-visible 環 */

  /* 語意色(狀態三段) */
  --ok:    oklch(0.74 0.15 155);   /* 已到/成功/共修 */    --ok-soft:    oklch(0.74 0.15 155 / 0.15);
  --warn:  oklch(0.82 0.13 82);    /* 請假/待確認/驗收/滿載 */ --warn-soft:  oklch(0.82 0.13 82 / 0.15);
  --danger:oklch(0.68 0.19 25);    /* 未到/失敗/超載/取消 */   --danger-soft:oklch(0.68 0.19 25 / 0.15);

  /* 服裝標示(直接畫在座位格) */
  --costume-white: oklch(0.90 0.01 255);
  --costume-blue:  oklch(0.66 0.12 245);
}
```

- **The One Blue Rule**:藍只標「當前/啟用/可操作」,占版面 ≤10%。
- 對比:body 用 `--ink`/`--ink-2`;`--ink-3` 只給 metadata。務必自檢 ≥4.5:1。

---

## 3. 字體與級距(大字)

- 家族:`"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif`(**不載外部字型**,CSP 安全 / 自足)。等寬 metadata(座位號 `{列}-{排}`、電話、車牌、時間)用 `ui-monospace, "SF Mono", monospace`。
- **base = 18px**(非 16)。固定 rem 級距,非流體。
- 級距:`0.78rem`(角標/label)、`0.86rem`(mono)、`1rem`=18px(body)、`1.125rem`、`1.375rem`(title)、`1.75rem`、`2.25rem`(headline/大數字)、`2.75rem`(頁面大標)。
- 觸控目標 ≥48px;主要按鈕高 56px;行高 body 1.6。標題 `text-wrap: balance`。
- **不用**全大寫追蹤 eyebrow;層級靠級距與字重。

---

## 4. 版面 / 導覽 / Demo 時鐘

- **手機 (<1024px)**:頂部 app bar(頁名 + 情境 chip + persona 切換器)+ 內容 + **底部分頁**(大圖示+字);safe-area padding。
- **桌面 (≥1024px)**:**左側邊欄**(logo + 導覽項 + 底部使用者/persona 卡)+ 主內容加寬。底部分頁隱藏。同一份 DOM,`@media (min-width:1024px)` 切換。
- z-index 語意層級:dropdown(10) < sticky(20) < backdrop(30) < modal(40) < toast(50) < tooltip(60)。
- **導覽項依 persona 增減**(見 §5),項目數變動時排版仍穩定。
- **Demo 時鐘 `DEMO_NOW`**(`2026-11-09T10:30`):展示用「現在」,讓活動能同時出現「進行中/即將發生/已發生」。UI 標「Demo 時鐘」小字,所有時間比較都用它。

---

## 5. 角色 / 權限模型(Persona 分流)

Mockup 用頂部 **「Demo · 以…身份檢視」切換器**(分「個人 / 幕僚」兩組)切換身份,整個 app 依 `scope / pii / caps / kind` 重繪,並於頂部顯示「檢視範圍」chip(如「大橋和氣 · 聯絡級」)。切換用 150–250ms 淡切。

### 5.1 三軸

- **scope(列級)**:`all`(合心/企劃)| `lianQu`(聯區級,限自己聯區內和氣)| `heQi`(和氣級,限自己和氣)| `self`/`none`(個人)。
- **pii(欄級)**:`full` 全欄(含身分證/生日)| `contact` 姓名+電話+年齡(無 email/身分證/生日)| `self` 本人看自己=full | `none` 僅非 PII(姓名/和氣/場次/座位)。
- **caps(能力)**:決定可執行動作與按鈕顯示(伺服器仍需重驗,UI 隱藏≠權限)。

### 5.2 11 種 Persona

| id | 組 | 名稱 | kind | scope | pii | 主要能力 |
|----|----|------|------|-------|-----|---------|
| `unbound` | 個人 | 未綁定帳號 | personal | none | none | —(僅行事曆+通用座位表) |
| `performer` | 個人 | 入經藏菩薩(已綁定) | personal | self | self | 自我報名/請假/遊覽車登記 |
| `leader` | 個人 | 入經藏菩薩 · 兼車長 | personal | self | contact | 上述 + 車上點名/撥打(交通頁) |
| `heqi-activity` | 幕僚 | 和氣活動 | staff | heQi | contact | manage_events_heqi, take_attendance, bus_assign_rider |
| `lianqu-activity` | 幕僚 | 聯區活動 · 交通 | staff | lianQu | contact | manage_events_lianqu, take_attendance, bus_dispatch_scope, set_bus_leader |
| `hexin-activity` | 幕僚 | 合心活動 · 交通幹事 | staff | all | contact | manage_events_all, take_attendance, bus_dispatch_all, bus_create, set_bus_leader |
| `heqi-hr` | 幕僚 | 和氣人事 | staff | heQi | full | crud_registration, confirm_84, edit_pii |
| `heqi-admin` | 幕僚 | 和氣行政 | staff | heQi | full | crud_registration, confirm_84, edit_seat_attrs, edit_pii, manage_registration |
| `lianqu-admin` | 幕僚 | 聯區行政 | staff | lianQu | full | edit_seat_attrs |
| `hexin-hr` | 幕僚 | 合心人事 | staff | all | full | assign_any_seat, crud_registration, confirm_84, edit_pii, manage_registration, manage_staff |
| `hexin-admin` | 幕僚 | 合心行政 | staff | all | full | manage_users, assign_any_seat, crud_registration, confirm_84, edit_seat_attrs, edit_pii, manage_registration |

Helper:`can(cap)`、`scopeOK(row)`(all:true / lianQu:row.lianQu===p.lianQu / heQi:row.heQi===p.heQi / self·none:個人另處理)、`piiTier()`。

### 5.3 導覽可見性

- **personal**:`座位` + `我的`。`leader` 另加 `交通`(=車長點名視圖)。
- **staff**:`總覽` + `活動` + `名單` + `座位`;`交通` 僅在有 `bus_*`/`dispatch` 能力時出現;`審核` 僅在 `manage_users` 或(`crud_registration` 且 scope)時出現。
- 切換到「目前畫面對此 persona 不可見」時,自動導向合理預設(個人→我的、幕僚→總覽)。

---

## 6. 畫面規格

### 6.1 總覽 Overview(scope 分層)
- **四場次卡**:場次名、日期、**648 名額**、已配位進度環/條、缺額數。
- 統計列:**總報名人次 2,592**、**不重複人數 1,187**、**已配位 %**、**19 和氣**。
- **19 和氣分佈**:水平長條;heQi 只亮自己那條、lianQu 亮聯區數條、all 全部。
- **高雄彩排交通概況**:8 台去程(上限 9)· 車上已點名 n · **280 人不參加** · 同一上車點最多 2 台(上限 5)。
- 依 `scope` 過濾:和氣級看到的數字明顯較小(幾百)、合心看到 2,592。頂部顯示「檢視範圍」。

### 6.2 活動 Events + 報名/點名
- **清單**:依起始時間排序,分三組並各標計數:**進行中**(置頂醒目)、**即將發生**(近→遠)、**已發生**(可折疊、預設收合)。type chip(彩排/共修/驗收)、地點、日期、名冊人數、進度條。依 scope 過濾(heQi 見自己和氣+全場合辦;lianQu 見聯區;all 見全部)。
- **新增活動**(依角色鎖範圍):和氣活動→「新增和氣共修」(共修,heQi 鎖自己);聯區活動→「新增聯區共修」;合心活動→「新增活動」(共修/彩排/驗收 + 全區)。表單欄位:type、title、location、heQi、**場次**、**演繹區塊(A/B/C 可複選/全部)**、**起始/結束時間(datetime,支援多日)**。無 `manage_events_*` 不顯示。
- **編輯 / 取消**:有 `manage_events_*` 且 scope 通過者可 **編輯**(帶入現值)、**取消活動**(二次確認;取消後標「已取消」樣式、不刪列;有點名紀錄則警告)。
- **明細動作依時態**:
  - **即將發生 → 報名**:名冊每人 **報名 / 請假** 切換 + 已報名/請假/未回覆計數。
  - **進行中 / 已發生 → 點名**:每人三態 **未到 / 已到 / 請假**(未到中性、已到=`--ok`、請假=`--warn`;互斥、≥48px)。
  - 頂部標目前模式(報名中/點名中)+ Demo 時鐘。
- **scoped 點名**:和氣活動只可點自己和氣的人(其餘列唯讀/淡化並標「非可點名範圍」);聯區活動可點聯區內任一和氣;合心全區可點。多日活動有日期分頁;支援搜尋加名冊。空狀態要教學。
> 註:活動「已到」是**到場點名**;**車上點名**是另一件事,在交通/車長頁(見 §6.4)。

### 6.3 座位格 SeatGrid(招牌,西一象限 A+B 完整球場圖)
- 場次選擇器 + 組別(`AB` 合併圖 / `C` 入座演繹清單提示)。
- **座標**:列 1–54(列1 最右)、排 16–22(排16 最上,近舞台)。渲染 **`gridColumn = 55 − 列`、`gridRow = 排 − 15`**。
- **每格顯示座位號 `{列}-{排}`**;桌面同時顯示 **名字 + 和氣**(非 PII,各級可見,免點擊);手機縮小顯號、點擊出詳情。
- **軸標**:上方一列列號(1..54,對齊每格)、左方排號(16..22)。
- **每 3 列一組標籤帶**:`{A/B}` · `{藍/白}` · `{男/女}`。
  - 區塊:A=列1–30、B=列31–54。
  - 服裝:`f(列)` 每 3 列白/藍交替(白白白藍藍藍…)。
  - 性別:**列1–12 與 列49–54 = 男**,其餘(列13–48)= 女。
- **缺角(湊成 368)**:7 排 × 54 列 = 378,扣截角 10 格 = **368**。缺格不渲染:列51 缺排22;列52 缺排21,22;列53 缺排20,21,22;列54 缺排19,20,21,22。頁面標「本象限 A+B 共 368 席」。
- 個人 `performer`/`leader`:自己座位高亮描邊(藍雙環,藍白服裝上皆可見)+「我的座位」。`unbound`:通用檢視,不顯示自己位置。和氣級 staff:可全覽,但只有自己和氣座位可操作(其餘唯讀變淡 + scope 提示)。
- 圖例:白/藍服裝、空位、我的座位。手機容器 `overflow-x:auto`,body 不橫捲;桌面完整展開。

### 6.4 交通 Transport(高雄彩排,多階調度 + 車長)
去/回程 toggle。摘要:去程 **8 台**(最大 9)· 座位分配 · 同上車點上限 5(目前最多 2)· 280 人不參加。**依 persona 顯示不同視圖**:
- **合心活動 · 交通幹事**(`bus_dispatch_all`,`bus_create`)→ **上車點調度**:每個上車地點一列(目前報名坐車人數、建議車數=ceil(人數/48)、已安排車數、＋/－ 安排車數、指派聯區/和氣);可**新增車次**。另含「**跨場次 / 整日調度**」區(見下)。
- **聯區活動**(`bus_dispatch_scope`)→ **車輛分配**:本聯區被分到的車,每台編輯「各和氣 × 席次」,指派給和氣活動;**設定車長**(從該車乘客名單下拉)。
- **和氣活動**(`bus_assign_rider`)→ **乘客編排**:本和氣分到的車 + 本和氣「已報名坐車」名單,逐人 assign/remove;顯示每台已排/容量。
- **車長**(persona `leader`,在**交通**頁)→ **車長點名**(只有本車):乘客名單、司機聯絡(姓名/電話/**車牌**)、**上車點名**(未到/已到 逐人 toggle)、**撥打**(乘客/司機)。
- 純人事/行政(無交通能力):交通頁不出現在導覽。
- **車次卡**:車次名、`上車點 → 目的地`、**車牌**、車長、容量填充條(48 席,滿載/超載為建議性警示)、車上點名進度(boarded/total)、司機電話(僅調度/車長可見,其餘遮罩)。
- **同車去回 vs 跨場次去回不同車**:預設**同車去回**(去/回同一台、同上下車點)。到高雄靜思堂彩排/驗收一天可能 2 或 4 場次 → **跨場次**者可去/回不同車(但同上下車地點);**整日型**(企劃/菁英/工作人員)與跨場次者由**合心**統一安排。乘客資料帶 `dayType:'單場'|'跨場次'|'整日'` 與 `outboundBusId`/`returnBusId`(可不同);合心視圖的「跨場次/整日調度」區可分別指派去程車/回程車並標示「去≠回」,單場乘客標「同車去回」。

### 6.5 名單 List(幕僚專屬)
- **手機 deck view**(每人一張卡,分行排版);**桌面表格**。
- 欄位依 **pii tier**:
  - `full`(人事/行政):姓名 · 性別 · 和氣 · 聯區 · category · 電話 · email · **身分證**(遮罩 `A12****789`,可「顯示」)· **出生年月日** · 年齡。
  - `contact`(活動/企劃):姓名 · 和氣 · category · 電話 · **年齡**(由生日計算)。無 email/身分證/生日。
  - personal / none:此頁不出現。
- **區塊/服裝/位置**:每場報名顯示 區塊(A/B/C)、服裝(藍/白,C 無)、位置 `{列}-{排}`(未配位顯「未排」)。
- **多場次(重點)**:資料 `participations:[{session,block,costume,seat,is84}]`(0–4 筆)。「全部場次」檢視顯示「**報 N 場**」徽章 + 每場一 chip(`場次簡稱 · 區塊 · 服裝 · 位置`);篩單一場次時只顯示該場欄位。場次簡稱:11/12 共同 · 11/13 安平+大橋 · 11/14 佳里 · 11/15 仁德。
- 列 scope 過濾(heQi/lianQu/all)。搜尋 + 篩選(和氣/場次/category);顯示總數,mockup 顯示一段。
- **操作**:`manage_registration`(行政)→「報名管理」(新增/刪除報名、設定場次與座位,mock 面板);`edit_pii`(人事/行政)→「編輯人事資料」(mock 表單);`manage_staff`(合心人事/行政)→「＋ 新增人員」(mock 表單,category=工作人員…);`contact` 級唯讀無管理鈕。

### 6.6 審核 Approvals(個人帳號綁定)
- 導覽項 gate:`manage_users` 或(`crud_registration` 且 scope)→ 合心行政、和氣行政、和氣人事可見。
- **待審核**:申請人 email、綁定 person(姓名+和氣)、申請時間、[核准]/[婉拒]。
- **已核准**:email、person、核准人、核准時間、ICS 狀態。
- scope 過濾(和氣角色只審自己和氣的申請)。核准 = mock 產生 ics_token 提示。空狀態:「目前無待審核申請」。

### 6.7 我的 Me(個人分流)
- **unbound**:「尚未綁定帳號」大卡 → 綁定表單(姓名 + 身分證,mock)+ 說明;**行事曆訂閱(ICS)** 大按鈕;**座位表**(通用,無自己位置)。不顯示任何個人場次/座位/車次。
- **performer(入經藏菩薩)**:
  - 「**我的行程**」時間軸(彩排/共修/驗收):每項 **報名 / 請假** 切換(請假顯示已請假樣式)。
  - 「**遊覽車登記**」:是否坐車、上車點(datalist)、回程目的地(留高雄/回台南)——mock 表單。
  - 派車完畢後「**我的車次**」卡(車次名、上車地點、發車時間、車長);未派車顯示「尚未派車」。
  - 「**我的座位**」mini-grid 高亮 + 場次/服裝;ICS 訂閱。
- **leader(兼車長)**:同 performer(行程/座位/報名/車次資訊)。**車長點名工具不在此頁**,改在**交通**頁(見 §6.4);此頁僅標「車長」身分。

---

## 7. 資料模型 & 假資料(seed)

- **人**:`PEOPLE`(1,187 筆,含 name/gender/heQi/lianQu/category/phone/email/idNumber/birthDate;age 由 birthDate 計算)。`BRIDGE_ROSTER`(24 位大橋和氣可辨識人名,供名單/座位/交通/點名一致引用)。
- **報名**:`personParticipations(personId)` → `[{session,block,costume,seat,is84}]`(0–4);`sessionParticipation(personId, sessionId)`。分佈偏 11/12 共同場與本人聯區場。
- **聯區↔和氣**:仁德聯區 = 東一/東二/仁德/歸仁/大橋/永康(其餘 19 和氣依 domain model)。
- **座位**:西一象限 A+B,程式生成並斷言 **368 席**(截角規則見 §6.3)。
- **交通**:高雄彩排 8 台去程(不同上車點,單點 ≤5;台南靜思堂 2 台、其餘各 1 → 最多 2),每台 48 席,含 `plate`(如 `KAA-5162`)/司機姓名/司機電話/depart time/車長;去/回程、`dayType`、`outboundBusId`/`returnBusId`。
- **審核**:待審核 + 已核准 綁定申請(大橋/仁德)。
- 所有互動皆前端狀態模擬(記憶體,重整重置);唯一約束(座位占用/已點名/上車)以友善繁中訊息呈現。

---

## 8. PWA

- `manifest.webmanifest`:name「慈濟大巨蛋演繹」、short_name「大巨蛋」、`display:standalone`、`theme_color`(近黑)、`background_color`、直向、icons(藍底蓮花/巨蛋標,SVG + maskable)。
- `sw.js`:install 快取 app shell(index.html+css+js),fetch cache-first,offline 可開。
- `index.html <head>`:manifest + theme-color meta + apple-touch meta + `viewport`(含 `viewport-fit=cover`)。

---

## 9. 互動 / 狀態規則

- 每個互動元件備齊 default/hover/`:focus-visible`/active/disabled;焦點環 3px `--focus` + 2px offset。
- 點名/配位/上車有唯一約束 → mockup 模擬,但 UI 呈現「已點名/座位已占用」友善訊息並觸發重抓語意。
- Toast(友善繁中);樂觀更新:切換即時反白 + 微動(pulse 250ms),再落定。
- 動效 150–250ms、ease-out(`cubic-bezier(.16,1,.3,1)`),傳達狀態非裝飾;`prefers-reduced-motion` 有即時替代。
- 深度用**色階抬升**(bg→surface→surface-2→surface-3),不用陰影堆疊;陰影僅給浮層(modal/toast)。

---

## 10. 技術

- **單一自足 `index.html`**(inline CSS + JS,零外部請求)以利 Artifact 預覽 + 好帶走;PWA 檔(manifest/sw/icons)另存,提供真正安裝。
- 假資料 seed 內嵌 JS;客戶端 hash routing 切畫面;persona 切換即 `renderAll()`。
- 無框架、無 build,原生 JS + CSS(OKLCH tokens)。乾淨、可讀。

---

## 11. 禁止(避免 AI slop)

- 不用:側邊色條 border(>1px 彩色 border-left/right)、漸層文字、玻璃擬態當預設、hero-metric 樣板、千篇一律卡片牆、全大寫追蹤 eyebrow、`01/02/03` 編號裝飾。
- 不用通用科技綠/霓虹——藍是慈濟識別,克制使用。
- body 文字不降成淺灰「求優雅」(長者最吃虧的可讀性失誤)。
- 標題不溢出容器(各斷點測 heading)。
