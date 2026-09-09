/* AIRDAB - site behavior
   - accessible mobile nav (focus trap, Esc, scroll lock, restore focus)
   - active nav link from current URL
   - scroll reveal (respects reduced motion)
   - count-up numbers (Our Impact / Home)
   - hero slideshow (crossfade, autoplay, dots; respects reduced motion)
   - support-type option selector (Support Us)
   - contact / support forms -> pre-filled mailto
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
      return Array.prototype.slice.call(nav.querySelectorAll("a[href], button:not([disabled])"));
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

  /* ---------- Active nav link ---------- */
  var current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a, .footer a").forEach(function (a) {
    if (a.getAttribute("href") === current && a.closest(".nav")) {
      a.classList.add("is-current");
      a.setAttribute("aria-current", "page");
    }
  });

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

  /* ---------- Forms -> mailto ---------- */
  var EMAIL = "airdabuganda@gmail.com";
  function labelFor(form, name) {
    var field = form.querySelector('[name="' + name + '"]');
    var lab = field && field.id ? form.querySelector('label[for="' + field.id + '"]') : null;
    return lab ? lab.textContent.trim().replace(/\s*\*?$/, "") : name;
  }
  function buildMailto(form) {
    var data = new FormData(form);
    var subject = form.getAttribute("data-subject") ||
      (document.querySelector(".hero__inner .display, .hero .display") || {}).textContent || "Website enquiry";
    var lines = [];
    data.forEach(function (value, key) {
      var v = String(value).trim();
      if (v) lines.push(labelFor(form, key) + ": " + v);
    });
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject.trim()) +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }
  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var note = form.querySelector(".form__note");
      if (note) {
        note.hidden = false;
        note.textContent = "Opening your email app with the message ready. Please press send to reach AIRDAB.";
      }
      window.location.href = buildMailto(form);
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

    var INTERVAL = 6000;
    var index = 0;
    var timer = null;
    var hero = stage.closest(".hero");

    stage.classList.add("is-live");
    slides.forEach(function (s, i) { s.classList.toggle("is-active", i === 0); });

    // eager-load the neighbours of the current slide so crossfades are ready
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
      if (timer || reduceMotion || document.hidden) return;
      timer = window.setInterval(next, INTERVAL);
    };
    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };
    var restart = function () { stop(); start(); };

    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      hero.addEventListener("focusin", stop);
      hero.addEventListener("focusout", start);
    }
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    render();
    start();
  });

  /* ---------- Give directly (Support Us donate panel) ---------- */
  var donateToggle = document.getElementById("donate-toggle");
  var donateAmounts = document.getElementById("donate-amounts");
  var donateOther = document.getElementById("donate-other");
  var donateContinue = document.getElementById("donate-continue");
  if (donateToggle && donateAmounts && donateContinue) {
    var state = { freq: "Monthly", amount: "25" };

    donateToggle.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        donateToggle.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        state.freq = btn.getAttribute("data-freq");
      });
    });

    donateAmounts.querySelectorAll(".donate-amount[data-amount]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        donateAmounts.querySelectorAll(".donate-amount").forEach(function (b) { b.classList.remove("is-selected"); });
        btn.classList.add("is-selected");
        state.amount = btn.getAttribute("data-amount");
        if (donateOther) donateOther.value = "";
      });
    });

    if (donateOther) {
      donateOther.addEventListener("input", function () {
        if (donateOther.value) {
          donateAmounts.querySelectorAll(".donate-amount[data-amount]").forEach(function (b) { b.classList.remove("is-selected"); });
          state.amount = donateOther.value;
        }
      });
    }

    donateContinue.addEventListener("click", function (e) {
      e.preventDefault();
      var subject = "Support interest via AIRDAB website (" + state.freq + " $" + state.amount + ")";
      var body = "I would like to give $" + state.amount + " (" + state.freq + ").\n\nPlease let me know the next step.";
      window.location.href = "mailto:airdabuganda@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }
})();