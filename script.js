let cartItems = [];
const cartSidebar = document.getElementById("cart-sidebar");
const cartList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

function toggleCart() {
  cartSidebar.classList.toggle("open");
}

function addToCart(name, price) {
  cartItems.push({ name, price });
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
    `;
    cartList.appendChild(li);
  });

  cartCount.textContent = cartItems.length;
  cartTotal.textContent = total.toFixed(2) + " €";
}

function checkout() {
  alert("Weiter zur Kasse");
}

function renderArticlesByCategory(articles, containerSelector) {
  const categories = [
    "Vorspeisen",
    "Suppen",
    "Salate",
    "Sushi - Maki",
    "Desserts",
    "Getränke",
  ];
  categories.forEach((cat) => {
    const catContainer = document.querySelector(
      containerSelector + `[data-category="${cat}"]`
    );
    const filteredArticles = articles.filter((a) => a.kategorie === cat);
    filteredArticles.forEach((item) => {
      // Template-Rendering oder direktes HTML anhängen
      catContainer.innerHTML += `<div>${item.name}</div>`;
    });
  });
}
