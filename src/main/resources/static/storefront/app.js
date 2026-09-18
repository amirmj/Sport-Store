import { api, ApiError, refreshSession } from "./api.js";
import { escapeHtml, stored } from "./catalog.js";
import * as views from "./views.js";

/** @typedef {import('./types').Product} Product */
/** @typedef {import('./types').Cart} Cart */
/** @typedef {import('./types').User} User */

/** @type {{products: Product[] | null, cart: Cart | null, user: User | null, productsError: string, cartError: string}} */
const state = {
  products: null,
  cart: null,
  user: null,
  productsError: "",
  cartError: "",
};
const main = /** @type {HTMLElement} */ (document.getElementById("main"));
const header = /** @type {HTMLElement} */ (document.getElementById("header"));
const toast = /** @type {HTMLElement} */ (document.getElementById("toast"));
const cartKey = "sport-store.cart";
const sessionKey = "sport-store.session";
let busy = false;
let pageVersion = 0;
let toastTimer = 0;
let initialized = false;
let cartId = stored(localStorage, cartKey);

function route() {
  const url = new URL(location.hash.slice(1) || "/", location.origin);
  return { path: url.pathname, params: url.searchParams };
}

/** @param {unknown} error */
const message = (error) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

/** @param {string} text @param {boolean} [bagLink] */
function notify(text, bagLink = false) {
  clearTimeout(toastTimer);
  toast.innerHTML = `<span>${escapeHtml(text)}</span>${bagLink ? '<a href="#/bag">View bag →</a>' : ""}<button aria-label="Dismiss notification" data-action="dismiss">${views.icon("close")}</button>`;
  toast.classList.add("visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 7000);
}

/** @param {boolean} value */
function setBusy(value) {
  busy = value;
  document.body.classList.toggle("busy", value);
  main.setAttribute("aria-busy", String(value));
  main.querySelectorAll("button, input, select").forEach((element) => {
    if (
      !(
        element instanceof HTMLButtonElement ||
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement
      )
    )
      return;
    if (value) {
      if (!element.disabled) {
        element.dataset.busyDisabled = "true";
        element.disabled = true;
      }
    } else if (element.dataset.busyDisabled) {
      element.disabled = false;
      delete element.dataset.busyDisabled;
    }
  });
}

/** @param {string} html @param {string} title @param {boolean} focus */
function mount(html, title, focus) {
  main.innerHTML = html;
  document.title = `${title} — Sport Store`;
  header.innerHTML = views.header(state.cart, state.user, route().path);
  if (busy) setBusy(true);
  if (focus) {
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

async function loadProducts() {
  state.productsError = "";
  try {
    state.products = await api.products();
  } catch (error) {
    state.productsError = message(error);
  }
}

async function loadCart() {
  state.cartError = "";
  if (!cartId) {
    state.cart = null;
    return;
  }
  try {
    state.cart = await api.cart(cartId);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 400 || error.status === 404)
    ) {
      cartId = null;
      state.cart = null;
      stored(localStorage, cartKey, null);
      notify("Your previous bag is no longer available. Start a fresh one.");
    } else {
      state.cartError = message(error);
    }
  }
}

async function restoreUser() {
  if (!stored(localStorage, sessionKey)) return;
  try {
    if (await refreshSession()) state.user = await api.me();
    else stored(localStorage, sessionKey, null);
  } catch {
    stored(localStorage, sessionKey, null);
  }
}

/** @param {boolean} [focus] */
async function render(focus = true) {
  const version = ++pageVersion;
  const { path, params } = route();
  const products = state.products || [];
  if (path === "/")
    return mount(
      views.home(state.products, state.productsError),
      "Built for your next",
      focus,
    );
  if (path === "/shop")
    return mount(
      views.shop(state.products, params, state.productsError),
      "Shop equipment",
      focus,
    );
  if (path === "/about") return mount(views.about(), "About us", focus);
  if (!initialized) return mount(views.loading(), "Getting ready", focus);
  if (path === "/account")
    return mount(views.account(state.user, params), "Your account", focus);
  if (path === "/bag" || path === "/checkout") {
    mount(views.loading("Getting your latest bag…"), "Your bag", focus);
    await loadCart();
    if (version !== pageVersion) return;
    return path === "/bag"
      ? mount(
          views.bag(state.cart, products, state.cartError),
          "Your bag",
          false,
        )
      : mount(
          views.checkout(state.cart, state.user, products, state.cartError),
          "Checkout",
          false,
        );
  }
  const productMatch = path.match(/^\/product\/(\d+)$/);
  const orderMatch = path.match(/^\/order\/(\d+)$/);
  if (productMatch || orderMatch || path === "/orders") {
    if (!productMatch && !state.user) {
      location.hash = "/account?next=orders";
      return;
    }
    mount(
      views.loading(),
      productMatch ? "Your equipment" : "Your orders",
      focus,
    );
    try {
      if (productMatch) {
        const product = await api.product(Number(productMatch[1]));
        if (version === pageVersion)
          mount(views.productPage(product, products), product.name, false);
      } else if (orderMatch) {
        const order = await api.order(Number(orderMatch[1]));
        if (version === pageVersion)
          mount(
            views.orderPage(order, products, params.has("placed")),
            `Order #${order.id}`,
            false,
          );
      } else {
        const orders = await api.orders();
        if (version === pageVersion)
          mount(views.ordersPage(orders), "Your orders", false);
      }
    } catch (error) {
      if (version !== pageVersion) return;
      if (error instanceof ApiError && error.status === 401) {
        state.user = null;
        stored(localStorage, sessionKey, null);
        location.hash = "/account?next=orders";
        notify("Your session expired. Sign in to view your orders.");
      } else {
        mount(
          `<section class="container page-section">${views.errorView(message(error))}<a class="text-link" href="#/shop">Back to equipment →</a></section>`,
          "Something went wrong",
          false,
        );
      }
    }
    return;
  }
  mount(
    views.empty(
      "Looks like you took a different trail.",
      "This page doesn’t exist. Let’s get you back to the gear.",
    ),
    "Page not found",
    focus,
  );
}

/** @param {number} id @param {number} quantity */
async function addProduct(id, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99)
    throw new Error("Choose a quantity between 1 and 99.");
  if (!cartId) {
    state.cart = await api.createCart();
    cartId = state.cart.id;
    stored(localStorage, cartKey, cartId);
  }
  state.cart = await api.cart(cartId);
  const currentQuantity =
    state.cart.items.find((item) => item.product.id === id)?.quantity || 0;
  if (currentQuantity + quantity > 99)
    throw new Error("You can add up to 99 of an item to your bag.");
  const item = await api.addItem(cartId, id);
  if (quantity > 1)
    await api.updateItem(cartId, id, item.quantity + quantity - 1);
  await loadCart();
  if (state.cartError)
    throw new Error(
      "Your item was added, but we couldn’t refresh the bag. Open your bag to check it before adding again.",
    );
  header.innerHTML = views.header(state.cart, state.user, route().path);
  notify("Good choice. Added to your bag.", true);
}

/** @param {number} id @param {string} action */
async function changeQuantity(id, action) {
  if (!cartId || !state.cart) return;
  const item = state.cart.items.find((row) => row.product.id === id);
  if (!item) return;
  if (action === "remove") {
    await api.removeItem(cartId, id);
  } else {
    const quantity = item.quantity + (action === "increase" ? 1 : -1);
    if (quantity < 1 || quantity > 99) return;
    await api.updateItem(cartId, id, quantity);
  }
  await render(false);
  const nextControl = main.querySelector(
    `button[data-action="${action}"][data-id="${id}"]`,
  );
  if (nextControl instanceof HTMLButtonElement) nextControl.focus();
  else main.focus({ preventScroll: true });
  notify(action === "remove" ? "Item removed from your bag." : "Bag updated.");
}

async function placeOrder() {
  const consent = document.getElementById("order-consent");
  const errorElement = document.getElementById("checkout-error");
  if (!(consent instanceof HTMLInputElement) || !errorElement) return;
  if (!state.user) {
    location.hash = "/account?next=checkout";
    return;
  }
  if (!consent.checked) {
    errorElement.textContent =
      "Please confirm you understand this is a pending order request.";
    consent.focus();
    return;
  }
  if (!cartId || !state.cart?.items.length) return;
  errorElement.textContent = "";
  setBusy(true);
  try {
    const result = await api.checkout(cartId);
    state.cart = null;
    cartId = null;
    stored(localStorage, cartKey, null);
    location.hash = `/order/${result.orderId}?placed=1`;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      state.user = null;
      stored(localStorage, sessionKey, null);
      location.hash = "/account?next=checkout";
      notify("Please sign in again. Your bag is saved.");
    } else if (
      !(error instanceof ApiError) ||
      error.status === 0 ||
      error.status >= 500
    ) {
      errorElement.innerHTML =
        'We couldn’t confirm the result. <a href="#/orders">Check your orders</a> before trying again to avoid a duplicate order.';
      const placeButton = main.querySelector('[data-action="place-order"]');
      if (placeButton instanceof HTMLButtonElement)
        delete placeButton.dataset.busyDisabled;
    } else {
      errorElement.textContent = message(error);
    }
  } finally {
    setBusy(false);
  }
}

document.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest(".skip-link")) {
    event.preventDefault();
    main.focus();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!(button instanceof HTMLElement)) return;
  const action = button.dataset.action || "";
  if (action === "menu") {
    const open = header.classList.toggle("menu-open");
    button.setAttribute("aria-expanded", String(open));
    return;
  }
  if (action === "dismiss") return toast.classList.remove("visible");
  if (busy) return;
  if (action === "place-order") return placeOrder();
  if (action === "signout") {
    api.signOut();
    state.user = null;
    stored(localStorage, sessionKey, null);
    await render(false);
    return notify("You’re signed out on this device.");
  }
  setBusy(true);
  try {
    const id = Number(button.dataset.id);
    if (action === "add") await addProduct(id, 1);
    else if (["increase", "decrease", "remove"].includes(action))
      await changeQuantity(id, action);
    else {
      if (action === "reload-products") await loadProducts();
      await render(false);
    }
  } catch (error) {
    notify(message(error));
  } finally {
    setBusy(false);
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.dataset.form) return;
  event.preventDefault();
  if (busy) return;
  const data = new FormData(form);
  const kind = form.dataset.form;
  if (kind === "search" || kind === "filter") {
    const params = new URLSearchParams();
    for (const key of ["search", "category", "sort"]) {
      const value = String(data.get(key) || "").trim();
      if (value) params.set(key, value);
    }
    location.hash = `/shop?${params}`;
    header.classList.remove("menu-open");
    return;
  }
  setBusy(true);
  try {
    if (kind === "add-product") {
      await addProduct(
        Number(data.get("productId")),
        Number(data.get("quantity")),
      );
      return;
    }
    const credentials = {
      email: String(data.get("email") || "")
        .trim()
        .toLowerCase(),
      password: String(data.get("password") || ""),
    };
    const errorElement = document.getElementById("auth-error");
    if (errorElement) errorElement.textContent = "";
    if (kind === "register") {
      await api.register({
        ...credentials,
        name: String(data.get("name") || "").trim(),
      });
      notify("Account created. Welcome to Sport Store.");
      form.dataset.form = "login";
    }
    state.user = await api.login(credentials);
    stored(localStorage, sessionKey, "active");
    location.hash = data.get("next") === "checkout" ? "/checkout" : "/account";
    if (route().path === "/account") await render(false);
  } catch (error) {
    const errorElement = document.getElementById("auth-error");
    if (errorElement) {
      errorElement.textContent =
        error instanceof ApiError && error.status === 401
          ? "That email and password don’t match. Please try again."
          : message(error);
    } else notify(message(error));
  } finally {
    setBusy(false);
  }
});

document.addEventListener("change", (event) => {
  const select = event.target;
  if (select instanceof HTMLSelectElement && select.name === "sort")
    select.form?.requestSubmit();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    header.classList.remove("menu-open");
    header
      .querySelector('[data-action="menu"]')
      ?.setAttribute("aria-expanded", "false");
    toast.classList.remove("visible");
  }
});
window.addEventListener("hashchange", () => {
  if (location.hash === "#main") return main.focus();
  header.classList.remove("menu-open");
  void render();
});
window.addEventListener("storage", (event) => {
  if (event.key === cartKey && !busy) {
    cartId = event.newValue;
    void loadCart().then(() => render(false));
  }
  if (event.key === sessionKey && event.newValue === null) {
    api.signOut();
    state.user = null;
    void render(false);
  }
});

const footer = document.getElementById("footer");
if (footer) footer.innerHTML = views.footer();
await render(false);
await Promise.all([loadProducts(), loadCart(), restoreUser()]);
initialized = true;
await render(false);
