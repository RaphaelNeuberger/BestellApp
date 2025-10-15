// ==============================
// SHOPPING CART
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
