# Mockup v2 — 角色 / 權限分流(Opus 規劃)

延伸 `DESIGN.md`。核心新增:**Persona 切換器**(mockup 用「以…身份檢視」控制項),
切換後整個 app 依 `scope / pii / caps / accountType` 重新渲染。沿用同一份響應式 PWA、
同一套 tokens、深色大字。**不要動 v1 的視覺語言,只加分流邏輯與新畫面。**

---

## A. Persona 模型(核心,放在 index.html JS 最上層)

```js
// state.persona 指向目前檢視身份;切換器改它 → renderAll()
const PERSONAS = [
  // ===== 個人帳號(kind:'personal')=====
  { id:'unbound',   group:'個人', label:'未綁定帳號',
    kind:'personal', bound:false, scope:'none', pii:'none', caps:[], person:null },
  { id:'performer', group:'個人', label:'入經藏菩薩(已綁定)',
    kind:'personal', bound:true, staff:false, scope:'self', pii:'self',
    caps:['self_register','self_leave','self_bus_signup'],
    person:{ name:'陳美玲', heQi:'大橋', lianQu:'仁德', category:'委員',
             sessions:[{s:'11/13(五) 安平聯區+大橋', block:'B', costume:'藍', seat:'B-48-21'}],
             busDispatched:true } },
  { id:'leader',    group:'個人', label:'入經藏菩薩 · 兼車長',
    kind:'personal', bound:true, staff:false, busLeader:true, scope:'self', pii:'contact',
    caps:['self_register','self_leave','self_bus_signup','bus_checkin','bus_contact'],
    person:{ name:'黃志明', heQi:'大橋', lianQu:'仁德', category:'慈誠',
             sessions:[{s:'11/13(五) 安平聯區+大橋', block:'A', costume:'白', seat:'A-12-18'}],
             busId:'go-1', busDispatched:true } },
  // ===== 幕僚(kind:'staff')scope: all|lianQu|heQi ; pii: full|contact =====
  { id:'heqi-activity',  group:'幕僚', label:'和氣活動', kind:'staff',
    scope:'heQi',  heQi:'大橋', lianQu:'仁德', pii:'contact',
    caps:['manage_events_heqi','take_attendance','bus_assign_rider'] },
  { id:'lianqu-activity',group:'幕僚', label:'聯區活動 · 交通', kind:'staff',
    scope:'lianQu', lianQu:'仁德', pii:'contact',
    caps:['manage_events_lianqu','take_attendance','bus_dispatch_scope','set_bus_leader'] },
  { id:'hexin-activity', group:'幕僚', label:'合心活動 · 交通幹事', kind:'staff',
    scope:'all', pii:'contact',
    caps:['manage_events_all','take_attendance','bus_dispatch_all','bus_create','set_bus_leader'] },
  { id:'heqi-hr',    group:'幕僚', label:'和氣人事', kind:'staff',
    scope:'heQi', heQi:'大橋', lianQu:'仁德', pii:'full',
    caps:['crud_registration','confirm_84','edit_pii'] },
  { id:'heqi-admin', group:'幕僚', label:'和氣行政', kind:'staff',
    scope:'heQi', heQi:'大橋', lianQu:'仁德', pii:'full',
    caps:['crud_registration','confirm_84','edit_seat_attrs','edit_pii','manage_registration'] },
  { id:'lianqu-admin',group:'幕僚', label:'聯區行政', kind:'staff',
    scope:'lianQu', lianQu:'仁德', pii:'full', caps:['edit_seat_attrs'] },
  { id:'hexin-hr',   group:'幕僚', label:'合心人事', kind:'staff',
    scope:'all', pii:'full',
    caps:['assign_any_seat','crud_registration','confirm_84','edit_pii','manage_registration','manage_staff'] },
  { id:'hexin-admin',group:'幕僚', label:'合心行政', kind:'staff',
    scope:'all', pii:'full',
    caps:['manage_users','assign_any_seat','crud_registration','confirm_84',
          'edit_seat_attrs','edit_pii','manage_registration'] },
];
// helper: can(cap) → state.persona.caps.includes(cap)
// scopeOK(row) → all:true | lianQu: row.lianQu===p.lianQu | heQi: row.heQi===p.heQi | self/none: 個人另處理
// pii tier: 'full' 全欄 | 'contact' 姓名+電話+年齡(無 email/身分證/生日) | 'none' 只有非PII(姓名/和氣/場次/座位)
```

**切換器 UI**:app bar / sidebar user 卡上放一個下拉(分「個人」「幕僚」兩組),
選單顯示 label + 一行 scope/pii 摘要。切換 = 存 `state.persona`、`renderAll()`、
頂部顯示目前檢視範圍 chip(如「檢視範圍:大橋和氣 · 聯絡級」)。這是 mockup 展示用控制項,
明確標示「Demo:切換檢視身份」。

---

## B. 導覽可見性(依 persona.kind / caps)

- **personal**:只顯示 `座位` + `我的`(行事曆/行程)。隱藏 總覽/活動/交通/名單。
  - `leader` 額外:我的頁內含「我的車次」區(不另開幕僚交通頁)。
- **staff**:顯示 `總覽` + `活動` + `名單` + `座位`;`交通` 僅在有 `bus_*`/`dispatch`/`bus_assign_rider` 能力時顯示。
- 底部分頁(手機)與側欄(桌面)同步依此增減項目。項目數變動時保持排版穩定。

---

## C. 各畫面分流規格

### 1) 總覽(scope 分層,第 6 點)
- 依 `scope` 過濾場次/和氣統計:`heQi` 只算自己和氣;`lianQu` 只算聯區內和氣;`all` 全部。
- 頂部顯示「檢視範圍」。和氣級看到的數字明顯較小(例:大橋和氣總報名 ~ 一兩百),
  合心看到 2,592。19 和氣分佈:heQi 只亮自己那條、lianQu 亮聯區數條、all 全部。

### 2) 座位表(第 2 點,改設計)
- **桌面(≥1024px)**:占用格**直接顯示 名字 + 和氣**(姓名/和氣屬非 PII,各級可見),不需點擊。
  格子夠大時兩行(名字上、和氣下小字);hover 加深。
- **手機(<1024px)**:維持點擊才出詳情(空間不足)。
- 個人 `performer`/`leader`:自己座位高亮描邊 + 標「我的座位」。
- `unbound`:座位表為通用檢視,**不顯示任何「我的位置」**(因未綁定不知道是誰)。
- 和氣級 staff:可全覽座位,但只有自己和氣座位可操作(其餘唯讀);顯示 scope 提示。

### 3) 交通(第 3 點,多階調度 — 依 persona 顯示不同視圖)
情境:高雄彩排。各角色看到的交通頁不同:
- **合心活動 · 交通幹事(`bus_dispatch_all`,`bus_create`)**:
  「**上車點調度**」——每個上車地點一列:目前報名坐車人數、建議車數(=ceil(人數/48))、
  已安排車數、[＋/－ 安排車數] 控制;摘要:8 台去程(最大 9)、同上車點上限 5。
  可新增車次、指派車輛給聯區/和氣。
- **聯區活動(`bus_dispatch_scope`)**:「**車輛分配**」——本聯區被分到的車,
  每台編輯「各和氣坐幾人」(和氣 × 席次表),把車與數量指派給和氣活動;
  設定**車長**(從該車乘客名單下拉選)。
- **和氣活動(`bus_assign_rider`)**:「**乘客編排**」——本和氣分到的車 + 本和氣「已報名坐車」名單,
  把人一位位排進車(assign/remove);顯示每台已排/容量。
- **車長(persona `leader`,在「我的」頁)**:見「我的車次」——本車乘客名單、司機聯絡方式(電話),
  可**車上點名**(逐人 toggle 已上車)與**撥打**(乘客/司機電話按鈕)。
- 其他 staff(純人事/行政、無交通能力):交通頁不出現在導覽。

### 4) 活動(第 4 點,分級主辦 + scoped 點名)
- **新增活動**按鈕依角色:
  - 和氣活動 → 「新增和氣共修」(type=共修,heQi=自己,鎖定)。
  - 聯區活動 → 「新增聯區共修」(共修,範圍=聯區)。
  - 合心活動 → 「新增活動」可選 共修/彩排/驗收 + 全區。
  - 無 `manage_events_*` → 不顯示新增。
- **活動清單**依 scope 過濾(heQi 見自己和氣 + 全場合辦;lianQu 見聯區;all 見全部)。
- **點名**(`take_attendance`)進入活動:名冊依 scope——
  和氣活動只可點自己和氣的人(其餘列唯讀/淡化並標「非本和氣」);
  聯區活動可點聯區內任一和氣;合心全區可點。頂部標可點名範圍。

### 5) 名單(**新頁面**,第 5 點)—— 幕僚專屬
- 表格,欄位依 **pii tier**:
  - `full`(人事/行政):姓名 · 性別 · 和氣 · 聯區 · category · 電話 · email · **身分證**(遮罩 `A12****789`,可「顯示」)· **出生年月日** · 年齡。
  - `contact`(活動/企劃):姓名 · 和氣 · category · 電話 · **年齡**(由生日計算)。**無** email/身分證/生日。
  - personal / `none`:此頁不出現在導覽(看不到)。
- 列 scope 過濾:heQi→自己和氣;lianQu→聯區;all→全部。
- 搜尋 + 篩選(和氣 / 場次 / category)。分頁或虛擬清單(mockup 顯示一段即可,標總數)。
- **操作**:
  - `manage_registration`(行政):每列「報名管理」——新增/刪除報名、設定場次與座位(開 mock 編輯面板)。
  - `edit_pii`(人事+行政):「編輯人事資料」——改 PII 欄位(mock 表單)。
  - `contact` 級:唯讀,無管理鈕。
- 空/無權限狀態要清楚(例:contact 想開 PII → 顯示「權限不足」樣式)。

### 6) 我的(第 1 點,個人分流 — 依 persona)
- **unbound**:
  - 大卡:「尚未綁定帳號」→ 綁定表單(姓名 + 身分證,mock)+ 說明。
  - 可看:**行事曆訂閱(ICS)** 大按鈕、**座位表**(通用,無自己位置)。
  - **不顯示**任何個人場次/座位/車次(因未知身份)。
- **performer(入經藏菩薩)**:
  - 「**我的行程**」時間軸(彩排/共修/驗收):每項有狀態 + **報名 / 請假** 按鈕(toggle mock,請假顯示已請假樣式)。
  - 「**遊覽車登記**」:是否需要坐車、上車點(datalist)、回程目的地(留高雄/回台南)——mock 表單。
  - **派車完畢後**:顯示「**我的車次**」卡(車次名、上車地點、發車時間、車長);未派車顯示「尚未派車」。
  - 「**我的座位**」mini-grid 高亮 + 場次/服裝。ICS 訂閱。
- **leader(兼車長)**:performer 全部 + 「**我的車次**」升級為車長視圖:
  乘客名單、司機電話、車上點名 toggle、撥打鈕(見 §C-3 車長)。

---

## D. 實作與驗證要求
- 全部進**同一個** `index.html`(維持自足、inline、無外部請求;PWA 檔不變)。
- 沿用 v1 tokens/元件/動效規則;新元件(切換器、名單表、上車點調度、乘客編排、我的行程)
  遵守 product register + 所有 bans(無側條 border、無漸層字、無玻璃預設、無 hero-metric 樣板、
  無千篇一律卡牆、無 eyebrow、無 01/02/03、標題不溢出)。
- 每個互動元件備 default/hover/focus-visible/active/disabled。切換 persona 用 150–250ms 淡切。
- **每個 persona × 相關畫面**都要截圖驗證(手機 390×844 + 桌面 1440×900),
  確認:導覽項目正確增減、scope 數字正確變化、座位表桌面顯示名字+和氣、
  名單 PII 欄位依 tier 增減、交通頁依角色換視圖、我的頁依 personal 狀態換內容、
  無橫向溢出、無 console 錯誤、對比 ≥4.5:1。
- 假資料:大橋和氣給一份可辨識的人名清單(供名單/座位/交通/點名一致引用),
  聯區(仁德)含 東一/東二/仁德/歸仁/大橋/永康。高雄彩排沿用 v1 八台去程種子。
