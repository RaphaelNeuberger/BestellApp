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
