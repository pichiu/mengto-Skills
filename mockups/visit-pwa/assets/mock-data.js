/**
 * mock-data.js — 家訪 PWA 原型的假資料模組。
 *
 * 純傳統 script(非 ES module),掛到 window.VisitMock,
 * 供 mobile.html / admin.html 以 <script src="assets/mock-data.js"> 直接載入,
 * 在 file:// 下開啟不會被 CORS / module 限制擋住。
 *
 * 情境:台灣慈善團體「花蓮光復堰塞湖溢流」風災後家訪 — 主事件 slug: flood-2026。
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 小工具(決定性亂數,確保每次載入資料一致、方便截圖比對)
  // ------------------------------------------------------------------

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var rand = mulberry32(20260714);

  function randInt(min, max) {
    return min + Math.floor(rand() * (max - min + 1));
  }

  function pick(arr) {
    return arr[Math.floor(rand() * arr.length)];
  }

  function pad(n, len) {
    var s = String(n);
    while (s.length < len) s = '0' + s;
    return s;
  }

  function uuid() {
    var chars = '0123456789abcdef';
    function seg(len) {
      var s = '';
      for (var i = 0; i < len; i++) s += chars[Math.floor(rand() * 16)];
      return s;
    }
    return (
      seg(8) + '-' + seg(4) + '-4' + seg(3) + '-' +
      chars[8 + Math.floor(rand() * 4)] + seg(3) + '-' + seg(12)
    );
  }

  function dateStr(y, m, d) {
    return y + '-' + pad(m, 2) + '-' + pad(d, 2);
  }

  function addDays(iso, days) {
    var parts = iso.split('-').map(Number);
    var dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    dt.setUTCDate(dt.getUTCDate() + days);
    return dateStr(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }

  // ------------------------------------------------------------------
  // FIELD_CATALOG — 37 欄,涵蓋 text/number/date/select/textarea,3 個 PII 欄
  // ------------------------------------------------------------------

  var FIELD_CATALOG = [
    // 基本組
    { key: 'route', label: '路線', type: 'select', pii: false, group: '基本組' },
    { key: 'caseNo', label: '案號', type: 'number', pii: false, group: '基本組' },
    { key: 'visitDate', label: '訪視日期', type: 'date', pii: false, group: '基本組' },
    { key: 'visitor', label: '訪視員', type: 'text', pii: false, group: '基本組' },
    { key: 'visitStatus', label: '訪視狀態', type: 'select', pii: false, group: '基本組' },
    // 地址組
    { key: 'county', label: '縣市', type: 'text', pii: false, group: '地址組' },
    { key: 'district', label: '鄉鎮市區', type: 'select', pii: false, group: '地址組' },
    { key: 'village', label: '村里', type: 'select', pii: false, group: '地址組' },
    { key: 'neighborhood', label: '鄰', type: 'select', pii: false, group: '地址組' },
    { key: 'address', label: '地址', type: 'text', pii: false, group: '地址組' },
    { key: 'lat', label: '緯度', type: 'number', pii: false, group: '地址組' },
    { key: 'lng', label: '經度', type: 'number', pii: false, group: '地址組' },
    // 個案組
    { key: 'name', label: '姓名', type: 'text', pii: false, group: '個案組' },
    { key: 'gender', label: '性別', type: 'select', pii: false, group: '個案組' },
    { key: 'birthYear', label: '出生年', type: 'number', pii: false, group: '個案組' },
    { key: 'phone', label: '聯絡電話', type: 'text', pii: false, group: '個案組' },
    { key: 'idNumber', label: '身分證字號', type: 'text', pii: true, group: '個案組' },
    { key: 'householdSize', label: '家戶人數', type: 'number', pii: false, group: '個案組' },
    { key: 'relationship', label: '與案主關係', type: 'text', pii: false, group: '個案組' },
    // 災損組
    { key: 'damageType', label: '災損類型', type: 'select', pii: false, group: '災損組' },
    { key: 'damageLevel', label: '災損程度', type: 'select', pii: false, group: '災損組' },
    { key: 'houseType', label: '房屋類型', type: 'select', pii: false, group: '災損組' },
    { key: 'damageDesc', label: '災損描述', type: 'textarea', pii: false, group: '災損組' },
    { key: 'waterDepth', label: '淹水深度(公分)', type: 'number', pii: false, group: '災損組' },
    // 救助組
    { key: 'reliefType', label: '救助類型', type: 'select', pii: false, group: '救助組' },
    { key: 'reliefAmount', label: '救助金額', type: 'number', pii: false, group: '救助組' },
    { key: 'payeeName', label: '受款人姓名', type: 'text', pii: false, group: '救助組' },
    { key: 'payeeIdNumber', label: '受款人身分證字號', type: 'text', pii: true, group: '救助組' },
    { key: 'bankName', label: '銀行名稱', type: 'text', pii: false, group: '救助組' },
    { key: 'bankAccount', label: '銀行帳號', type: 'text', pii: false, group: '救助組' },
    { key: 'paymentStatus', label: '撥款狀態', type: 'select', pii: false, group: '救助組' },
    // 訪視組
    { key: 'needs', label: '需求評估', type: 'textarea', pii: false, group: '訪視組' },
    { key: 'followUp', label: '後續處理', type: 'select', pii: false, group: '訪視組' },
    { key: 'referral', label: '轉介單位', type: 'text', pii: false, group: '訪視組' },
    { key: 'internalNotes', label: '內部備註', type: 'textarea', pii: true, group: '訪視組' },
    { key: 'visitCount', label: '訪視次數', type: 'number', pii: false, group: '訪視組' },
    { key: 'lastContact', label: '最近聯繫日期', type: 'date', pii: false, group: '訪視組' }
  ];

  // ------------------------------------------------------------------
  // EVENTS — 4 筆,涵蓋 active/closing/closed、openSupport、driveConfigured:false
  // ------------------------------------------------------------------

  var EVENTS = [
    {
      id: 'evt-flood-2026',
      slug: 'flood-2026',
      name: '花蓮光復堰塞湖溢流救災(第一階段)',
      status: 'active',
      openSupport: true,
      county: '花蓮縣',
      driveConfigured: true
    },
    {
      id: 'evt-flood-2026-b',
      slug: 'flood-2026-b',
      name: '花蓮光復堰塞湖溢流救災(第二階段擴編)',
      status: 'active',
      openSupport: false,
      county: '花蓮縣',
      driveConfigured: false
    },
    {
      id: 'evt-typhoon-2025',
      slug: 'typhoon-2025',
      name: '凱米颱風災後安置',
      status: 'closing',
      openSupport: false,
      county: '高雄市',
      driveConfigured: true
    },
    {
      id: 'evt-earthquake-2024',
      slug: 'earthquake-2024',
      name: '0403花蓮地震救助專案',
      status: 'closed',
      openSupport: false,
      county: '花蓮縣',
      driveConfigured: true
    }
  ];

  // ------------------------------------------------------------------
  // EVENT_CONFIG
  // ------------------------------------------------------------------

  var EVENT_CONFIG = {
    'flood-2026': {
      // 3 個 PII 欄(idNumber / payeeIdNumber / internalNotes)皆列入,讓手機表單
      // 能完整示範 PII 欄依 canSeePII(persona) 出現/消失,而非只演到 idNumber。
      enabledFields: [
        'route', 'caseNo', 'visitDate', 'visitor', 'visitStatus',
        'county', 'district', 'village', 'neighborhood', 'address', 'lat', 'lng',
        'name', 'gender', 'birthYear', 'phone', 'idNumber', 'householdSize',
        'damageType', 'damageLevel', 'houseType', 'damageDesc',
        'reliefType', 'reliefAmount', 'payeeIdNumber',
        'internalNotes'
      ],
      routes: [
        { id: 'A', label: '光復市區', color: 'var(--route-a)' },
        { id: 'B', label: '大馬里', color: 'var(--route-b)' },
        { id: 'C', label: '鳳林市區', color: 'var(--route-c)' },
        { id: 'D', label: '林榮里', color: 'var(--route-d)' }
      ],
      districts: ['光復鄉', '鳳林鎮'],
      teams: [
        { id: 'office', label: '行政組', bypass: true },
        { id: 'teamA', label: '訪視一隊', bypass: false },
        { id: 'teamB', label: '訪視二隊', bypass: false }
      ],
      county: '花蓮縣',
      options: {
        district: ['光復鄉', '鳳林鎮'],
        village: ['大平村', '東富村', '南富村', '大馬村', '鳳林里', '長橋里', '林榮里', '山興里'],
        neighborhood: ['1鄰', '2鄰', '3鄰', '4鄰', '5鄰'],
        gender: ['男', '女', '其他'],
        damageType: ['淹水', '土石流', '屋損', '農損', '其他'],
        damageLevel: ['輕微', '中度', '嚴重', '全毀'],
        houseType: ['透天', '公寓', '平房', '鐵皮屋', '其他'],
        reliefType: ['急難救助金', '慰問金', '以工代賑', '物資援助'],
        paymentStatus: ['未撥款', '已核定', '已撥款', '退回'],
        visitStatus: ['待訪視', '訪視中', '已完成', '無法聯繫'],
        followUp: ['需複訪', '已結案', '轉介中', '觀察中']
      }
    }
  };

  var OPT = EVENT_CONFIG['flood-2026'].options;

  // ------------------------------------------------------------------
  // MEMBERS — 10 筆
  // ------------------------------------------------------------------

  var MEMBERS = [
    { email: 'lin.office@charity.org.tw', name: '林哲宇', team: 'office', availableRoutes: ['A', 'B', 'C', 'D'], role: 'member', isEventAdmin: true },
    { email: 'chen.admin@charity.org.tw', name: '陳美惠', team: 'office', availableRoutes: ['A', 'B', 'C', 'D'], role: 'member', isEventAdmin: true },
    { email: 'wu.teamA1@charity.org.tw', name: '吳建志', team: 'teamA', availableRoutes: ['A', 'B'], role: 'member', isEventAdmin: false },
    { email: 'huang.teamA2@charity.org.tw', name: '黃淑芬', team: 'teamA', availableRoutes: ['A'], role: 'member', isEventAdmin: false },
    { email: 'tsai.teamA3@charity.org.tw', name: '蔡宗翰', team: 'teamA', availableRoutes: ['A', 'B'], role: 'viewer', isEventAdmin: false },
    { email: 'chiu.teamA4@charity.org.tw', name: '邱雅婷', team: 'teamA', availableRoutes: ['A', 'B'], role: 'member', isEventAdmin: false },
    { email: 'yang.teamB1@charity.org.tw', name: '楊佳蓉', team: 'teamB', availableRoutes: ['C', 'D'], role: 'member', isEventAdmin: false },
    { email: 'hsu.teamB2@charity.org.tw', name: '許柏翰', team: 'teamB', availableRoutes: ['C'], role: 'member', isEventAdmin: false },
    { email: 'cheng.teamB3@charity.org.tw', name: '鄭宜蓁', team: 'teamB', availableRoutes: ['C', 'D'], role: 'viewer', isEventAdmin: false },
    { email: 'hong.office2@charity.org.tw', name: '洪國樑', team: 'office', availableRoutes: ['A', 'B', 'C', 'D'], role: 'viewer', isEventAdmin: false }
  ];

  // ------------------------------------------------------------------
  // DIRECTORY — 挑人器用
  // ------------------------------------------------------------------

  var DIRECTORY = {
    volunteer: [
      { email: 'v1@charity.org.tw', name: '王志明', orgUnit: '大平村志工隊' },
      { email: 'v2@charity.org.tw', name: '李美玲', orgUnit: '光復鄉志工隊' },
      { email: 'v3@charity.org.tw', name: '張俊傑', orgUnit: '鳳林鎮志工隊' },
      { email: 'v4@charity.org.tw', name: '劉淑惠', orgUnit: '花蓮縣志工聯隊' },
      { email: 'v5@charity.org.tw', name: '賴文昌', orgUnit: '大馬社區發展協會' }
    ],
    staff: [
      { email: 's1@charity.org.tw', name: '陳雅琪', orgUnit: '社福處' },
      { email: 's2@charity.org.tw', name: '林建宏', orgUnit: '賑災處' },
      { email: 's3@charity.org.tw', name: '黃詩涵', orgUnit: '花蓮聯絡處' },
      { email: 's4@charity.org.tw', name: '吳冠宇', orgUnit: '慈發處' },
      { email: 's5@charity.org.tw', name: '周思妤', orgUnit: '人資處' }
    ],
    advisor: [
      { email: 'a1@charity.org.tw', name: '曾榮森', orgUnit: '花蓮合心和氣組' },
      { email: 'a2@charity.org.tw', name: '廖美雪', orgUnit: '光復互愛組' },
      { email: 'a3@charity.org.tw', name: '徐國賓', orgUnit: '鳳林互愛組' },
      { email: 'a4@charity.org.tw', name: '謝月琴', orgUnit: '花蓮合心資深委員' }
    ]
  };

  // ------------------------------------------------------------------
  // CASES — ~24 筆,route A–D 平均分佈
  // ------------------------------------------------------------------

  var SURNAMES = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '洪', '邱', '曾', '廖', '賴', '徐', '周'];
  var GIVEN_MALE = ['志明', '家豪', '俊傑', '建宏', '文昌', '國樑', '世芳', '宗翰', '冠宇', '柏翰', '奕辰', '宇軒'];
  var GIVEN_FEMALE = ['淑芬', '美玲', '雅婷', '怡君', '佳蓉', '靜怡', '詩涵', '思妤', '品妍', '宜蓁', '玉珍', '秀琴'];
  var ID_LETTERS = ['A', 'B', 'C', 'F', 'H', 'K', 'L', 'N', 'P', 'S'];
  var RELATIONSHIP = ['本人', '配偶', '子女', '父母', '孫子女', '其他親屬'];
  var BANKS = ['台灣銀行', '合作金庫', '中華郵政', '第一銀行', '土地銀行', '花蓮二信'];
  var REFERRALS = ['花蓮縣社會局', '紅十字會', '長照2.0中心', '國軍協助', '無'];
  var NEEDS_POOL = [
    '住屋暫無法居住,需協助安置或短期租屋補助',
    '家中長者需要輪椅及行動輔具',
    '孩童就學用品因淹水損毀,需文具與書包援助',
    '需要清淤機具協助清理一樓及庭院',
    '家中無其他收入來源,需生活物資援助',
    '獨居長者,需社工定期關懷訪視',
    '家電(冰箱、洗衣機)泡水損毀,需汰換援助',
    '需協助申請房屋修繕補助及泥作估價'
  ];
  var DAMAGE_EXTRA = [
    '一樓家具、家電幾乎全毀',
    '庭院農地遭泥沙掩埋',
    '外牆及圍牆龜裂',
    '屋內淤泥厚達數公分,已初步清除',
    '電力設備泡水待檢修',
    '無人員傷亡,已妥善安置'
  ];
  var INTERNAL_NOTES_POOL = [
    '案家對外部單位介入抱持疑慮,需社工同仁協調後再安排訪視',
    '獨居長者,需留意季節性健康風險,建議提高複訪頻率',
    '家中有身心障礙成員,行動不便,安排訪視需注意交通接駁',
    '案家情緒較不穩定,建議由資深訪視員陪同再訪',
    '案家已多次向他單位申請補助,需確認是否重複撥款',
    '受款人帳戶資訊由家屬代填,尚待本人確認',
    '個資核對中,身分證影本尚未收齊',
    '案家近期有意願搬離組合屋,需持續追蹤後續安置'
  ];

  var ROUTE_AREA = {
    A: { district: '光復鄉', villages: ['大平村', '東富村'], streets: ['中正路', '中山路', '大平街'], baseLat: 23.6672, baseLng: 121.4206 },
    B: { district: '光復鄉', villages: ['南富村', '大馬村'], streets: ['林森路', '博愛街', '光復街'], baseLat: 23.6591, baseLng: 121.4102 },
    C: { district: '鳳林鎮', villages: ['鳳林里', '長橋里'], streets: ['中正路', '中山路', '光復路'], baseLat: 23.7469, baseLng: 121.4469 },
    D: { district: '鳳林鎮', villages: ['林榮里', '山興里'], streets: ['校前路', '鳳林街', '中華路'], baseLat: 23.7391, baseLng: 121.4551 }
  };

  var VISITOR_BY_ROUTE = {
    A: ['吳建志', '黃淑芬', '邱雅婷'],
    B: ['吳建志', '蔡宗翰', '邱雅婷'],
    C: ['楊佳蓉', '許柏翰'],
    D: ['楊佳蓉', '鄭宜蓁']
  };

  function maskId(letter, digits) {
    var full = letter + digits;
    return full.slice(0, 6) + '****';
  }

  function genDigits(n) {
    var s = '';
    for (var i = 0; i < n; i++) s += randInt(0, 9);
    return s;
  }

  function makePersonName() {
    var isMale = rand() < 0.5;
    var given = isMale ? pick(GIVEN_MALE) : pick(GIVEN_FEMALE);
    return { name: pick(SURNAMES) + given, gender: isMale ? '男' : '女' };
  }

  var ROUTES_CYCLE = ['A', 'B', 'C', 'D'];
  var CASES = [];

  for (var i = 0; i < 24; i++) {
    var route = ROUTES_CYCLE[i % 4];
    var area = ROUTE_AREA[route];
    var person = makePersonName();
    var village = pick(area.villages);
    var neighborhood = pick(OPT.neighborhood);
    var street = pick(area.streets);
    var visitDate = dateStr(2026, 6, randInt(1, 20));

    var damageType = rand() < 0.55 ? '淹水' : pick(OPT.damageType);
    var damageLevel = pick(OPT.damageLevel);
    var houseType = pick(OPT.houseType);
    var waterDepth = damageType === '淹水' ? randInt(20, 150) : randInt(0, 10);

    var idLetter = pick(ID_LETTERS);
    var idDigits = (rand() < 0.5 ? '1' : '2') + genDigits(8);
    var idNumber = maskId(idLetter, idDigits);

    var relationship = i % 5 === 0 ? pick(RELATIONSHIP.slice(1)) : '本人';
    var samePayee = relationship === '本人' || rand() < 0.7;
    var payeePerson = samePayee ? person : makePersonName();
    var payeeIdDigits = (rand() < 0.5 ? '1' : '2') + genDigits(8);
    var payeeIdNumber = samePayee ? idNumber : maskId(pick(ID_LETTERS), payeeIdDigits);

    var reliefType = pick(OPT.reliefType);
    var reliefAmount =
      reliefType === '急難救助金' ? randInt(6, 20) * 1000 :
      reliefType === '慰問金' ? randInt(2, 6) * 1000 :
      reliefType === '以工代賑' ? randInt(800, 1500) :
      0;

    var geocodeSource = ['auto', 'manual', null][i % 3];
    var syncState = ['synced', 'pending', 'rejected'][i % 3];

    var caseObj = {
      id: uuid(),
      caseNo: 1001 + i,
      eventSlug: 'flood-2026',
      route: route,

      visitDate: visitDate,
      visitor: pick(VISITOR_BY_ROUTE[route]),
      visitStatus: pick(OPT.visitStatus),

      county: '花蓮縣',
      district: area.district,
      village: village,
      neighborhood: neighborhood,
      address: area.district + village + neighborhood + street + randInt(1, 180) + '號',
      lat: Number((area.baseLat + (rand() - 0.5) * 0.02).toFixed(6)),
      lng: Number((area.baseLng + (rand() - 0.5) * 0.02).toFixed(6)),

      name: person.name,
      gender: person.gender,
      birthYear: randInt(1935, 2008),
      phone: '09' + genDigits(2) + '-' + genDigits(3) + '-' + genDigits(3),
      idNumber: idNumber,
      householdSize: randInt(1, 6),
      relationship: relationship,

      damageType: damageType,
      damageLevel: damageLevel,
      houseType: houseType,
      damageDesc: houseType + '一樓因' + damageType + '受損,積水約' + waterDepth + '公分,' + damageLevel + '受損,' + pick(DAMAGE_EXTRA) + '。',
      waterDepth: waterDepth,

      reliefType: reliefType,
      reliefAmount: reliefAmount,
      payeeName: payeePerson.name,
      payeeIdNumber: payeeIdNumber,
      bankName: pick(BANKS),
      bankAccount: genDigits(3) + '-' + genDigits(2) + '-' + genDigits(6),
      paymentStatus: pick(OPT.paymentStatus),

      needs: pick(NEEDS_POOL),
      followUp: pick(OPT.followUp),
      referral: pick(REFERRALS),
      internalNotes: pick(INTERNAL_NOTES_POOL),
      visitCount: randInt(1, 5),
      lastContact: addDays(visitDate, randInt(1, 14)),

      geocodeSource: geocodeSource,
      syncState: syncState
    };

    if (syncState === 'rejected') {
      caseObj.rejectReason = i % 2 === 0 ? 'permission' : 'restricted_field:idNumber';
    }

    CASES.push(caseObj);
  }

  // ------------------------------------------------------------------
  // PHOTOS — 6 筆,uploadStatus 三態皆有
  // ------------------------------------------------------------------

  var PHOTO_TITLES = ['屋內淹水情形', '大門損毀狀況', '屋頂受損', '農地流失現場', '積水深度量測', '現場清淤前'];
  var UPLOAD_STATES = ['uploaded', 'pending', 'uploading'];
  var PHOTOS = [];
  for (var p = 0; p < 6; p++) {
    var relatedCase = CASES[p];
    PHOTOS.push({
      id: uuid(),
      caseId: relatedCase.id,
      eventSlug: relatedCase.eventSlug,
      title: PHOTO_TITLES[p],
      takenAt: addDays(relatedCase.visitDate, 0) + 'T' + pad(randInt(8, 17), 2) + ':' + pad(randInt(0, 59), 2),
      uploadStatus: UPLOAD_STATES[p % 3]
    });
  }

  // ------------------------------------------------------------------
  // ADDR_POINTS / ADDR_REGIONS — 規劃桌用
  // ------------------------------------------------------------------

  var ADDR_STREETS = ['中正路', '大平街'];
  var ADDR_POINTS = [];
  var addrBaseLat = 23.6672;
  var addrBaseLng = 121.4206;
  ['1鄰', '2鄰', '3鄰'].forEach(function (nb, nbIdx) {
    var count = 6;
    for (var h = 0; h < count; h++) {
      var street = ADDR_STREETS[h % ADDR_STREETS.length];
      var houseNo = 2 + h * 4 + nbIdx;
      var displayAddress = '花蓮縣光復鄉大平村' + nb + street + houseNo + '號';
      ADDR_POINTS.push({
        addrKey: 'addr-' + nbIdx + '-' + h,
        district: '光復鄉',
        village: '大平村',
        neighborhood: nb,
        displayAddress: displayAddress,
        lat: Number((addrBaseLat + nbIdx * 0.0015 + h * 0.0006).toFixed(6)),
        lng: Number((addrBaseLng + nbIdx * 0.0012 + h * 0.0007).toFixed(6))
      });
    }
  });

  var ADDR_REGIONS = {
    '花蓮縣': {
      '光復鄉': {
        '大平村': ['1鄰', '2鄰', '3鄰', '4鄰'],
        '東富村': ['1鄰', '2鄰', '3鄰'],
        '南富村': ['1鄰', '2鄰'],
        '大馬村': ['1鄰', '2鄰', '3鄰']
      },
      '鳳林鎮': {
        '鳳林里': ['1鄰', '2鄰', '3鄰'],
        '長橋里': ['1鄰', '2鄰'],
        '林榮里': ['1鄰', '2鄰', '3鄰'],
        '山興里': ['1鄰', '2鄰']
      }
    }
  };

  // ------------------------------------------------------------------
  // ORG_TREE — 合心/互愛/處室(對應 persona.js 的 hexinAdminOf:[10] / deptAdminOf:[3])
  // ------------------------------------------------------------------

  var ORG_TREE = {
    hexin: [
      {
        id: 10,
        name: '花蓮合心',
        heqi: [
          { id: 101, name: '光復互愛' },
          { id: 102, name: '鳳林互愛' },
          { id: 103, name: '吉安互愛' }
        ]
      },
      {
        id: 11,
        name: '台東合心',
        heqi: [
          { id: 111, name: '台東互愛' },
          { id: 112, name: '關山互愛' }
        ]
      }
    ],
    depts: [
      { id: 3, name: '社福處' },
      { id: 4, name: '賑災處' },
      { id: 5, name: '慈發處' },
      { id: 6, name: '人資處' }
    ]
  };

  // ------------------------------------------------------------------
  // IMPORT_DRYRUN — 匯入試算結果(insert/update/error)
  // ------------------------------------------------------------------

  var IMPORT_DRYRUN = {
    fileHash: 'abc123',
    rows: [
      {
        action: 'insert',
        data: {
          caseNo: 1101, route: 'A', name: '沈家豪', county: '花蓮縣',
          district: '光復鄉', village: '大平村', neighborhood: '2鄰',
          address: '花蓮縣光復鄉大平村2鄰中正路88號', phone: '0933-221-445'
        }
      },
      {
        action: 'insert',
        data: {
          caseNo: 1102, route: 'C', name: '潘靜怡', county: '花蓮縣',
          district: '鳳林鎮', village: '鳳林里', neighborhood: '1鄰',
          address: '花蓮縣鳳林鎮鳳林里1鄰中正路12號', phone: '0919-002-337'
        }
      },
      {
        action: 'insert',
        data: {
          caseNo: 1103, route: 'D', name: '古秀琴', county: '花蓮縣',
          district: '鳳林鎮', village: '林榮里', neighborhood: '2鄰',
          address: '花蓮縣鳳林鎮林榮里2鄰校前路5號', phone: '0928-556-190'
        }
      },
      {
        action: 'update',
        data: {
          caseNo: 1001, name: CASES[0].name,
          visitStatus: '已完成', paymentStatus: '已撥款'
        }
      },
      {
        action: 'update',
        data: {
          caseNo: 1005, name: CASES[4].name,
          damageLevel: '嚴重', reliefAmount: 18000
        }
      },
      {
        action: 'error',
        data: {
          caseNo: 1104, route: 'B', name: '游文昌',
          district: '光復鄉', village: '中興村', neighborhood: '1鄰'
        },
        error: '村里不存在'
      },
      {
        action: 'error',
        data: {
          caseNo: 1105, route: 'A', name: '莫美玲',
          district: '光復鄉', village: '大平村', address: '花蓮縣光復鄉大平村(門牌未填)'
        },
        error: '地址無法定位'
      }
    ]
  };

  // ------------------------------------------------------------------
  // 匯出
  // ------------------------------------------------------------------

  window.VisitMock = {
    FIELD_CATALOG: FIELD_CATALOG,
    EVENTS: EVENTS,
    EVENT_CONFIG: EVENT_CONFIG,
    CASES: CASES,
    PHOTOS: PHOTOS,
    MEMBERS: MEMBERS,
    DIRECTORY: DIRECTORY,
    ADDR_POINTS: ADDR_POINTS,
    ADDR_REGIONS: ADDR_REGIONS,
    ORG_TREE: ORG_TREE,
    IMPORT_DRYRUN: IMPORT_DRYRUN
  };
})();
