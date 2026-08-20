/* ============================================================
   MULK LEGACY — scroll-driven cinematic site
   ============================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     Lenis smooth scroll
  --------------------------------------------------------- */
  if (!prefersReducedMotion && window.Lenis) {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------------------------------------------------
     Frame preloader
  --------------------------------------------------------- */
  const FRAME_COUNT = 180;
  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;

  const loaderEl = document.getElementById("loader");
  const loaderFill = document.getElementById("loader-bar-fill");
  const loaderPercent = document.getElementById("loader-percent");

  function framePath(i) {
    return "frames/frame_" + String(i).padStart(4, "0") + ".webp";
  }

  function updateLoaderProgress() {
    const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    if (loaderFill) loaderFill.style.width = pct + "%";
    if (loaderPercent) loaderPercent.textContent = pct + "%";
  }

  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        updateLoaderProgress();
        resolve();
      };
      img.src = framePath(i);
      frames[i - 1] = img;
    });
  }

  async function preloadFrames() {
    const firstBatch = [];
    const firstN = Math.min(10, FRAME_COUNT);
    for (let i = 1; i <= firstN; i++) firstBatch.push(loadFrame(i));
    await Promise.all(firstBatch);
    drawFrame(0);

    const rest = [];
    for (let i = firstN + 1; i <= FRAME_COUNT; i++) rest.push(loadFrame(i));
    await Promise.all(rest);

    if (loaderEl) loaderEl.classList.add("is-hidden");
    onFramesReady();
  }

  /* ---------------------------------------------------------
     Canvas — padded cover renderer
  --------------------------------------------------------- */
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const canvasWrap = document.getElementById("canvas-wrap");
  const IMAGE_SCALE = 0.86;
  let bgColor = "#17150f";
  let currentFrame = 0;

  function sampleBgColor(img) {
    try {
      const s = 6;
      const c = document.createElement("canvas");
      c.width = s;
      c.height = s;
      const cx = c.getContext("2d");
      const cropW = Math.max(1, Math.floor(img.naturalWidth * 0.03));
      const cropH = Math.max(1, Math.floor(img.naturalHeight * 0.03));
      cx.drawImage(img, 0, 0, cropW, cropH, 0, 0, s, s);
      const d = cx.getImageData(0, 0, 1, 1).data;
      bgColor = "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
    } catch (e) {
      /* canvas read errors are non-fatal — keep previous bg color */
    }
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = window.innerWidth,
      ch = window.innerHeight;
    const iw = img.naturalWidth,
      ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale,
      dh = ih * scale;
    const dx = (cw - dw) / 2,
      dy = (ch - dh) / 2;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
    if (index % 20 === 0) sampleBgColor(img);
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(currentFrame);
  }

  /* ---------------------------------------------------------
     Frame-to-scroll binding
  --------------------------------------------------------- */
  const scrollContainer = document.getElementById("scroll-container");
  const FRAME_SPEED = 1.3; // footage keeps informing later sections rather than finishing early

  function bindScrollFrames() {
    ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
        const index = Math.min(Math.floor(accelerated * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
        if (index !== currentFrame) {
          currentFrame = index;
          requestAnimationFrame(() => drawFrame(currentFrame));
        }
      },
    });
  }

  /* ---------------------------------------------------------
     Hero — circle-wipe reveal as it scrolls away
  --------------------------------------------------------- */
  const heroSection = document.querySelector(".hero-standalone");

  function initHeroTransition() {
    ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        heroSection.style.opacity = Math.max(0, 1 - p * 2.4);
        const radius = Math.min(1, p / 0.9) * 78;
        canvasWrap.style.clipPath = "circle(" + radius + "% at 50% 50%)";
      },
    });
  }

  /* ---------------------------------------------------------
     Hero entrance — logo -> visual -> typography -> CTA
  --------------------------------------------------------- */
  function initHeroEntrance() {
    const navLogo = document.querySelector(".nav-logo");
    const heroMediaImg = document.querySelector(".hero-media img");
    const label = document.querySelector(".hero-inner .section-label");
    const words = document.querySelectorAll(".hero-heading .word");
    const tagline = document.querySelector(".hero-tagline");
    const cta = document.querySelector(".hero-cta");
    const indicator = document.querySelector(".scroll-indicator");

    if (prefersReducedMotion) return;

    gsap.set(navLogo, { opacity: 0, y: -10 });
    gsap.set(heroMediaImg, { opacity: 0, scale: 1.08 });
    gsap.set(label, { opacity: 0, y: 14 });
    gsap.set(words, { yPercent: 115 });
    gsap.set([tagline, cta, indicator], { opacity: 0, y: 18 });

    gsap
      .timeline({ delay: 0.3 })
      .to(navLogo, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0)
      .to(heroMediaImg, { opacity: 1, scale: 1, duration: 1.8, ease: "power2.out" }, 0.1)
      .to(label, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.6)
      .to(words, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "power4.out" }, 0.85)
      .to(tagline, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "-=0.5")
      .to(cta, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5")
      .to(indicator, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4");
  }

  /* ---------------------------------------------------------
     Header — subtle shrink on scroll
  --------------------------------------------------------- */
  function initHeaderScrollState() {
    const header = document.querySelector(".site-header");
    window.addEventListener(
      "scroll",
      () => header.classList.toggle("is-scrolled", window.scrollY > 80),
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
    }
    function openMenu() {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });
    menu.querySelectorAll(".mobile-menu-link").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ---------------------------------------------------------
     Gallery lightbox
  --------------------------------------------------------- */
  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("lightbox-close");
    if (!lightbox || !lightboxImg) return;

    function open(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    }
    function close() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
    }

    document.querySelectorAll("[data-lightbox]").forEach((item) => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img");
        if (img) open(img.src, img.alt);
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------------------------------------------------
     Section entrance choreography
  --------------------------------------------------------- */
  // Sections are positioned in the SAME basis GSAP uses for scroll progress.
  // With `end: "bottom bottom"`, progress 0->1 spans (containerHeight - viewportHeight),
  // not the full container height — so positioning must use that same span, or a
  // section's placement drifts out of sync with when its own reveal/overlay fires.
  const sectionPositions = [];

  function positionSections() {
    const containerHeight = scrollContainer.offsetHeight;
    const progressSpan = Math.max(1, containerHeight - window.innerHeight);
    sectionPositions.forEach(({ section, mid }) => {
      if (!section.classList.contains("section-cta")) {
        section.style.top = (mid / 100) * progressSpan + "px";
      }
    });
    return progressSpan;
  }

  function setupSectionAnimations() {
    const sections = document.querySelectorAll(".scroll-section");
    const progressSpan = Math.max(1, scrollContainer.offsetHeight - window.innerHeight);

    sections.forEach((section) => {
      const type = section.dataset.animation;
      const persist = section.dataset.persist === "true";
      const enter = parseFloat(section.dataset.enter);
      const leave = parseFloat(section.dataset.leave);
      const mid = (enter + leave) / 2;

      sectionPositions.push({ section, mid });

      const children = section.querySelectorAll(
        ".section-label, .section-heading, .section-body, .cta-button, .feature-row, .poi-row, .info-row, .editorial-item, .stat-tile, .floorplan-media"
      );

      if (prefersReducedMotion) {
        gsap.set(section, { opacity: 1 });
        return;
      }

      gsap.set(section, { opacity: 0 });
      const tl = gsap.timeline({ paused: true });
      tl.to(section, { opacity: 1, duration: 0.5 }, 0);

      switch (type) {
        case "fade-up":
          tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" }, 0);
          break;
        case "slide-left":
          tl.from(children, { x: -70, opacity: 0, stagger: 0.13, duration: 1.0, ease: "power3.out" }, 0);
          break;
        case "slide-right":
          tl.from(children, { x: 70, opacity: 0, stagger: 0.13, duration: 1.0, ease: "power3.out" }, 0);
          break;
        case "scale-up":
          tl.from(children, { scale: 0.9, opacity: 0, stagger: 0.12, duration: 1.1, ease: "power2.out" }, 0);
          break;
        case "clip-reveal":
          tl.from(
            children,
            { clipPath: "inset(100% 0 0 0)", opacity: 0, stagger: 0.15, duration: 1.2, ease: "power4.inOut" },
            0
          );
          break;
      }

      const startPx = Math.max(0, (enter - 3) / 100) * progressSpan;
      const endPx = (enter / 100) * progressSpan;

      ScrollTrigger.create({
        trigger: scrollContainer,
        start: "top+=" + startPx + " top",
        end: "top+=" + endPx + " top",
        onEnter: () => tl.play(),
        onLeaveBack: () => {
          if (!persist) tl.reverse();
        },
      });
    });

    positionSections();
  }

  /* ---------------------------------------------------------
     Key Features — count-up numerals
  --------------------------------------------------------- */
  function initFeatureCounters() {
    const nums = document.querySelectorAll(".feature-number");
    nums.forEach((el) => {
      const target = parseInt(el.dataset.value, 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = String(target).padStart(2, "0");
        return;
      }
      const proxy = { val: 0 };
      ScrollTrigger.create({
        trigger: el.closest(".scroll-section"),
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(proxy, {
            val: target,
            duration: 1.1,
            ease: "power1.out",
            onUpdate: () => {
              el.textContent = String(Math.floor(proxy.val)).padStart(2, "0");
            },
          });
        },
      });
    });
  }

  /* ---------------------------------------------------------
     Marquee
  --------------------------------------------------------- */
  function initMarquee() {
    const marquee = document.getElementById("marquee");
    if (!marquee) return;
    const enter = 90,
      leave = 93,
      fade = 1.5;

    ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress * 100;
        let opacity = 0;
        if (p >= enter - fade && p < enter) opacity = (p - (enter - fade)) / fade;
        else if (p >= enter && p <= leave) opacity = 1;
        else if (p > leave && p <= leave + fade) opacity = 1 - (p - leave) / fade;
        marquee.style.opacity = Math.max(0, Math.min(1, opacity)) * 0.5;
      },
    });
  }

  /* ---------------------------------------------------------
     Dark overlay — Location section cinematic beat
  --------------------------------------------------------- */
  function initDarkOverlay() {
    const overlay = document.getElementById("dark-overlay");
    const locationSection = document.getElementById("location");
    if (!overlay || !locationSection) return;
    const enter = parseFloat(locationSection.dataset.enter) / 100;
    const leave = parseFloat(locationSection.dataset.leave) / 100;
    const fadeRange = 0.05;
    const peakOpacity = 0.55;

    ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        let opacity = 0;
        if (p >= enter - fadeRange && p <= enter) opacity = (p - (enter - fadeRange)) / fadeRange;
        else if (p > enter && p < leave) opacity = peakOpacity;
        else if (p >= leave && p <= leave + fadeRange) opacity = peakOpacity * (1 - (p - leave) / fadeRange);
        overlay.style.opacity = Math.max(0, Math.min(peakOpacity, opacity));
      },
    });
  }

  /* ---------------------------------------------------------
     Boot
  --------------------------------------------------------- */
  function onFramesReady() {
    resizeCanvas();
    ScrollTrigger.refresh();
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    positionSections();
    ScrollTrigger.refresh();
  });

  document.addEventListener("DOMContentLoaded", () => {
    resizeCanvas();
    initHeaderScrollState();
    initMobileNav();
    initLightbox();
    initHeroEntrance();
    initHeroTransition();
    bindScrollFrames();
    setupSectionAnimations();
    initFeatureCounters();
    initMarquee();
    initDarkOverlay();
    preloadFrames();
  });
})();
