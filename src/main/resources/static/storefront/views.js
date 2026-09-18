import {
  categories,
  categoryFor,
  escapeHtml as e,
  filterProducts,
  money,
} from "./catalog.js";

/** @typedef {import('./types').Product} Product */
/** @typedef {import('./types').Cart} Cart */
/** @typedef {import('./types').CartItem} CartItem */
/** @typedef {import('./types').User} User */
/** @typedef {import('./types').Order} Order */

/** @type {Record<string, string>} */
const paths = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  diagonal: '<path d="M6 18 18 6M6 6h12v12"/>',
  bag: '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
  box: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 9v10M3 8l9 4 9-4M7 5.8l9 5V15"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  trail:
    '<path d="m2 20 7-13 4 7 3-5 6 11H2ZM7 11l2 2 2-2"/><circle cx="18" cy="4" r="2"/>',
};

/** @param {string} name */
export const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
const logo =
  '<span class="brand-mark" aria-hidden="true">S</span><span>SPORT<span class="brand-light">STORE</span><span class="brand-dot">®</span></span>';
/** @param {string} file @param {string} [className] */
const photo = (file, className = "") =>
  `<img class="${className}" src="/storefront/images/${file}.jpg" alt="" loading="lazy" width="700" height="700">`;

/** @param {Cart | null} cart @param {User | null} user @param {string} path */
export function header(cart, user, path) {
  const count =
    cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  return `<div class="header-inner">
    <a class="brand" href="#/" aria-label="Sport Store home">${logo}</a>
    <nav id="main-nav" class="main-nav" aria-label="Main navigation">
      <a href="#/shop" ${path === "/shop" ? 'aria-current="page"' : ""}>Shop all</a>
      <a href="#/shop?category=1">Running</a><a href="#/shop?category=4">Training</a><a href="#/shop?category=6">Outdoor</a>
    </nav>
    <div class="header-actions">
      <form class="header-search" data-form="search" role="search"><label class="sr-only" for="header-query">Search equipment</label><input id="header-query" name="search" placeholder="Find your gear" type="search" maxlength="120"><button class="icon-button" aria-label="Search">${icon("search")}</button></form>
      <a class="icon-button account-link" href="#/account" aria-label="${user ? "Your account" : "Sign in"}">${icon("user")}${user ? '<span class="signed-in-dot"></span>' : ""}</a>
      <a class="bag-link" href="#/bag" aria-label="Shopping bag, ${count} items">${icon("bag")}<span class="bag-word">Bag</span><span class="bag-count">${count}</span></a>
      <button class="icon-button menu-toggle" data-action="menu" aria-label="Toggle navigation" aria-controls="main-nav" aria-expanded="false">${icon("menu")}</button>
    </div>
  </div>`;
}

export const footer = () => `<div class="footer-main container">
  <div class="footer-brand"><a class="brand" href="#/" aria-label="Sport Store home">${logo}</a><p>For the early starts. The extra reps.<br>The everyday athletes. For you.</p></div>
  <div><h2>Find your gear</h2><a href="#/shop?category=1">Running</a><a href="#/shop?category=4">Training & fitness</a><a href="#/shop?category=6">Outdoor & adventure</a><a href="#/shop">All equipment</a></div>
  <div><h2>Your Sport Store</h2><a href="#/account">My account</a><a href="#/orders">My orders</a><a href="#/bag">Shopping bag</a><a href="#/about">About the store</a></div>
  <div class="footer-manifesto"><span class="eyebrow">THE ONLY WAY IS FORWARD.</span><p>KEEP<br><em>MOVING.</em>${icon("diagonal")}</p></div>
  </div><div class="footer-bottom container"><span>© ${new Date().getFullYear()} Sport Store</span><span>Built for your next.</span><span>USD · English</span></div>`;

/** @param {string} text */
export const loading = (text = "Getting your gear ready…") =>
  `<div class="loading" role="status"><span class="spinner"></span>${e(text)}</div>`;
/** @param {string} title @param {string} text @param {string} [action] */
export const empty = (
  title,
  text,
  action = '<a class="button" href="#/shop">Explore equipment ' +
    icon("arrow") +
    "</a>",
) =>
  `<div class="empty-state"><span class="empty-icon">${icon("bag")}</span><h2>${e(title)}</h2><p>${e(text)}</p>${action}</div>`;
/** @param {string} message @param {string} [action] */
export const errorView = (message, action = "retry") =>
  `<div class="error-state" role="alert"><h2>A little pause in the action.</h2><p>${e(message)}</p><button class="button secondary" data-action="${action}">Try again ${icon("arrow")}</button></div>`;
/** @param {string} current */
const breadcrumb = (current) =>
  `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/shop">Equipment</a><span>/</span><span aria-current="page">${e(current)}</span></nav>`;

/** @param {Product} product */
export function productCard(product) {
  const category = categoryFor(product.categoryId);
  return `<article class="product-card">
    <a class="product-image" href="#/product/${product.id}" aria-label="View ${e(product.name)}">${photo(category.image)}<span class="product-category">${e(category.name)}</span><span class="image-arrow">${icon("diagonal")}</span></a>
    <div class="product-info"><span class="eyebrow">${e(category.name)} / EQUIPMENT</span><h3><a href="#/product/${product.id}">${e(product.name)}</a></h3>
    <div class="product-bottom"><span class="price">${money(product.price)}</span><button class="add-button" data-action="add" data-id="${product.id}" aria-label="Add ${e(product.name)} to bag">${icon("plus")}</button></div></div>
  </article>`;
}

/** @param {Product[] | null} products @param {string} failure */
export function home(products, failure) {
  const picks = products
    ? [1, 3, 4, 8]
        .map((id) => products.find((product) => product.categoryId === id))
        .filter((product) => product !== undefined)
    : [];
  return `<section class="hero">
    <img class="hero-photo" src="/storefront/images/running.jpg" alt="Runners pushing forward on an outdoor track at sunrise" fetchpriority="high" width="1800" height="1200">
    <div class="hero-shade"></div><div class="hero-content container">
      <div class="hero-copy"><div class="hero-label"><span></span> BUILT FOR THE WAY YOU MOVE</div><h1>YOUR NEXT<br>LEVEL STARTS<br><em>HERE.</em></h1><p>Big goals. Small wins. Everything in between.<br>Find the gear that keeps you moving forward.</p>
      <a class="button" href="#/shop">Find your gear ${icon("arrow")}</a><a class="hero-secondary" href="#/shop?category=1">Explore running ${icon("diagonal")}</a></div>
      <div class="hero-caption"><span>01 / THE EVERYDAY ATHLETE</span><span>SHOW UP. GO FURTHER.</span></div>
    </div><div class="hero-bottom"><span>LESS SCROLLING. MORE MOVING.</span><span>↓</span></div>
  </section>
  <div class="sport-strip"><span>FIND YOUR FOCUS</span><a href="#/shop?category=1">RUN</a><i>✳</i><a href="#/shop?category=4">TRAIN</a><i>✳</i><a href="#/shop?category=3">PLAY</a><i>✳</i><a href="#/shop?category=6">EXPLORE</a><i>✳</i><span>REPEAT.</span></div>
  <section class="section container"><div class="section-heading"><div><span class="eyebrow">YOUR SPORT. YOUR WAY.</span><h2>Find your playing field.</h2></div><a class="text-link" href="#/shop">Explore all sports ${icon("arrow")}</a></div>
    <div class="category-grid">${[categories[0], categories[3], categories[2], categories[5]].map((category, index) => `<a class="category-card" href="#/shop?category=${category.id}">${photo(category.id === 1 ? "running" : category.image)}<span class="category-number">0${index + 1}</span><div><h3>${category.name === "Fitness" ? "Training" : category.name}</h3><span>${category.line}</span></div><span class="category-arrow">${icon("diagonal")}</span></a>`).join("")}</div>
  </section>
  <section class="section product-section container"><div class="section-heading"><div><span class="eyebrow">GOOD GEAR. GREAT POSSIBILITIES.</span><h2>Meet your next essentials.</h2></div><a class="text-link" href="#/shop">Shop all equipment ${icon("arrow")}</a></div>
    ${failure ? errorView(failure, "reload-products") : !products ? loading() : !picks.length ? empty("New gear is on the way.", "Our collection is being prepared. Check back soon.") : `<div class="product-grid">${picks.map(productCard).join("")}</div><p class="image-note">Explore the sport. Photos illustrate each category; see product descriptions for item details.</p>`}
  </section>
  <section class="training-banner container"><div>${photo("fitness")}<span class="vertical-label">NO SHORTCUTS. JUST YOU.</span></div><div class="training-copy"><span class="eyebrow">EVERY REP IS A STEP FORWARD.</span><h2>SHOW UP.<br>GET STRONGER.<br><em>GO AGAIN.</em></h2><p>From your first session to your next personal best.<br>Make room for the work that matters.</p><a class="button light" href="#/shop?category=4">Build your training kit ${icon("arrow")}</a></div></section>
  <section class="purpose container"><span>${icon("trail")}</span><h2>Whatever moves you.<br>We’re here for it.</h2><p>A morning run. A weekend game. A trail with no finish line.<br>Equipment for the joy of getting out there.</p><a class="text-link" href="#/about">Meet Sport Store ${icon("arrow")}</a></section>`;
}

/** @param {Product[] | null} products @param {URLSearchParams} params @param {string} failure */
export function shop(products, params, failure) {
  const category = params.get("category");
  const query = params.get("search") || "";
  const selected = category ? categoryFor(Number(category)) : null;
  const result = filterProducts(products || [], params);
  return `<div class="catalog-hero"><div class="container">${breadcrumb(selected?.name || "All equipment")}<span class="eyebrow">THE RIGHT GEAR. YOUR NEXT CHAPTER.</span><h1>${query ? "Find your next." : selected ? e(selected.name) + "." : "All in. All equipment."}</h1><p>${selected ? selected.line : "For every way you move. Find something that moves you."}</p></div></div>
    <section class="section container catalog-layout"><aside class="filters"><h2>Shop by sport</h2><a href="#/shop" ${!category ? 'aria-current="true"' : ""}>All equipment <span>${products?.length ?? "—"}</span></a>${categories.map((item) => `<a href="#/shop?category=${item.id}" ${String(item.id) === category ? 'aria-current="true"' : ""}>${item.name}<span>${products?.filter((product) => product.categoryId === item.id).length ?? "—"}</span></a>`).join("")}
    <div class="filter-note">${icon("diagonal")}<p>Your next<br><strong>starts here.</strong></p></div></aside>
    <div class="catalog-main"><form class="catalog-toolbar" data-form="filter" role="search">
      <label class="search-field">${icon("search")}<span class="sr-only">Search products</span><input name="search" type="search" value="${e(query)}" placeholder="Search equipment…" maxlength="120"></label>
      ${category ? `<input type="hidden" name="category" value="${e(category)}">` : ""}
      <label class="sort-field"><span>Sort by</span><select name="sort" aria-label="Sort products">${[
        ["featured", "Featured"],
        ["price-low", "Price: low to high"],
        ["price-high", "Price: high to low"],
        ["name", "Name: A–Z"],
      ]
        .map(
          ([value, label]) =>
            `<option value="${value}" ${params.get("sort") === value ? "selected" : ""}>${label}</option>`,
        )
        .join(
          "",
        )}</select></label><button class="button small" type="submit">Apply</button>
    </form><div class="results-line"><span>${products ? result.length : "…"} products${query ? ` for “${e(query)}”` : ""}</span>${query || category ? '<a class="text-link" href="#/shop">Clear filters ×</a>' : "<span>Made for your kind of movement.</span>"}</div>
    ${failure ? errorView(failure, "reload-products") : !products ? loading() : !result.length ? empty("No gear found. Yet.", "Try another search or explore a different sport.", '<a class="button secondary" href="#/shop">Clear filters</a>') : `<div class="product-grid">${result.map(productCard).join("")}</div><p class="image-note">Category photos are illustrative, not exact product photographs.</p>`}</div></section>`;
}

/** @param {Product} product @param {Product[]} products */
export function productPage(product, products) {
  const category = categoryFor(product.categoryId);
  const related = products
    .filter(
      (item) =>
        item.categoryId === product.categoryId && item.id !== product.id,
    )
    .slice(0, 4);
  return `<div class="container">${breadcrumb(product.name)}<section class="product-detail">
    <figure class="detail-image">${photo(category.image)}<span class="product-category">${e(category.name)}</span><figcaption>Category inspiration · Illustrative photograph</figcaption></figure>
    <div class="detail-copy"><a class="eyebrow" href="#/shop?category=${category.id}">${e(category.name)} / EQUIPMENT</a><h1>${e(product.name)}</h1><p class="detail-price">${money(product.price)} <span>USD</span></p><p class="description">${e(product.description)}</p>
    <form data-form="add-product" class="add-product-form"><input type="hidden" name="productId" value="${product.id}"><label for="product-quantity">Quantity</label><div class="detail-actions"><input id="product-quantity" name="quantity" type="number" min="1" max="99" value="1" required><button class="button" type="submit">Add to bag ${icon("plus")}</button></div></form>
    <p class="small-note">Review your bag before placing an order request.</p><details open><summary>Product details</summary><p>${e(product.description)}</p><dl><div><dt>Sport</dt><dd>${e(category.name)}</dd></div><div><dt>Product reference</dt><dd>SS-${product.id}</dd></div></dl></details><details><summary>Ordering & payment</summary><p>Sign in to submit your order. Orders are saved as pending. Online payment and delivery options are not yet available, and no payment is collected.</p></details></div>
    </section>${related.length ? `<section class="section"><div class="section-heading"><div><span class="eyebrow">KEEP THE MOMENTUM GOING.</span><h2>Complete your kit.</h2></div></div><div class="product-grid">${related.map(productCard).join("")}</div></section>` : ""}</div>`;
}

/** @param {CartItem} item @param {Product[]} products @param {boolean} [editable] */
function cartRow(item, products, editable = true) {
  const category = categoryFor(
    products.find((product) => product.id === item.product.id)?.categoryId,
  );
  const unitPrice = editable
    ? item.product.price
    : item.totalPrice / item.quantity;
  return `<article class="cart-row"><a class="cart-image" href="#/product/${item.product.id}" aria-label="View ${e(item.product.name)}">${photo(category.image)}</a><div class="cart-item-copy"><span class="eyebrow">${e(category.name)}</span><h3><a href="#/product/${item.product.id}">${e(item.product.name)}</a></h3><span class="muted">${money(unitPrice)} each</span>
  ${editable ? `<div class="quantity-controls"><button data-action="decrease" data-id="${item.product.id}" class="icon-button" aria-label="Decrease quantity of ${e(item.product.name)}" ${item.quantity <= 1 ? "disabled" : ""}>${icon("minus")}</button><span aria-label="Quantity">${item.quantity}</span><button data-action="increase" data-id="${item.product.id}" class="icon-button" aria-label="Increase quantity of ${e(item.product.name)}" ${item.quantity >= 99 ? "disabled" : ""}>${icon("plus")}</button></div>` : `<span class="item-quantity">Quantity: ${item.quantity}</span>`}</div><div class="cart-row-end"><strong>${money(item.totalPrice)}</strong>${editable ? `<button class="remove-button" data-action="remove" data-id="${item.product.id}" aria-label="Remove ${e(item.product.name)}">Remove</button>` : ""}</div></article>`;
}

/** @param {Cart} cart @param {boolean} [checkout] */
function summary(cart, checkout = false) {
  return `<aside class="order-summary"><span class="eyebrow">ONE STEP CLOSER.</span><h2>Order summary</h2><dl><div><dt>Subtotal (${cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</dt><dd>${money(cart.totalPrice)}</dd></div><div><dt>Shipping & payment</dt><dd>Not yet available</dd></div><div class="summary-total"><dt>Order total</dt><dd>${money(cart.totalPrice)} <small>USD</small></dd></div></dl>
  ${checkout ? '<button class="button full" data-action="place-order">Place order request ' + icon("arrow") + '</button><p class="summary-note">This creates a pending order. You will not be charged.</p>' : '<a class="button full" href="#/checkout">Continue to checkout ' + icon("arrow") + '</a><p class="summary-note">Sign in at checkout to save your order.</p>'}<div class="summary-foot">${icon("lock")}<span>Your bag total comes directly from the store.</span></div></aside>`;
}

/** @param {Cart | null} cart @param {Product[]} products @param {string} failure */
export function bag(cart, products, failure) {
  return `<section class="container page-section">${breadcrumb("Shopping bag")}<div class="page-heading"><span class="eyebrow">GOOD CHOICES. GREAT START.</span><h1>Your bag<span class="title-count">${cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0}</span></h1><a class="text-link" href="#/shop">Keep exploring ${icon("arrow")}</a></div>
    ${failure ? errorView(failure, "reload-cart") : !cart?.items.length ? empty("Your next adventure starts with an empty bag.", "Let’s find the gear to fill it.") : `<div class="purchase-layout"><div><div class="cart-table-heading"><span>YOUR EQUIPMENT</span><span>TOTAL</span></div>${cart.items.map((item) => cartRow(item, products)).join("")}<p class="image-note">Photos illustrate the sport, not the exact item.</p></div>${summary(cart)}</div>`}</section>`;
}

/** @param {Cart | null} cart @param {User | null} user @param {Product[]} products @param {string} failure */
export function checkout(cart, user, products, failure) {
  return `<section class="container page-section">${breadcrumb("Checkout")}<div class="checkout-progress"><a href="#/bag">01 Bag</a><span></span><strong>02 Checkout</strong><span></span><span>03 Confirmation</span></div><div class="page-heading"><span class="eyebrow">THE NEXT STEP IS YOURS.</span><h1>Make it yours.</h1></div>
    ${
      failure
        ? errorView(failure, "reload-cart")
        : !cart?.items.length
          ? empty(
              "Your bag is waiting.",
              "Add some equipment before checking out.",
            )
          : `<div class="purchase-layout"><div class="checkout-sections"><section class="checkout-section"><div class="step-heading"><span>01</span><h2>Your account</h2></div>${user ? `<div class="signed-in-card">${icon("check")}<div><strong>${e(user.name)}</strong><p>${e(user.email)}</p></div><a href="#/account?next=checkout">Manage account</a></div>` : `<p>Sign in or create an account to keep your order in one place.</p><a class="button secondary" href="#/account?next=checkout">Sign in to continue ${icon("arrow")}</a>`}</section>
    <section class="checkout-section"><div class="step-heading"><span>02</span><h2>Review your equipment</h2><a href="#/bag">Edit bag</a></div>${cart.items.map((item) => cartRow(item, products, false)).join("")}</section>
    <section class="checkout-section"><div class="step-heading"><span>03</span><h2>Order request</h2></div><div class="notice">${icon("box")}<div><strong>A heads-up before you finish</strong><p>The store currently accepts pending orders. Online payment and delivery details are not available yet. Placing an order request does not charge your card or schedule delivery.</p></div></div><label class="consent"><input type="checkbox" id="order-consent"><span>I understand this is a pending order request and no payment will be collected.</span></label><p id="checkout-error" class="form-error" role="alert"></p></section></div><div>${user ? summary(cart, true) : `<aside class="order-summary"><h2>Your order</h2><p class="detail-price">${money(cart.totalPrice)}</p><a class="button full" href="#/account?next=checkout">Sign in to continue ${icon("arrow")}</a><p class="summary-note">Your bag will be waiting for you.</p></aside>`}</div></div>`
    }</section>`;
}

/** @param {User | null} user @param {URLSearchParams} params */
export function account(user, params) {
  if (user)
    return `<section class="container page-section account-home"><span class="eyebrow">GOOD TO SEE YOU.</span><h1>Hey, ${e(user.name)}.</h1><p class="muted">${e(user.email)}</p><div class="account-cards"><a href="#/orders">${icon("box")}<h2>Your orders</h2><p>Every step of your journey, in one place.</p>${icon("arrow")}</a><a href="#/bag">${icon("bag")}<h2>Your bag</h2><p>Pick up right where you left off.</p>${icon("arrow")}</a></div>${params.get("next") === "checkout" ? '<a class="button" href="#/checkout">Return to checkout ' + icon("arrow") + "</a>" : ""}<button class="text-link signout" data-action="signout">Sign out on this device</button></section>`;
  const register = params.get("mode") === "register";
  const destination = params.get("next") || "";
  const next = ["checkout", "orders"].includes(destination)
    ? destination
    : "account";
  return `<section class="auth-layout container"><div class="auth-art">${photo("running")}<div><span class="eyebrow">YOU BRING THE AMBITION.</span><h2>WE’LL BRING<br>THE GEAR.</h2><p>Your next chapter starts here.</p></div></div><div class="auth-form-wrap"><span class="eyebrow">WELCOME TO SPORT STORE.</span><h1>${register ? "Join the movement." : "Back for more?"}</h1><p>${register ? "One account. A world of possibilities." : "Sign in and keep your momentum going."}</p>
    <form data-form="${register ? "register" : "login"}" class="auth-form"><input name="next" type="hidden" value="${next}">${register ? '<label>Your name<input name="name" autocomplete="name" maxlength="255" required placeholder="Alex Morgan"></label>' : ""}<label>Email address<input type="email" name="email" autocomplete="email" maxlength="255" required placeholder="you@example.com"></label><label>Password<input type="password" name="password" autocomplete="${register ? "new-password" : "current-password"}" ${register ? 'minlength="6" maxlength="25"' : ""} required placeholder="${register ? "Create a password" : "Your password"}"></label>${register ? '<p class="small-note">Use 6–25 characters for your password.</p>' : ""}<p id="auth-error" class="form-error" role="alert"></p><button class="button full" type="submit">${register ? "Create account" : "Sign in"} ${icon("arrow")}</button></form>
    <p class="auth-switch">${register ? "Already part of the team?" : "New around here?"} <a href="#/account?mode=${register ? "login" : "register"}&next=${next}">${register ? "Sign in" : "Create an account"}</a></p><a class="text-link muted" href="#/shop">Keep exploring ${icon("arrow")}</a></div></section>`;
}

/** @param {Order[]} orders */
export function ordersPage(orders) {
  return `<section class="container page-section">${breadcrumb("My orders")}<div class="page-heading"><span class="eyebrow">YOUR JOURNEY SO FAR.</span><h1>Your orders.</h1></div>${
    !orders.length
      ? empty(
          "Your first order is still ahead.",
          "Find your equipment and start something good.",
        )
      : `<div class="orders-list">${[...orders]
          .sort((a, b) => b.id - a.id)
          .map(
            (order) =>
              `<a class="order-card" href="#/order/${order.id}"><div class="order-icon">${icon("box")}</div><div><span class="eyebrow">ORDER #${order.id}</span><h2>${order.items.length} ${order.items.length === 1 ? "product" : "products"}</h2><span class="muted">${e(new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))}</span></div><span class="status">${e(order.status)}</span><strong>${money(order.totalPrice)}</strong>${icon("arrow")}</a>`,
          )
          .join("")}</div>`
  }</section>`;
}

/** @param {Order} order @param {Product[]} products @param {boolean} confirmation */
export function orderPage(order, products, confirmation) {
  return `<section class="container page-section order-detail"><div class="confirmation-icon">${icon("check")}</div><span class="eyebrow">${confirmation ? "YOUR NEXT CHAPTER IS ON THE WAY." : "YOUR EQUIPMENT. YOUR JOURNEY."}</span><h1>${confirmation ? "Order request received." : `Order #${order.id}`}</h1><p class="muted">Order #${order.id} <span aria-hidden="true">·</span> <span class="status">${e(order.status)}</span></p>
  ${order.status === "PENDING" ? '<div class="notice"><strong>Your order is saved and pending.</strong><p>No payment has been collected. Payment and delivery options are not yet available in this store.</p></div>' : `<p>Current order status: ${e(order.status.toLowerCase())}.</p>`}
  <div class="order-items">${order.items.map((item) => cartRow(item, products, false)).join("")}<div class="order-total"><span>Order total</span><strong>${money(order.totalPrice)}</strong></div></div><div class="confirmation-actions"><a class="button" href="#/shop">Keep moving ${icon("arrow")}</a><a class="button secondary" href="#/orders">View all orders</a></div></section>`;
}

export const about = () =>
  `<section class="container page-section about-page"><span class="eyebrow">FOR THE EVERYDAY ATHLETE.</span><h1>Big ambition.<br>Everyday movement.</h1><p class="intro">Sport isn’t just what you do.<br>It’s what keeps you going.</p><p>Sport Store brings together equipment for running, football, basketball, fitness, cycling, outdoor adventure, swimming, and tennis. Whether you’re building a new habit or chasing a new personal best, find your next piece of gear here.</p><div class="notice"><div><h2>Shopping with us</h2><p>Browse the collection, add equipment to your bag, and create an account to submit an order request. Orders are currently saved as pending: online payments, delivery addresses, shipping, stock availability, and product variants are not yet supported.</p><p>Prices are displayed in USD. Photos illustrate sports categories and are not exact product images. Product descriptions and prices come from our store catalog.</p></div></div><a class="button" href="#/shop">Find your gear ${icon("arrow")}</a></section>`;
