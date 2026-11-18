/*
 * Small touches on top of the HTML and CSS. Without JavaScript the site still
 * works: every link, every word and every color is in the HTML and CSS.
 *
 *   1. The header turns solid once you start scrolling.
 *   2. On phones, the menu button opens and closes the menu.
 *   3. The menu highlights the section you're reading.
 *   4. Sections rise into view as you reach them.
 *   5. The depth gauge shows how deep into "the ocean" you've scrolled,
 *      and you can drag it to scroll.
 *   6. The sun sets into the sea as you scroll down from the top.
 *   7. A video's thumbnail turns into the video when you click it.
 */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Keeps a number between a lowest and a highest value. */
function clamp(value, lowest, highest) {
  return Math.min(Math.max(value, lowest), highest);
}

/** 1. Gives the header a background once the page has scrolled a little. */
function setUpHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/** 2. Opens and closes the phone menu: the button, a tap on a link, or Escape. */
function setUpMenu() {
  const button = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!button || !nav) return;

  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  };

  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      setOpen(false);
      button.focus();
    }
  });
  // If the window grows past phone size while the menu is open, close it.
  window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}

/**
 * 3. Highlights the menu link of the section in the middle of the screen.
 * The hero has no link, so at the top of the page nothing is highlighted.
 */
function setUpActiveSection() {
  const links = [...document.querySelectorAll(".site-nav a[data-section]")];
  const sections = [...document.querySelectorAll("main section[id], #contact")];
  if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const active = link.dataset.section === entry.target.id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach((section) => observer.observe(section));
}

/** 4. Fades each .reveal element in the first time it scrolls into view. */
function setUpReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

  items.forEach((item) => observer.observe(item));
}

/** The ocean's zones, deepest first, by the depth in meters where each begins. */
const ZONES = [
  { from: 6000, name: "Hadal zone" },
  { from: 4000, name: "Abyssal zone" },
  { from: 1000, name: "Midnight zone" },
  { from: 200, name: "Twilight zone" },
  { from: 1, name: "Sunlight zone" },
  { from: 0, name: "Surface" },
];

/**
 * 5. The depth gauge. Every element with data-depth="<meters>" is a stop: the
 * gauge reads that depth when the element's top is a third of the way down the
 * screen, and slides smoothly between stops in between.
 *
 * It's also a slider for scrolling the page: drag the marker or click anywhere
 * on the line, and the page scrolls to the same place. With the keyboard, the
 * arrow keys (and Page Up/Down) move from section to section, and Home and End
 * go to the top and the bottom. Hovering shows each section's name at its tick.
 */
function setUpDepthGauge() {
  const gauge = document.querySelector(".gauge");
  const stops = [...document.querySelectorAll("[data-depth]")];
  if (!gauge || stops.length < 2) return;

  const track = gauge.querySelector(".gauge__track");
  const marker = gauge.querySelector(".gauge__marker");
  const depthText = gauge.querySelector(".gauge__depth");
  const zoneText = gauge.querySelector(".gauge__zone");

  let points = [];       // { y: scroll position, depth: meters }, top to bottom
  let sectionTops = [];  // the scroll position that brings each stop to the top
  let maxScroll = 1;

  // The depth at a scroll position: the depth of the last stop passed, plus
  // the share of the way to the next stop.
  const depthAt = (y) => {
    let last = -1;
    points.forEach((point, i) => {
      if (point.y <= y) last = i;
    });
    if (last < 0) return points[0].depth;
    if (last === points.length - 1) return points[last].depth;
    const from = points[last];
    const to = points[last + 1];
    const share = to.y > from.y ? (y - from.y) / (to.y - from.y) : 1;
    return from.depth + (to.depth - from.depth) * share;
  };

  const update = () => {
    const y = window.scrollY;
    const depth = depthAt(y);
    const zone = ZONES.find((z) => depth >= z.from);
    const meters = `${Math.round(depth).toLocaleString("en-US")} m`;
    depthText.textContent = meters;
    zoneText.textContent = zone.name;
    marker.style.transform = `translateY(${clamp(y / maxScroll, 0, 1) * track.clientHeight}px)`;
    track.setAttribute("aria-valuenow", String(Math.round(depth)));
    track.setAttribute("aria-valuetext", `${meters}, ${zone.name}`);
  };

  // Where each stop is. Runs again whenever the layout can change.
  const measure = () => {
    maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 0;
    points = stops.map((stop) => ({
      y: clamp(stop.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3, 0, maxScroll),
      depth: Number(stop.dataset.depth),
    }));
    sectionTops = stops.map((stop) =>
      clamp(stop.getBoundingClientRect().top + window.scrollY - headerHeight, 0, maxScroll));
    track.setAttribute("aria-valuemax", String(points[points.length - 1].depth));

    // A tick for each stop, labeled with its section's heading (the hero has none).
    track.querySelectorAll(".gauge__tick").forEach((tick) => tick.remove());
    points.forEach((point, i) => {
      const tick = document.createElement("span");
      tick.className = "gauge__tick";
      tick.style.top = `${(point.y / maxScroll) * 100}%`;
      const heading = stops[i].querySelector("h2");
      if (heading) {
        const label = document.createElement("span");
        label.className = "gauge__label";
        label.textContent = heading.textContent.trim();
        tick.append(label);
      }
      track.append(tick);
    });
    update();
  };

  // Dragging or clicking: scroll to the same share of the page as the
  // pointer's place on the line.
  const scrollToPointer = (clientY) => {
    const rect = track.getBoundingClientRect();
    const share = clamp((clientY - rect.top) / rect.height, 0, 1);
    window.scrollTo({ top: share * maxScroll, behavior: "instant" });
    update();   // move the marker now, under the pointer, rather than on the next frame
  };

  let dragging = false;
  const stopDragging = () => {
    dragging = false;
    document.documentElement.classList.remove("is-dragging-gauge");
  };
  track.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;   // the main mouse button, a finger or a pen
    event.preventDefault();
    dragging = true;
    try {
      track.setPointerCapture(event.pointerId);   // keep following the pointer off the line
    } catch {
      // Without capture, dragging still works while the pointer stays on the line.
    }
    document.documentElement.classList.add("is-dragging-gauge");
    scrollToPointer(event.clientY);
  });
  track.addEventListener("pointermove", (event) => {
    if (dragging) scrollToPointer(event.clientY);
  });
  track.addEventListener("pointerup", stopDragging);
  track.addEventListener("pointercancel", stopDragging);
  track.addEventListener("lostpointercapture", stopDragging);

  // The keyboard: deeper with Down/Right/Page Down, shallower with
  // Up/Left/Page Up, and Home and End for the top and the bottom.
  track.addEventListener("keydown", (event) => {
    const y = window.scrollY;
    let top = null;
    if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) {
      top = sectionTops.find((t) => t > y + 2) ?? maxScroll;
    } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
      top = [...sectionTops].reverse().find((t) => t < y - 2) ?? 0;
    } else if (event.key === "Home") {
      top = 0;
    } else if (event.key === "End") {
      top = maxScroll;
    }
    if (top === null) return;
    event.preventDefault();
    window.scrollTo({ top, behavior: reducedMotion.matches ? "instant" : "smooth" });
  });

  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  }, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  if (document.fonts) document.fonts.ready.then(measure);
  // The page also grows and shrinks without a resize, e.g. when an Experience
  // entry is opened or shut: measure again once per frame while it changes.
  if ("ResizeObserver" in window) {
    let measureQueued = false;
    new ResizeObserver(() => {
      if (measureQueued) return;
      measureQueued = true;
      requestAnimationFrame(() => {
        measureQueued = false;
        measure();
      });
    }).observe(document.body);
  }
  measure();
}

/**
 * 6. Sets the sun as you scroll: main.css moves the sun, its glow and its
 * reflection by --set, from 0 (the page at the top, the sun on the horizon) to
 * 1 (the sun gone), reached when 60% of the hero has scrolled away. For people
 * who ask their device for reduced motion, the sun stays where it is.
 */
function setUpSunset() {
  const hero = document.querySelector(".hero");
  if (!hero || reducedMotion.matches) return;

  let shown = null;
  const update = () => {
    const scrolled = -hero.getBoundingClientRect().top;
    const set = clamp(scrolled / (hero.offsetHeight * 0.6), 0, 1).toFixed(3);
    if (set === shown) return;  // past the hero it stays at 1: nothing to redraw
    shown = set;
    hero.style.setProperty("--set", set);
  };

  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/**
 * 7. Plays a video in place: clicking its thumbnail (a link to YouTube) puts
 * YouTube's player there instead, the same size, and starts it. The player
 * comes from youtube-nocookie.com, which sets no cookies until the video plays,
 * and only loads on the click. A click with a modifier key (to open a new tab
 * or window) still just follows the link.
 */
function setUpVideos() {
  document.querySelectorAll("a.video[data-video]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      const player = document.createElement("iframe");
      player.className = "video__frame";
      player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(link.dataset.video)}?autoplay=1&rel=0`;
      player.title = link.dataset.title || "Video";
      player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      player.allowFullscreen = true;

      const box = document.createElement("div");
      box.className = "video video--playing";
      box.append(player);
      link.replaceWith(box);
      player.focus();
    });
  });
}

setUpHeader();
setUpMenu();
setUpActiveSection();
setUpReveal();
setUpDepthGauge();
setUpSunset();
setUpVideos();
