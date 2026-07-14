/**
 * prototype.js — 家訪 PWA 原型的 hash 路由 + 裝置外框 + tab 註冊 + 轉場。
 *
 * 純傳統 script(非 ES module),掛到 window.VisitProto,
 * 供 mobile.html / admin.html 以 <script src="assets/prototype.js"> 直接載入。
 */
(function () {
  'use strict';

  // ---- hash 路由 -----------------------------------------------------

  function stripHash(hash) {
    if (!hash) return '';
    return hash.charAt(0) === '#' ? hash.slice(1) : hash;
  }

  function splitSegments(hash) {
    var normalized = stripHash(hash).replace(/^\//, '');
    if (normalized.length === 0) return [];
    return normalized.split('/');
  }

  function matchRoute(routes, hash) {
    var hashSegments = splitSegments(hash);
    var patterns = Object.keys(routes);
    for (var i = 0; i < patterns.length; i++) {
      var pattern = patterns[i];
      var patternSegments = splitSegments(pattern);
      if (patternSegments.length !== hashSegments.length) continue;

      var params = {};
      var isMatch = true;
      for (var s = 0; s < patternSegments.length; s++) {
        var patSeg = patternSegments[s];
        var hashSeg = hashSegments[s];
        if (patSeg.charAt(0) === ':') {
          params[patSeg.slice(1)] = decodeURIComponent(hashSeg);
        } else if (patSeg !== hashSeg) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        return { handler: routes[pattern], params: params };
      }
    }
    return null;
  }

  function initRouter(routes) {
    var routeKeys = Object.keys(routes);

    function dispatch() {
      var match = matchRoute(routes, location.hash);
      if (match) {
        match.handler(match.params || {});
        return;
      }
      if (routeKeys.length > 0) {
        navigate(routeKeys[0]);
      }
    }

    window.addEventListener('hashchange', dispatch);
    dispatch();

    return dispatch;
  }

  function navigate(hash) {
    location.hash = hash;
  }

  // ---- 裝置外框 --------------------------------------------------------

  function mountPhoneFrame(el) {
    if (!el) return null;
    el.innerHTML = '';

    var frame = document.createElement('div');
    frame.className = 'phone-frame';
    // notch is drawn by .phone-frame::before in components.css

    var content = document.createElement('div');
    content.className = 'phone-frame__screen';
    frame.appendChild(content);

    el.appendChild(frame);
    return content;
  }

  function mountBrowserFrame(el) {
    if (!el) return null;
    el.innerHTML = '';

    var frame = document.createElement('div');
    frame.className = 'browser-frame';

    var bar = document.createElement('div');
    bar.className = 'browser-frame__bar';

    // 3 dots as direct children so components.css :nth-child colours apply
    for (var i = 0; i < 3; i++) {
      var dot = document.createElement('span');
      dot.className = 'browser-frame__dot';
      bar.appendChild(dot);
    }

    var urlBar = document.createElement('div');
    urlBar.className = 'browser-frame__url';
    urlBar.textContent = 'file:///visit-pwa/admin.html';
    bar.appendChild(urlBar);

    frame.appendChild(bar);

    var content = document.createElement('div');
    content.className = 'browser-frame__body';
    frame.appendChild(content);

    el.appendChild(frame);
    return content;
  }

  // ---- tab 註冊表 --------------------------------------------------------

  var tabRegistry = {};

  function registerTab(name, fn) {
    tabRegistry[name] = fn;
  }

  function getTab(name) {
    return tabRegistry[name];
  }

  // ---- 轉場 -----------------------------------------------------------

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function screenTransition(fromEl, toEl) {
    var reduced = prefersReducedMotion();

    if (fromEl && fromEl !== toEl) {
      fromEl.hidden = true;
      fromEl.classList.remove('screen-transition-in');
    }

    if (toEl) {
      toEl.hidden = false;
      if (reduced) {
        toEl.classList.remove('screen-transition-in');
      } else {
        toEl.classList.remove('screen-transition-in');
        // 強制 reflow 以重新觸發動畫
        void toEl.offsetWidth;
        toEl.classList.add('screen-transition-in');
      }
    }
  }

  window.VisitProto = {
    initRouter: initRouter,
    navigate: navigate,
    mountPhoneFrame: mountPhoneFrame,
    mountBrowserFrame: mountBrowserFrame,
    registerTab: registerTab,
    getTab: getTab,
    screenTransition: screenTransition
  };
})();
