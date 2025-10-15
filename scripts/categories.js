// ==============================
// CATEGORIES MODULE
// ==============================
const Categories = {
  init() {
    this.bindCategoryLinks();
    this.bindScrollSpy();
  },

  bindCategoryLinks() {
    const categoryLinks = document.querySelectorAll(".category-link");

    categoryLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        this.handleCategoryClick(e, link);
      });
    });
  },

  handleCategoryClick(e, link) {
    e.preventDefault();

    const targetId = link.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      this.scrollToSection(targetElement);
      this.updateActiveCategory(link);
    }
  },

  scrollToSection(element) {
    const headerHeight = 160;
    const targetPosition = element.offsetTop - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  },

  updateActiveCategory(activeLink) {
    const categoryLinks = document.querySelectorAll(".category-link");
    categoryLinks.forEach((link) => link.classList.remove("active"));
    activeLink.classList.add("active");
  },

  bindScrollSpy() {
    window.addEventListener("scroll", () => {
      this.handleScrollSpy();
    });
  },

  handleScrollSpy() {
    const scrollPosition = window.scrollY + 200;
    const sections = document.querySelectorAll(".menu-section");

    sections.forEach((section) => {
      this.checkSectionInView(section, scrollPosition);
    });
  },

  checkSectionInView(section, scrollPosition) {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      this.activateCategoryLink(sectionId);
    }
  },

  activateCategoryLink(sectionId) {
    const categoryLinks = document.querySelectorAll(".category-link");
    categoryLinks.forEach((link) => link.classList.remove("active"));

    const activeLink = document.querySelector(
      `.category-link[href="#${sectionId}"]`
    );
    if (activeLink) activeLink.classList.add("active");
  },
};
