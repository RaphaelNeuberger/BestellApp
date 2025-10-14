/* ==============================================
   VINA FOOD BESTELLAPP JAVASCRIPT (TEMPLATES-VERSION)
   ============================================== */

// ==============================
// GLOBALE VARIABLEN
// ==============================
let cartItems = [];
let deliveryOption = "abholung";

// DOM Elemente
const DOM = {
  cartSidebar: document.getElementById("cart-sidebar"),
  cartList: document.getElementById("cart-items"),
  cartCountDesktop: document.getElementById("cart-count-desktop"),
  cartCountMobile: document.getElementById("cart-count-mobile"),
  cartTotal: document.getElementById("cart-total"),
  cartTotalMobile: document.getElementById("cart-total-mobile"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  deliveryCosts: document.getElementById("delivery-costs"),
  searchInput: document.getElementById("search-input"),
  mobileCartBtn: document.getElementById("mobile-cart-btn"),
  orderModal: document.getElementById("order-confirmation"),
};

// ==============================
// WARENKORB MODULE
// ==============================
const Cart = {
  toggle() {
    DOM.cartSidebar.classList.toggle("open");
    if (DOM.cartSidebar.classList.contains("open")) {
      this.focusCart();
    }
  },

  close() {
    DOM.cartSidebar.classList.remove("open");
  },

  open() {
    DOM.cartSidebar.classList.add("open");
    this.focusCart();
  },

  focusCart() {
    setTimeout(() => {
      const closeBtn = document.getElementById("close-cart");
      if (closeBtn) closeBtn.focus();
    }, 100);
  },

  addItem(name, priceInCents) {
    const priceInEuro = priceInCents / 100;
    const existingItem = cartItems.find((item) => item.name === name);

    if (existingItem) {
      this.increaseExistingItem(existingItem);
    } else {
      this.addNewItem(name, priceInEuro);
    }

    this.updateAfterChange();
  },

  increaseExistingItem(item) {
    item.quantity += 1;
    item.totalPrice = item.price * item.quantity;
  },

  addNewItem(name, price) {
    cartItems.push({
      name: name,
      price: price,
      quantity: 1,
      totalPrice: price,
    });
  },

  updateAfterChange() {
    this.render();
    this.saveToStorage();
    this.updateMobileButton();

    if (!DOM.cartSidebar.classList.contains("open")) {
      this.open();
    }
  },

  removeItem(index) {
    if (index >= 0 && index < cartItems.length) {
      cartItems.splice(index, 1);
      this.updateAfterChange();
    }
  },

  increaseQuantity(index) {
    if (index >= 0 && index < cartItems.length) {
      const item = cartItems[index];
      item.quantity += 1;
      item.totalPrice = item.price * item.quantity;
      this.updateAfterChange();
    }
  },

  decreaseQuantity(index) {
    if (index >= 0 && index < cartItems.length) {
      const item = cartItems[index];
      if (item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = item.price * item.quantity;
        this.updateAfterChange();
      }
    }
  },

  render() {
    if (!DOM.cartList) return;

    DOM.cartList.innerHTML = "";
    let subtotal = 0;

    if (cartItems.length === 0) {
      this.renderEmptyCart();
    } else {
      subtotal = this.renderCartItems();
    }

    this.updateTotals(subtotal);
  },

  renderEmptyCart() {
    DOM.cartList.innerHTML =
      '<li class="empty-cart">Ihr Warenkorb ist leer</li>';
  },

  renderCartItems() {
    let subtotal = 0;

    cartItems.forEach((item, index) => {
      subtotal += item.totalPrice;
      const li = this.createCartItemElement(item, index);
      DOM.cartList.appendChild(li);
    });

    return subtotal;
  },

  createCartItemElement(item, index) {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = this.getCartItemTemplate(item, index);
    return li;
  },

  getCartItemTemplate(item, index) {
    return `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price.toFixed(2)} € x ${
      item.quantity
    }</div>
      </div>
      <div class="quantity-controls">
        <button class="quantity-btn decrease" onclick="Cart.decreaseQuantity(${index})">−</button>
        <span class="quantity-display">${item.quantity}</span>
        <button class="quantity-btn increase" onclick="Cart.increaseQuantity(${index})">+</button>
      </div>
      <button class="remove-btn" onclick="Cart.removeItem(${index})">🗑️</button>
    `;
  },

  updateTotals(subtotal) {
    const deliveryCosts = this.calculateDeliveryFee(subtotal);
    const total = subtotal + deliveryCosts;
    this.updateUI(subtotal, deliveryCosts, total);
  },

  calculateDeliveryFee(subtotal) {
    if (deliveryOption === "lieferung") {
      return subtotal >= 30 ? 0 : 4.99;
    }
    return 0;
  },

  updateUI(subtotal, deliveryCosts, total) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    this.updatePriceElements(subtotal, deliveryCosts, total);
    this.updateCountElements(totalItems);
    this.updateCheckoutButton();
  },

  updatePriceElements(subtotal, deliveryCosts, total) {
    if (DOM.cartSubtotal)
      DOM.cartSubtotal.textContent = `${subtotal.toFixed(2)} €`;
    if (DOM.deliveryCosts)
      DOM.deliveryCosts.textContent = `${deliveryCosts.toFixed(2)} €`;
    if (DOM.cartTotal) DOM.cartTotal.textContent = `${total.toFixed(2)} €`;
    if (DOM.cartTotalMobile)
      DOM.cartTotalMobile.textContent = `${total.toFixed(2)} €`;
  },

  updateCountElements(totalItems) {
    if (DOM.cartCountDesktop) DOM.cartCountDesktop.textContent = totalItems;
    if (DOM.cartCountMobile) DOM.cartCountMobile.textContent = totalItems;
  },

  updateCheckoutButton() {
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.disabled = cartItems.length === 0;
    }
  },

  updateMobileButton() {
    if (DOM.mobileCartBtn) {
      const display = cartItems.length > 0 ? "flex" : "none";
      DOM.mobileCartBtn.style.display = display;
    }
  },

  clear() {
    cartItems = [];
    this.render();
    this.saveToStorage();
    this.updateMobileButton();
  },

  saveToStorage() {
    localStorage.setItem("vina_cart_v2", JSON.stringify(cartItems));
  },

  loadFromStorage() {
    const savedCart = localStorage.getItem("vina_cart_v2");
    if (savedCart) {
      try {
        cartItems = JSON.parse(savedCart);
        this.render();
        this.updateMobileButton();
      } catch (e) {
        console.error("Fehler beim Laden des Warenkorbs:", e);
        cartItems = [];
      }
    }
  },

  setDeliveryOption(option) {
    deliveryOption = option;
    this.render();
  },
};

// ==============================
// MENU MODULE (rendert aus ./scripts/templates.js)
// ==============================
const Menu = {
  renderItems() {
    if (!window.MENU_DATA) {
      console.error("MENU_DATA aus ./scripts/templates.js nicht gefunden!");
      console.error(
        "Stellen Sie sicher, dass scripts/templates.js vor script.js geladen wird."
      );
      return;
    }

    console.log("Renderiere Menü-Artikel aus templates.js...");
    Object.keys(window.MENU_DATA).forEach((categoryKey) => {
      this.renderCategory(categoryKey);
    });
  },

  renderCategory(categoryKey) {
    const containerSelector = this.getContainerSelector(categoryKey);
    const container = document.getElementById(`${containerSelector}-container`);

    if (!container) {
      console.error(
        `Container #${containerSelector}-container nicht gefunden!`
      );
      return;
    }

    if (!window.MENU_DATA[categoryKey]) {
      console.error(`Kategorie ${categoryKey} nicht in MENU_DATA gefunden!`);
      return;
    }

    container.innerHTML = "";
    this.addItemsToContainer(
      container,
      window.MENU_DATA[categoryKey],
      categoryKey
    );
  },

  getContainerSelector(categoryKey) {
    return categoryKey === "sushiMaki" ? "sushi-maki" : categoryKey;
  },

  addItemsToContainer(container, items, categoryKey) {
    console.log(`Rendere ${items.length} Artikel in Kategorie ${categoryKey}`);

    items.forEach((item) => {
      const menuItemDiv = this.createMenuItem(item);
      container.appendChild(menuItemDiv);
    });
  },

  createMenuItem(item) {
    const menuItemDiv = document.createElement("div");
    menuItemDiv.className = "menu-item";
    menuItemDiv.innerHTML = this.getMenuItemTemplate(item);
    return menuItemDiv;
  },

  getMenuItemTemplate(item) {
    const safeName = item.title.replace(/'/g, "\\'");
    const price = (item.cents / 100).toFixed(2);

    return `
      <img src="${item.img}" alt="${item.title}" class="menu-item-image" loading="lazy">
      <div class="menu-item-info">
        <h3>${item.title}</h3>
        <p class="description">${item.desc}</p>
        <div class="price-add">
          <span class="price">${price} €</span>
          <button class="add-btn" onclick="Cart.addItem('${safeName}', ${item.cents})" aria-label="${item.title} zum Warenkorb hinzufügen">+</button>
        </div>
      </div>
    `;
  },
};

// ==============================
// SEARCH MODULE
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

// ==============================
// DELIVERY MODULE
// ==============================
const Delivery = {
  init() {
    const deliveryRadios = document.querySelectorAll(
      'input[name="delivery-option"]'
    );

    deliveryRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        Cart.setDeliveryOption(e.target.value);
      });
    });
  },
};

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

// ==============================
// ORDER MODULE (kein Alert!)
// ==============================
const Order = {
  process() {
    if (cartItems.length === 0) {
      this.showMessage("Ihr Warenkorb ist leer!", "error");
      return;
    }

    const orderData = this.createOrderData();
    this.showOrderConfirmation(orderData);
    this.completeOrder();
  },

  createOrderData() {
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      items: [...cartItems],
      deliveryOption: deliveryOption,
      subtotal: subtotal,
      deliveryCosts: Cart.calculateDeliveryFee(subtotal),
      total: subtotal + Cart.calculateDeliveryFee(subtotal),
      timestamp: new Date().toISOString(),
    };
  },

  showOrderConfirmation(orderData) {
    const modal = DOM.orderModal;
    const summary = document.getElementById("order-summary");

    if (modal && summary) {
      summary.innerHTML = this.createOrderSummaryTemplate(orderData);
      modal.classList.add("show");
    }
  },

  createOrderSummaryTemplate(orderData) {
    const itemsHTML = this.createItemsHTML(orderData.items);
    const deliveryText =
      orderData.deliveryOption === "lieferung" ? "Lieferung" : "Abholung";

    return `
      <h4>Bestellübersicht:</h4>
      ${itemsHTML}
      <hr style="margin: 1rem 0;">
      ${this.createTotalsHTML(orderData)}
      <p style="margin-top: 1rem; font-style: italic;">Lieferart: ${deliveryText}</p>
    `;
  },

  createItemsHTML(items) {
    return items
      .map(
        (item) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span>${item.quantity}x ${item.name}</span>
        <span>${item.totalPrice.toFixed(2)} €</span>
      </div>
    `
      )
      .join("");
  },

  createTotalsHTML(orderData) {
    return `
      <div style="display: flex; justify-content: space-between;">
        <span>Zwischensumme:</span>
        <span>${orderData.subtotal.toFixed(2)} €</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Lieferkosten:</span>
        <span>${orderData.deliveryCosts.toFixed(2)} €</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
        <span>Gesamtsumme:</span>
        <span>${orderData.total.toFixed(2)} €</span>
      </div>
    `;
  },

  completeOrder() {
    Cart.clear();
    Cart.close();
  },

  closeConfirmation() {
    if (DOM.orderModal) {
      DOM.orderModal.classList.remove("show");
    }
  },

  showMessage(message, type) {
    const toast = this.createToast(message, type);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  createToast(message, type) {
    const toast = document.createElement("div");
    const bgColor = type === "error" ? "var(--primary)" : "var(--accent)";

    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: ${bgColor};
      color: white; padding: 1rem; border-radius: var(--border-radius);
      z-index: 10001; animation: slideInRight 0.3s ease;
    `;

    return toast;
  },
};

// ==============================
// ACCESSIBILITY MODULE
// ==============================
const Accessibility = {
  init() {
    this.bindKeyboardEvents();
    this.bindClickOutside();
  },

  bindKeyboardEvents() {
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardShortcuts(e);
    });
  },

  handleKeyboardShortcuts(e) {
    if (e.key === "Escape") {
      this.handleEscapeKey();
    }

    if (e.ctrlKey && e.shiftKey && e.key === "T") {
      e.preventDefault();
      Theme.toggle();
    }
  },

  handleEscapeKey() {
    if (DOM.cartSidebar?.classList.contains("open")) {
      Cart.close();
    }
    if (DOM.orderModal?.classList.contains("show")) {
      Order.closeConfirmation();
    }
  },

  bindClickOutside() {
    document.addEventListener("click", (e) => {
      this.handleClickOutside(e);
    });
  },

  handleClickOutside(e) {
    if (!DOM.cartSidebar?.classList.contains("open")) return;

    const isClickOnCart = DOM.cartSidebar.contains(e.target);
    const isClickOnCartButton = this.isClickOnCartButton(e.target);

    if (!isClickOnCart && !isClickOnCartButton) {
      Cart.close();
    }
  },

  isClickOnCartButton(target) {
    const cartButtons = document.querySelectorAll(
      ".cart-btn, .mobile-cart-btn"
    );
    return Array.from(cartButtons).some((btn) => btn.contains(target));
  },
};

// ==============================
// APP HAUPTMODUL
// ==============================
const App = {
  init() {
    console.log("🍜 Vina Food App wird initialisiert...");

    this.loadCart();
    this.loadMenu();
    this.initModules();
    this.bindGlobalEvents();

    console.log(
      "✅ App erfolgreich initialisiert mit",
      this.getMenuItemCount(),
      "Gerichten"
    );
  },

  loadCart() {
    Cart.loadFromStorage();
  },

  loadMenu() {
    if (window.MENU_DATA) {
      Menu.renderItems();
    } else {
      console.error("❌ MENU_DATA aus ./scripts/templates.js nicht gefunden!");
      console.error(
        'Stellen Sie sicher, dass <script src="./scripts/templates.js"></script> VOR script.js geladen wird.'
      );
    }
  },

  getMenuItemCount() {
    if (!window.MENU_DATA) return 0;

    return Object.keys(window.MENU_DATA).reduce((count, category) => {
      return count + window.MENU_DATA[category].length;
    }, 0);
  },

  initModules() {
    Search.init();
    Delivery.init();
    Theme.init();
    MobileNav.init();
    Categories.init();
    Accessibility.init();
  },

  bindGlobalEvents() {
    this.handleMobileCartVisibility();
    this.handleScrollEvents();
  },

  handleMobileCartVisibility() {
    const updateVisibility = () => {
      if (DOM.mobileCartBtn) {
        const isDesktop = window.innerWidth > 768;
        const hasItems = cartItems.length > 0;
        const display = !isDesktop && hasItems ? "flex" : "none";
        DOM.mobileCartBtn.style.display = display;
      }
    };

    window.addEventListener("resize", updateVisibility);
    updateVisibility();
  },

  handleScrollEvents() {
    let scrollTimeout;

    window.addEventListener("scroll", () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Zusätzliche Scroll-Logik hier
      }, 16);
    });
  },
};

// ==============================
// GLOBALE FUNKTIONEN (für HTML onclick Events)
// ==============================
function toggleCart() {
  Cart.toggle();
}

function addToCart(name, price) {
  Cart.addItem(name, price);
}

function removeFromCart(index) {
  Cart.removeItem(index);
}

function checkout() {
  Order.process();
}

function closeOrderConfirmation() {
  Order.closeConfirmation();
}

// ==============================
// APP INITIALISIERUNG
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

// Debugging Interface (nur in Entwicklung)
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  window.VinaApp = {
    Cart,
    Menu,
    Search,
    Delivery,
    Theme,
    Order,
    cartItems: () => cartItems,
    deliveryOption: () => deliveryOption,
    menuData: () => window.MENU_DATA,
  };
  console.log("🔧 Debug-Interface verfügbar unter: window.VinaApp");
}
