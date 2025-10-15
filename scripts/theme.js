// ==============================
// THEME MODULE
// ==============================
const Theme = {
  currentTheme: "light",

  init() {
    this.loadTheme();
    this.bindToggleEvent();
    this.updateToggleButton();
  },

  loadTheme() {
    const savedTheme = localStorage.getItem("vina_theme") || "light";
    this.setTheme(savedTheme);
  },

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    this.saveTheme();
    this.updateToggleButton();
  },

  toggle() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  },

  saveTheme() {
    localStorage.setItem("vina_theme", this.currentTheme);
  },

  bindToggleEvent() {
    const toggleButton = document.getElementById("theme-toggle");
    if (toggleButton) {
      toggleButton.addEventListener("click", () => this.toggle());
    }
  },

  updateToggleButton() {
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");

    if (themeIcon && themeText) {
      this.setToggleButtonContent(themeIcon, themeText);
    }
  },

  setToggleButtonContent(iconEl, textEl) {
    if (this.currentTheme === "dark") {
      iconEl.textContent = "☀️";
      textEl.textContent = "Light";
    } else {
      iconEl.textContent = "🌙";
      textEl.textContent = "Dark";
    }
  },
};
