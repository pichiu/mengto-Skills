# 慈濟大巨蛋演繹管理系統 — Mockup 設計規格 (Opus 規劃)

> 依 `backend-guide-for-frontend.md` + `domain-model.md` 製作的高保真 mockup。
> 一個**響應式 PWA**同時涵蓋手機與瀏覽器(手機優先,桌面漸進增強),不拆兩份。

## 產品定位 & 使用者
- 幕僚/志工用的**營運工具**(product register,非 landing)。工具要「消失在任務裡」。
- 使用者多為**年長志工(菩薩)**——年齡規則(男<60/女<50)透露族群偏長者。
- 所以 **深色 + 大字 + 大點擊區** 不是風格,是無障礙需求。

## 品牌與色彩(慈濟藍 · 深色)
用 OKLCH。**慈濟藍**是識別核心,不可換成通用科技綠/紫。

```css
:root{
  /* 底層:近黑、極淡藍調 */
  --bg:         oklch(0.17 0.014 255);
  --surface:    oklch(0.213 0.016 255);   /* 面板/卡片 */
  --surface-2:  oklch(0.255 0.018 255);   /* 抬升層/hover */
  --line:       oklch(0.34 0.018 255);    /* 邊框(不透明) */
  --line-soft:  oklch(1 0 0 / 0.08);      /* 分隔線 */

  /* 文字(高對比,長者可讀,body ≥4.5:1) */
  --ink:   oklch(0.97 0.004 255);   /* 主文字 */
  --ink-2: oklch(0.82 0.010 255);   /* 次要 */
  --ink-3: oklch(0.70 0.012 255);   /* 弱化(仍須過 4.5:1 於 --bg) */

  /* 慈濟藍 主訊號色 */
  --brand:      oklch(0.68 0.115 245);
  --brand-2:    oklch(0.60 0.12 248);
  --brand-ink:  oklch(0.16 0.02 255);      /* 藍底上的字 */
  --brand-soft: oklch(0.68 0.115 245 / 0.14);
  --focus:      oklch(0.78 0.11 240);

  /* 語意色 */
  --ok:    oklch(0.74 0.15 155);   /* 到場/已點名 */
  --ok-soft: oklch(0.74 0.15 155 / 0.15);
  --warn:  oklch(0.82 0.13 82);    /* 待確認/滿載警示 */
  --warn-soft: oklch(0.82 0.13 82 / 0.15);
  --danger:oklch(0.68 0.19 25);    /* 未到/失敗/超載 */
  --danger-soft: oklch(0.68 0.19 25 / 0.15);

  /* 和氣/服裝標示 */
  --costume-white: oklch(0.90 0.01 255);
  --costume-blue:  oklch(0.66 0.12 245);
}
```
- 對比:body 文字用 `--ink`/`--ink-2`;`--ink-3` 只給 metadata。務必自檢 ≥4.5:1。
- 藍是**訊號色**——主要動作、目前選取、狀態。不拿藍做整片裝飾。Restrained/局部 Committed。

## 字體與級距(大字)
- 家族:`"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif`(**不載外部字型**,CSP 安全)。等寬 metadata 用 `ui-monospace, "SF Mono", monospace`。
- **base = 18px**(非 16)。固定 rem 級距,非流體。
- 級距:12→ `0.78rem`(僅角標)、14→`0.86rem`、body `1rem`(18px)、`1.125rem`、`1.375rem`、`1.75rem`、`2.25rem`、`2.75rem`(頁面大標)。
- 觸控目標 ≥ 48px;主要按鈕高 56px。行高舒適(body 1.6)。
- `text-wrap: balance` 於標題。

## 版面 / 導覽(單一響應式)
- **手機 (<1024px)**:頂部 app bar(頁名 + 目前情境 chip)+ 內容 + **底部 5 分頁**(大圖示+字):`總覽 / 活動 / 交通 / 座位 / 我的`。底部列 safe-area padding。
- **桌面 (≥1024px)**:**左側邊欄**導覽(logo + 5 項 + 使用者卡)+ 主內容加寬(表格/座位格展開)。底部分頁隱藏。
- 用 CSS `@media (min-width:1024px)` 切換;內容同一份 DOM。
- z-index 語意層級:dropdown < sticky < backdrop < modal < toast < tooltip。

## 五個畫面

### 1) 總覽 Overview
- 頂部:活動倒數/情境。
- **四場次卡**(11/12 全區共同場、11/13 安平聯區+大橋、11/14 佳里聯區、11/15 仁德聯區),每卡:場次名、日期、**648 名額**、已配位進度環/條、缺額數。
- 統計列:**總報名人次 2,592**(4×648)、**不重複人數 1,187**(一人可報 1–4 場)、**已配位 %**、19 和氣。
- **19 和氣分佈**:水平長條/熱區,顯示各和氣報名量(用真實 19 個和氣名)。
- **高雄彩排交通概況**:8 台去程 · 車上已點名 n · 280 人不參加彩排 · 最多同一上車點 2 台(上限 5)。
- 近期活動清單(彩排/共修/驗收)入口。

### 2) 活動 Events + 點名 Attendance
- 活動清單:type chip(彩排/共修/驗收)、標題、地點、日期、名冊人數、點名進度條。
- 進入某活動:名冊 + **點名**。點名列每人:姓名 + 和氣 chip,右側**大狀態切換**(未到 / 現場 / 車上)——大按鈕、色彩明確(到場=--ok)。頂部日期分頁(多日活動)。搜尋加名。
- 空狀態要教學,不只「沒有資料」。

### 3) 交通 Transport 調度(重點畫面)
- 情境:**高雄彩排** event。去/回程 toggle。
- 摘要列:去程 **8 台**(最大 9)· 座位 360/384 · **同上車點上限 5**(目前最多 2)· 280 人不參加。
- **車次卡**(每台):車次名、`上車點 → 目的地`、車長(person)、`capacity` 填充條(48 席,已滿/建議性超載警示)、**車上點名**進度(boarded/total)、司機聯絡(權限 gate,mockup 標示可見/遮罩)。
- 去程 8 台種子(不同上車點,無單點 >5):
  - 台南靜思堂(48/48)、台南靜思堂(46/48)、安平共修處(45/48)、佳里聯絡處(44/48)、新營聯絡處(43/48)、善化聯絡處(40/48)、麻豆聯絡處(38/48)、學甲聯絡處(36/48)。
  - 上車點分佈:台南靜思堂 2 台,其餘各 1 → 最多 2,遠低於上限 5(顯示這個安全指標)。
- 回程:抵達地同理(可與去程不同,顯示「跟回台南 / 留高雄」邏輯)。
- 小型「上車點分佈」視覺(bar),標紅線 = 上限 5。

### 4) 座位格 SeatGrid(招牌功能)
- 場次選擇器 + 組別(A/B/C;C 無格,顯示清單提示)。
- **西一象限**座標:`row_no` 列 1–54(列1 最右)、`col_no` 排 16–22(排16 最上)。
  **渲染:`gridColumn = 55 − 列`、`gridRow = 排 − 15`。**
- Mockup 渲染 A 組一段(列 1–30 × 排 16–22)的座位格,以顏色標:服裝(白/藍)或狀態(已配/空)或和氣。點座位顯示占用者。圖例。
- 手機:可橫向捲動(`overflow-x:auto` 容器),不讓 body 橫捲。桌面:完整展開。

### 5) 我的 Me(個人區)
- 個人卡:姓名、和氣、聯區、category。
- **我的場次/座位**:哪一場、座位編號(可視化小格高亮)、服裝。
- **我的車次**:去/回程上車點、車長資訊(若本人是車長顯示乘客名單入口)。
- **我的行程**:彩排/共修/驗收 時間軸。
- **行事曆訂閱(ICS)**:大按鈕(說明個人憑證,不外洩)。
- 跑位 note(session/block/seq)。

## PWA
- `manifest.webmanifest`:name「慈濟大巨蛋演繹」、short_name「大巨蛋」、`display:standalone`、`theme_color`(近黑)、`background_color`、直向、icons(192/512,maskable)。SVG 生成的藍底蓮花/巨蛋簡標,轉 PNG 或用 SVG icon + data-URI fallback。
- `sw.js`:install 時 cache app shell(index.html+css+js),fetch cache-first,offline 可開。
- `index.html` `<head>` 掛 manifest + theme-color meta + apple-touch 相關 meta + viewport(含 `viewport-fit=cover`)。
- 頂部提供「加入主畫面」提示(beforeinstallprompt 監聽,mockup 顯示按鈕)。

## 互動/狀態(product 規則)
- 每個互動元件備齊 default/hover/focus/active/disabled。焦點環用 `--focus`,`:focus-visible`。
- 點名/配位/上車有唯一約束 → mockup 用假資料模擬,但 UI 呈現「已點名/座位已占用」友善訊息樣式。
- Toast 元件(res.error 友善繁中)。
- 動效 150–250ms,傳達狀態非裝飾;`prefers-reduced-motion` 提供即時替代。ease-out(quart/expo)。
- 樂觀更新:切換點名即時反白 + 微動,再落定。

## 技術
- **單一自足 `index.html`**(inline CSS + JS,無外部請求)以利 Artifact 預覽 + 好帶走;PWA 檔(manifest/sw/icons)另存,提供真正安裝。
- 假資料 seed 內嵌 JS(4 場次、19 和氣、~1187 人抽樣、8 台車、座位格一段)。
- 客戶端切畫面(hash route 或 tab state)。
- 無框架,原生 JS + CSS。乾淨、可讀、無 build。

## 禁止(避免 AI slop)
- 不用側邊色條 border、漸層文字、玻璃擬態當預設、hero-metric 樣板、千篇一律卡片牆、每段小寫追蹤 eyebrow、01/02/03 編號裝飾。
- 不用通用科技綠/霓虹。藍是慈濟識別,克制使用。
- 標題不溢出容器(各斷點測 heading)。
