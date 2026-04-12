document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const navShell = document.querySelector(".nav-shell");
  const navCta = document.querySelector(".nav-cta");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const syncReducedMotionClass = () => {
    document.documentElement.classList.toggle("reduced-motion", prefersReducedMotion.matches);
  };

  syncReducedMotionClass();
  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", syncReducedMotionClass);
  }

  if (navToggle) {
    navToggle.setAttribute("aria-label", "Toggle navigation");
    navToggle.textContent = "Menu";
  }

  if (navMenu && navCta && !navMenu.querySelector(".nav-link--cta")) {
    const ctaClone = navCta.cloneNode(true);
    ctaClone.className = "button button-primary nav-link--cta";
    navMenu.appendChild(ctaClone);
    navCta.hidden = true;
  }

  const setMenuState = (isOpen) => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle("is-open", isOpen);
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      setMenuState(!navMenu.classList.contains("is-open"));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("click", (event) => {
      if (!navMenu.classList.contains("is-open")) return;
      if (navShell && navShell.contains(event.target)) return;
      setMenuState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setMenuState(false);
    });
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  const footerYear = document.querySelector("[data-year]");
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  const revealTargets = Array.from(document.querySelectorAll(".reveal"));
  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
});
