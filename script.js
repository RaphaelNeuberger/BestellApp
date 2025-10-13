let cartItems = [];
const cartSidebar = document.getElementById("cart-sidebar");
const cartList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

function toggleCart() {
  cartSidebar.classList.toggle("open");
}

function addToCart(name, price) {
  // Preis von Cents in Euro umrechnen
  const priceInEuro = price / 100;
  cartItems.push({ name, price: priceInEuro });
  renderCart();
  // Sidebar automatisch öffnen
  cartSidebar.classList.add("open");
}

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;
  cartItems.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.innerHTML = `
            <span>${item.name}</span>
            <span>${item.price.toFixed(2)} €</span>
            <button onclick="removeFromCart(${index})">×</button>
        `;
    cartList.appendChild(li);
  });
  cartCount.textContent = cartItems.length;
  cartTotal.textContent = total.toFixed(2) + " €";
}

function removeFromCart(index) {
  cartItems.splice(index, 1);
  renderCart();
}

function checkout() {
  alert("Weiter zur Kasse");
}

// Korrigierte Render-Funktion
function renderMenuItems() {
  const categoryMapping = {
    vorspeisen: "Vorspeisen",
    suppen: "Suppen",
    salate: "Salate",
    sushiMaki: "Sushi - Maki",
    desserts: "Desserts",
    getraenke: "Getränke",
  };

  // Alle Kategorien durchgehen
  Object.keys(window.MENU_DATA).forEach((categoryKey) => {
    const categoryName = categoryMapping[categoryKey];
    const container = document.getElementById(
      `${categoryKey === "sushiMaki" ? "sushi-maki" : categoryKey}-container`
    );

    if (container && window.MENU_DATA[categoryKey]) {
      container.innerHTML = ""; // Container leeren

      window.MENU_DATA[categoryKey].forEach((item) => {
        const menuItemDiv = document.createElement("div");
        menuItemDiv.className = "menu-item";
        menuItemDiv.innerHTML = `
                    <div class="menu-item-content">
                        <img src="${item.img}" alt="${
          item.title
        }" class="menu-item-image">
                        <div class="menu-item-info">
                            <h3>${item.title}</h3>
                            <p class="description">${item.desc}</p>
                            <div class="price-add">
                                <span class="price">${(
                                  item.cents / 100
                                ).toFixed(2)} €</span>
                                <button class="add-btn" onclick="addToCart('${
                                  item.title
                                }', ${item.cents})">+</button>
                            </div>
                        </div>
                    </div>
                `;
        container.appendChild(menuItemDiv);
      });
    }
  });
}

// Warten bis DOM geladen ist, dann Menü rendern
document.addEventListener("DOMContentLoaded", function () {
  if (window.MENU_DATA) {
    renderMenuItems();
  } else {
    console.error("MENU_DATA nicht gefunden!");
  }
});

// LocalStorage funktionalität
function saveCartToLocalStorage() {
  localStorage.setItem("vina_cart_v1", JSON.stringify(cartItems));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem("vina_cart_v1");
  if (savedCart) {
    cartItems = JSON.parse(savedCart);
    renderCart();
  }
}

// Cart bei Änderungen speichern
function addToCart(name, price) {
  const priceInEuro = price / 100;
  cartItems.push({ name, price: priceInEuro });
  renderCart();
  saveCartToLocalStorage();
  cartSidebar.classList.add("open");
}

function removeFromCart(index) {
  cartItems.splice(index, 1);
  renderCart();
  saveCartToLocalStorage();
}

// Cart beim Laden der Seite wiederherstellen
document.addEventListener("DOMContentLoaded", function () {
  loadCartFromLocalStorage();
  if (window.MENU_DATA) {
    renderMenuItems();
  }
});

const input = document.getElementById("search-input");
input.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const allItems = document.querySelectorAll(".menu-item"); // CSS Klasse der Artikel
  allItems.forEach((item) => {
    const title = item.querySelector("h3").textContent.toLowerCase();
    const desc = item.querySelector(".description").textContent.toLowerCase();
    if (title.includes(searchTerm) || desc.includes(searchTerm)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  initMenuRendering();
  initSearch();
  initCart();
});

function initMenuRendering() {
  // re-render menu items
}

function initSearch() {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    filterMenuItems(term);
  });
}

function filterMenuItems(term) {
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    const title = item.querySelector("h3").textContent.toLowerCase();
    const desc = item.querySelector(".description").textContent.toLowerCase();
    item.style.display =
      title.includes(term) || desc.includes(term) ? "" : "none";
  });
}

function initCart() {
  // init cart functionality
}

let deliveryOption = "abholung"; // Standard auf Abholung

// Eventlistener für Optionschange
document.querySelectorAll('input[name="delivery-option"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    deliveryOption = e.target.value;
    renderCart(); // erneutes Rendering der Preise
  });
});

function renderCart() {
  cartList.innerHTML = "";
  let subtotal = 0;
  cartItems.forEach((item, index) => {
    subtotal += item.price;
    const li = document.createElement("li");
    li.innerHTML = `
  <span class="cart-item-name">${item.name}</span>
  <span class="cart-item-price">${item.price.toFixed(2)} €</span>
  <button aria-label="Artikel entfernen" onclick="removeFromCart(${index})" class="remove-btn">❌</button>
`;
    cartList.appendChild(li);
  });

  // Update Zwischensumme
  document.getElementById("cart-subtotal").textContent =
    subtotal.toFixed(2) + " €";

  // Versandkosten berechnen
  let deliveryCosts = 0;
  if (deliveryOption === "lieferung") {
    deliveryCosts = subtotal >= 30 ? 0 : 4.99;
  }
  document.getElementById("delivery-costs").textContent =
    deliveryCosts.toFixed(2) + " €";

  // Gesamtsumme
  const total = subtotal + deliveryCosts;
  document.getElementById("cart-total").textContent = total.toFixed(2) + " €";

  cartCount.textContent = cartItems.length;
}
