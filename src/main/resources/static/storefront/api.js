/** @typedef {import('./types').Product} Product */
/** @typedef {import('./types').Cart} Cart */
/** @typedef {import('./types').CartItem} CartItem */
/** @typedef {import('./types').User} User */
/** @typedef {import('./types').Order} Order */

let accessToken = "";
/** @type {Promise<boolean> | null} */
let refreshing = null;

export class ApiError extends Error {
  /** @param {number} status @param {string} message */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** @param {unknown} data @param {number} status */
function errorMessage(data, status) {
  if (typeof data === "object" && data !== null) {
    const messages = Object.values(data).filter(
      (value) => typeof value === "string",
    );
    if (messages.length && status < 500) return messages.join(". ");
  }
  if (status === 401)
    return "Please sign in to continue. Your session may have expired.";
  if (status === 403) return "You do not have access to this item.";
  if (status === 404) return "We couldn’t find this item.";
  return "The store couldn’t complete your request. Please try again.";
}

export async function refreshSession() {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const response = await fetch("/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) return false;
        /** @type {{token: string}} */
        const data = await response.json();
        accessToken = data.token;
        return true;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

/**
 * @template T
 * @param {string} path
 * @param {{method?: string, body?: object, authenticated?: boolean, retry?: boolean}} [options]
 * @returns {Promise<T>}
 */
async function request(path, options = {}) {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body) headers.set("Content-Type", "application/json");
  if (options.authenticated && accessToken)
    headers.set("Authorization", `Bearer ${accessToken}`);
  let response;
  try {
    response = await fetch(path, {
      method: options.method || "GET",
      headers,
      credentials: "same-origin",
      signal: AbortSignal.timeout(15000),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "We couldn’t reach the store. Check your connection and try again.",
    );
  }
  if (
    response.status === 401 &&
    options.authenticated &&
    options.retry !== false
  ) {
    if (await refreshSession())
      return request(path, { ...options, retry: false });
    accessToken = "";
  }
  if (response.status === 204) return /** @type {T} */ (undefined);
  /** @type {unknown} */
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(response.status, errorMessage(data, response.status));
  if (data === null)
    throw new ApiError(502, "The store returned an unexpected response.");
  return /** @type {T} */ (data);
}

export const api = {
  /** @returns {Promise<Product[]>} */
  products: () => request("/products"),
  /** @param {number} id @returns {Promise<Product>} */
  product: (id) => request(`/products/${id}`),
  /** @returns {Promise<Cart>} */
  createCart: () => request("/carts", { method: "POST" }),
  /** @param {string} id @returns {Promise<Cart>} */
  cart: (id) => request(`/carts/${encodeURIComponent(id)}`),
  /** @param {string} id @param {number} productId @returns {Promise<CartItem>} */
  addItem: (id, productId) =>
    request(`/carts/${encodeURIComponent(id)}/items`, {
      method: "POST",
      body: { productId },
    }),
  /** @param {string} id @param {number} productId @param {number} quantity @returns {Promise<CartItem>} */
  updateItem: (id, productId, quantity) =>
    request(`/carts/${encodeURIComponent(id)}/items/${productId}`, {
      method: "PUT",
      body: { quantity },
    }),
  /** @param {string} id @param {number} productId @param {number} quantity @returns {Promise<{cart: Cart, complete: boolean}>} */
  async addQuantity(id, productId, quantity) {
    let complete = true;
    try {
      const item = await api.addItem(id, productId);
      if (quantity > 1)
        await api.updateItem(id, productId, item.quantity + quantity - 1);
    } catch {
      complete = false;
    }
    try {
      return { cart: await api.cart(id), complete };
    } catch {
      throw new ApiError(
        0,
        "We couldn’t confirm the quantity in your bag. Open your bag and check it before adding again.",
      );
    }
  },
  /** @param {string} id @param {number} productId @returns {Promise<void>} */
  removeItem: (id, productId) =>
    request(`/carts/${encodeURIComponent(id)}/items/${productId}`, {
      method: "DELETE",
    }),
  /** @param {{name: string, email: string, password: string}} details @returns {Promise<User>} */
  register: (details) => request("/users", { method: "POST", body: details }),
  /** @param {{email: string, password: string}} credentials */
  async login(credentials) {
    const data = await /** @type {Promise<{token: string}>} */ (
      request("/auth/login", { method: "POST", body: credentials })
    );
    accessToken = data.token;
    return api.me();
  },
  /** @returns {Promise<User>} */
  me: () => request("/auth/me", { authenticated: true }),
  signOut: () => {
    accessToken = "";
  },
  /** @param {string} cartId @returns {Promise<{orderId: number}>} */
  checkout: (cartId) =>
    request("/checkout", {
      method: "POST",
      body: { cartId },
      authenticated: true,
    }),
  /** @returns {Promise<Order[]>} */
  orders: () => request("/orders", { authenticated: true }),
  /** @param {number} id @returns {Promise<Order>} */
  order: (id) => request(`/orders/${id}`, { authenticated: true }),
};
