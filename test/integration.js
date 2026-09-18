import assert from "node:assert/strict";

const origin = process.env.STORE_URL || "http://localhost:8080";
const unique = Date.now();
const credentials = {
  name: "Local integration shopper",
  email: `storefront-${unique}@example.com`,
  password: "Local-Test-123",
};

async function request(path, options = {}, expectedStatus = 200) {
  const response = await fetch(`${origin}${path}`, options);
  assert.equal(
    response.status,
    expectedStatus,
    `${options.method || "GET"} ${path}`,
  );
  if (
    expectedStatus === 204 ||
    response.headers.get("content-type")?.includes("text/")
  )
    return response.text();
  return response.json();
}

const options = (method, body, token) => ({
  method,
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

assert.match(await request("/"), /Sport Store/);
assert.match(await request("/storefront/styles.css"), /hero/);
assert.match(await request("/storefront/app.js"), /loadProducts/);
const products = await request("/products");
assert.ok(products.length > 0);
assert.equal((await request(`/products/${products[0].id}`)).id, products[0].id);
const cart = await request("/carts", options("POST"), 201);
await request(
  `/carts/${cart.id}/items`,
  options("POST", { productId: products[0].id }),
  201,
);
await request(
  `/carts/${cart.id}/items/${products[0].id}`,
  options("PUT", { quantity: 2 }),
);
const filled = await request(`/carts/${cart.id}`);
assert.equal(filled.items[0].quantity, 2);
assert.equal(filled.totalPrice, products[0].price * 2);
assert.equal(
  (await fetch(`${origin}/checkout`, options("POST", { cartId: cart.id })))
    .status,
  401,
);
await request("/users", options("POST", credentials), 201);
const { token } = await request("/auth/login", options("POST", credentials));
assert.equal(
  (await request("/auth/me", options("GET", null, token))).email,
  credentials.email,
);
const { orderId } = await request(
  "/checkout",
  options("POST", { cartId: cart.id }, token),
);
const order = await request(`/orders/${orderId}`, options("GET", null, token));
assert.equal(order.status, "PENDING");
assert.equal(order.totalPrice, filled.totalPrice);
assert.equal(order.items[0].quantity, 2);
assert.equal((await request(`/carts/${cart.id}`)).items.length, 0);
assert.ok(
  (await request("/orders", options("GET", null, token))).some(
    (item) => item.id === orderId,
  ),
);
await request(
  `/carts/${cart.id}/items`,
  options("POST", { productId: products[0].id }),
  201,
);
await request(
  `/carts/${cart.id}/items/${products[0].id}`,
  options("DELETE"),
  204,
);
assert.equal((await request(`/carts/${cart.id}`)).totalPrice, 0);
console.log(
  "PASS: public storefront/assets, catalog, guest cart, quantity, registration/login, protected checkout, pending order, history, cleared cart, item removal.",
);
