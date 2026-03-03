"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/* Immigrate to Brazil - Consolidated JavaScript */
/* Standard site functionality without frameworks */

function ITBInit() {
  if (window.__itbInitialized) return;
  window.__itbInitialized = true;
  ensurePrimaryStylesheet();
  ensureFavicon();
  normalizePlaceholders();
  ensureGlobalPlaceholders();

  // Mobile navigation toggle
  var mobileToggle = document.querySelector('.mobile-nav-toggle');
  var nav = document.querySelector('nav');
  var mobileNav = document.querySelector('.mobile-nav');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      if (nav) {
        nav.classList.toggle('active');
      }
      if (mobileNav) {
        mobileNav.classList.toggle('active');
      }
    });

    // Close menu when clicking nav links
    var navLinks = nav ? nav.querySelectorAll('a') : [];
    var mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];
    [].concat(_toConsumableArray(navLinks), _toConsumableArray(mobileLinks)).forEach(function (link) {
      link.addEventListener('click', function () {
        if (nav) nav.classList.remove('active');
        if (mobileNav) mobileNav.classList.remove('active');
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Form validation
  var forms = document.querySelectorAll('form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var requiredFields = form.querySelectorAll('[required]');
      var isValid = true;
      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = '#d9534f';
        } else {
          field.style.borderColor = '';
        }
      });
      if (!isValid) {
        e.preventDefault();
      }
    });
  });

  // Intersection Observer for fade-in animations on cards
  var observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  var cards = document.querySelectorAll('.card');
  cards.forEach(function (card) {
    return observer.observe(card);
  });

  // Ensure form placeholders exist on every page, then load partials
  ensureFormPlaceholders();
  loadPartials();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ITBInit);
} else {
  ITBInit();
}
function ensurePrimaryStylesheet() {
  var head = document.head;
  if (!head) return;
  var stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  stylesheets.forEach(function (link) {
    try {
      var href = link.getAttribute('href') || '';
      var isLocalCss = href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
      if (isLocalCss && !href.includes('/css/site.css')) {
        link.remove();
      }
    } catch (error) {
      console.warn('Failed to evaluate stylesheet link', error);
    }
  });
  var hasPrimary = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(function (link) {
    return (link.getAttribute('href') || '').includes('/css/site.css');
  });
  if (!hasPrimary) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/site.css';
    head.appendChild(link);
  }
}
function ensureFavicon() {
  var head = document.head;
  if (!head) return;
  var icons = Array.from(document.querySelectorAll('link[rel~="icon"]'));
  icons.forEach(function (link) {
    return link.remove();
  });
  var icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/svg+xml';
  icon.href = '/favicon.svg';
  head.appendChild(icon);
}
function normalizePlaceholders() {
  var normalize = function normalize(targetId) {
    var matches = Array.from(document.querySelectorAll("[id*=\"".concat(targetId, "\"]")));
    if (!matches.length) return;
    matches.forEach(function (el, index) {
      el.id = targetId;
      if (index > 0) {
        el.remove();
      }
    });
  };
  normalize('header-placeholder');
  normalize('footer-placeholder');
  normalize('top-bar-placeholder');
  normalize('language-switcher-placeholder');
  normalize('nav-placeholder');
  normalize('mobile-nav-placeholder');
  normalize('breadcrumbs-placeholder');
  normalize('contact-cta-placeholder');
  normalize('newsletter-placeholder');
  normalize('legal-disclaimer-placeholder');
  normalize('email-signup-placeholder');
  normalize('consultation-form-placeholder');
  normalize('schema-organization-placeholder');
  normalize('schema-website-placeholder');
  normalize('schema-breadcrumbs-placeholder');
}
function loadPartials() {
  return _loadPartials.apply(this, arguments);
}
function _loadPartials() {
  _loadPartials = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var partials;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          partials = {
            'header-placeholder': '/partials/header.html',
            'footer-placeholder': '/partials/footer.html',
            'top-bar-placeholder': '/partials/top-bar.html',
            'language-switcher-placeholder': '/partials/language-switcher.html',
            'nav-placeholder': '/partials/nav.html',
            'mobile-nav-placeholder': '/partials/mobile-nav.html',
            'breadcrumbs-placeholder': '/partials/breadcrumbs.html',
            'contact-cta-placeholder': '/partials/contact-cta.html',
            'newsletter-placeholder': '/partials/newsletter.html',
            'legal-disclaimer-placeholder': '/partials/legal-disclaimer.html',
            'email-signup-placeholder': '/partials/email-signup.html',
            'consultation-form-placeholder': '/partials/book-consultation.html',
            'schema-organization-placeholder': '/partials/schema/organization.json',
            'schema-website-placeholder': '/partials/schema/website.json',
            'schema-breadcrumbs-placeholder': '/partials/schema/breadcrumbs.json'
          };
          _context2.n = 1;
          return Promise.all(Object.keys(partials).map(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(id) {
              var el, primaryPath, fallbackPath, response, payload, _t;
              return _regenerator().w(function (_context) {
                while (1) switch (_context.p = _context.n) {
                  case 0:
                    el = document.getElementById(id);
                    if (el) {
                      _context.n = 1;
                      break;
                    }
                    return _context.a(2);
                  case 1:
                    primaryPath = partials[id];
                    fallbackPath = primaryPath.replace('/partials/', '/pages/partials/');
                    _context.p = 2;
                    _context.n = 3;
                    return fetch(primaryPath);
                  case 3:
                    response = _context.v;
                    if (response.ok) {
                      _context.n = 5;
                      break;
                    }
                    _context.n = 4;
                    return fetch(fallbackPath);
                  case 4:
                    response = _context.v;
                  case 5:
                    if (response.ok) {
                      _context.n = 6;
                      break;
                    }
                    throw new Error("HTTP ".concat(response.status));
                  case 6:
                    _context.n = 7;
                    return response.text();
                  case 7:
                    payload = _context.v;
                    if (!primaryPath.endsWith('.json')) {
                      _context.n = 8;
                      break;
                    }
                    injectSchema(payload);
                    el.remove();
                    return _context.a(2);
                  case 8:
                    el.innerHTML = payload;
                    _context.n = 10;
                    break;
                  case 9:
                    _context.p = 9;
                    _t = _context.v;
                    console.warn("Failed to load partial: ".concat(primaryPath), _t);
                  case 10:
                    return _context.a(2);
                }
              }, _callee, null, [[2, 9]]);
            }));
            return function (_x) {
              return _ref.apply(this, arguments);
            };
          }()));
        case 1:
          if (!window.__partialsNestedLoaded) {
            window.__partialsNestedLoaded = true;
            loadPartials();
          }
        case 2:
          return _context2.a(2);
      }
    }, _callee2);
  }));
  return _loadPartials.apply(this, arguments);
}
function injectSchema(jsonText) {
  var head = document.head;
  if (!head) return;
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = jsonText;
  head.appendChild(script);
}
function ensureFormPlaceholders() {
  var main = document.querySelector('main');
  if (!main) return;
  var ensurePlaceholder = function ensurePlaceholder(id, title) {
    if (document.getElementById(id)) return;
    var section = document.createElement('section');
    section.className = 'section container';
    section.setAttribute('data-auto-insert', 'forms');
    section.innerHTML = "<div id=\"".concat(id, "\"><h2>").concat(title, "</h2></div>");
    main.appendChild(section);
  };
  ensurePlaceholder('email-signup-placeholder', 'Email updates');
  ensurePlaceholder('consultation-form-placeholder', 'Book a consultation');
}
function ensureGlobalPlaceholders() {
  var body = document.body;
  if (!body) return;
  var ensureAfterHeader = function ensureAfterHeader(id) {
    if (document.getElementById(id)) return;
    var anchor = document.getElementById('header-placeholder');
    if (!anchor) return;
    var wrapper = document.createElement('div');
    wrapper.id = id;
    anchor.insertAdjacentElement('afterend', wrapper);
  };
  var ensureBeforeFooter = function ensureBeforeFooter(id) {
    if (document.getElementById(id)) return;
    var anchor = document.getElementById('footer-placeholder');
    if (!anchor) return;
    var wrapper = document.createElement('div');
    wrapper.id = id;
    anchor.insertAdjacentElement('beforebegin', wrapper);
  };
  ensureAfterHeader('breadcrumbs-placeholder');
  ensureBeforeFooter('contact-cta-placeholder');
  var schemaIds = ['schema-organization-placeholder', 'schema-website-placeholder', 'schema-breadcrumbs-placeholder'];
  schemaIds.forEach(function (id) {
    if (document.getElementById(id)) return;
    var holder = document.createElement('div');
    holder.id = id;
    holder.style.display = 'none';
    body.appendChild(holder);
  });
}

// Utility namespace for common functions
window.ITB = window.ITB || {};
ITB.scrollToTop = function () {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
ITB.addClass = function (element, className) {
  if (element) {
    element.classList.add(className);
  }
};
ITB.removeClass = function (element, className) {
  if (element) {
    element.classList.remove(className);
  }
};
ITB.toggleClass = function (element, className) {
  if (element) {
    element.classList.toggle(className);
  }
};
ITB.show = function (element) {
  if (element) {
    element.style.display = '';
  }
};
ITB.hide = function (element) {
  if (element) {
    element.style.display = 'none';
  }
};
ITB.query = function (selector) {
  return document.querySelector(selector);
};
ITB.queryAll = function (selector) {
  return document.querySelectorAll(selector);
};
