document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll("[data-dropdown]");

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-dropdown-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

      dropdowns.forEach((other) => {
        if (other === dropdown) return;
        other.classList.remove("open");
        const otherToggle = other.querySelector("[data-dropdown-toggle]");
        if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
      });
    });
  });

  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown.contains(event.target)) return;
      dropdown.classList.remove("open");
      const toggle = dropdown.querySelector("[data-dropdown-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });
});
