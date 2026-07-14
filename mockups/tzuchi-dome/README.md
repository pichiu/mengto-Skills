# 慈濟大巨蛋演繹管理系統 — Mockup

高保真、可安裝的 PWA mockup,涵蓋慈濟大巨蛋演繹活動的營運工具:場次總覽、活動點名、
交通調度、座位格與個人行程。依 `PLAN.md` 規劃規格製作,內嵌**假資料(seed data)**,
不連接任何真實後端或資料庫。含角色/權限分流,可用頂部「以…身份檢視」切換 11 種身份。

## 設計文件

- **`DESIGN.md`** — 從本 mockup 逆向產出的設計系統文件(impeccable / DESIGN.md 格式:
  YAML token frontmatter + 六段 Overview/Colors/Typography/Elevation/Components/Do's and Don'ts)。
  新畫面依此保持一致。
- **`.impeccable/design.json`** — 設計系統 sidecar(色階 ramp、陰影/動效/斷點、可注入的元件片段、敘事)。
- **`PLAN.md`** — 完整實作規劃規格(產品、色彩/字體、角色權限、七個畫面、資料模型、PWA;Opus 規劃、Sonnet 實作)。

## 如何執行

在本資料夾下起一個靜態伺服器(需要伺服器而非直接開檔,才能讓 Service Worker 與
manifest 正常運作):

```bash
cd mockups/tzuchi-dome
python3 -m http.server 8099
```

再以瀏覽器開啟 `http://localhost:8099/`。手機瀏覽器可用「加入主畫面」安裝成
standalone PWA(離線可開)。

## 五個畫面

1. **總覽** — 四場次配位進度、統計列、19 和氣分佈、高雄彩排交通概況、近期活動。
2. **活動 + 點名** — 彩排/共修/驗收活動清單,進入活動可依日期分頁點名(未到/現場/車上),支援搜尋與手動加名冊。
3. **交通調度** — 高雄彩排去/回程 8 台巴士、容量與車上點名進度、司機電話權限遮罩(可切換檢視身分)、上車點分佈。
4. **座位格** — 西一象限座標渲染(`gridColumn = 55 − 列`、`gridRow = 排 − 15`),A/B 組即時網格、C 組清單模式,支援手機橫向捲動。
5. **我的** — 個人卡、我的場次/座位(迷你網格高亮)、我的車次、行程時間軸、ICS 行事曆訂閱、跑位備註。

## 技術重點

- 單一自足 `index.html`:inline CSS + inline JS,零外部請求(無 CDN、無外部字型)。
- `manifest.webmanifest` + `sw.js` + `icons/icon.svg`:可安裝、離線可開的 PWA。
- 響應式:< 1024px 為手機版(底部 5 分頁);≥ 1024px 為桌面版(左側邊欄)。同一份 DOM,CSS 斷點切換。
- 無框架、無 build,原生 JS(hash routing)+ 原生 CSS(OKLCH tokens)。
- 深色主題、base 18px、觸控目標 ≥48px、主要按鈕 56px 高 — 針對年長志工的無障礙設計。

## 這是 Mockup,不是正式產品

- 所有人名、和氣分佈、車次、座位占用皆為**種子假資料**(部分以固定亂數生成,重新整理後資料一致)。
- 點名 / 交通 / 座位互動皆為前端狀態模擬(存於記憶體,重新整理會重置),不寫入任何後端。
- 座位格數學、19 和氣、8 台去程巴士等數字依 `PLAN.md` 與 domain model 規格構造,力求真實但非正式資料來源。
