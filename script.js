/* ==============================================
   VINA FOOD — BESTELLAPP JAVASCRIPT
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
  cartCount: document.getElementById("cart-count"),
  cartTotal: document.getElementById("cart-total"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  deliveryCosts: document.getElementById("delivery-costs"),
  searchInput: document.getElementById("search-input"),
};

// ==============================
// WARENKORB MODULE
// ==============================
const Cart = {
  // Warenkorb öffnen/schließen
  toggle() {
    DOM.cartSidebar.classList.toggle("open");
  },

  // Artikel hinzufügen
  addItem(name, price) {
    const priceInEuro = price / 100;
    cartItems.push({ name, price: priceInEuro });
    this.render();
    this.saveToStorage();
    DOM.cartSidebar.classList.add("open");
  },

  // Artikel entfernen
  removeItem(index) {
    cartItems.splice(index, 1);
    this.render();
    this.saveToStorage();
  },

  // Warenkorb anzeigen
  render() {
    if (!DOM.cartList) return;

    // Liste leeren
    DOM.cartList.innerHTML = "";
    let subtotal = 0;

    // Artikel durchlaufen
    cartItems.forEach((item, index) => {
      subtotal += item.price;
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${item.price.toFixed(2)} €</span>
        <button aria-label="Artikel entfernen" onclick="Cart.removeItem(${index})" class="remove-btn">❌</button>
      `;
      DOM.cartList.appendChild(li);
    });

    // Versandkosten berechnen
    const deliveryCosts = this.calculateDeliveryFee(subtotal);
    const total = subtotal + deliveryCosts;

    // UI aktualisieren
    this.updateUI(subtotal, deliveryCosts, total);
  },

  // Versandkosten berechnen
  calculateDeliveryFee(subtotal) {
    if (deliveryOption === "lieferung") {
      return subtotal >= 30 ? 0 : 4.99;
    }
    return 0;
  },

  // UI-Elemente aktualisieren
  updateUI(subtotal, deliveryCosts, total) {
    if (DOM.cartSubtotal)
      DOM.cartSubtotal.textContent = `${subtotal.toFixed(2)} €`;
    if (DOM.deliveryCosts)
      DOM.deliveryCosts.textContent = `${deliveryCosts.toFixed(2)} €`;
    if (DOM.cartTotal) DOM.cartTotal.textContent = `${total.toFixed(2)} €`;
    if (DOM.cartCount) DOM.cartCount.textContent = cartItems.length;
  },

  // LocalStorage speichern
  saveToStorage() {
    localStorage.setItem("vina_cart_v1", JSON.stringify(cartItems));
  },

  // LocalStorage laden
  loadFromStorage() {
    const savedCart = localStorage.getItem("vina_cart_v1");
    if (savedCart) {
      cartItems = JSON.parse(savedCart);
      this.render();
    }
  },

  // Lieferoption ändern
  setDeliveryOption(option) {
    deliveryOption = option;
    this.render();
  },
};

// ==============================
// MENU MODULE
// ==============================
const Menu = {
  // Kategorie-Mapping
  categoryMapping: {
    vorspeisen: "Vorspeisen",
    suppen: "Suppen",
    salate: "Salate",
    sushiMaki: "Sushi - Maki",
    desserts: "Desserts",
    getraenke: "Getränke",
  },

  // Alle Menü-Artikel rendern
  renderItems() {
    if (!window.MENU_DATA) {
      console.error("MENU_DATA nicht gefunden!");
      return;
    }

    Object.keys(window.MENU_DATA).forEach((categoryKey) => {
      this.renderCategory(categoryKey);
    });
  },

  // Eine Kategorie rendern
  renderCategory(categoryKey) {
    const containerSelector =
      categoryKey === "sushiMaki" ? "sushi-maki" : categoryKey;
    const container = document.getElementById(`${containerSelector}-container`);

    if (!container || !window.MENU_DATA[categoryKey]) return;

    container.innerHTML = ""; // Container leeren

    window.MENU_DATA[categoryKey].forEach((item) => {
      const menuItemDiv = this.createMenuItem(item);
      container.appendChild(menuItemDiv);
    });
  },

  // Einzelnen Menü-Artikel erstellen
  createMenuItem(item) {
    const menuItemDiv = document.createElement("div");
    menuItemDiv.className = "menu-item";
    menuItemDiv.innerHTML = `
      <div class="menu-item-content">
        <img src="${item.img}" alt="${item.title}" class="menu-item-image">
        <div class="menu-item-info">
          <h3>${item.title}</h3>
          <p class="description">${item.desc}</p>
          <div class="price-add">
            <span class="price">${(item.cents / 100).toFixed(2)} €</span>
            <button class="add-btn" onclick="Cart.addItem('${item.title}', ${
      item.cents
    })">+</button>
          </div>
        </div>
      </div>
    `;
    return menuItemDiv;
  },
};

// ==============================
// SUCHE MODULE
// ==============================
const Search = {
  // Suchfunktion initialisieren
  init() {
    if (!DOM.searchInput) return;

    DOM.searchInput.addEventListener("input", (e) => {
      this.filterItems(e.target.value.toLowerCase());
    });
  },

  // Artikel nach Suchbegriff filtern
  filterItems(searchTerm) {
    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach((item) => {
      const title = item.querySelector("h3")?.textContent.toLowerCase() || "";
      const desc =
        item.querySelector(".description")?.textContent.toLowerCase() || "";

      const isVisible = title.includes(searchTerm) || desc.includes(searchTerm);
      item.style.display = isVisible ? "" : "none";
    });
  },
};

// ==============================
// LIEFEROPTIONEN MODULE
// ==============================
const Delivery = {
  // Event Listener für Lieferoptionen
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
// CHECKOUT MODULE
// ==============================
const Checkout = {
  // Zur Kasse gehen
  process() {
    if (cartItems.length === 0) {
      alert("Ihr Warenkorb ist leer!");
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const deliveryCosts = Cart.calculateDeliveryFee(total);
    const finalTotal = total + deliveryCosts;

    alert(
      `Bestellung aufgegeben!\nGesamtsumme: ${finalTotal.toFixed(
        2
      )} €\nLieferart: ${deliveryOption}`
    );
  },
};

// ==============================
// APP INITIALISIERUNG
// ==============================
const App = {
  // App starten
  init() {
    this.loadCart();
    this.loadMenu();
    this.initModules();
    this.bindGlobalEvents();
  },

  // Warenkorb laden
  loadCart() {
    Cart.loadFromStorage();
  },

  // Menü laden
  loadMenu() {
    Menu.renderItems();
  },

  // Module initialisieren
  initModules() {
    Search.init();
    Delivery.init();
  },

  // Globale Events
  bindGlobalEvents() {
    // Warenkorb Toggle Button (falls vorhanden)
    const cartButton = document.getElementById("cart-button");
    if (cartButton) {
      cartButton.addEventListener("click", () => Cart.toggle());
    }
  },
};

// ==============================
// GLOBALE FUNKTIONEN (für onclick Events)
// ==============================

// Globale Funktionen für HTML onclick Events
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
  Checkout.process();
}

// ==============================
// APP START
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

// ==============================
// DEBUGGING (nur in Entwicklung)
// ==============================
if (typeof window !== "undefined") {
  window.VinaApp = {
    Cart,
    Menu,
    Search,
    Delivery,
    cartItems: () => cartItems,
    deliveryOption: () => deliveryOption,
  };
}

// ==============================
// MOBILE NAVIGATION MODULE
// ==============================
const MobileNav = {
  // Mobile Navigation initialisieren
  init() {
    this.bindToggleEvent();
    this.bindResizeEvent();
    this.bindLinkEvents();
  },

  // Toggle Button Event
  bindToggleEvent() {
    const toggleButton = document.getElementById("mobile-menu-toggle");
    const nav = document.getElementById("main-nav");

    if (toggleButton && nav) {
      toggleButton.addEventListener("click", () => {
        nav.classList.toggle("mobile-open");
        this.updateToggleIcon(nav.classList.contains("mobile-open"));
      });
    }
  },

  // Toggle Icon aktualisieren
  updateToggleIcon(isOpen) {
    const toggleButton = document.getElementById("mobile-menu-toggle");
    if (toggleButton) {
      toggleButton.textContent = isOpen ? "✕" : "☰";
      toggleButton.setAttribute(
        "aria-label",
        isOpen ? "Menü schließen" : "Menü öffnen"
      );
    }
  },

  // Navigation schließen bei Fenster-Resize
  bindResizeEvent() {
    window.addEventListener("resize", () => {
      const nav = document.getElementById("main-nav");
      if (window.innerWidth > 768 && nav) {
        nav.classList.remove("mobile-open");
        this.updateToggleIcon(false);
      }
    });
  },

  // Navigation schließen bei Link-Klick (Mobile)
  bindLinkEvents() {
    const nav = document.getElementById("main-nav");
    const links = nav?.querySelectorAll("a");

    if (links && nav) {
      links.forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            nav.classList.remove("mobile-open");
            this.updateToggleIcon(false);
          }
        });
      });
    }
  },
};
