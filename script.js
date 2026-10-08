/* ==========================================================================
   Rabbi Shlome Ekstein — site behaviour
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================== */

// The address that receives the contact form.
var CONTACT_EMAIL = "rabbisekstein@bris-milah.com";

(function () {
  "use strict";

  /* ---------- Current year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  var subToggles = document.querySelectorAll(".sub-toggle");

  var closeSubs = function (except) {
    Array.prototype.forEach.call(subToggles, function (t) {
      if (t !== except) t.setAttribute("aria-expanded", "false");
    });
  };

  var closeNav = function () {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    closeSubs(null);
  };

  Array.prototype.forEach.call(subToggles, function (t) {
    t.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = t.getAttribute("aria-expanded") === "true";
      closeSubs(t);
      t.setAttribute("aria-expanded", String(!open));
    });
  });

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (!open) closeSubs(null);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
  }

  document.addEventListener("click", function (e) {
    if (nav && !nav.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
      closeSubs(null);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) closeNav();
  });

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".reveal");

  var showAll = function () {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add("visible");
    });
  };

  if (!("IntersectionObserver" in window)) {
    showAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          setTimeout(function () {
            el.classList.add("visible");
          }, Math.min(i * 90, 360));
          observer.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    Array.prototype.forEach.call(revealables, function (el) {
      observer.observe(el);
    });

    // Safety net: if anything goes wrong with the observer, never leave the
    // page blank. Everything is shown after a few seconds regardless.
    setTimeout(showAll, 4000);
  }

  /* ---------- Print button (checklists page) ---------- */
  var printBtn = document.getElementById("printPage");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  /* ---------- "About the baby" form -> direct, email or WhatsApp ----------
     Nothing leaves the page until the parent presses a button. "Send directly"
     saves to the private Google Sheet; email and WhatsApp hand a plain message
     to the parent's own app. */
  var babyForm = document.getElementById("babyForm");
  if (babyForm) {
    var babyFields = [
      ["b_parent",    "Father"],
      ["b_mother",    "Mother"],
      ["b_phone",     "Phone"],
      ["b_email",     "Email"],
      ["b_dob",       "Date of birth"],
      ["b_tob",       "Time of birth"],
      ["b_weight",    "Birth weight"],
      ["b_weeks",     "Weeks at birth"],
      ["b_delivery",  "Type of birth"],
      ["b_hospital",  "Hospital"],
      ["b_home",      "Home yet"],
      ["b_twin",      "Twin"],
      ["b_jaundice",  "Jaundice"],
      ["b_vitk",      "Vitamin K given"],
      ["b_bili",      "Bilirubin level"],
      ["b_bilidate",  "Bilirubin taken when"],
      ["b_nicu",      "NICU or special care"],
      ["b_abnormal",  "Abnormality noticed at birth"],
      ["b_health",    "Health issues now"],
      ["b_family",    "Bleeding disorder in the family"],
      ["b_prevbris",  "Trouble at an older brother's Bris"],
      ["b_ped",       "Pediatrician"],
      ["b_pedphone",  "Pediatrician phone"],
      ["b_hebrew",    "Father's Hebrew name"],
      ["b_mhebrew",   "Mother's Hebrew name"],
      ["b_firstborn", "First child"],
      ["b_kohen",     "Father is"],
      ["b_mkohen",    "Mother is"],
      ["b_place",     "Where the Bris will be held"],
      ["b_time",      "Preferred time"],
      ["b_notes",     "Anything else"],
      ["b_heard",     "How they heard"]
    ];

    var babyNote = document.getElementById("babyNote");

    // Pidyon Haben questions only appear when he is the mother's first child.
    var firstborn = document.getElementById("b_firstborn");
    var pidyonBlock = document.getElementById("pidyonBlock");
    var pidyonShown = function () {
      return !firstborn || firstborn.value === "Yes";
    };
    var updatePidyon = function () {
      if (pidyonBlock) pidyonBlock.hidden = !pidyonShown();
    };
    if (firstborn) firstborn.addEventListener("change", updatePidyon);
    updatePidyon();

    var babyMessage = function () {
      var lines = ["About the baby - sent from bris-milah.com", ""];
      var answered = 0;
      babyFields.forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        var v = el ? el.value.trim() : "";
        if (v && pidyonBlock && pidyonBlock.contains(el) && !pidyonShown()) v = "";
        if (v) {
          answered++;
          lines.push(pair[1] + ": " + v);
        }
      });
      return answered ? lines.join("\n") : null;
    };

    var babySend = function (mode) {
      var body = babyMessage();
      if (!body) {
        if (babyNote) {
          babyNote.textContent = "Please fill in at least one answer first.";
          babyNote.className = "form-note err";
        }
        return;
      }
      var url =
        mode === "whatsapp"
          ? "https://wa.me/13478316196?text=" + encodeURIComponent(body)
          : "mailto:" + CONTACT_EMAIL +
            "?subject=" + encodeURIComponent("About the baby - bris-milah.com") +
            "&body=" + encodeURIComponent(body);

      if (mode === "whatsapp") {
        window.open(url, "_blank", "noopener");
      } else {
        window.location.href = url;
      }

      if (babyNote) {
        babyNote.textContent =
          mode === "whatsapp"
            ? "Opening WhatsApp with your answers ready to send."
            : "Opening your email app with your answers ready to send.";
        babyNote.className = "form-note ok";
      }
    };

    // "Send directly": saves to Rabbi Ekstein's private Google Sheet (Babies tab)
    var babyDirect = function () {
      var answers = {};
      var answered = 0;
      babyFields.forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        var v = el ? el.value.trim() : "";
        if (v && pidyonBlock && pidyonBlock.contains(el) && !pidyonShown()) v = "";
        if (v) { answered++; answers[pair[1]] = v; }
      });
      if (!answered) {
        if (babyNote) { babyNote.textContent = "Please fill in at least one answer first."; babyNote.className = "form-note err"; }
        return;
      }
      var btn = document.getElementById("babyDirect");
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      fetch("https://script.google.com/macros/s/AKfycbwtSL9oF1nB6WRKwyZmYPv6NQt9CscyQSFUzLEWMjAKZp-NnurLRgs3wAYX9zDjbrpU/exec", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ form_version: "baby_intake_v1", submitted_at: new Date().toISOString(), answers: answers })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data || !data.ok) throw new Error("fail");
          if (babyNote) { babyNote.textContent = "Thank you, it was sent. I will call you soon."; babyNote.className = "form-note ok"; }
          if (btn) btn.textContent = "Sent";
        })
        .catch(function () {
          if (babyNote) { babyNote.textContent = "Sorry, it could not be sent. Please use email or WhatsApp, or call 845-467-8595."; babyNote.className = "form-note err"; }
          if (btn) { btn.disabled = false; btn.textContent = "Send directly to Rabbi Ekstein"; }
        });
    };
    var babyDirectBtn = document.getElementById("babyDirect");
    if (babyDirectBtn) babyDirectBtn.addEventListener("click", babyDirect);

    var babyEmailBtn = document.getElementById("babyEmail");
    var babyWaBtn = document.getElementById("babyWhatsapp");
    // Phone alert when a parent sends from their own email/WhatsApp: name and phone only
    var babyAlert = function (how) {
      var phoneEl = document.getElementById("b_phone");
      var phone = phoneEl ? phoneEl.value.trim() : "";
      if (!phone || !babyMessage()) return;
      var nameEl = document.getElementById("b_parent");
      var params = new URLSearchParams({
        name: nameEl ? nameEl.value.trim() : "",
        phone: phone,
        regarding: "Baby form sent by " + how + ", check your " + how
      });
      try {
        if (navigator.sendBeacon) navigator.sendBeacon("https://lead-alert-4146.twil.io/new-lead", params);
        else fetch("https://lead-alert-4146.twil.io/new-lead", { method: "POST", body: params, mode: "no-cors", keepalive: true });
      } catch (e) {}
    };
    if (babyEmailBtn) babyEmailBtn.addEventListener("click", function () { babyAlert("email"); babySend("email"); });
    if (babyWaBtn) babyWaBtn.addEventListener("click", function () { babyAlert("WhatsApp"); babySend("whatsapp"); });
  }

  /* ---------- Contact form -> Web3Forms ---------- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (!form) return;

  var setNote = function (text, kind) {
    if (!note) return;
    note.textContent = text;
    note.className = "form-note" + (kind ? " " + kind : "");
  };

  var value = function (id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = value("name");
    var phone = value("phone");

    var missing = [];
    [["name", name], ["phone", phone]].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!pair[1]) {
        missing.push(pair[0]);
        if (el) el.classList.add("invalid");
      } else if (el) {
        el.classList.remove("invalid");
      }
    });

    if (missing.length) {
      setNote("Please add your name and a phone number so I can reach you.", "err");
      var first = document.getElementById(missing[0]);
      if (first) first.focus();
      return;
    }

    var lines = [
      "Name: " + name,
      "Phone: " + phone,
      "Email: " + (value("email") || "-"),
      "Regarding: " + value("type"),
      "Location: " + (value("location") || "-"),
      "Due date / date of birth: " + (value("date") || "-"),
      "",
      "Message:",
      value("message") || "-"
    ];

    var bot = document.getElementById("botcheck");
    if (bot && bot.checked) return; // spam trap

    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
    setNote("Sending your message...", "");

    var payload = {
      access_key: "1954278b-98e4-4242-99fc-b24f83e7f386",
      subject: "Website enquiry - " + value("type") + " - " + name,
      from_name: "bris-milah.com",
      name: name,
      phone: phone,
      email: value("email") || "-",
      regarding: value("type"),
      location: value("location") || "-",
      date: value("date") || "-",
      message: value("message") || "-",
      page: window.location.pathname
    };

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success) {
          form.reset();
          setNote("Thank you, your message was sent. I will call you back soon.", "ok");
          if (btn) btn.textContent = "Message sent";
        } else {
          throw new Error("fail");
        }
      })
      .catch(function () {
        setNote("Sorry, the message could not be sent. Please call 845-467-8595 or WhatsApp 347-831-6196.", "err");
        if (btn) { btn.disabled = false; btn.textContent = "Send message"; }
      });
  });

  ["name", "phone"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", function () {
        el.classList.remove("invalid");
      });
    }
  });
})();

/* ---------- Quick call-back forms (adult pages) -> Web3Forms ---------- */
(function () {
  var forms = document.querySelectorAll("form.quick-form");
  Array.prototype.forEach.call(forms, function (form) {
    var note = form.querySelector(".form-note");
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.textContent : "";
    var d = form.dataset;
    var setNote = function (text, kind) {
      if (!note) return;
      note.textContent = text;
      note.className = "form-note" + (kind ? " " + kind : "");
    };
    var field = function (name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el;
    };
    var val = function (name) {
      var el = field(name);
      return el ? el.value.trim() : "";
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bot = field("botcheck");
      if (bot && bot.checked) return;
      var missing = null;
      ["name", "phone"].forEach(function (n) {
        var el = field(n);
        if (!val(n)) { if (el) el.classList.add("invalid"); if (!missing) missing = el; }
        else if (el) el.classList.remove("invalid");
      });
      if (missing) { setNote(d.missing, "err"); missing.focus(); return; }

      if (btn) { btn.disabled = true; btn.textContent = d.sending; }
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          access_key: "1954278b-98e4-4242-99fc-b24f83e7f386",
          subject: d.subject + " - " + val("name"),
          from_name: "bris-milah.com",
          name: val("name"),
          phone: val("phone"),
          best_time: val("best_time") || "-",
          message: val("message") || "-",
          page: window.location.pathname
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data || !data.success) throw new Error("fail");
          form.reset();
          setNote(d.ok, "ok");
          if (btn) btn.textContent = d.sent;
        })
        .catch(function () {
          setNote(d.err, "err");
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
    });
    ["name", "phone"].forEach(function (n) {
      var el = field(n);
      if (el) el.addEventListener("input", function () { el.classList.remove("invalid"); });
    });
  });
})();
