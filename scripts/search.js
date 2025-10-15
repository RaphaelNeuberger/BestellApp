// ==============================
// SEARCH
// ==============================
const Search = {
  init() {
    if (!DOM.searchInput) return;

    DOM.searchInput.addEventListener("input", (e) => {
      this.filterItems(e.target.value.toLowerCase());
    });
  },

  filterItems(searchTerm) {
    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach((item) => {
      const isVisible = this.isItemVisible(item, searchTerm);
      item.style.display = isVisible ? "" : "none";
    });

    this.updateCategoryVisibility();
  },

  isItemVisible(item, searchTerm) {
    const title = item.querySelector("h3")?.textContent.toLowerCase() || "";
    const desc =
      item.querySelector(".description")?.textContent.toLowerCase() || "";
    return title.includes(searchTerm) || desc.includes(searchTerm);
  },

  updateCategoryVisibility() {
    const sections = document.querySelectorAll(".menu-section");

    sections.forEach((section) => {
      const hasVisibleItems = this.hasVisibleItems(section);
      section.style.display = hasVisibleItems ? "" : "none";
    });
  },

  hasVisibleItems(section) {
    const items = section.querySelectorAll(".menu-item");
    return Array.from(items).some((item) => item.style.display !== "none");
  },
};
