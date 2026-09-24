/* LEELA — small, dependency-free enhancements. Every page reads fine without them. */
(function () {
  "use strict";

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* Leela keeps Mountain Time; fall back to the visitor's clock if Intl can't. */
  function leelaNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Denver", weekday: "long", hour: "numeric", minute: "numeric", hour12: false
      }).formatToParts(new Date());
      var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
      return { day: DAYS.indexOf(get("weekday")), minutes: (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
  }

  /* ---- A day at Leela: today's name, rest days, and the current hour ---- */
  var today = document.getElementById("today");
  if (today) {
    var now = leelaNow();
    var isRest = now.day === 1 || now.day === 2;
    var dayName = today.querySelector("[data-dayname]");
    if (dayName) dayName.textContent = DAYS[now.day];
    var open = today.querySelector("[data-log='open']");
    var rest = today.querySelector("[data-log='rest']");
    if (open && rest) {
      open.hidden = isRest;
      rest.hidden = !isRest;
    }
    var restNote = today.querySelector("[data-restnote]");
    if (restNote) restNote.hidden = !isRest;
    var log = isRest ? rest : open;
    if (log) {
      var current = null;
      log.querySelectorAll("li[data-t]").forEach(function (li) {
        var t = li.getAttribute("data-t").split(":");
        if (parseInt(t[0], 10) * 60 + parseInt(t[1], 10) <= now.minutes) current = li;
      });
      if (current) current.classList.add("is-now");
    }
  }

  /* ---- Week strip ---- */
  document.querySelectorAll(".week").forEach(function (week) {
    var cell = week.children[(leelaNow().day + 6) % 7]; // strip starts on Monday
    if (cell) {
      cell.classList.add("is-today");
      cell.setAttribute("aria-current", "date");
    }
  });

  /* ---- Calendar filters ---- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var events = document.querySelectorAll(".event[data-kind]");
    var months = document.querySelectorAll(".month");
    var empty = document.querySelector(".events-empty");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      filterBar.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var f = btn.getAttribute("data-filter");
      var shown = 0;
      events.forEach(function (ev) {
        var match = f === "all" || ev.getAttribute("data-kind").split(" ").indexOf(f) > -1;
        ev.hidden = !match;
        if (match) shown++;
      });
      months.forEach(function (m) {
        var list = m.nextElementSibling;
        m.hidden = list ? !list.querySelector(".event:not([hidden])") : false;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* ---- Forms (not yet connected to a mailing service) ---- */
  document.querySelectorAll("form[data-signup]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".form-msg");
      var input = form.querySelector("input[type=email]");
      if (!input || !input.value || !input.checkValidity()) {
        if (msg) msg.textContent = "Please enter a valid email address.";
        return;
      }
      if (msg) msg.textContent = "Thank you. You'll receive the next seasonal letter.";
      form.reset();
    });
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
