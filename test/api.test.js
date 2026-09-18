import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { api, ApiError } from "../src/main/resources/static/storefront/api.js";

afterEach(() => {
  mock.restoreAll();
  api.signOut();
});

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("cart calls follow controller paths, methods and DTOs", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () =>
    json({ quantity: 1 }),
  );
  await api.addItem("cart-123", 8);
  await api.updateItem("cart-123", 8, 3);
  const calls = fetchMock.mock.calls;
  assert.equal(calls[0].arguments[0], "/carts/cart-123/items");
  assert.equal(calls[0].arguments[1].method, "POST");
  assert.deepEqual(JSON.parse(calls[0].arguments[1].body), { productId: 8 });
  assert.equal(calls[1].arguments[0], "/carts/cart-123/items/8");
  assert.equal(calls[1].arguments[1].method, "PUT");
  assert.deepEqual(JSON.parse(calls[1].arguments[1].body), { quantity: 3 });
  assert.equal(calls[0].arguments[1].headers.get("Authorization"), null);
});

test("delete accepts an empty 204 response", async () => {
  mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 204 }),
  );
  assert.equal(await api.removeItem("cart", 1), undefined);
});

test("quantity additions reconcile after a failed update without repeating the POST", async () => {
  for (const actualQuantity of [1, 3]) {
    const cart = {
      id: "cart-123",
      items: [{ product: { id: 8 }, quantity: actualQuantity }],
    };
    const fetchMock = mock.method(globalThis, "fetch", async (_, options) => {
      if (options.method === "POST") return json({ quantity: 1 });
      if (options.method === "PUT") throw new TypeError("Connection lost");
      return json(cart);
    });
    assert.deepEqual(await api.addQuantity("cart-123", 8, 3), {
      cart,
      complete: false,
    });
    assert.deepEqual(
      fetchMock.mock.calls.map((call) => call.arguments[1].method),
      ["POST", "PUT", "GET"],
    );
    mock.restoreAll();
  }
});

test("quantity additions report uncertainty when reconciliation is unavailable", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async (_, options) => {
    if (options.method === "POST") return json({ quantity: 1 });
    throw new TypeError("Connection lost");
  });
  await assert.rejects(
    api.addQuantity("cart-123", 8, 3),
    /check it before adding again/,
  );
  assert.deepEqual(
    fetchMock.mock.calls.map((call) => call.arguments[1].method),
    ["POST", "PUT", "GET"],
  );
});

test("successful additions use the returned item quantity and refreshed cart", async () => {
  const cart = { id: "cart-123", items: [{ quantity: 5 }] };
  const fetchMock = mock.method(globalThis, "fetch", async (_, options) => {
    if (options.method === "POST") return json({ quantity: 3 });
    if (options.method === "PUT") return json({ quantity: 5 });
    return json(cart);
  });
  assert.deepEqual(await api.addQuantity("cart-123", 8, 3), {
    cart,
    complete: true,
  });
  assert.deepEqual(JSON.parse(fetchMock.mock.calls[1].arguments[1].body), {
    quantity: 5,
  });
});

test("authenticated checkout refreshes once on 401 and sends only cartId", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async (path, options) => {
    if (path === "/auth/refresh") return json({ token: "refreshed-token" });
    if (options.headers.get("Authorization") === "Bearer refreshed-token")
      return json({ orderId: 44 });
    return new Response(null, { status: 401 });
  });
  assert.deepEqual(await api.checkout("cart-123"), { orderId: 44 });
  assert.equal(fetchMock.mock.callCount(), 3);
  assert.deepEqual(JSON.parse(fetchMock.mock.calls[2].arguments[1].body), {
    cartId: "cart-123",
  });
  assert.equal(fetchMock.mock.calls[1].arguments[1].credentials, "same-origin");
});

test("a persistently unauthorized request cannot refresh in a loop", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async (path) =>
    path === "/auth/refresh"
      ? json({ token: "expired" })
      : new Response(null, { status: 401 }),
  );
  await assert.rejects(
    api.orders(),
    (error) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(fetchMock.mock.callCount(), 3);
});

test("network failure never retries checkout or assumes an order succeeded", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Failed to fetch");
  });
  await assert.rejects(
    api.checkout("cart-123"),
    (error) => error instanceof ApiError && error.status === 0,
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("server failure never retries checkout or exposes internal error details", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () =>
    json({ message: "Internal stack trace" }, 500),
  );
  await assert.rejects(
    api.checkout("cart-123"),
    (error) => error.status === 500 && !error.message.includes("stack trace"),
  );
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("validation maps are readable, and malformed successful responses are rejected", async () => {
  mock.method(globalThis, "fetch", async () =>
    json({ email: "Email must be valid" }, 400),
  );
  await assert.rejects(
    api.register({ name: "Alex", email: "bad", password: "password" }),
    /Email must be valid/,
  );
  mock.restoreAll();
  mock.method(
    globalThis,
    "fetch",
    async () => new Response("<html>Error</html>", { status: 200 }),
  );
  await assert.rejects(api.products(), (error) => error.status === 502);
});
