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

  /* ---------- "About the baby" form -> email or WhatsApp ----------
     Nothing leaves the page until the parent presses a button. The answers are
     assembled into a plain message and handed to their own mail app or
     WhatsApp; there is no server and nothing is stored. */
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
      ["b_kohen",     "Father is"],
      ["b_mkohen",    "Mother is"],
      ["b_firstborn", "First child"],
      ["b_place",     "Where the Bris will be held"],
      ["b_time",      "Preferred time"],
      ["b_notes",     "Anything else"],
      ["b_heard",     "How they heard"]
    ];

    var babyNote = document.getElementById("babyNote");

    var babyMessage = function () {
      var lines = ["About the baby - sent from bris-milah.com", ""];
      var answered = 0;
      babyFields.forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        var v = el ? el.value.trim() : "";
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

    var babyEmailBtn = document.getElementById("babyEmail");
    var babyWaBtn = document.getElementById("babyWhatsapp");
    if (babyEmailBtn) babyEmailBtn.addEventListener("click", function () { babySend("email"); });
    if (babyWaBtn) babyWaBtn.addEventListener("click", function () { babySend("whatsapp"); });
  }

  /* ---------- Contact form -> pre-filled email ---------- */
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

    var href =
      "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent("Website enquiry - " + value("type") + " - " + name) +
      "&body=" + encodeURIComponent(lines.join("\n"));

    window.location.href = href;
    setNote("Opening your email app. If nothing happens, please call or WhatsApp instead.", "ok");
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
