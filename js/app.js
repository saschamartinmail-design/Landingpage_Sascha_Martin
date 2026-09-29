/* ==========================================================
   Homepage-Logik
   - liest window.SITE_CONFIG (data/config.js) und window.SITE_DATA (data/daten.js)
   - baut Reiter und Inhalte ohne externe Abhängigkeiten
   - alle Texte werden per textContent gesetzt (kein HTML aus Daten)

   NEUEN REITER HINZUFÜGEN:
   1) Funktion renderXyz() schreiben (gibt ein DOM-Element zurück)
   2) Eintrag im Array TABS ergänzen
   3) optional Beschriftung in data/config.js unter tabs.xyz.label
   ========================================================== */
(function () {
  "use strict";

  var D = window.SITE_DATA || {};
  var C = (window.SITE_CONFIG && window.SITE_CONFIG.tabs) || {};
  var PROJEKTE = window.SITE_PROJEKTE || [];
  var P = D.profil || {};

  /* Layout und Farbschema: aus config.js, per Adresszusatz überschreibbar (?layout=kacheln&theme=dark) */
  var HERO_VARIANTEN = { "kacheln-ohne-kennzahlen": "d", "kacheln-d1": "d1", "kacheln-d2": "d2", "kacheln-d3": "d3", "kacheln-e1": "e1", "kacheln-e2": "e2", "kacheln-e3": "e3", "kacheln-e4": "e4", "kacheln-e5": "e2" };
  var LAYOUTS = ["klassisch", "seitenleiste", "kacheln"].concat(Object.keys(HERO_VARIANTEN));
  var params = new URLSearchParams(location.search);
  var layout = params.get("layout") || (window.SITE_CONFIG && window.SITE_CONFIG.layout) || "klassisch";
  if (LAYOUTS.indexOf(layout) < 0) layout = "klassisch";
  // Varianten D, D1–D3 nutzen das Kachel-Layout ohne Kennzahlen, mit jeweils eigenem Profil-Banner
  if (HERO_VARIANTEN[layout]) {
    document.documentElement.setAttribute("data-layout", "kacheln");
    document.documentElement.setAttribute("data-kennzahlen", "aus");
    document.documentElement.setAttribute("data-hero", HERO_VARIANTEN[layout]);
    if (layout === "kacheln-e5") document.documentElement.setAttribute("data-foto", "rund");
  } else {
    document.documentElement.setAttribute("data-layout", layout);
  }
  var themeParam = params.get("theme");
  if (themeParam === "light" || themeParam === "dark") document.documentElement.setAttribute("data-theme", themeParam);
  var MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

  /* ---------- Hilfsfunktionen ---------- */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else el.setAttribute(k, v);
      });
    }
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }
  function svg(pathD) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "1.6");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", pathD);
    s.appendChild(p);
    return s;
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : null; }
  function visible(list) { return (list || []).filter(function (x) { return x && x.sichtbar !== false; }); }

  function parseYM(s) {
    var m = /^(\d{4})(?:-(\d{2}))?$/.exec(s || "");
    return m ? { y: +m[1], m: m[2] ? +m[2] : null } : null;
  }
  function fmt(s) {
    var d = parseYM(s);
    if (!d) return "";
    return d.m ? MONTHS[d.m - 1] + " " + d.y : String(d.y);
  }
  function range(start, end) {
    var a = fmt(start);
    if (!a) return end ? "bis " + fmt(end) : "";
    return a + " – " + (end ? fmt(end) : "heute");
  }
  function duration(start, end) {
    var a = parseYM(start);
    if (!a || !a.m) return "";
    var now = new Date();
    var b = end ? parseYM(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
    if (!b || !b.m) return "";
    var months = (b.y - a.y) * 12 + (b.m - a.m) + 1;
    if (months < 1) return "";
    var y = Math.floor(months / 12), mo = months % 12, out = [];
    if (y) out.push(y + " J.");
    if (mo) out.push(mo + " Mon.");
    return out.join(" ");
  }
  function sortKey(x) {
    var d = parseYM(x.start) || parseYM(x.ende);
    return d ? d.y * 12 + (d.m || 1) : -1;
  }
  function byDateDesc(a, b) { return sortKey(b) - sortKey(a); }
  function initials(name) {
    var w = (name || "").trim().split(/\s+/).filter(Boolean);
    if (!w.length) return "·";
    return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
  }

  /* ---------- Abschnitte ---------- */
  function section(id, title, count, body) {
    return h("section", { class: "section sec-" + id, "aria-labelledby": "h-" + id }, [
      h("h2", { id: "h-" + id }, [title, h("span", { class: "count", text: String(count) })]),
      body
    ]);
  }

  function renderKarriere() {
    var items = visible(D.karriere).sort(byDateDesc);
    if (!items.length) return section("karriere", "Karriere", 0, h("p", { class: "empty", text: "Noch keine Einträge." }));
    var ul = h("ol", { class: "timeline" }, items.map(function (x) {
      var cur = !x.ende;
      var dur = duration(x.start, x.ende);
      return h("li", { class: "tl-item" + (cur ? " is-current" : "") }, [
        h("div", { class: "tl-card" }, [
          h("div", { class: "tl-head" }, [
            h("h3", { text: x.titel || x.firma }),
            cur ? h("span", { class: "badge", text: "Aktuell" }) : null
          ]),
          x.titel && x.firma ? h("p", { class: "tl-org", text: x.firma + (x.ort ? " · " + x.ort : "") }) : (x.ort ? h("p", { class: "tl-org", text: x.ort }) : null),
          h("p", { class: "tl-date", text: range(x.start, x.ende) + (dur ? " · " + dur : "") }),
          x.beschreibung ? h("p", { class: "tl-desc", text: x.beschreibung }) : null
        ])
      ]);
    }));
    return section("karriere", "Karriere", items.length, ul);
  }

  function renderQualifikationen() {
    var items = visible(D.qualifikationen).sort(byDateDesc);
    if (!items.length) return section("qualifikationen", "Qualifikationen", 0, h("p", { class: "empty", text: "Noch keine Einträge." }));
    var ul = h("ul", { class: "grid" }, items.map(function (x) {
      var isEdu = x.art === "ausbildung";
      var dateText = isEdu
        ? range(x.start, x.ende)
        : (x.start ? "Erworben " + fmt(x.start) : "") + (x.ende ? (x.start ? " · " : "") + "gültig bis " + fmt(x.ende) : "");
      var url = safeUrl(x.url);
      return h("li", { class: "qcard" }, [
        h("span", { class: "tag tag-" + (isEdu ? "ausbildung" : "zertifikat"), text: isEdu ? "Ausbildung" : "Zertifikat" }),
        h("h3", { text: x.name }),
        x.aussteller ? h("p", { class: "q-org", text: x.aussteller }) : null,
        dateText ? h("p", { class: "q-date", text: dateText }) : null,
        x.beschreibung ? h("p", { class: "q-desc", text: x.beschreibung }) : null,
        url ? h("a", { class: "q-link", href: url, target: "_blank", rel: "noopener noreferrer", text: "Nachweis ansehen ↗" }) : null
      ]);
    }));
    return section("qualifikationen", "Qualifikationen", items.length, ul);
  }

  function renderKompetenzen() {
    var items = visible(D.kompetenzen);
    if (!items.length) return section("kompetenzen", "Kompetenzen", 0, h("p", { class: "empty", text: "Noch keine Einträge." }));
    var ul = h("ul", { class: "chips" }, items.map(function (x) { return h("li", { class: "chip", text: x.name }); }));
    return section("kompetenzen", "Kompetenzen", items.length, ul);
  }

  /* ---------- Reiter: Zu meiner Person ---------- */
  function renderStats() {
    var k = visible(D.karriere), q = visible(D.qualifikationen);
    if (!k.length) return null;
    var starts = k.map(function (x) { return parseYM(x.start); }).filter(Boolean);
    var cells = [];
    if (starts.length) {
      var min = Math.min.apply(null, starts.map(function (d) { return d.y * 12 + (d.m || 1); }));
      var now = new Date();
      var years = Math.max(0, Math.floor((now.getFullYear() * 12 + now.getMonth() + 1 - min) / 12));
      cells.push([String(years), "Jahre Berufserfahrung"]);
    }
    cells.push([String(k.length), "Stationen"]);
    cells.push([String(q.filter(function (x) { return x.art !== "ausbildung"; }).length), "Zertifikate"]);
    return h("div", { class: "stats", "aria-label": "Kennzahlen" }, cells.map(function (c) {
      return h("div", { class: "stat" }, [h("b", { text: c[0] }), h("span", { text: c[1] })]);
    }));
  }

  function renderPerson() {
    var li = safeUrl(P.linkedin);
    var mail = P.email && /^[^\s@]+@[^\s@]+$/.test(P.email) ? P.email : null;
    var foto = P.foto && /^[\w\-./]+$/.test(P.foto) ? P.foto : null;

    var hero = h("section", { class: "hero", "aria-label": "Profil" }, [
      h("div", { class: "avatar-col" }, [
        h("div", { class: "avatar", "aria-hidden": foto ? null : "true" }, [
          foto ? h("img", { src: foto, alt: "Foto " + (P.name || "") }) : initials(P.name)
        ]),
        P.leitspruch ? h("p", { class: "hero-leitspruch", text: P.leitspruch }) : null
      ]),
      h("div", null, [
        h("h1", { text: P.name || "Name" }),
        P.titel ? h("p", { class: "subtitle", text: P.titel }) : null,
        P.ort ? h("p", { class: "place", text: P.ort }) : null,
        P.kurzprofil ? h("p", { class: "summary", text: P.kurzprofil }) : null,
        (li || mail) ? h("div", { class: "actions" }, [
          li ? h("a", { class: "btn primary", href: li, target: "_blank", rel: "noopener noreferrer", text: "Auf LinkedIn vernetzen ↗" }) : null,
          mail ? h("a", { class: "btn", href: "mailto:" + mail, text: "E-Mail schreiben" }) : null
        ]) : null
      ])
    ]);

    // Zwei Spalten-Container: Layouts ordnen sie per CSS (Seitenleiste, Kacheln oder untereinander)
    return h("div", { class: "person" }, [
      h("div", { class: "col-side" }, [hero, renderStats(), renderKompetenzen()]),
      h("div", { class: "col-main" }, [renderKarriere(), renderQualifikationen()])
    ]);
  }

  /* ---------- Reiter: Projekte ---------- */
  var IMG_ICON = "M4 5h16v14H4V5Zm0 11 4-4 3 3 4-5 5 6";
  /* Kurzsymbole für Business-Projektreferenzen (kein Screenshot, nur sinnbildliches Icon).
     Passendes "icon"-Feld pro Eintrag in data/projekte.js hinterlegen: database | sync | car | chip */
  var BUSINESS_ICONS = {
    database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    sync: "M4 7h13l-3-3m3 3-3 3M20 17H7l3 3m-3-3 3-3",
    car: "M5 17h14M6 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 13l1.5-5A2 2 0 0 1 7.4 6.5h9.2a2 2 0 0 1 1.9 1.5L20 13v4H4v-4Z",
    chip: "M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M7 7h10v10H7V7Z"
  };
  /* ---------- Lightbox: Screenshot in Vollbild ---------- */
  function lightboxEl() {
    var el = document.getElementById("lightbox");
    if (el) return el;
    el = h("div", { class: "lightbox", id: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": "Screenshot, groß" }, [
      h("button", { class: "lightbox-close", type: "button", "aria-label": "Schließen" }, [svg("M6 6l12 12M18 6 6 18")]),
      h("img", { class: "lightbox-img", alt: "" })
    ]);
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      if (e.target === el || e.target.closest(".lightbox-close")) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && el.classList.contains("is-open")) closeLightbox();
    });
    return el;
  }
  function openLightbox(src, alt) {
    var el = lightboxEl();
    var img = el.querySelector(".lightbox-img");
    img.src = src;
    img.alt = alt || "";
    el.classList.add("is-open");
  }
  function closeLightbox() {
    var el = document.getElementById("lightbox");
    if (el) el.classList.remove("is-open");
  }

  function shot(p, small) {
    var box = h("div", { class: "pshot" + (small ? " pshot-sm" : "") });
    function placeholder() {
      box.textContent = "";
      box.className = "pshot is-empty" + (small ? " pshot-sm" : "");
      box.appendChild(svg(IMG_ICON));
      if (!small) box.appendChild(h("span", { text: "Screenshot folgt" }));
    }
    if (p.bild && /^[\w\-./]+$/.test(p.bild)) {
      var img = h("img", { src: p.bild, alt: "Screenshot: " + p.titel, loading: "lazy", tabindex: "0", role: "button", "aria-label": "Screenshot von " + p.titel + " groß anzeigen" });
      img.addEventListener("error", placeholder);
      img.addEventListener("click", function () { openLightbox(p.bild, "Screenshot: " + p.titel); });
      img.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(p.bild, "Screenshot: " + p.titel); } });
      box.appendChild(img);
    } else placeholder();
    return box;
  }

  function pcard(p) {
    var link = safeUrl(p.link);
    var isBusiness = p.kategorie === "business";
    var body = h("div", { class: "pbody" }, [
      h("div", { class: "phead" }, [
        h("h3", { text: p.titel }),
        p.status ? h("span", { class: "badge" + (p.status === "Läuft" ? "" : " muted"), text: p.status }) : null
      ]),
      isBusiness
        ? h("div", { class: "pdesc-row" }, [
            h("div", { class: "picon", "aria-hidden": "true" }, [svg(BUSINESS_ICONS[p.icon] || IMG_ICON)]),
            h("p", { class: "pdesc", text: p.kurz || "" })
          ])
        : h("p", { class: "pdesc", text: p.kurz || "" }),
      (isBusiness && p.tags && p.tags.length) ? h("ul", { class: "ptags" }, p.tags.map(function (t) { return h("li", { class: "ptag", text: t }); })) : null,
      link ? h("a", { class: "plink", href: link, target: "_blank", rel: "noopener noreferrer", text: "Ansehen ↗" }) : null
    ]);
    if (isBusiness) return h("li", { class: "pcard pcard-business" }, [body]);
    return h("li", { class: "pcard pcard-row" }, [body, shot(p, true)]);
  }

  function pgroup(titel, items, listClass) {
    if (!items.length) return null;
    return h("div", { class: "pgroup" }, [
      h("h2", { class: "pgroup-title", text: titel }),
      h("ul", { class: "pgrid" + (listClass ? " " + listClass : "") }, items.map(pcard))
    ]);
  }

  function renderProjekte() {
    var items = PROJEKTE.filter(function (p) { return p && p.sichtbar !== false; });
    var head = h("div", { class: "page-head" }, [
      h("h1", { text: "Projekte" }),
      h("p", { text: "Kleine Werkzeuge und Experimente – jeweils kurz erklärt." })
    ]);
    if (!items.length) return h("div", null, [head, h("p", { class: "empty", text: "Noch keine Projekte eingetragen." })]);

    var business = items.filter(function (p) { return p.kategorie === "business"; });
    var privat = items.filter(function (p) { return p.kategorie !== "business"; });
    var groups = [pgroup("Business-Projektreferenzen", business), pgroup("Private Projekte", privat, "pgrid-rows")].filter(Boolean);

    // Trennstrich nur, wenn beide Gruppen tatsächlich Einträge haben
    var body = [];
    groups.forEach(function (g, i) {
      if (i > 0) body.push(h("hr", { class: "pdivider" }));
      body.push(g);
    });
    return h("div", null, [head].concat(body));
  }

  /* ---------- Reiter-Verwaltung ---------- */
  var TABS = [
    { id: "person", label: "Zu meiner Person", render: renderPerson },   // Standard-Reiter (immer der erste aktive)
    { id: "projekte", label: "Projekte", render: renderProjekte }
  ].filter(function (t) { return !C[t.id] || C[t.id].aktiv !== false; })
   .map(function (t) { if (C[t.id] && C[t.id].label) t.label = C[t.id].label; return t; });

  var main = document.getElementById("main");
  var nav = document.getElementById("tabs");
  var buttons = {};

  function idFromHash() {
    var id = (location.hash || "").replace("#", "");
    return TABS.some(function (t) { return t.id === id; }) ? id : TABS[0].id;
  }

  function show(id) {
    var tab = TABS.filter(function (t) { return t.id === id; })[0] || TABS[0];
    TABS.forEach(function (t) {
      var sel = t.id === tab.id;
      buttons[t.id].setAttribute("aria-selected", sel ? "true" : "false");
      buttons[t.id].tabIndex = sel ? 0 : -1;
    });
    main.setAttribute("aria-labelledby", "tab-" + tab.id);
    main.replaceChildren(tab.render());
    document.title = (P.name ? P.name + " – " : "") + tab.label;
  }

  function mount() {
    var brand = document.getElementById("brand");
    brand.textContent = P.name || "Startseite";
    document.getElementById("copy").textContent = "© " + new Date().getFullYear() + (P.name ? " " + P.name : "");

    TABS.forEach(function (t, i) {
      var b = h("button", { type: "button", class: "tab", role: "tab", id: "tab-" + t.id, "aria-controls": "main", text: t.label });
      b.addEventListener("click", function () {
        if (location.hash !== "#" + t.id) location.hash = "#" + t.id; else show(t.id);
      });
      b.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        var n = TABS[(i + dir + TABS.length) % TABS.length];
        buttons[n.id].focus();
        location.hash = "#" + n.id;
        e.preventDefault();
      });
      buttons[t.id] = b;
      nav.appendChild(b);
    });

    // Tabs ausblenden, wenn es nur einen gibt
    if (TABS.length < 2) nav.hidden = true;

    brand.addEventListener("click", function (e) {
      e.preventDefault();
      location.hash = "#" + TABS[0].id;
      show(TABS[0].id);
      window.scrollTo(0, 0);
    });
    window.addEventListener("hashchange", function () { show(idFromHash()); window.scrollTo(0, 0); });
    show(idFromHash());
  }

  mount();
})();
