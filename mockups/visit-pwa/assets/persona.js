/**
 * persona.js — 家訪 PWA 原型的「三層授權模型」persona 狀態機。
 *
 * 純傳統 script(非 ES module),掛到 window.VisitPersona,
 * 供 mobile.html / admin.html 以 <script src="assets/persona.js"> 直接載入。
 *
 * 三層授權:
 *   1) team/availableRoutes — 一般成員只能看自己團隊被授權的路線
 *   2) bypass — 行政組/事件管理員/系統管理員可略過路線限制,看整個活動
 *   3) adminSignal(isAdmin/eventAdminSlugs/hexinAdminOf/deptAdminOf) — 決定 admin 後台可管什麼
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'visit-persona';

  // PERSONAS 真值表(唯一事實來源,逐字對照 plan 文件)。
  var PERSONAS = [
    {
      id: 'office',
      label: '行政組',
      bypass: true,
      role: 'member',
      revoked: false,
      team: 'office',
      availableRoutes: ['A', 'B', 'C', 'D'],
      adminSignal: {
        isAdmin: false,
        eventAdminSlugs: [],
        hexinAdminOf: [],
        deptAdminOf: []
      },
      backendDivergence: null
    },
    {
      id: 'visitor',
      label: '訪視志工',
      bypass: false,
      role: 'member',
      revoked: false,
      team: 'teamA',
      availableRoutes: ['A', 'B'],
      adminSignal: {
        isAdmin: false,
        eventAdminSlugs: [],
        hexinAdminOf: [],
        deptAdminOf: []
      },
      backendDivergence: '非bypass 但可見PII,現行後端做不到,代表後端能力缺口'
    },
    {
      id: 'advisor',
      label: '指導師父',
      bypass: false,
      role: 'viewer',
      revoked: false,
      team: 'teamA',
      availableRoutes: ['A', 'B'],
      adminSignal: {
        isAdmin: false,
        eventAdminSlugs: [],
        hexinAdminOf: [],
        deptAdminOf: []
      },
      backendDivergence: null
    },
    {
      id: 'revoked',
      label: '被停權',
      bypass: false,
      role: 'member',
      revoked: true,
      team: 'teamA',
      availableRoutes: ['A', 'B'],
      adminSignal: {
        isAdmin: false,
        eventAdminSlugs: [],
        hexinAdminOf: [],
        deptAdminOf: []
      },
      backendDivergence: null
    },
    {
      id: 'orgAdmin',
      label: '合心/處室管理員',
      bypass: false,
      role: 'member',
      revoked: false,
      team: 'teamB',
      availableRoutes: ['C'],
      adminSignal: {
        isAdmin: false,
        eventAdminSlugs: [],
        hexinAdminOf: [10],
        deptAdminOf: [3]
      },
      backendDivergence: null
    },
    {
      id: 'eventAdmin',
      label: '事件管理員',
      bypass: true,
      role: 'member',
      revoked: false,
      team: 'office',
      availableRoutes: ['A', 'B', 'C', 'D'],
      adminSignal: {
        isAdmin: false,
        eventAdminSlugs: ['flood-2026'],
        hexinAdminOf: [],
        deptAdminOf: []
      },
      backendDivergence: null
    },
    {
      id: 'sysAdmin',
      label: '系統管理員',
      bypass: true,
      role: 'member',
      revoked: false,
      team: 'office',
      availableRoutes: ['A', 'B', 'C', 'D'],
      adminSignal: {
        isAdmin: true,
        eventAdminSlugs: [],
        hexinAdminOf: [],
        deptAdminOf: []
      },
      backendDivergence: null
    }
  ];

  function findPersona(id) {
    for (var i = 0; i < PERSONAS.length; i++) {
      if (PERSONAS[i].id === id) return PERSONAS[i];
    }
    return null;
  }

  function getPersona() {
    var id = null;
    try {
      id = sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      id = null;
    }
    return findPersona(id) || findPersona('office');
  }

  function setPersona(id) {
    var prev = getPersona();
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      /* sessionStorage 不可用時仍派發事件,不中斷流程 */
    }
    var next = getPersona();
    window.dispatchEvent(
      new CustomEvent('personachange', { detail: { prev: prev, next: next } })
    );
    return next;
  }

  function onPersonaChange(cb) {
    var handler = function (e) {
      cb(e.detail);
    };
    window.addEventListener('personachange', handler);
    return function unsubscribe() {
      window.removeEventListener('personachange', handler);
    };
  }

  function canSeePII(p) {
    return p.role !== 'viewer' && !p.revoked;
  }

  function canSeePhotos(p) {
    return p.role !== 'viewer' && !p.revoked;
  }

  function canPush(p) {
    return p.role !== 'viewer' && !p.revoked;
  }

  function visibleCases(p, cases, slug) {
    if (p.revoked) return [];
    if (p.bypass) {
      return cases.filter(function (c) {
        return c.eventSlug === slug;
      });
    }
    return cases.filter(function (c) {
      return c.eventSlug === slug && p.availableRoutes.indexOf(c.route) !== -1;
    });
  }

  // org        — 有組織平面存在感(orgAdmin + sysAdmin):組織 tab 可見、可依組織
  //              範圍管理名冊、可建立事件。
  // orgStructure — 可異動組織樹結構本身(合心/和氣/處室 CRUD、管理員任免、
  //              toggle-admin)。後端 /api/admin/org、任免、toggle-admin 皆僅
  //              系統管理員可用,故僅 sysAdmin 為 true;orgAdmin 為 false
  //              (進得去組織 tab,但內容降級為唯讀)。
  function adminScope(p) {
    switch (p.id) {
      case 'orgAdmin':
        return {
          manageEvents: false,
          createEvent: true,
          manageMembers: false,
          planningDesk: false,
          org: true,
          orgStructure: false
        };
      case 'eventAdmin':
        return {
          manageEvents: true,
          createEvent: false,
          manageMembers: true,
          planningDesk: true,
          org: false,
          orgStructure: false
        };
      case 'sysAdmin':
        return {
          manageEvents: true,
          createEvent: true,
          manageMembers: true,
          planningDesk: true,
          org: true,
          orgStructure: true
        };
      default:
        return {
          manageEvents: false,
          createEvent: false,
          manageMembers: false,
          planningDesk: false,
          org: false,
          orgStructure: false
        };
    }
  }

  var PII_FIELDS = ['idNumber', 'payeeIdNumber', 'internalNotes'];

  function stripPII(caseObj, p) {
    if (canSeePII(p)) {
      return caseObj;
    }
    var copy = {};
    for (var key in caseObj) {
      if (Object.prototype.hasOwnProperty.call(caseObj, key)) {
        copy[key] = caseObj[key];
      }
    }
    for (var i = 0; i < PII_FIELDS.length; i++) {
      delete copy[PII_FIELDS[i]];
    }
    return copy;
  }

  function mountPersonaSwitcher(el) {
    if (!el) return;

    el.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'persona-switcher';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Persona 切換器');

    var currentLabel = document.createElement('div');
    currentLabel.className = 'persona-switcher__current';

    var list = document.createElement('div');
    list.className = 'persona-switcher__list';

    var buttons = {};

    function render() {
      var current = getPersona();
      currentLabel.textContent = '目前身分:' + current.label;

      for (var id in buttons) {
        if (!Object.prototype.hasOwnProperty.call(buttons, id)) continue;
        var btn = buttons[id];
        var isCurrent = id === current.id;
        if (isCurrent) {
          btn.setAttribute('aria-current', 'true');
          btn.classList.add('is-active');
        } else {
          btn.removeAttribute('aria-current');
          btn.classList.remove('is-active');
        }
      }
    }

    PERSONAS.forEach(function (persona) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'persona-switcher__item';
      btn.setAttribute('role', 'button');
      btn.textContent = persona.label;

      if (persona.backendDivergence) {
        var badge = document.createElement('span');
        badge.className = 'persona-switcher__badge';
        badge.title = persona.backendDivergence;
        badge.textContent = '⚠︎ 後端缺口';
        btn.appendChild(badge);
      }

      btn.addEventListener('click', function () {
        setPersona(persona.id);
      });

      buttons[persona.id] = btn;
      list.appendChild(btn);
    });

    wrap.appendChild(currentLabel);
    wrap.appendChild(list);
    el.appendChild(wrap);

    render();
    onPersonaChange(render);
  }

  window.VisitPersona = {
    PERSONAS: PERSONAS,
    getPersona: getPersona,
    setPersona: setPersona,
    onPersonaChange: onPersonaChange,
    canSeePII: canSeePII,
    canSeePhotos: canSeePhotos,
    canPush: canPush,
    visibleCases: visibleCases,
    adminScope: adminScope,
    stripPII: stripPII,
    mountPersonaSwitcher: mountPersonaSwitcher
  };
})();
