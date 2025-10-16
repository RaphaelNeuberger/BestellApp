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
// MENU MODULE (rendert aus ./scripts/db.js)
// ==============================
const Menu = {
  renderItems() {
    if (!window.MENU_DATA) {
      console.error("MENU_DATA aus ./scripts/db.js nicht gefunden!");
      console.error(
        "Stellen Sie sicher, dass scripts/db.js vor script.js geladen wird."
      );
      return;
    }

    console.log("Renderiere Menü-Artikel aus db.js...");
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
    return categoryKey === "sushiRolls" ? "sushi-Rolls" : categoryKey;
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
      Cart.removeItem();
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
      console.error("❌ MENU_DATA aus ./scripts/db.js nicht gefunden!");
      console.error(
        'Stellen Sie sicher, dass <script src="./scripts/db.js"></script> VOR script.js geladen wird.'
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
