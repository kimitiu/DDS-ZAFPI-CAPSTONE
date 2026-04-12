document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const navShell = document.querySelector(".nav-shell");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const syncReducedMotionClass = () => {
    document.documentElement.classList.toggle("reduced-motion", prefersReducedMotion.matches);
  };

  syncReducedMotionClass();
  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", syncReducedMotionClass);
  }

  const setMenuState = (isOpen) => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const nextState = !navMenu.classList.contains("is-open");
      setMenuState(nextState);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("click", (event) => {
      if (!navMenu.classList.contains("is-open")) return;
      if (navShell && navShell.contains(event.target)) return;
      setMenuState(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenuState(false);
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
      threshold: 0.16,
      rootMargin: "0px 0px -6% 0px"
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
});
