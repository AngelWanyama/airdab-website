/* AIRDAB - site behavior
   - accessible mobile nav (focus trap, Esc, scroll lock, restore focus)
   - active nav link from current URL
   - scroll reveal (respects reduced motion)
   - count-up numbers (Our Impact / Home)
   - hero slideshow (crossfade, autoplay, dots; respects reduced motion)
   - support-type option selector (Support Us)
   - About dropdown (disclosure, Esc, click-outside)
   - contact / support forms -> validated, spam-guarded send via FormSubmit
   - dynamic copyright year
*/
(function () {
  "use strict";

  var body = document.body;
  body.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (toggle && nav) {
    var lastFocused = null;
    var focusables = function () {
      return Array.prototype.slice.call(nav.querySelectorAll("a[href], button:not([disabled])"))
        .filter(function (el) { return el.offsetParent !== null; }); // skip collapsed submenu links
    };
    var openNav = function () {
      lastFocused = document.activeElement;
      body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      var f = focusables();
      if (f.length) f[0].focus();
    };
    var closeNav = function (restore) {
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (restore && lastFocused) lastFocused.focus();
    };
    toggle.addEventListener("click", function () {
      body.classList.contains("nav-open") ? closeNav(true) : openNav();
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(false); });
    document.addEventListener("keydown", function (e) {
      if (!body.classList.contains("nav-open")) return;
      if (e.key === "Escape") { closeNav(true); return; }
      if (e.key === "Tab") {
        var f = focusables();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var mq = window.matchMedia("(min-width: 1081px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () {
      if (mq.matches) closeNav(false);
    });
  }

  /* ---------- About dropdown (disclosure) ---------- */
  document.querySelectorAll(".nav__group").forEach(function (group) {
    var btn = group.querySelector(".nav__parent");
    if (!btn) return;
    var setOpen = function (open) {
      group.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    btn.addEventListener("click", function () { setOpen(!group.classList.contains("is-open")); });
    group.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && group.classList.contains("is-open")) {
        e.stopPropagation(); // close the submenu first, not the whole mobile drawer
        setOpen(false);
        btn.focus();
      }
    });
    document.addEventListener("click", function (e) { if (!group.contains(e.target)) setOpen(false); });
    group.addEventListener("focusout", function (e) {
      if (e.relatedTarget && !group.contains(e.relatedTarget) && window.matchMedia("(min-width: 1081px)").matches) setOpen(false);
    });
  });

  /* ---------- Active nav link ---------- */
  var current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a, .footer a").forEach(function (a) {
    if (a.getAttribute("href") === current && a.closest(".nav")) {
      a.classList.add("is-current");
      a.setAttribute("aria-current", "page");
    }
  });
  if (["about.html", "board.html", "management.html"].indexOf(current) > -1) {
    document.querySelectorAll(".nav__parent").forEach(function (b) { b.classList.add("is-current"); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up numbers ---------- */
  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    var runCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = (el.getAttribute("data-decimals") | 0);
      if (reduceMotion) { el.textContent = target.toLocaleString(undefined, { minimumFractionDigits: decimals }) + suffix; return; }
      var duration = 1600, start = null;
      var tick = function (now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!reduceMotion && "IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) {
        el.textContent = "0" + (el.getAttribute("data-suffix") || "");
        cio.observe(el);
      });
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---------- Support-type option selector (Support Us) ---------- */
  var optGroup = document.querySelector("[data-opt-group]");
  if (optGroup) {
    var hidden = document.getElementById(optGroup.getAttribute("data-opt-group"));
    optGroup.querySelectorAll(".opt").forEach(function (opt) {
      opt.addEventListener("click", function () {
        optGroup.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("is-selected"); o.setAttribute("aria-pressed", "false"); });
        opt.classList.add("is-selected");
        opt.setAttribute("aria-pressed", "true");
        if (hidden) hidden.value = opt.getAttribute("data-value") || opt.textContent.trim();
      });
    });
  }

  /* keep floating labels correct for <select> */
  document.querySelectorAll(".field select").forEach(function (sel) {
    var sync = function () { sel.classList.toggle("has-value", !!sel.value); };
    sel.addEventListener("change", sync); sync();
  });

  /* ---------- Contact / support forms -> email via FormSubmit ----------
     The site is static, so messages are relayed by FormSubmit (formsubmit.co),
     which emails them to the organisational inbox below with the visitor's
     address as Reply-To. No secret is involved: the endpoint is public by
     design. Once the inbox owner activates the form, FormSubmit issues a
     random alias that can replace the address in FORM_ENDPOINT. */
  var EMAIL = "airdabuganda@gmail.com";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + EMAIL;
  var MIN_FILL_MS = 3000;          // faster than this is almost certainly a bot
  var MAX_SENDS = 3, SEND_WINDOW_MS = 10 * 60 * 1000; // per browser
  var pageLoadedAt = Date.now();

  function labelFor(form, name) {
    var field = form.querySelector('[name="' + name + '"]');
    if (field && field.getAttribute("data-label")) return field.getAttribute("data-label");
    var lab = field && field.id ? form.querySelector('label[for="' + field.id + '"]') : null;
    return lab ? lab.textContent.trim().replace(/\s*\(optional\)\s*$/i, "").replace(/\s*\*?$/, "") : name;
  }
  function recentSends() {
    try {
      var now = Date.now();
      return (JSON.parse(localStorage.getItem("airdab-form-sends") || "[]") || [])
        .filter(function (t) { return typeof t === "number" && now - t < SEND_WINDOW_MS; });
    } catch (err) { return []; }
  }
  function recordSend() {
    try {
      var list = recentSends(); list.push(Date.now());
      localStorage.setItem("airdab-form-sends", JSON.stringify(list));
    } catch (err) { /* storage unavailable: rely on the server-side limits */ }
  }
  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
  var RULES = {
    "full-name": function (v) { return v.length < 2 ? "Please enter your full name." : v.length > 100 ? "Please shorten your name to 100 characters." : ""; },
    "email": function (v) { return !v ? "Please enter your email address." : !EMAIL_RE.test(v) || v.length > 254 ? "Please enter a valid email address, for example name@example.com." : ""; },
    "phone": function (v) { return v && !/^[+\d][\d\s()-]{5,24}$/.test(v) ? "Please enter a valid phone number, or leave it blank." : ""; },
    "message": function (v) { return v.length < 10 ? "Please write a message of at least 10 characters." : v.length > 5000 ? "Please keep your message under 5,000 characters." : ""; }
  };

  function fieldError(field, msg) {
    var id = field.id + "-error";
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("p");
      el.id = id;
      el.className = "field__error";
      field.parentNode.appendChild(el);
      var described = (field.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
      if (described.indexOf(id) < 0) described.push(id);
      field.setAttribute("aria-describedby", described.join(" "));
    }
    el.textContent = msg;
    el.hidden = !msg;
    if (msg) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
  }
  function validate(form) {
    var firstBad = null;
    Object.keys(RULES).forEach(function (name) {
      var field = form.querySelector('[name="' + name + '"]');
      if (!field) return;
      var msg = RULES[name](field.value.trim());
      fieldError(field, msg);
      if (msg && !firstBad) firstBad = field;
    });
    return firstBad;
  }
  function showNote(form, kind, text, withEmailLink) {
    var note = form.querySelector(".form__note");
    if (!note) return;
    note.hidden = false;
    note.classList.toggle("form__note--error", kind === "error");
    note.setAttribute("role", kind === "error" ? "alert" : "status");
    note.textContent = text;
    if (withEmailLink) {
      note.appendChild(document.createTextNode(" "));
      var a = document.createElement("a");
      a.href = "mailto:" + EMAIL;
      a.textContent = EMAIL;
      note.appendChild(a);
      note.appendChild(document.createTextNode("."));
    }
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var button = form.querySelector('button[type="submit"]');
    var buttonHTML = button ? button.innerHTML : "";
    var sending = false;

    // re-check a field once the visitor has been told it is wrong
    form.addEventListener("input", function (e) {
      var f = e.target;
      if (f.getAttribute && f.getAttribute("aria-invalid") === "true" && RULES[f.name]) fieldError(f, RULES[f.name](f.value.trim()));
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return; // ignore double clicks / repeated Enter

      var firstBad = validate(form);
      if (firstBad) {
        showNote(form, "error", "Please check the highlighted fields and try again.");
        firstBad.focus();
        return;
      }
      var honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) { // bot filled the hidden field: pretend success, send nothing
        form.reset();
        showNote(form, "ok", "Thank you. Your message has been sent to AIRDAB.");
        return;
      }
      if (Date.now() - pageLoadedAt < MIN_FILL_MS) {
        showNote(form, "error", "That was very quick. Please wait a moment and press send again.");
        return;
      }
      if (recentSends().length >= MAX_SENDS) {
        showNote(form, "error", "You have sent several messages in the last few minutes. Please try again later, or email us at", true);
        return;
      }

      var payload = {
        _subject: form.getAttribute("data-subject") || "Website enquiry via AIRDAB",
        _template: "table",
        _captcha: "false"
      };
      new FormData(form).forEach(function (value, key) {
        var v = String(value).trim();
        if (!v || key === "_honey") return;
        if (key === "email") { payload.email = v; payload._replyto = v; return; }
        payload[labelFor(form, key)] = v;
      });

      sending = true;
      form.setAttribute("aria-busy", "true");
      if (button) { button.disabled = true; button.textContent = "Sending..."; }
      showNote(form, "ok", "Sending your message...");

      var controller = "AbortController" in window ? new AbortController() : null;
      var timeout = window.setTimeout(function () { if (controller) controller.abort(); }, 15000);

      // URL-encoded body = a CORS "simple" request (no preflight round trip)
      var body = new URLSearchParams();
      Object.keys(payload).forEach(function (k) { body.append(k, payload[k]); });
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: body,
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            var ok = res.ok && (data.success === true || data.success === "true");
            if (!ok) throw new Error((data && data.message) || ("HTTP " + res.status));
          });
        })
        .then(function () {
          recordSend();
          form.reset();
          form.querySelectorAll(".field__error").forEach(function (el) { el.hidden = true; el.textContent = ""; });
          showNote(form, "ok", "Thank you. Your message has been sent to AIRDAB and our team will reply to the email address you provided.");
        })
        .catch(function (err) {
          if (window.console) console.warn("AIRDAB form submission failed:", err && err.message);
          showNote(form, "error", "Sorry, your message could not be sent just now. Please try again in a few minutes, or email us directly at", true);
        })
        .then(function () {
          window.clearTimeout(timeout);
          sending = false;
          form.removeAttribute("aria-busy");
          if (button) { button.disabled = false; button.innerHTML = buttonHTML; }
        });
    });
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Hero slideshow (crossfade, autoplay, dots) ---------- */
  document.querySelectorAll(".hero__slides").forEach(function (stage) {
    var slides = Array.prototype.slice.call(stage.querySelectorAll(".hero__slide"));
    if (slides.length < 2) return;

    var INTERVAL = 5000;
    var index = 0;
    var timer = null;
    var hero = stage.closest(".hero");

    stage.classList.add("is-live");
    slides.forEach(function (s, i) { s.classList.toggle("is-active", i === 0); });

    // eager-load the neighbors of the current slide so crossfades are ready
    var warm = function (i) {
      var img = slides[(i + slides.length) % slides.length].querySelector("img");
      if (img && img.loading === "lazy") img.loading = "eager";
    };
    warm(1);

    var dots = document.createElement("div");
    dots.className = "hero__dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Choose hero image");
    var buttons = slides.map(function (slide, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      var label = (slide.querySelector("img") || {}).alt || "Image " + (i + 1);
      b.setAttribute("aria-label", label);
      b.addEventListener("click", function () { go(i); restart(); });
      dots.appendChild(b);
      return b;
    });
    (hero || stage.parentNode).appendChild(dots);

    var render = function () {
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === index); });
      buttons.forEach(function (b, i) {
        b.classList.toggle("is-active", i === index);
        b.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    };
    var go = function (i) { index = (i + slides.length) % slides.length; warm(index + 1); render(); };
    var next = function () { go(index + 1); };

    var start = function () {
      if (timer || document.hidden) return;
      timer = window.setInterval(next, INTERVAL);
    };
    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };
    var restart = function () { stop(); start(); };

    // Pause only while the pointer is on the dot controls (not the whole hero,
    // which fills the viewport), and while a control has keyboard focus.
    dots.addEventListener("mouseenter", stop);
    dots.addEventListener("mouseleave", start);
    if (hero) {
      hero.addEventListener("focusin", stop);
      hero.addEventListener("focusout", start);
    }
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    render();
    start();
  });

  /* ---------- Impact stories carousel (Our Impact) ----------
     Every 10s the stories turn clockwise: right-hand top -> middle -> bottom ->
     featured (left) -> top. Each story keeps its own photo, name and title.
     Pauses only while keyboard focus is inside it or the tab is hidden. */
  document.querySelectorAll("[data-story-carousel]").forEach(function (root) {
    var dataEl = root.querySelector(".story-data");
    var feature = root.querySelector(".feature-quote");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".quote-card"));
    if (!dataEl || !feature || cards.length !== 3) return;
    var stories;
    try { stories = JSON.parse(dataEl.textContent); } catch (err) { return; }
    if (stories.length !== 4) return;

    var photos = {};
    feature.querySelectorAll(".feature-quote__photo").forEach(function (p) {
      photos[p.getAttribute("data-story")] = p;
      p.hidden = false; // HTML hides photos 2-4 so the page is correct without this script
      var img = p.querySelector("img"); if (img) img.loading = "eager"; // ready before they rotate in
    });
    var caption = feature.querySelector(".feature-quote__body");
    var order = [0, 1, 2, 3]; // [featured, top, middle, bottom]
    var INTERVAL = 10000, SWAP_MS = 350; // 10s: enough time to read a full story
    var timer = null, focused = false;

    var fillFeature = function (s) {
      caption.querySelector("blockquote").textContent = s.quote;
      caption.querySelector("cite").textContent = s.name + ", " + s.title;
    };
    var fillCard = function (card, s) {
      card.querySelector("blockquote").textContent = s.quote;
      card.querySelector(".quote-card__badge").textContent = s.badge;
      card.querySelector(".quote-card__by strong").textContent = s.name;
      card.querySelector(".quote-card__by div span").textContent = s.title;
    };
    var render = function () {
      fillFeature(stories[order[0]]);
      cards.forEach(function (card, i) { fillCard(card, stories[order[i + 1]]); });
      Object.keys(photos).forEach(function (id) { photos[id].classList.toggle("is-active", id === stories[order[0]].id); });
    };

    // lock heights to the tallest story so the page does not jump while texts change
    var lockHeights = function () {
      var saved = order.slice();
      feature.style.minHeight = ""; cards.forEach(function (c) { c.style.minHeight = ""; });
      var fMax = 0, cMax = 0;
      stories.forEach(function (s) {
        fillFeature(s); fMax = Math.max(fMax, feature.offsetHeight);
        fillCard(cards[0], s); cMax = Math.max(cMax, cards[0].offsetHeight);
      });
      order = saved; render();
      feature.style.minHeight = fMax + "px";
      cards.forEach(function (c) { c.style.minHeight = cMax + "px"; });
    };

    var swapping = [caption].concat(cards);
    swapping.forEach(function (el) { el.classList.add("story-swap"); });
    var rotate = function () {
      swapping.forEach(function (el) { el.classList.add("is-out"); });
      order = [order[3], order[0], order[1], order[2]]; // bottom -> featured, featured -> top, top -> middle, middle -> bottom
      Object.keys(photos).forEach(function (id) { photos[id].classList.toggle("is-active", id === stories[order[0]].id); });
      window.setTimeout(function () {
        render();
        swapping.forEach(function (el) { el.classList.remove("is-out"); });
      }, SWAP_MS);
    };

    var start = function () {
      if (timer || focused || document.hidden) return;
      timer = window.setInterval(rotate, INTERVAL);
    };
    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };
    root.addEventListener("focusin", function () { focused = true; stop(); });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget)) { focused = false; start(); } });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    var resizeT;
    window.addEventListener("resize", function () { window.clearTimeout(resizeT); resizeT = window.setTimeout(lockHeights, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockHeights);

    render();
    lockHeights();
    root._storyCarousel = { rotate: rotate, order: function () { return order.slice(); } }; // test hook
    start();
  });
})();