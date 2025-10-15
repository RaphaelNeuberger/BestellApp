// ==============================
// MOBILE NAVIGATION MODULE
// ==============================
const MobileNav = {
  init() {
    this.bindToggleEvent();
    this.bindResizeEvent();
    this.bindLinkEvents();
  },

  bindToggleEvent() {
    const toggleButton = document.getElementById("mobile-menu-toggle");
    const nav = document.getElementById("main-nav");

    if (toggleButton && nav) {
      toggleButton.addEventListener("click", () => {
        this.toggleNav(nav, toggleButton);
      });
    }
  },

  toggleNav(nav, button) {
    nav.classList.toggle("mobile-open");
    const isOpen = nav.classList.contains("mobile-open");
    this.updateToggleIcon(button, isOpen);
  },

  updateToggleIcon(button, isOpen) {
    button.textContent = isOpen ? "✕" : "☰";
    const label = isOpen ? "Menü schließen" : "Menü öffnen";
    button.setAttribute("aria-label", label);
  },

  bindResizeEvent() {
    window.addEventListener("resize", () => {
      this.handleResize();
    });
  },

  handleResize() {
    if (window.innerWidth > 768) {
      const nav = document.getElementById("main-nav");
      const button = document.getElementById("mobile-menu-toggle");
      if (nav && button) {
        nav.classList.remove("mobile-open");
        this.updateToggleIcon(button, false);
      }
    }
  },

  bindLinkEvents() {
    const nav = document.getElementById("main-nav");
    const links = nav?.querySelectorAll("a");

    if (links && nav) {
      links.forEach((link) => {
        link.addEventListener("click", () => {
          this.handleLinkClick(nav);
        });
      });
    }
  },

  handleLinkClick(nav) {
    if (window.innerWidth <= 768) {
      const button = document.getElementById("mobile-menu-toggle");
      nav.classList.remove("mobile-open");
      if (button) this.updateToggleIcon(button, false);
    }
  },
};
