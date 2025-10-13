// Beispiel: Dark Mode Toggle speichern
const toggleTheme = () => {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-theme") ? "dark" : "light"
  );
};

// Beim Laden: gespeichertes Theme anwenden
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
}

// DOM Ready: header include, like buttons, add-to-cart
document.addEventListener('DOMContentLoaded', () => {

  // Render menu from data (if available) so elements exist before direct bindings
  try {
    const data = (typeof MENU_DATA !== 'undefined') ? MENU_DATA : (typeof window !== 'undefined' ? window.MENU_DATA : undefined);
    renderMenu(data);
  } catch (e) { console.warn('renderMenu failed', e); }

  // Like buttons: handled via event delegation in the global click handler (no direct listeners needed)

  // Add to cart buttons
  const cartCountEl = () => document.querySelector('.cart-count');
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const countEl = cartCountEl();
      if (!countEl) return;
      const current = parseInt(countEl.textContent || '0', 10);
      countEl.textContent = String(current + 1);
      // small visual feedback
      btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 200 });
    });
  });
});

/* -------------------------------
   CART: data model + UI bindings
   ------------------------------- */
const CART_KEY = 'vina_cart_v1';
function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}
function writeCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function formatPrice(cents) {
  return (cents/100).toFixed(2).replace('.', ',') + ' €';
}

// Render menu data into the DOM. Expects MENU_DATA available.
function renderMenu(menuData){
  if (!menuData) return;
  // Fixed category order and labels
  const categories = [
    { key: 'vorspeisen', id: 'vorspeisen', title: 'Vorspeisen' },
    { key: 'suppen', id: 'suppen', title: 'Suppen' },
    { key: 'salate', id: 'salate', title: 'Salate' },
    { key: 'sushiMaki', id: 'sushi-maki', title: 'Sushi - Maki' },
    { key: 'desserts', id: 'desserts', title: 'Desserts' },
    { key: 'getraenke', id: 'getraenke', title: 'Getränke' }
  ];

  // Rebuild nav.categories list in the fixed order
  const navUl = document.querySelector('nav.categories ul');
  if (navUl) {
    // Clear existing and recreate in desired order
    navUl.innerHTML = '';
    categories.forEach(cat => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.setAttribute('href', `#${cat.id}`);
      a.textContent = cat.title;
      li.appendChild(a);
      navUl.appendChild(li);
    });
  }

  categories.forEach(cat => {
    const sectionId = cat.id;
    const items = menuData[cat.key] || [];
    const section = document.getElementById(sectionId);
    if (!section) return;
    // Ensure section has an H2 title. If not, create one using the fixed label
    if (!section.querySelector('h2')) {
      const h2 = document.createElement('h2');
      h2.textContent = cat.title;
      section.insertBefore(h2, section.firstChild);
    } else {
      // normalize existing H2 text to the fixed label
      section.querySelector('h2').textContent = cat.title;
    }
    // Update count element if present
    const countEl = section.querySelector('.count');
    if (countEl) countEl.textContent = `${items.length} Artikel`;

    // Ensure the category navigation has a link to this section
    const nav = document.querySelector('nav.categories ul');
    if (nav) {
      const href = `#${sectionId}`;
      const exists = Array.from(nav.querySelectorAll('a')).some(a => a.getAttribute('href') === href);
      if (!exists) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titles[key] || sectionId;
        li.appendChild(a);
        nav.appendChild(li);
      }
    }
    // find or create .menu-items container
    let container = section.querySelector('.menu-items');
    if (!container) {
      container = document.createElement('div');
      container.className = 'menu-items';
      section.appendChild(container);
    }
    // build markup
    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'menu-list';
    items.forEach(it => {
      const article = document.createElement('article');
      article.className = 'menu-item';
      article.innerHTML = `
          <img src="${it.img}" alt="${escapeHtml(it.title)}" />
          <div class="menu-info">
            <div>
              <h3 class="item-title">${escapeHtml(it.title)}</h3>
              <p class="item-desc">${escapeHtml(it.desc)}</p>
            </div>
            <div class="menu-actions">
              <div class="price">${formatPrice(it.cents)}</div>
              <div>
                <button class="like-button" aria-label="Favorit" aria-pressed="false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" stroke="currentColor" stroke-width="0.6" fill="currentColor"/></svg>
                </button>
                <button class="add-btn" aria-label="In den Warenkorb: ${escapeHtml(it.title)} für ${formatPrice(it.cents)}">+</button>
              </div>
            </div>
          </div>
        `;
      list.appendChild(article);
    });
    container.appendChild(list);
  });
}

function findMenuItemData(btn) {
  // traverse to article and read title+price
  const article = btn.closest('.menu-item');
  if (!article) return null;
  const title = article.querySelector('.item-title')?.textContent?.trim() || 'Artikel';
  const priceText = article.querySelector('.price')?.textContent?.trim() || '0,00 €';
  // convert price like 4,99 € to cents
  const numeric = parseFloat(priceText.replace('€','').replace(',','.').trim()) || 0;
  const cents = Math.round(numeric * 100);
  return { title, cents };
}

function renderCart() {
  const cart = readCart();
  const list = document.querySelector('.cart-items');
  const totalEl = document.querySelector('.cart-total-value');
  list.innerHTML = '';
  let total = 0;
  cart.forEach((it, idx) => {
    total += it.cents * it.qty;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="title">${escapeHtml(it.title)}</div>
      <div class="qty">
        <button data-action="dec" data-idx="${idx}">-</button>
        <div>${it.qty}</div>
        <button data-action="inc" data-idx="${idx}">+</button>
      </div>
    `;
    list.appendChild(li);
  });
  totalEl.textContent = formatPrice(total);
}

function escapeHtml(s){ return s.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// wire add buttons to cart model
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.matches('.add-btn')) {
    const data = findMenuItemData(t);
    if (!data) return;
    const cart = readCart();
    const existing = cart.find(it => it.title === data.title && it.cents === data.cents);
    if (existing) existing.qty += 1; else cart.push({ ...data, qty: 1 });
    writeCart(cart);
    updateCartCount();
    renderCart();
    openCart();
    // show sticky briefly on add
    showStickyCart();
  }

  // like-button via delegation
  if (t.matches('.like-button')) {
    e.stopPropagation();
    const btn = t;
    const pressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
    btn.classList.toggle('liked');
  }

  // cart drawer inc/dec
  if (t.matches('.cart-items button')) {
    const idx = Number(t.dataset.idx);
    const action = t.dataset.action;
    const cart = readCart();
    if (!cart[idx]) return;
    if (action === 'inc') cart[idx].qty += 1;
    if (action === 'dec') cart[idx].qty = Math.max(0, cart[idx].qty - 1);
    // remove zero items
    const newCart = cart.filter(it => it.qty > 0);
    writeCart(newCart);
    updateCartCount();
    renderCart();
  }
});

function updateCartCount(){
  const cart = readCart();
  const count = cart.reduce((s,it) => s + it.qty, 0);
  const el = document.getElementById('cart-count') || document.querySelector('.cart-count');
  if (el) el.textContent = String(count);
  const mobileBtn = document.querySelector('.cart-btn.mobile-fixed');
  if (mobileBtn) mobileBtn.querySelector('.cart-count')?.textContent = String(count);
  // update sticky cart
  const stickyCount = document.querySelector('.sticky-count');
  const stickyTotal = document.querySelector('.sticky-total');
  if (stickyCount) stickyCount.textContent = String(count);
  const total = cart.reduce((s,it) => s + it.qty * it.cents, 0);
  if (stickyTotal) stickyTotal.textContent = formatPrice(total);
}

function openCart(){
  const d = document.getElementById('cart-drawer'); if (!d) return; d.classList.add('open'); d.setAttribute('aria-hidden','false');
  // indicate modal for assistive tech
  d.setAttribute('aria-modal', 'true');
  // focus management: trap focus inside drawer
  try { lastFocusedEl = document.activeElement; } catch(e) { lastFocusedEl = null; }
  trapFocus(d);
}
function closeCart(){
  const d = document.getElementById('cart-drawer'); if (!d) return; d.classList.remove('open'); d.setAttribute('aria-hidden','true');
  d.removeAttribute('aria-modal');
  releaseFocus();
}

// Highlight active category in nav while scrolling
function setupCategoryObserver(){
  const links = Array.from(document.querySelectorAll('nav.categories a'));
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`nav.categories a[href="#${id}"]`);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    });
  }, { root: null, rootMargin: '0px 0px -70% 0px', threshold: 0 });
  sections.forEach(s => observer.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {
  // set up category observer after render
  try { setupCategoryObserver(); } catch (e) { /* silent */ }
});

// Focus trap helpers
let lastFocusedEl = null;
function trapFocus(container){
  const focusable = container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length -1];
  first.focus();

  function handleKey(e){
    if (e.key === 'Tab'){
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    if (e.key === 'Escape') { closeCart(); }
  }
  container.__focusHandler = handleKey;
  document.addEventListener('keydown', handleKey);
}

function releaseFocus(){
  const container = document.getElementById('cart-drawer');
  if (!container) return;
  if (container.__focusHandler) document.removeEventListener('keydown', container.__focusHandler);
  container.__focusHandler = null;
  try { if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus(); } catch(e){}
  lastFocusedEl = null;
}

// Cart button handlers
document.addEventListener('DOMContentLoaded', () => {
  // if there's a cart button in header
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  });
  // Toggle mobile-fixed class based on viewport width
  function updateCartButtonPosition(){
    const mobile = window.innerWidth < 900;
    document.querySelectorAll('.cart-btn').forEach(btn => {
      if (mobile) btn.classList.add('mobile-fixed'); else btn.classList.remove('mobile-fixed');
    });
  }
  updateCartButtonPosition();
  window.addEventListener('resize', updateCartButtonPosition);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  // sticky open
  document.getElementById('sticky-open')?.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  // initial render
  updateCartCount(); renderCart();
});

// Sticky cart behavior
// Sticky cart persistent behavior
function showStickyCart(){
  const sc = document.getElementById('sticky-cart');
  if (!sc) return;
  sc.classList.add('show');
  sc.setAttribute('aria-hidden','false');
}
function hideStickyCart(){
  const sc = document.getElementById('sticky-cart');
  if (!sc) return;
  sc.classList.remove('show');
  sc.setAttribute('aria-hidden','true');
}
// show sticky if cart contains items on load
document.addEventListener('DOMContentLoaded', () => {
  const cart = readCart();
  if (cart && cart.length > 0) showStickyCart();
  document.getElementById('sticky-close')?.addEventListener('click', () => { hideStickyCart(); });
});
